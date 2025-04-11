import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Save, Trash2, Square } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/queryClient';
import { formatTime } from '@/lib/utils/formatTime';
import { useToast } from '@/hooks/use-toast';

interface RecordingSectionProps {
  onRecordingSaved: () => void;
}

const RecordingSection: React.FC<RecordingSectionProps> = ({ onRecordingSaved }) => {
  const { toast } = useToast();
  const [question, setQuestion] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    chunksRef.current = [];
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      let mediaRecorder;
      
      // Try different MIME types based on browser support
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        ''  // Default
      ];
      
      for (const mimeType of mimeTypes) {
        try {
          // Skip empty mime type or check if it's supported
          if (!mimeType || MediaRecorder.isTypeSupported(mimeType)) {
            const options = mimeType ? { mimeType } : undefined;
            mediaRecorder = new MediaRecorder(stream, options);
            console.log(`Using MIME type: ${mediaRecorder.mimeType}`);
            break;
          }
        } catch (e) {
          console.log(`MIME type ${mimeType} not supported, trying next...`);
          continue;
        }
      }
      
      if (!mediaRecorder) {
        throw new Error('No suitable MIME type found for recording');
      }
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        // Use the same mime type as the recorder for the blob
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        setAudioBlob(blob);
        
        // Stop all tracks from the stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Make sure we get data frequently to avoid missing the last chunk
      mediaRecorder.start(200); // Collect data every 200ms
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      let errorMessage = 'Could not access microphone. Please check permissions.';
      
      if (error instanceof Error) {
        errorMessage += ` Error: ${error.message}`;
      }
      
      toast({
        title: 'Lỗi truy cập microphone',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setIsRecording(false);
  };

  const cancelRecording = () => {
    stopRecording();
    setAudioBlob(null);
    setRecordingTime(0);
  };

  const saveRecording = async () => {
    if (!audioBlob) {
      toast({
        title: 'Error',
        description: 'No recording to save',
        variant: 'destructive',
      });
      return;
    }
    
    if (!question.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a question',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('data', JSON.stringify({
        question: question.trim(),
        duration: recordingTime,
      }));
      
      const response = await fetch('/api/recordings', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to save recording');
      }
      
      // Reset form
      setQuestion('');
      setAudioBlob(null);
      setRecordingTime(0);
      
      onRecordingSaved();
      
    } catch (error) {
      console.error('Error saving recording:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save recording',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <section className="mb-10">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-medium mb-4 text-primary font-heading">Tạo bản ghi âm mới</h2>
          
          <div className="mb-6">
            <label htmlFor="question" className="block mb-2 text-primary">Nhập câu hỏi của bạn:</label>
            <Textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              placeholder="Nhập câu hỏi của bạn tại đây..."
              rows={2}
            />
          </div>
          
          <div className="flex flex-col items-center">
            {/* Recording visualization */}
            <div className={`wave-container mb-4 h-10 flex items-center justify-center`} data-recording={isRecording}>
              {Array.from({ length: 10 }).map((_, i) => (
                <div 
                  key={i} 
                  className="wave-bar inline-block w-1 mx-0.5 rounded-sm bg-primary h-4"
                  style={{ animationDelay: `${i * 0.1}s` }}
                ></div>
              ))}
            </div>
            
            {/* Time indicator */}
            <div className="text-lg mb-4 font-medium text-primary">
              {formatTime(recordingTime)}
            </div>
            
            {/* Recording button */}
            <div className="mb-6 flex justify-center">
              <Button
                onClick={toggleRecording}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all ${
                  isRecording 
                    ? 'bg-amber-500 hover:bg-amber-600 animate-pulse' 
                    : 'bg-primary hover:bg-primary/80'
                }`}
                aria-label={isRecording ? 'Stop recording' : 'Start recording'}
              >
                {isRecording ? <Square className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </Button>
            </div>
            
            {/* Recording status */}
            <div className={`font-medium ${
              isRecording 
                ? 'text-amber-500' 
                : audioBlob 
                  ? 'text-primary' 
                  : 'text-neutral-600'
            }`}>
              {isRecording 
                ? 'Đang ghi âm...' 
                : audioBlob 
                  ? 'Đã ghi âm xong' 
                  : 'Nhấn nút để bắt đầu ghi âm'}
            </div>
            
            {/* Action buttons */}
            <div className="flex mt-6 space-x-3">
              <Button
                onClick={saveRecording}
                disabled={!audioBlob || isSaving}
                className="bg-primary hover:bg-primary/80 text-white"
              >
                <Save className="mr-2 h-4 w-4" /> Lưu
              </Button>
              
              <Button
                onClick={cancelRecording}
                disabled={!isRecording && !audioBlob}
                variant="outline"
                className="bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Hủy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default RecordingSection;
