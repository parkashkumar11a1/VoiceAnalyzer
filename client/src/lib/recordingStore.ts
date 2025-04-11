import { create } from 'zustand';
import { Recording } from '@shared/schema';

interface RecordingState {
  recordings: Recording[];
  setRecordings: (recordings: Recording[]) => void;
  addRecording: (recording: Recording) => void;
  deleteRecording: (id: number) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export const useRecordingStore = create<RecordingState>((set) => ({
  recordings: [],
  setRecordings: (recordings) => set({ recordings }),
  addRecording: (recording) => set((state) => ({ 
    recordings: [recording, ...state.recordings] 
  })),
  deleteRecording: (id) => set((state) => ({ 
    recordings: state.recordings.filter((recording) => recording.id !== id) 
  })),
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  error: null,
  setError: (error) => set({ error }),
}));
