import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Recording } from '@shared/schema';
import { format } from 'date-fns';
import { Trash, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { formatTime } from '@/lib/utils/formatTime';

interface RecordingCardProps {
  recording: Recording;
  onDelete: () => void;
}

const RecordingCard: React.FC<RecordingCardProps> = ({ recording, onDelete }) => {
  const { toast } = useToast();
  
  // Ensure we're using the full path
  const fullPath = recording.audioUrl.startsWith('http') 
    ? recording.audioUrl 
    : `${window.location.origin}${recording.audioUrl}`;
  
  // For debugging
  console.log('Audio path:', fullPath);
  
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

  const formattedDate = recording.createdAt 
    ? format(new Date(recording.createdAt), 'dd/MM/yyyy') 
    : '';

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-lg text-primary">{recording.question}</h3>
          <span className="text-sm text-neutral-600">{formattedDate}</span>
        </div>
        
        <div className="flex items-center text-sm text-neutral-600 mb-4">
          <span className="mr-1">⏱️</span>
          <span>{formatTime(recording.duration)}</span>
        </div>
        
        {/* Standard HTML5 audio element */}
        <div className="mb-4">
          <audio controls className="w-full" preload="metadata">
            <source src={fullPath} type="audio/mpeg" />
            <source src={fullPath} type="audio/mp3" />
            <source src={fullPath} type="audio/wav" />
            <source src={fullPath} type="audio/webm" />
            Your browser does not support the audio element.
          </audio>
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-between">
          {/* Download button */}
          <a 
            href={fullPath} 
            download={recording.filename || "recording.mp3"}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-primary bg-white border border-primary rounded-md hover:bg-primary/10"
          >
            Tải xuống
          </a>
          
          {/* Delete button */}
          <Button
            variant="ghost"
            onClick={onDelete}
            className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-md"
            aria-label="Delete"
          >
            <Trash className="mr-2 h-4 w-4" /> Xóa
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecordingCard;
