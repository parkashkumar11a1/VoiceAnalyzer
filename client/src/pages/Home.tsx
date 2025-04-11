import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RecordingSection from "@/components/RecordingSection";
import RecordingHistory from "@/components/RecordingHistory";
import ConfirmModal from "@/components/ConfirmModal";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Recording } from "@shared/schema";

const Home: React.FC = () => {
  const { toast } = useToast();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [recordingToDelete, setRecordingToDelete] = useState<number | null>(
    null,
  );

  // Fetch recordings
  const recordingsQuery = useQuery({
    queryKey: ["/api/recordings"],
    retry: 1,
  });

  // Delete recording mutation
  const deleteRecordingMutation = useMutation({
    mutationFn: (id: number) => {
      return fetch(`/api/recordings/${id}`, {
        method: "DELETE",
        credentials: "include",
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to delete recording");
        return res.json();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recordings"] });
      toast({
        title: "Success",
        description: "Recording deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete recording",
        variant: "destructive",
      });
    },
  });

  const handleDeleteRecording = (id: number) => {
    setRecordingToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (recordingToDelete !== null) {
      deleteRecordingMutation.mutate(recordingToDelete);
      setIsDeleteModalOpen(false);
      setRecordingToDelete(null);
    }
  };

  const closeModal = () => {
    setIsDeleteModalOpen(false);
    setRecordingToDelete(null);
  };
  function playSound(url: string) {
    var a = new Audio(url);
    a.play();
  }

  let sound = new Audio(
    "https://3210ec5c-a307-4833-ac77-74c455c80a3b-00-1fmjbs2dogzvc.worf.replit.dev/uploads/recording-1744346707213-624661289.mp3",
  );
  sound.onplay = () => {};
  return (
    <div className="min-h-screen flex flex-col bg-neutral-100">
      <button onClick={() => sound.play()}>Play aaaass</button>
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <RecordingSection
          onRecordingSaved={() => {
            queryClient.invalidateQueries({ queryKey: ["/api/recordings"] });
            toast({
              title: "Success",
              description: "Recording saved successfully",
            });
          }}
        />
        <RecordingHistory
          recordings={recordingsQuery.data || []}
          isLoading={recordingsQuery.isLoading}
          isError={recordingsQuery.isError}
          onDeleteRecording={handleDeleteRecording}
        />
      </main>
      <Footer />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeModal}
        onConfirm={confirmDelete}
        title="Xác nhận xóa"
        description="Bạn có chắc chắn muốn xóa bản ghi âm này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  );
};

export default Home;
