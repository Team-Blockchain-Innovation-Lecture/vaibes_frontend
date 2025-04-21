'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TikTokCallback() {
  const [status, setStatus] = useState('Processing authentication...');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get query parameters from URL
        const queryParams = new URLSearchParams(window.location.search);
        const code = queryParams.get('code');
        const state = queryParams.get('state');
        const error = queryParams.get('error');
        const errorDescription = queryParams.get('error_description');
        
        // Check for errors in the callback
        if (error) {
          setStatus(`Authentication error: ${error}`);
          setErrorDetails(errorDescription || '詳細情報がありません');
          return;
        }

        // Verify the state parameter to prevent CSRF attacks
        const storedState = localStorage.getItem('tiktok_auth_state');
        if (!state || state !== storedState) {
          setStatus('Invalid state parameter. Authentication failed.');
          setErrorDetails('セキュリティ検証に失敗しました。再度お試しください。');
          return;
        }

        // Clean up the state from localStorage
        localStorage.removeItem('tiktok_auth_state');

        if (!code) {
          setStatus('No authorization code received from TikTok.');
          setErrorDetails('TikTokから認証コードが返されませんでした。');
          return;
        }

        console.log('Received auth code from TikTok. Exchanging for token...');

        // Exchange the auth code for an access token
        const response = await fetch('/api/tiktok/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to exchange code for token');
        }

        if (!data.access_token) {
          throw new Error('No access token received from API');
        }

        console.log('Access token received successfully');

        // Store the access token in localStorage
        localStorage.setItem('tiktok_access_token', data.access_token);
        
        setStatus('Authentication successful! Redirecting...');
        
        // Redirect back to the TikTok page
        setTimeout(() => {
          router.push('/tiktok');
        }, 1500);
      } catch (error) {
        console.error('TikTok authentication error:', error);
        setStatus(`Authentication error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setErrorDetails('トークン取得処理中にエラーが発生しました。開発者コンソールで詳細を確認してください。');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="container mx-auto py-16">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>TikTok Authentication</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6">
            <p className={status.includes('successful') ? 'text-green-600' : status.includes('error') ? 'text-red-600' : 'text-gray-600'}>
              {status}
            </p>
            {errorDetails && (
              <p className="text-sm text-red-500 mt-2">{errorDetails}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}