import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Download, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatTime } from '@/lib/utils/formatTime';
import { useToast } from '@/hooks/use-toast';
// Import simple HTML audio player CSS

interface CustomAudioPlayerProps {
  src: string;
  duration: number;
  filename?: string;
  title?: string;
  onShare?: () => void;
}

const CustomAudioPlayer: React.FC<CustomAudioPlayerProps> = ({ 
  src, 
  duration, 
  filename = 'recording.mp3',
  title,
  onShare 
}) => {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create a hidden audio element to handle the playback
    const audio = document.createElement('audio');
    audio.src = src;
    audio.preload = 'metadata';
    
    // Add event listeners
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleAudioEnded);
    audio.addEventListener('error', handleAudioError);
    audio.addEventListener('canplaythrough', () => {
      console.log('Audio can play through');
    });
    
    // Store reference
    audioElementRef.current = audio;
    audioRef.current = audio;
    
    return () => {
      // Clean up
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        audioElementRef.current.removeEventListener('ended', handleAudioEnded);
        audioElementRef.current.removeEventListener('error', handleAudioError);
      }
    };
  }, [src]);
  
  const handleTimeUpdate = () => {
    if (audioElementRef.current) {
      setCurrentTime(audioElementRef.current.currentTime);
    }
  };
  
  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioElementRef.current) {
      audioElementRef.current.currentTime = 0;
    }
  };
  
  const handleAudioError = (e: Event) => {
    console.error('Audio error:', e);
    setIsPlaying(false);
    toast({
      title: 'Lỗi phát âm thanh',
      description: 'Không thể phát âm thanh. Vui lòng thử lại hoặc kiểm tra định dạng tệp âm thanh.',
      variant: 'destructive',
    });
  };
  
  const togglePlayback = () => {
    if (!audioElementRef.current) return;
    
    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      // Use play() Promise to handle autoplay restrictions
      audioElementRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(error => {
          console.error('Error playing audio:', error);
          toast({
            title: 'Lỗi phát âm thanh',
            description: 'Không thể phát âm thanh tự động. Vui lòng tương tác với trang và thử lại.',
            variant: 'destructive',
          });
        });
    }
  };
  
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioElementRef.current || !progressRef.current) return;
    
    // Calculate click position
    const bounds = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - bounds.left;
    const percentageClicked = clickX / bounds.width;
    
    // Set new time
    const newTime = percentageClicked * duration;
    audioElementRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = src;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  const progressPercentage = duration > 0 
    ? (currentTime / duration) * 100 
    : 0;
  
  return (
    <div className="custom-audio-player w-full">
      {title && (
        <div className="text-sm font-medium mb-2 text-primary">{title}</div>
      )}
      
      {/* Native HTML5 audio element as fallback */}
      <audio 
        controls 
        className="w-full mb-3" 
        preload="metadata"
        src={src}
      >
        Your browser does not support the audio element.
      </audio>
      
      <div className="flex items-center space-x-3">
        {/* Play/Pause button */}
        <Button
          variant="outline"
          size="icon"
          onClick={togglePlayback}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm transition-all ${
            isPlaying ? 'bg-amber-500 hover:bg-amber-600' : 'bg-primary hover:bg-primary/80'
          }`}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        </Button>
        
        {/* Progress bar */}
        <div 
          ref={progressRef}
          className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden cursor-pointer"
          onClick={handleProgressClick}
        >
          <div 
            className="bg-primary h-full transition-all"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        {/* Time indicator */}
        <span className="text-xs text-neutral-600 w-24 text-right">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
        
        {/* Action buttons */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDownload}
          className="p-1 text-primary hover:bg-neutral-100 rounded-full"
          aria-label="Download"
        >
          <Download className="h-3 w-3" />
        </Button>
        
        {onShare && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onShare}
            className="p-1 text-primary hover:bg-neutral-100 rounded-full"
            aria-label="Share"
          >
            <Share className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default CustomAudioPlayer;