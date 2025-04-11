import React, { useState, useEffect } from 'react';
import { Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Moon, Sun, HelpCircle } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';

const Header: React.FC = () => {
  const [theme, setTheme] = useState('light');
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <header className="bg-primary-500 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-2xl font-medium flex items-center font-heading">
          <Mic className="mr-2" />
          Voice Recorder
        </h1>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-white/10 transition-colors text-white"
          >
            {theme === 'light' ? <Moon /> : <Sun />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsHelpOpen(true)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors text-white ml-2"
          >
            <HelpCircle />
          </Button>
        </div>
      </div>

      <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hướng dẫn sử dụng</DialogTitle>
            <DialogDescription>
              Ứng dụng Voice Recorder giúp bạn ghi âm và lưu trữ câu hỏi một cách dễ dàng.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <h3 className="font-semibold">Ghi âm:</h3>
              <p className="text-sm text-muted-foreground">
                1. Nhập câu hỏi của bạn vào ô văn bản<br />
                2. Nhấn nút ghi âm (biểu tượng mic) để bắt đầu<br />
                3. Nói câu hỏi của bạn vào micro<br />
                4. Nhấn nút dừng (biểu tượng stop) để kết thúc<br />
                5. Nhấn "Lưu" để lưu bản ghi âm
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Quản lý bản ghi:</h3>
              <p className="text-sm text-muted-foreground">
                - Phát lại bản ghi âm bằng nút play<br />
                - Xóa bản ghi không cần thiết bằng nút xóa<br />
                - Sắp xếp và tìm kiếm bản ghi âm dễ dàng
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsHelpOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
