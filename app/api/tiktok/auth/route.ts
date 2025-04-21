import { NextRequest, NextResponse } from 'next/server';

// TikTok OAuth credentials - In a real app, store these in environment variables
const CLIENT_KEY = 'XXXXXXXXX';
const REDIRECT_URI = 'XXXXXXXX'; // 開発環境では適切なURLに変更

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const state = searchParams.get('state');

    if (!state) {
      return NextResponse.json(
        { error: 'Missing state parameter' },
        { status: 400 }
      );
    }

    console.log('Initiating TikTok auth with state:', state);

    // Build the TikTok authorization URL
    const authUrl = new URL('https://www.tiktok.com/v2/auth/authorize/');
    authUrl.searchParams.append('client_key', CLIENT_KEY);
    authUrl.searchParams.append('response_type', 'code');
    // TikTok APIのビデオアップロードに必要なスコープを確認
    authUrl.searchParams.append('scope', 'video.publish,video.upload,user.info.basic');
    authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.append('state', state);

    console.log('Redirecting to TikTok auth URL:', authUrl.toString());

    // Redirect to TikTok's authorization page
    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error('TikTok auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}