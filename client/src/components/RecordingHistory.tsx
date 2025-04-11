import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import RecordingCard from './RecordingCard';
import { Recording } from '@shared/schema';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Mic } from 'lucide-react';

interface RecordingHistoryProps {
  recordings: Recording[];
  isLoading: boolean;
  isError: boolean;
  onDeleteRecording: (id: number) => void;
}

const RecordingHistory: React.FC<RecordingHistoryProps> = ({ 
  recordings, 
  isLoading, 
  isError,
  onDeleteRecording 
}) => {
  const [sortBy, setSortBy] = useState<string>('newest');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredAndSortedRecordings = useMemo(() => {
    // First filter by search term
    const filtered = recordings.filter(recording => 
      recording.question.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Then sort
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'longest':
          return b.duration - a.duration;
        case 'shortest':
          return a.duration - b.duration;
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [recordings, sortBy, searchTerm]);

  const handleScrollToRecorder = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (isLoading) {
    return (
      <section>
        <h2 className="text-xl font-medium mb-4 text-primary-700 font-heading">Danh sách ghi âm</h2>
        <Card>
          <CardContent className="p-8 flex justify-center items-center">
            <div className="text-center">
              <div className="animate-pulse space-y-3">
                <div className="h-6 bg-neutral-200 rounded w-48 mx-auto"></div>
                <div className="h-4 bg-neutral-200 rounded w-32 mx-auto"></div>
                <div className="h-12 bg-neutral-200 rounded w-64 mx-auto mt-4"></div>
              </div>
              <p className="mt-4 text-neutral-500">Đang tải danh sách...</p>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (isError) {
    return (
      <section>
        <h2 className="text-xl font-medium mb-4 text-primary-700 font-heading">Danh sách ghi âm</h2>
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-red-500 text-6xl flex justify-center mb-4">
              <span className="material-icons" style={{ fontSize: '4rem' }}>error</span>
            </div>
            <h3 className="text-xl font-medium text-neutral-700 mb-2">Lỗi tải dữ liệu</h3>
            <p className="text-neutral-500 mb-6">Đã có lỗi xảy ra khi tải danh sách ghi âm. Vui lòng thử lại sau.</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-xl font-medium mb-4 text-primary-700 font-heading">Danh sách ghi âm</h2>
      
      {/* Filters */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center">
              <label htmlFor="sortBy" className="mr-2 text-neutral-700">Sắp xếp:</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32 border border-neutral-300 rounded-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mới nhất</SelectItem>
                  <SelectItem value="oldest">Cũ nhất</SelectItem>
                  <SelectItem value="longest">Dài nhất</SelectItem>
                  <SelectItem value="shortest">Ngắn nhất</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <Input
                type="text"
                placeholder="Tìm kiếm câu hỏi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-neutral-300 rounded-md"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Recording list */}
      <div className="space-y-4">
        {filteredAndSortedRecordings.length > 0 ? (
          filteredAndSortedRecordings.map((recording) => (
            <RecordingCard 
              key={recording.id} 
              recording={recording} 
              onDelete={() => onDeleteRecording(recording.id)}
            />
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-6xl text-neutral-300 flex justify-center mb-4">
                <Mic className="h-24 w-24" />
              </div>
              <h3 className="text-xl font-medium text-neutral-700 mb-2">Chưa có bản ghi âm nào</h3>
              <p className="text-neutral-500 mb-6">Hãy tạo bản ghi âm đầu tiên của bạn bằng cách nhập câu hỏi và nhấn nút ghi âm.</p>
              <Button 
                onClick={handleScrollToRecorder}
                className="bg-primary-500 hover:bg-primary-700 text-white"
              >
                <Mic className="mr-2 h-4 w-4" /> Bắt đầu ghi âm
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};

export default RecordingHistory;
