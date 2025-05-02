'use client';

import type React from 'react';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Send, Play, Pause, SkipBack, SkipForward, Heart } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { usePrivy } from '@privy-io/react-auth';
import { useSolanaWallets } from '@privy-io/react-auth/solana';
import { ErrorBoundary } from 'react-error-boundary';

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

interface MusicTrack {
  id: string;
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

interface Props {
  searchParams: {
    prompt?: string;
    genre?: string;
    task_id?: string;
  };
}

// ChatContentコンポーネントを作成
function ChatContent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(true); // 初期状態は生成中
  const [isLoading, setIsLoading] = useState(true);
  const [generatedSong, setGeneratedSong] = useState<GeneratedSong | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState('00:00');
  const [duration, setDuration] = useState('00:00');
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0); // 生成の進行状況 (0-100)
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);
  const [currentTaskId, setCurrentTaskId] = useState<string>(''); // 現在のタスクID
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasInitialized = useRef(false); // 初回実行フラグ
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = usePrivy();
  const { wallets } = useSolanaWallets();
  const solanaWallet = wallets && wallets.length > 0 ? wallets[0] : null;
  const userAddress = solanaWallet?.address || '';

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Load initial prompt from URL parameters and fetch generated music
  useEffect(() => {
    if (hasInitialized.current) return; // 既に初期化済みの場合は何もしない
    hasInitialized.current = true; // 初期化済みフラグを設定

    const prompt = searchParams.get('prompt');
    const genre = searchParams.get('genre');
    const taskId = searchParams.get('task_id');

    console.log('URL Parameters:', { prompt, genre, taskId });

    if (!prompt || !genre || !taskId) {
      console.error('Missing required parameters:', { prompt, genre, taskId });
      toast({
        title: 'エラーが発生しました',
        description: '必要なパラメーターが不足しています',
        variant: 'destructive',
      });
      router.push('/create');
      return;
    }

    // 初期メッセージを設定
    setMessages([
      { role: 'user', content: prompt },
      { role: 'assistant', content: `${genre}ジャンルの曲を生成しています。少々お待ちください...` },
    ]);

    // 生成プログレスの擬似アニメーションを開始
    startFakeProgressAnimation();

    // 音楽生成APIを呼び出し
    const instrumental = searchParams.get('instrumental') === 'true';
    generateMusic(prompt, genre, instrumental, taskId);

    return () => {
      // クリーンアップ関数でインターバルをクリア
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, []); // 依存配列を空に戻す

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 擬似的な進行状況アニメーションを開始
  const startFakeProgressAnimation = () => {
    // プログレスを徐々に増加させるが、90%で止める（実際のコールバックを待つ）
    let currentProgress = 0;

    progressInterval.current = setInterval(() => {
      if (currentProgress < 90) {
        // 進行速度を遅くする
        const increment = (90 - currentProgress) / 20;
        currentProgress += Math.max(0.5, increment);
        setGenerationProgress(currentProgress);
      } else {
        // 90%に達したらインターバルをクリア
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }
      }
    }, 1000);
  };

  // ポーリングを開始する関数
  const startPolling = (taskId: string, currentPrompt: string, currentGenre: string) => {
    const poll = async () => {
      try {
        console.log(`ポーリング開始 - タスクID: ${taskId}`);
        const response = await fetch(`/api/callback?task_id=${taskId}`);
        const data = await response.json();

        console.log('ポーリングレスポンス:', data);

        if (data.success && data.data) {
          if (data.data.status === 'success') {
            // 生成完了
            setGenerationProgress(100);
            setIsGenerating(false);
            fetchMusicData(data.data, currentPrompt, currentGenre, taskId);
          } else if (data.data.status === 'failed') {
            // 生成失敗
            toast({
              title: 'エラーが発生しました',
              description: '音楽生成に失敗しました',
              variant: 'destructive',
            });
            setIsGenerating(false);
          } else {
            // 処理中の場合、ポーリングを継続
            console.log('処理中...');
            setTimeout(poll, 5000); // 5秒後に再度チェック
          }
        } else {
          console.log('データ未取得...');
          setTimeout(poll, 5000); // 5秒後に再度チェック
        }
      } catch (error) {
        console.error('Error polling:', error);
        setTimeout(poll, 5000); // エラーが発生しても5秒後に再度チェック
      }
    };

    poll(); // 初回のポーリングを開始
  };

  // 音楽生成APIを呼び出す関数
  const generateMusic = async (
    prompt: string,
    genre: string,
    instrumental: boolean,
    taskId: string
  ) => {
    try {
      setGenerationProgress(10); // 生成開始

      // 音楽生成APIの呼び出し
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
        // 外部APIからのレスポンスのtask_idを使用
        const apiTaskId = data.data?.task_id || data.task_id;
        console.log('外部APIからのタスクID:', apiTaskId);
        setCurrentTaskId(apiTaskId);

        // Raw_musicテーブルにレコードを作成
        await fetch('/api/raw-music', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            task_id: apiTaskId,
            userAddress: userAddress,
            is_completed: false,
            audio_url: '',
            image_url: '',
          }),
        });

        // タイムアウトメッセージを表示
        setMessages((prev) => [
          ...prev.slice(0, -1), // 最後のメッセージを削除
          {
            role: 'assistant',
            content: '音楽生成に時間がかかっています。少々お待ちください...',
          },
        ]);

        // ポーリングを開始
        startPolling(apiTaskId, prompt, genre);
      } else {
        toast({
          title: 'エラーが発生しました',
          description: data.message || '音楽生成に失敗しました',
          variant: 'destructive',
        });
        setIsGenerating(false);
      }
    } catch (error) {
      console.error('Error generating music:', error);
      toast({
        title: 'エラーが発生しました',
        description: '音楽生成中にエラーが発生しました',
        variant: 'destructive',
      });
      setIsGenerating(false);
    }
  };

  // コールバックデータから音楽情報を取得
  const fetchMusicData = async (data: any, prompt: string, genre: string, taskId: string) => {
    try {
      setIsLoading(true);

      console.log('Raw API response data:', data);

      // API応答から音楽データを抽出
      let musicData: MusicTrack[] | undefined;

      if (data.data) {
        if (data.data.callback_data) {
          // 旧形式のレスポンス
          musicData = data.data.callback_data?.data?.data?.data;
        } else if (data.data.data && data.data.data.data) {
          // 直接レスポンスの形式
          musicData = data.data.data.data;
        }
      }

      console.log('Extracted music data:', musicData);

      if (musicData && musicData.length > 0) {
        // 優先的に完成したオーディオがあるものを選ぶ
        // source_stream_audio_urlやstream_audio_urlが利用可能であればそれを使用
        let selectedTrack =
          musicData.find((track) => track.audio_url) ||
          musicData.find((track) => track.stream_audio_url) ||
          musicData.find((track) => track.source_stream_audio_url) ||
          musicData[0];

        // 既存のオーディオを停止
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.removeEventListener('timeupdate', updateProgress);
          audioRef.current = null;
        }

        // APIレスポンスから曲情報を設定
        const songData = {
          title: selectedTrack.title || `${genre} Music`,
          // オーディオURLの優先順位: audio_url > stream_audio_url > source_stream_audio_url
          audioUrl:
            selectedTrack.audio_url ||
            selectedTrack.stream_audio_url ||
            selectedTrack.source_stream_audio_url ||
            '',
          coverUrl:
            selectedTrack.image_url ||
            selectedTrack.source_image_url ||
            '/placeholder.svg?height=400&width=400',
          genre: genre,
          lyrics: extractLyrics(selectedTrack.prompt, genre) || '',
        };

        console.log('Final song data:', songData);

        setGeneratedSong(songData);

        // --- ここからDBのis_completed, audio_url, image_urlを更新 ---
        try {
          await fetch('/api/raw-music', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              task_id: taskId,
              is_completed: true,
              audio_url: songData.audioUrl,
              image_url: songData.coverUrl,
            }),
          });
        } catch (err) {
          console.error('DB更新失敗:', err);
        }
        // --- ここまでDB更新 ---

        // 再生状態をリセット
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime('00:00');

        // AIアシスタントの応答を追加
        setMessages((prev) => [
          ...prev.slice(0, -1), // 最後の「生成中」メッセージを削除
          {
            role: 'assistant',
            content: `${genre}ジャンルの曲を作成しました。右側のプレイヤーで再生できます。`,
          },
        ]);
      } else {
        toast({
          title: 'エラーが発生しました',
          description: '生成されたデータの形式が不正です',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching music data:', error);
      toast({
        title: 'エラーが発生しました',
        description: '音楽データの取得中にエラーが発生しました',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // プロンプトから歌詞を抽出する関数（実際の歌詞がない場合）
  const extractLyrics = (prompt: string, genre: string = 'EDM'): string => {
    // プロンプトをもとに簡単な歌詞を生成
    return `(Verse 1)
City lights reflecting in your eyes
We're dancing underneath these digital skies
Every moment feels like eternity
In this world that we've created, just you and me

(Chorus)
${genre} nights, holding you tight
Our love flows like code through the night
No one can break this connection we share
In this digital world beyond compare

(Verse 2)
Your touch like electricity through my veins
We're breaking free from all these chains
Together we'll create a new reality
Where our love shines for all eternity`;
  };

  // 音楽プレイヤーの制御関数
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

  // 生成中のロード画面のレンダリング
  const renderGenerationLoading = () => {
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

        <h3 className="text-xl font-bold text-white mb-3">音楽を生成中...</h3>
        <div className="text-white/70 text-center max-w-md space-y-2">
          <p>タスクID: {currentTaskId}</p>
          <p>ステータス: 処理中</p>
          <p>メッセージ: タイムアウトしました。処理は継続中です。</p>
        </div>

        <div className="w-full max-w-md mt-8">
          <div className="h-2 bg-[#2a1a3e] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#d4af37] transition-all duration-500 ease-out"
              style={{ width: `${generationProgress}%` }}
            ></div>
          </div>
          <div className="mt-2 flex justify-between text-sm text-white/60">
            <span>生成を開始</span>
            <span>処理中...</span>
            <span>完了</span>
          </div>
        </div>
      </div>
    );
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
        {isGenerating ? (
          // 生成中の表示
          renderGenerationLoading()
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-white/80">音楽データを読み込み中...</p>
          </div>
        ) : generatedSong ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">{generatedSong.title}</h2>
            <p className="text-white/60 text-sm">ジャンル: {generatedSong.genre}</p>

            <div className="relative aspect-square overflow-hidden rounded-lg">
              <Image src={generatedSong.coverUrl} alt="Album Cover" fill className="object-cover" />
            </div>

            <div className="space-y-4">
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
              <div className="mt-8">
                <h3 className="text-xl font-bold text-white mb-3">歌詞</h3>
                <div className="bg-[#1a0e26] rounded-lg p-4 text-white/90 whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                  {generatedSong.lyrics}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-white/70">
            <p>音楽が生成されていません</p>
            <div className="text-white/70 text-center max-w-md space-y-2">
              <p>タスクID: {currentTaskId}</p>
              <p>ステータス: 処理中</p>
              <p>メッセージ: タイムアウトしました。処理は継続中です。</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// エラーフォールバックコンポーネント
function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-xl font-bold mb-4">エラーが発生しました</h2>
      <p className="text-red-500 mb-4">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        再試行
      </button>
    </div>
  );
}

// メインのページコンポーネント
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
