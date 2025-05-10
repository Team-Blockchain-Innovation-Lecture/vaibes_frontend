'use client';

import type React from 'react';
import { useState, useEffect, useRef, Suspense, useImperativeHandle, forwardRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Send, Play, Pause, SkipBack, SkipForward, Heart } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { usePrivy } from '@privy-io/react-auth';
import { useSolanaWallets } from '@privy-io/react-auth/solana';
import { ErrorBoundary } from 'react-error-boundary';
import { ReleaseButton } from '@/components/release-button';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface GeneratedSong {
  title: string;
  lyrics: string;
  coverUrl: string;
  audioUrl: string;
  genre: string;
}

interface GeneratedVideo {
  videoUrl: string;
}

interface MusicTrack {
  id: number;
  title: string;
  prompt: string;
  audio_url?: string;
  stream_audio_url?: string;
  source_stream_audio_url?: string;
  image_url?: string;
  source_image_url?: string;
  tags?: string;
  createTime?: number;
  duration?: number;
  model_name?: string;
}

interface ProgressRef {
  startFakeProgressAnimation: () => void;
  setGenerationProgress: (progress: number) => void;
}

interface Props {
  searchParams: {
    prompt?: string;
    genre?: string;
    task_id?: string;
  };
}

// Create ChatContent component
function ChatContent() {
  console.log('ChatContent component rendering');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(true); // Initial state is generating
  const [isLoading, setIsLoading] = useState(false);
  const [generatedSong, setGeneratedSong] = useState<GeneratedSong | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState('00:00');
  const [duration, setDuration] = useState('00:00');
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string>(''); // Current task ID
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasInitialized = useRef(false); // First execution flag
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = usePrivy();
  const { wallets } = useSolanaWallets();
  const solanaWallet = wallets && wallets.length > 0 ? wallets[0] : null;
  const userAddress = solanaWallet?.address || '';

  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<GeneratedVideo | null>(null);

  const musicProgressRef = useRef<ProgressRef>(null);
  const videoProgressRef = useRef<ProgressRef>(null);

  // Load initial prompt from URL parameters and fetch generated music
  useEffect(() => {
    if (hasInitialized.current) return; // Do nothing if already initialized
    hasInitialized.current = true; // Set initialized flag

    const prompt = searchParams.get('prompt');
    const genre = searchParams.get('genre');
    const taskId = searchParams.get('task_id');
    const videoStyle = searchParams.get('video_style') || 'anime';

    console.log('URL Parameters:', { prompt, genre, taskId, videoStyle });

    if (!prompt || !genre || !taskId) {
      console.error('Missing required parameters:', { prompt, genre, taskId });
      toast({
        title: 'An error occurred',
        description: 'Required parameters are missing',
        variant: 'destructive',
      });
      router.push('/create');
      return;
    }

    // Initial messages
    setMessages([
      { role: 'user', content: prompt },
      { role: 'assistant', content: `Generating a ${genre} song. Please wait...` },
    ]);

    // Start fake progress animation

    setIsGenerating(true);
    musicProgressRef.current?.startFakeProgressAnimation();
    // Call music generation API
    const instrumental = searchParams.get('instrumental') === 'true';
    generateMusic(prompt, genre, instrumental, taskId, videoStyle);
  }, [searchParams]); // Reset dependency array

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Start fake progress animation

  // Function to start polling
  const startPolling = (taskId: string, currentPrompt: string, currentGenre: string) => {
    const poll = async () => {
      try {
        console.log(`Starting polling - Task ID: ${taskId}`);
        const response = await fetch(`/api/callback/music?task_id=${taskId}`);
        const data = await response.json();

        console.log('Polling response:', data);

        if (data.success && data.data) {
          console.log('Polling response 2:', data);
          console.log('Polling response completed:', data);

          // Generation completed
          musicProgressRef.current?.setGenerationProgress(100);
          setIsGenerating(false);
          fetchMusicData(data.data, currentPrompt, currentGenre, taskId);
        } else {
          console.log('Data not retrieved yet...');
          setTimeout(poll, 5000); // Check again after 5 seconds
        }
      } catch (error) {
        console.error('Error polling:', error);
        setTimeout(poll, 5000); // Check again after 5 seconds even if error occurs
      }
    };
    poll(); // Start initial polling
  };

  // Function to start video polling
  const startVideoPolling = (taskId: string, currentPrompt: string, currentGenre: string) => {
    const videoPoll = async () => {
      try {
        console.log(`Starting video polling - Task ID: ${taskId}`);
        const response = await fetch(`/api/callback/video?task_id=${taskId}`);
        const data = await response.json();

        console.log('Video polling response:', data);

        if (data.success && data.data) {
          console.log('Video polling response 2:', data);
          console.log('Video polling response completed:', data);

          // Generation completed
          videoProgressRef.current?.setGenerationProgress(100);
          setIsVideoGenerating(false);
          fetchVideoData(data.data, currentPrompt, currentGenre, taskId);
        } else {
          console.log('Video data not retrieved yet...');
          setTimeout(videoPoll, 5000); // Check again after 5 seconds
        }
      } catch (error) {
        console.error('Error video polling:', error);
        setTimeout(videoPoll, 5000); // Check again after 5 seconds even if error occurs
      }
    };
    videoPoll(); // Start initial polling
  };

  // Function to call music generation API
  const generateMusic = async (
    prompt: string,
    genre: string,
    instrumental: boolean,
    taskId: string,
    videoStyle: string
  ) => {
    try {
      musicProgressRef.current?.setGenerationProgress(10);

      // Call music generation API
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          genre,
          instrumental,
          model_version: 'v4',
          timeout: 3,
          task_id: taskId,
        }),
      });

      const data = await response.json();
      console.log('Generate API response:', data);

      if (data.success) {
        // Use task_id from external API response
        const apiTaskId = data.data?.task_id || data.task_id;
        console.log('Task ID from external API:', apiTaskId);
        setCurrentTaskId(apiTaskId);

        // Create record in Raw_music table
        await fetch('/api/raw-music', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            task_id: taskId,
            music_task_id: apiTaskId,
            userAddress: userAddress,
            is_completed: false,
            audio_url: '',
            image_url: '',
            prompt: prompt,
            video_style: videoStyle,
          }),
        });

        // Timeout message
        setMessages((prev) => [
          ...prev.slice(0, -1),
          {
            role: 'assistant',
            content: 'Music generation is taking longer than expected. Please wait...',
          },
        ]);

        // Start polling
        startPolling(taskId, prompt, genre);
      } else {
        toast({
          title: 'An error occurred',
          description: data.message || 'Music generation failed',
          variant: 'destructive',
        });
        setIsGenerating(false);
      }
    } catch (error) {
      console.error('Error generating music:', error);
      toast({
        title: 'An error occurred',
        description: 'An error occurred during music generation',
        variant: 'destructive',
      });
      setIsGenerating(false);
    }
  };

  // Function to fetch music data from callback
  const fetchMusicData = async (data: any, prompt: string, genre: string, taskId: string) => {
    try {
      setIsLoading(true);

      // Set song information from API response
      const songData = {
        title: `${genre} Music`,
        audioUrl: data.audio_url || '',
        coverUrl: data.image_url || '/placeholder.svg?height=400&width=400',
        genre: genre,
        lyrics: prompt || '',
      };

      console.log('Final song data:', songData);
      setGeneratedSong(songData);
      //}
      //   // --- DB update ---
      //   try {
      //     await fetch('/api/raw-music', {
      //       method: 'PATCH',
      //       headers: {
      //         'Content-Type': 'application/json',
      //       },
      //       body: JSON.stringify({
      //         task_id: taskId,
      //         is_completed: true,
      //         audio_url: songData.audioUrl,
      //         image_url: songData.coverUrl,
      //       }),
      //     });
      //   } catch (err) {
      //     console.error('Failed to update DB:', err);
      //   }
      // --- end DB update ---

      // Reset playback state
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime('00:00');

      // Add AI assistant response
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: 'assistant',
          content: `A ${genre} song has been created. You can play it on the right player.`,
        },
        {
          role: 'assistant',
          content: `Yeah, we're dropping videos now.`,
        },
      ]);
    } catch (error) {
      console.error('Error fetching music data:', error);
      toast({
        title: 'An error occurred',
        description: 'An error occurred while fetching music data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);

      // Start polling
      startVideoPolling(taskId, prompt, genre);
      setIsVideoGenerating(true);
      videoProgressRef.current?.startFakeProgressAnimation();
    }
  };

  // Function to fetch video data from callback
  const fetchVideoData = async (data: any, prompt: string, genre: string, taskId: string) => {
    try {
      setIsVideoLoading(true);

      // Set video information from API response
      const videoData = {
        videoUrl: data.merged_video_url || '',
      };

      console.log('Final video data:', videoData);
      setGeneratedVideo(videoData);
      //}
      //   // --- DB update ---
      //   try {
      //     await fetch('/api/raw-music', {
      //       method: 'PATCH',
      //       headers: {
      //         'Content-Type': 'application/json',
      //       },
      //       body: JSON.stringify({
      //         task_id: taskId,
      //         is_completed: true,
      //         audio_url: songData.audioUrl,
      //         image_url: songData.coverUrl,
      //       }),
      //     });
      //   } catch (err) {
      //     console.error('Failed to update DB:', err);
      //   }
      // --- end DB update ---

      // Add AI assistant response
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `The video's done...`,
        },
      ]);
    } catch (error) {
      console.error('Error fetching video data:', error);
      toast({
        title: 'An error occurred',
        description: 'An error occurred while fetching video data',
        variant: 'destructive',
      });
    } finally {
      setIsVideoLoading(false);
    }
  };

  // Music player control functions
  const togglePlay = () => {
    if (!audioRef.current || !generatedSong) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      if (!audioRef.current.src) {
        audioRef.current.src = generatedSong.audioUrl;
        audioRef.current.addEventListener('timeupdate', updateProgress);
        audioRef.current.addEventListener('loadedmetadata', () => {
          setDuration(formatTime(Math.floor(audioRef.current!.duration)));
        });
      }
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const updateProgress = () => {
    if (!audioRef.current) return;
    const duration = audioRef.current.duration;
    const currentTime = audioRef.current.currentTime;
    const progressPercent = (currentTime / duration) * 100;
    setProgress(progressPercent);
    setCurrentTime(formatTime(Math.floor(currentTime)));
  };

  const startDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !audioRef.current) return;

    setIsDragging(true);
    const progressBar = progressBarRef.current;
    const rect = progressBar.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const width = progressBar.clientWidth;
    const percentage = (offsetX / width) * 100;

    // Update progress bar visually
    setProgress(percentage);

    // Calculate time based on percentage
    const audioDuration = audioRef.current.duration;
    const newTime = (percentage / 100) * audioDuration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(formatTime(Math.floor(newTime)));
  };

  const onDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !progressBarRef.current || !audioRef.current) return;

    const progressBar = progressBarRef.current;
    const rect = progressBar.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;

    // Ensure offsetX is within the bounds of the progress bar
    const boundedOffsetX = Math.max(0, Math.min(offsetX, progressBar.clientWidth));

    const percentage = (boundedOffsetX / progressBar.clientWidth) * 100;

    // Update progress bar visually
    setProgress(percentage);

    // Calculate time based on percentage
    const audioDuration = audioRef.current.duration;
    const newTime = (percentage / 100) * audioDuration;
    setCurrentTime(formatTime(Math.floor(newTime)));
  };

  const endDrag = () => {
    if (!isDragging || !audioRef.current) return;

    // Set the current time of the audio based on the final progress
    const newTime = (progress / 100) * audioRef.current.duration;
    audioRef.current.currentTime = newTime;

    setIsDragging(false);
  };

  const restart = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setProgress(0);
    setCurrentTime('00:00');

    if (!isPlaying) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Add event listeners for global drag end
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleMouseUp = () => {
        endDrag();
      };

      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  // Handle audio events
  useEffect(() => {
    if (typeof window !== 'undefined' && generatedSong?.audioUrl) {
      // Create audio element if it doesn't exist
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.preload = 'auto';
      }

      // Set new source
      audioRef.current.src = generatedSong.audioUrl;
      audioRef.current.load();

      // Add event listeners
      const audio = audioRef.current;

      const onEnded = () => {
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime('00:00');
      };

      const onTimeUpdate = () => {
        updateProgress();
      };

      const onLoadedMetadata = () => {
        setDuration(formatTime(Math.floor(audio.duration)));
      };

      audio.addEventListener('ended', onEnded);
      audio.addEventListener('timeupdate', onTimeUpdate);
      audio.addEventListener('loadedmetadata', onLoadedMetadata);

      return () => {
        if (audio) {
          audio.pause();
          audio.removeEventListener('ended', onEnded);
          audio.removeEventListener('timeupdate', onTimeUpdate);
          audio.removeEventListener('loadedmetadata', onLoadedMetadata);
        }
      };
    }
  }, [generatedSong?.audioUrl]);

  // Render generation loading state
  const renderGenerationLoading = () => {
    // Loading display during music generation
    return <MusicProgress ref={musicProgressRef} currentTaskId={currentTaskId} />;
  };

  const renderVideoGenerationLoading = () => {
    // Loading display during video generation
    return <VideoPrgress ref={videoProgressRef} currentTaskId={currentTaskId} />;
  };

  return (
    <div className="h-full flex flex-col md:flex-row">
      {/* Chat section */}
      <div className="flex-1 flex flex-col p-4 bg-[#1a0e26] overflow-hidden">
        <div className="flex-1 overflow-y-auto mb-4 space-y-4 pb-2">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  message.role === 'user' ? 'bg-[#d4af37] text-black' : 'bg-[#2a1a3e] text-white'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
          {generatedVideo && (
            <div className="flex">
              <ReleaseButton videoData={generatedVideo} musicData={generatedSong} />
            </div>
          )}
        </div>

        <div className="mt-auto">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="メッセージを入力..."
              className="flex-1 bg-[#2a1a3e] rounded-full py-3 px-6 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && input.trim()) {
                  e.preventDefault();
                  // ここに送信時の処理
                }
              }}
              disabled={isGenerating}
            />
            <button
              className="bg-[#d4af37] p-3 rounded-full text-black disabled:opacity-50"
              disabled={!input.trim() || isGenerating}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Music player section */}
      <div className="md:w-1/3 lg:w-2/5 bg-[#2a1a3e] p-4 md:p-6 overflow-y-auto">
        <div className={`${isVideoGenerating ? 'block' : 'hidden'}`}>
          {renderVideoGenerationLoading()}
        </div>
        {isVideoLoading ? (
          <div className="flex flex-col items-center justify-center mb-10">
            <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-white/80">Loading music data...</p>
          </div>
        ) : generatedVideo ? (
          <>
            <div className="space-y-6 mb-10">
              <div className="relative aspect-[9/16] overflow-hidden rounded-lg">
                <video
                  src={generatedVideo.videoUrl}
                  controls
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  onError={(e) => console.error('Video loading error:', e)}
                >
                  <source src={generatedVideo.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-white/70 mb-10">
            <p>No music has been generated</p>
            <div className="text-white/70 text-center max-w-md space-y-2">
              <p>Task ID: {currentTaskId}</p>
              <p>Status: Processing</p>
              <p>Message: Timeout occurred. Processing continues.</p>
            </div>
          </div>
        )}
        <div className={`${isGenerating ? 'block' : 'hidden'}`}>{renderGenerationLoading()}</div>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-white/80">Loading music data...</p>
          </div>
        ) : generatedSong ? (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">{generatedSong.title}</h2>
            <p className="text-white/60 text-sm mb-6">Genre: {generatedSong.genre}</p>

            <div className="relative aspect-square overflow-hidden rounded-lg mb-6">
              <Image src={generatedSong.coverUrl} alt="Album Cover" fill className="object-cover" />
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">{currentTime}</span>
                <span className="text-white/80 text-sm">{duration}</span>
              </div>

              <div
                ref={progressBarRef}
                className="h-2 bg-white/10 rounded-full cursor-pointer relative overflow-hidden"
                onClick={startDrag}
                onMouseMove={onDrag}
                onMouseDown={startDrag}
              >
                <div
                  className="absolute h-full bg-[#d4af37] rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <button className="p-2 text-white/80 hover:text-white" onClick={restart}>
                  <SkipBack size={24} />
                </button>

                <button className="p-4 bg-[#d4af37] rounded-full text-black" onClick={togglePlay}>
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>

                <button className="p-2 text-white/80 hover:text-white">
                  <Heart size={24} />
                </button>
              </div>
            </div>

            {generatedSong.lyrics && (
              <div className="mt-8 mb-8">
                <h3 className="text-xl font-bold text-white mb-3">Lyrics</h3>
                <div className="bg-[#1a0e26] rounded-lg p-4 text-white/90 whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                  {generatedSong.lyrics}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-white/70">
            <p>No music has been generated</p>
            <div className="text-white/70 text-center max-w-md space-y-2">
              <p>Task ID: {currentTaskId}</p>
              <p>Status: Processing</p>
              <p>Message: Timeout occurred. Processing continues.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Error fallback component
function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-xl font-bold mb-4">An error occurred</h2>
      <p className="text-red-500 mb-4">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Retry
      </button>
    </div>
  );
}

const VideoPrgress = forwardRef<
  any,
  {
    currentTaskId: string;
  }
>(({ currentTaskId }, ref) => {
  const [generationProgress, setGenerationProgress] = useState(0); // Generation progress (0-100)
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  useImperativeHandle(ref, () => ({
    startFakeProgressAnimation: () => {
      // Gradually increase progress but stop at 90% (wait for actual callback)
      let currentProgress = 0;

      progressInterval.current = setInterval(() => {
        if (currentProgress < 90) {
          // Slow down progress
          const increment = (90 - currentProgress) / 20;
          currentProgress += Math.max(0.5, increment);
          setGenerationProgress(currentProgress);
        } else {
          // Clear interval when reaching 90%
          if (progressInterval.current) {
            clearInterval(progressInterval.current);
          }
        }
      }, 1000);
    },
    setGenerationProgress: (progress: number) => {
      setGenerationProgress(progress);
    },
  }));
  return (
    <div className="flex flex-col items-center justify-center mb-10">
      <div className="relative w-40 h-40 mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-[#2a1a3e]"></div>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="#d4af37"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${generationProgress * 2.89}, 289`}
            transform="rotate(-90, 50, 50)"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold text-white">{Math.round(generationProgress)}%</span>
        </div>
      </div>

      <h3 className="text-xl font-bold text-white mb-3">Generating video...</h3>
      <div className="text-white/70 text-center max-w-md space-y-2">
        <p>Task ID: {currentTaskId}</p>
        <p>Status: Processing</p>
        <p>Message: Timeout occurred. Processing continues.</p>
      </div>

      <div className="w-full max-w-md mt-8">
        <div className="h-2 bg-[#2a1a3e] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#d4af37] transition-all duration-500 ease-out"
            style={{ width: `${generationProgress}%` }}
          ></div>
        </div>
        <div className="mt-2 flex justify-between text-sm text-white/60">
          <span>Start</span>
          <span>Processing...</span>
          <span>Complete</span>
        </div>
      </div>
    </div>
  );
});

const MusicProgress = forwardRef<
  any,
  {
    currentTaskId: string;
  }
>(({ currentTaskId }, ref) => {
  const [generationProgress, setGenerationProgress] = useState(0); // Generation progress (0-100)
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  useImperativeHandle(ref, () => ({
    startFakeProgressAnimation: () => {
      // Gradually increase progress but stop at 90% (wait for actual callback)
      let currentProgress = 0;

      progressInterval.current = setInterval(() => {
        if (currentProgress < 90) {
          // Slow down progress
          const increment = (90 - currentProgress) / 20;
          currentProgress += Math.max(0.5, increment);
          setGenerationProgress(currentProgress);
        } else {
          // Clear interval when reaching 90%
          if (progressInterval.current) {
            clearInterval(progressInterval.current);
          }
        }
      }, 1000);
    },
    setGenerationProgress: (progress: number) => {
      setGenerationProgress(progress);
    },
  }));

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="relative w-40 h-40 mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-[#2a1a3e]"></div>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="#d4af37"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${generationProgress * 2.89}, 289`}
            transform="rotate(-90, 50, 50)"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold text-white">{Math.round(generationProgress)}%</span>
        </div>
      </div>

      <h3 className="text-xl font-bold text-white mb-3">Generating music...</h3>
      <div className="text-white/70 text-center max-w-md space-y-2">
        <p>Task ID: {currentTaskId}</p>
        <p>Status: Processing</p>
        <p>Message: Timeout occurred. Processing continues.</p>
      </div>

      <div className="w-full max-w-md mt-8">
        <div className="h-2 bg-[#2a1a3e] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#d4af37] transition-all duration-500 ease-out"
            style={{ width: `${generationProgress}%` }}
          ></div>
        </div>
        <div className="mt-2 flex justify-between text-sm text-white/60">
          <span>Start</span>
          <span>Processing...</span>
          <span>Complete</span>
        </div>
      </div>
    </div>
  );
});

// Main page component
export default function ChatPage() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          </div>
        }
      >
        <ChatContent />
      </Suspense>
    </ErrorBoundary>
  );
}

// Helper functions to generate sample content
function generateTitle(theme: string): string {
  const titles = [
    `${theme} Dreams`,
    `Digital ${theme}`,
    `${theme} Nights`,
    `Romantic ${theme}`,
    `${theme} Future`,
    `${theme} Moonlight`,
  ];
  return titles[Math.floor(Math.random() * titles.length)];
}

function generateLyrics(theme: string): string {
  if (theme.toLowerCase() === 'solana') {
    return `(Verse 1) Underneath the neon skies,
Your eyes shimmer in blockchain dreams.
Holding hands beneath starlight,
Together building brand-new schemes.

A thousand stars could never match,
The glow we find in digital streams.
Whispers shared in crypto nights,
You're my moonbeam in Solana's lights.

(Chorus) We love Solana, Dancing close,
Hearts align. Every token shared,
Your heart closer to mine.

(Verse 2) We love Solana, In your eyes,
Futures bright. Trading dreams,
Making love, Till the morning light.

(Bridge) In this decentralized romance,
We find our truth, we take our chance.
No validators needed for this love,
Just you and me, and stars above.

(Chorus) We love Solana, Dancing close,
Hearts align. Every token shared,
Your heart closer to mine.`;
  } else {
    return `(Verse 1) Digital pathways leading to you,
${theme} dreams coming into view.
Every transaction sealed with trust,
In this network, our love's a must.

(Chorus) ${theme} nights, holding you tight,
Our love secured by cryptographic light.
No central power can break our bond,
Of this connection, I am fond.

(Verse 2) Decentralized hearts beating as one,
Our journey together has just begun.
Mining moments of pure delight,
Staking our future, it feels so right.

(Bridge) No need for third parties in between,
Our love is private, yet to be seen.
Peer to peer, heart to heart,
A perfect match right from the start.

(Chorus) ${theme} nights, holding you tight,
Our love secured by cryptographic light.
No central power can break our bond,
Of this connection, I am fond.`;
  }
}
