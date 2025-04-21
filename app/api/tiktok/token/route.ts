import { NextRequest, NextResponse } from 'next/server';

// TikTok OAuth credentials - In a real app, store these in environment variables
const CLIENT_KEY = 'XXXXXXXXX';
const CLIENT_SECRET = 'XXXXXXXXX';
const REDIRECT_URI = 'XXXXXXXXX'; // 開発環境では適切なURLに変更

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' }, 
        { status: 400 }
      );
    }

    console.log('Exchanging code for token:', { code });

    // Make a request to TikTok's token endpoint
    const tokenUrl = 'https://open.tiktokapis.com/v2/oauth/token/';
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: CLIENT_KEY,
        client_secret: CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
      }).toString(),
    });

    const tokenData = await response.json();
    console.log('TikTok token response:', JSON.stringify(tokenData));

    if (!response.ok) {
      console.error('TikTok token exchange failed:', tokenData);
      return NextResponse.json(
        { error: tokenData.error_description || tokenData.error?.message || 'Failed to exchange authorization code' },
        { status: response.status }
      );
    }

    // TikTokのレスポンス形式に合わせて処理
    // V2 APIでは、データが data プロパティ内にネストされている可能性がある
    const accessToken = tokenData.data?.access_token || tokenData.access_token;
    const expiresIn = tokenData.data?.expires_in || tokenData.expires_in;
    const refreshToken = tokenData.data?.refresh_token || tokenData.refresh_token;
    const openId = tokenData.data?.open_id || tokenData.open_id;

    if (!accessToken) {
      console.error('No access token in response:', tokenData);
      return NextResponse.json(
        { error: 'No access token found in response' },
        { status: 500 }
      );
    }

    // Return the access token data to the client
    return NextResponse.json({
      access_token: accessToken,
      expires_in: expiresIn,
      refresh_token: refreshToken,
      open_id: openId
    });
  } catch (error) {
    console.error('TikTok token error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}