'use client';

import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useSolanaWallets } from '@privy-io/react-auth/solana';

interface ReleaseButtonProps {
  videoData: {
    videoUrl: string;
  } | null;
  musicData: {
    title: string;
    lyrics: string;
    coverUrl: string;
    audioUrl: string;
    genre: string;
  } | null;
  onChatMessage: (msg: string) => void;
}

export function ReleaseButton({ videoData, musicData, onChatMessage }: ReleaseButtonProps) {
  const { wallets } = useSolanaWallets();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const [isReleasing, setIsReleasing] = useState(false);

  const startNftPolling = (videoId: string) => {
    const nftPoll = async () => {
      try {
        console.log(`Starting nft polling - Task ID: ${videoId}`);
        const response = await fetch(`/api/nft?video_id=${videoId}`);
        const data = await response.json();

        console.log('Video polling response:', data);

        if (data.success && data.data) {
          onChatMessage(
            `Your NFT has been successfully created. Address: ${data.data.nft_address}`
          );
          onChatMessage(`See https://solscan.io/token/${data.data.nft_address}?cluster=devnet`);
        } else {
          console.log('Video data not retrieved yet...');
          setTimeout(nftPoll, 5000); // Check again after 5 seconds
        }
      } catch (error) {
        console.error('Error video polling:', error);
        setTimeout(nftPoll, 5000); // Check again after 5 seconds even if error occurs
      }
    };
    nftPoll(); // Start initial polling
  };

  // Form validation
  const validateInput = (input: string): boolean => {
    // Reset error state
    setError('');

    // Check if input is empty
    if (!input.trim()) {
      setError('Token address or URL is required');
      return false;
    }

    // Check if input is a URL
    if (input.startsWith('http')) {
      // Validate it's a pump.fun URL
      const isPumpFunUrl = input.includes('pump.fun/coin/');
      if (!isPumpFunUrl) {
        setError('URL must be a valid pump.fun token page');
        return false;
      }
      return true;
    }

    // If not a URL, assume it's a token address
    // Basic validation for Solana addresses (they are usually 44 characters)
    if (input.length < 30) {
      setError('Token address appears to be invalid');
      return false;
    }

    return true;
  };

  // Extract token address from URL or return the address directly
  const extractTokenAddress = (input: string): string => {
    if (input.includes('pump.fun/coin/')) {
      const parts = input.split('pump.fun/coin/');
      return parts[1].split(/[?#]/)[0]; // Remove query params if any
    }
    return input;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsReleasing(true);
    if (!validateInput(tokenInput)) {
      return;
    }

    if (!videoData || !musicData) {
      toast({
        title: 'Error',
        description: 'Video and music data are required',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const tokenAddress = extractTokenAddress(tokenInput);

      // Prepare video data for registration
      const videoDataForRegistration = {
        title: musicData.title,
        description: `AI-generated ${musicData.genre} music video`,
        url: videoData.videoUrl,
        thumbnailUrl: musicData.coverUrl,
        duration: 8, // You might want to get this from the video metadata
        createdWith: 'AI Video Generator',
        lyrics: musicData.lyrics,
        videoCreator: wallets[0]?.address || null,
      };

      // API call to register the token and video
      const response = await fetch('/api/release', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenAddress,
          ...videoDataForRegistration,
          userPublicKey: wallets[0]?.address || null,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to register token');
      }

      // Success!
      toast({
        title: 'Success!',
        description: 'Your token has been successfully released.',
      });

      // Close dialog and reset form
      setDialogOpen(false);
      setTokenInput('');

      onChatMessage('Your video has been successfully released.');
      startNftPolling(data.videoId);
      onChatMessage('Your NFT is creating...');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to register token',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
          disabled={isReleasing}
        >
          Release
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Release Token Video</DialogTitle>
          <DialogDescription>
            Enter the pump.fun token contract address or URL to release your AI-generated video for
            this token.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="token-input">
                Token Address or URL <span className="text-red-500">*</span>
              </Label>
              <Input
                id="token-input"
                placeholder="https://pump.fun/coin/... or token address"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className={error ? 'border-red-500' : ''}
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <p className="text-sm text-muted-foreground">
                Enter a valid pump.fun token URL or contract address
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
