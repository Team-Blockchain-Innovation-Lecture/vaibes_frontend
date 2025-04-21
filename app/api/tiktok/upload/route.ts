import { NextRequest, NextResponse } from 'next/server';

// ファイルをダウンロードするための関数
async function downloadFile(url: string): Promise<Buffer> {
  console.log('Downloading file from URL:', url);
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
  }
  
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// チャンクサイズの計算 (TikTok APIの要件に基づく)
function calculateChunkParams(totalSize: number): { chunkSize: number; totalChunkCount: number } {
  const MIN_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_CHUNK_SIZE = 64 * 1024 * 1024; // 64MB

  // 5MB未満のファイルは1チャンクとして扱う
  if (totalSize < MIN_CHUNK_SIZE) {
    return { chunkSize: totalSize, totalChunkCount: 1 };
  }

  // 適切なチャンクサイズを計算 (10MBを基本サイズとする)
  let chunkSize = 10 * 1024 * 1024; // 10MB
  
  // チャンクサイズが小さすぎる場合は調整
  if (chunkSize < MIN_CHUNK_SIZE) {
    chunkSize = MIN_CHUNK_SIZE;
  }
  
  // チャンクサイズが大きすぎる場合は調整
  if (chunkSize > MAX_CHUNK_SIZE) {
    chunkSize = MAX_CHUNK_SIZE;
  }

  // チャンク数の計算（切り上げ）
  const totalChunkCount = Math.ceil(totalSize / chunkSize);
  
  return { chunkSize, totalChunkCount };
}

export async function POST(request: NextRequest) {
  try {
    const { videoUrl, accessToken } = await request.json();

    // デバッグのためアクセストークンの一部を表示（セキュリティ上全部は表示しない）
    console.log('Processing upload request with video URL:', videoUrl);
    console.log('Access token available:', !!accessToken);
    if (accessToken) {
      // セキュリティのため最初の10文字のみ表示
      console.log('Access token preview:', accessToken.substring(0, 10) + '...');
    }

    if (!videoUrl || !accessToken) {
      return NextResponse.json(
        { error: 'Video URL and access token are required' },
        { status: 400 }
      );
    }

    // Step 1: S3 URLからファイルをダウンロード
    console.log('Downloading video file from S3...');
    let videoBuffer: Buffer;
    try {
      videoBuffer = await downloadFile(videoUrl);
      console.log(`Successfully downloaded video file (${videoBuffer.length} bytes)`);
    } catch (error) {
      console.error('Error downloading video file:', error);
      return NextResponse.json(
        { error: `Failed to download video file: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 500 }
      );
    }

    // TikTok APIの要件に基づいてチャンクパラメータを計算
    const videoSize = videoBuffer.length;
    const { chunkSize, totalChunkCount } = calculateChunkParams(videoSize);
    
    console.log(`Video size: ${videoSize} bytes, Chunk size: ${chunkSize} bytes, Total chunks: ${totalChunkCount}`);

    // Step 2: FILE_UPLOAD メソッドでビデオアップロードを初期化
    console.log('Initializing TikTok video upload with FILE_UPLOAD method...');
    const initResponse = await fetch('https://open.tiktokapis.com/v2/post/publish/inbox/video/init/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        source_info: {
          source: 'FILE_UPLOAD',
          video_size: videoSize,
          chunk_size: chunkSize,
          total_chunk_count: totalChunkCount
        }
      }),
    });

    const initData = await initResponse.json();
    console.log('TikTok init response status:', initResponse.status);

    if (!initResponse.ok) {
      console.error('Failed to initialize TikTok video upload:', initData);
      
      let errorDetails = '';
      if (initData.error) {
        errorDetails = `Code: ${initData.error.code}, Message: ${initData.error.message}`;
        
        if (initData.error.code === 'access_token_invalid') {
          errorDetails += '. トークンが期限切れか無効な可能性があります。再度ログインしてください。';
        }
      }
      
      return NextResponse.json(
        { error: errorDetails || 'Failed to initialize video upload' },
        { status: initResponse.status }
      );
    }

    const publishId = initData.data?.publish_id;
    const uploadUrl = initData.data?.upload_url;
    
    if (!publishId || !uploadUrl) {
      console.error('Missing publish_id or upload_url in response:', initData);
      return NextResponse.json(
        { error: 'Missing publish_id or upload_url in TikTok response' },
        { status: 500 }
      );
    }

    // Step 3: 指定されたアップロードURLにビデオデータをアップロード
    console.log('Uploading video data to TikTok upload URL:', uploadUrl);
    
    if (totalChunkCount === 1) {
      // 単一チャンクの場合（5MB未満または単一チャンクでアップロード）
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT', // TikTokのドキュメントではPUTメソッドが推奨されています
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Length': String(videoSize),
          'Content-Range': `bytes 0-${videoSize - 1}/${videoSize}`
        },
        body: videoBuffer,
      });

      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.text().catch(() => 'Unknown upload error');
        console.error('Failed to upload video data:', uploadError);
        return NextResponse.json(
          { error: `Failed to upload video data: ${uploadError}` },
          { status: uploadResponse.status }
        );
      }
      
      console.log('Video successfully uploaded to TikTok in a single chunk');
    } else {
      // 複数チャンクの場合（5MB以上のファイル）
      // 注: 実際の実装ではこちらのロジックも完成させる必要があります
      return NextResponse.json(
        { error: 'Multi-chunk upload is not implemented in this version.' },
        { status: 501 }
      );
    }

    // Step 4: アップロードステータスを確認
    console.log('Checking upload status for publish ID:', publishId);
    const statusResponse = await fetch('https://open.tiktokapis.com/v2/post/publish/status/fetch/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        publish_id: publishId
      }),
    });

    const statusData = await statusResponse.json();
    console.log('TikTok status check response:', statusData);

    // クライアントにレスポンスを返す
    return NextResponse.json({
      publishId: publishId,
      status: statusData.data?.status || 'PENDING',
      message: 'Video upload initiated successfully. Check your TikTok inbox to complete the post.',
      details: statusData.data || {}
    });
  } catch (error) {
    console.error('TikTok upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}