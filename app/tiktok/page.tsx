'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RefreshCw } from 'lucide-react';

export default function TikTokPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [tokenExpiryTime, setTokenExpiryTime] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [showTokenDebug, setShowTokenDebug] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if there's a stored access token
    const storedToken = localStorage.getItem('tiktok_access_token');
    const storedExpiry = localStorage.getItem('tiktok_token_expiry');
    
    if (storedToken) {
      console.log('Found stored token');
      setAccessToken(storedToken);
      setIsLoggedIn(true);
      
      if (storedExpiry) {
        setTokenExpiryTime(new Date(storedExpiry).toLocaleString());
      }
    } else {
      console.log('No stored token found');
    }
  }, []);

  const handleTikTokLogin = () => {
    // Generate a random state for CSRF protection
    const state = Math.random().toString(36).substring(2);
    localStorage.setItem('tiktok_auth_state', state);
    
    // Redirect to our API endpoint that will handle the TikTok OAuth flow
    window.location.href = `/api/tiktok/auth?state=${state}`;
  };

  const handleUploadVideo = async () => {
    if (!videoUrl) {
      setUploadStatus('Please enter a video URL');
      return;
    }

    if (!accessToken) {
      setUploadStatus('アクセストークンが見つかりません。再度ログインしてください。');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Uploading video to TikTok...');

    try {
      const response = await fetch('/api/tiktok/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUrl,
          accessToken,
        }),
      });

      const data = await response.json();
      console.log('Upload response:', data);

      if (response.ok) {
        setUploadStatus(`Upload successful! Publish ID: ${data.publishId}`);
      } else {
        if (data.error && data.error.includes('access_token_invalid')) {
          // トークンが無効な場合は自動でログアウト
          handleLogout();
          setUploadStatus(`Upload failed: ${data.error || 'Unknown error'}. You have been logged out. Please login again.`);
        } else {
          setUploadStatus(`Upload failed: ${data.error || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('tiktok_access_token');
    localStorage.removeItem('tiktok_token_expiry');
    setIsLoggedIn(false);
    setAccessToken('');
    setTokenExpiryTime(null);
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>TikTok Integration</CardTitle>
          <CardDescription>
            Upload videos directly to your TikTok account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isLoggedIn ? (
            <Button onClick={handleTikTokLogin} className="w-full">
              Login with TikTok
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-green-600">✓ Connected to TikTok</p>
                  {tokenExpiryTime && (
                    <p className="text-xs text-gray-500">Token expires: {tokenExpiryTime}</p>
                  )}
                </div>
                <Input
                  type="text"
                  placeholder="Enter S3 MP4 video URL (must be publicly accessible)"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL must be publicly accessible and contain a valid MP4 file
                </p>
              </div>
              <div>
                <Button 
                  onClick={handleUploadVideo} 
                  className="w-full" 
                  disabled={isUploading || !videoUrl}
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                    </>
                  ) : "Upload to TikTok"}
                </Button>
                {uploadStatus && (
                  <p className={`mt-2 text-sm ${uploadStatus.includes('Error') || uploadStatus.includes('failed') ? 'text-red-500' : 'text-green-600'}`}>
                    {uploadStatus}
                  </p>
                )}
              </div>
              
              <div className="pt-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowTokenDebug(!showTokenDebug)} 
                  className="text-xs w-full"
                >
                  {showTokenDebug ? "Hide Debug Info" : "Show Debug Info"}
                </Button>
                
                {showTokenDebug && accessToken && (
                  <Alert className="mt-2">
                    <AlertTitle>Token Info</AlertTitle>
                    <AlertDescription>
                      <p className="text-xs break-all">
                        Token Preview: {accessToken.substring(0, 15)}...
                      </p>
                      <p className="text-xs mt-1">
                        Token Length: {accessToken.length} characters
                      </p>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          {isLoggedIn && (
            <Button variant="outline" onClick={handleLogout} className="w-full">
              Logout
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}