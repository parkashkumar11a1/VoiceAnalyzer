import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Recording } from '@shared/schema';
import { formatTime } from '@/lib/utils/formatTime';
import { Play, Pause, Download, Share, Trash } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface RecordingCardProps {
  recording: Recording;
  onDelete: () => void;
}

const RecordingCard: React.FC<RecordingCardProps> = ({ recording, onDelete }) => {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Create audio element
    const audio = new Audio(recording.audioUrl);
    audioRef.current = audio;
    
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    });
    
    return () => {
      // Cleanup
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [recording.audioUrl]);

  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    } else {
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
        toast({
          title: 'Error',
          description: 'Could not play audio. Try again later.',
          variant: 'destructive',
        });
      });
      
      progressIntervalRef.current = setInterval(() => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      }, 100);
    }
    
    setIsPlaying(!isPlaying);
  };

  const downloadRecording = () => {
    const a = document.createElement('a');
    a.href = recording.audioUrl;
    a.download = recording.filename || 'recording.webm';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const shareRecording = () => {
    if (navigator.share) {
      navigator.share({
        title: recording.question,
        text: `Listen to my recording: ${recording.question}`,
        url: window.location.href,
      }).catch(error => {
        console.error('Error sharing:', error);
        toast({
          title: 'Sharing not supported',
          description: 'Your browser does not support sharing or the operation was cancelled.',
        });
      });
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast({
          title: 'Link copied',
          description: 'Link to this page has been copied to clipboard',
        });
      }).catch(() => {
        toast({
          title: 'Error',
          description: 'Could not copy link to clipboard',
          variant: 'destructive',
        });
      });
    }
  };

  const progressPercentage = recording.duration > 0 
    ? (currentTime / recording.duration) * 100 
    : 0;

  const formattedDate = recording.createdAt 
    ? format(new Date(recording.createdAt), 'dd/MM/yyyy') 
    : '';

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-lg text-neutral-800">{recording.question}</h3>
          <span className="text-sm text-neutral-500">{formattedDate}</span>
        </div>
        
        <div className="flex items-center text-sm text-neutral-600 mb-4">
          <span className="mr-1">⏱️</span>
          <span>{formatTime(recording.duration)}</span>
        </div>
        
        {/* Audio player */}
        <div className="flex items-center space-x-3 mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={togglePlayback}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm transition-all ${
              isPlaying ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'
            }`}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          
          <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
            <div 
              className="bg-cyan-500 h-full transition-all"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          
          <span className="text-sm text-neutral-600">
            {formatTime(currentTime)} / {formatTime(recording.duration)}
          </span>
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-end space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={downloadRecording}
            className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-full"
            aria-label="Download"
          >
            <Download className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={shareRecording}
            className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-full"
            aria-label="Share"
          >
            <Share className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="p-2 text-red-500 hover:bg-neutral-100 rounded-full"
            aria-label="Delete"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecordingCard;
