// src/components/UploadVideo.tsx
import React, { useState } from "react";
import { uploadVideo, updateMovie } from "../api";

interface Props {
  movieId: number;
  onUpload: () => void;
}

export const UploadVideo: React.FC<Props> = ({ movieId, onUpload }) => {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    const url = await uploadVideo(movieId, file);
    await updateMovie(movieId, { video_url: url });
    onUpload();
  };

  return (
    <div>
      <input type="file" accept="video/mp4" onChange={e => setFile(e.target.files?.[0] || null)} />
      <button onClick={handleUpload}>Upload Video</button>
    </div>
  );
};