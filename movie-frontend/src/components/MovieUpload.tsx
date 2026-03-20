import React, { useMemo, useState } from "react";
import { createMovie, updateMovie, uploadVideo } from "../api";

interface Props {
  onSaved: () => Promise<void> | void;
}

export const MovieUpload: React.FC<Props> = ({ onSaved }) => {
  const [title, setTitle] = useState("");
  const [director, setDirector] = useState("");
  const [year, setYear] = useState<number>(2024);
  const [file, setFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fileLabel = useMemo(() => {
    if (!file) return "Файл не выбран";
    const mb = (file.size / 1024 / 1024).toFixed(2);
    return `${file.name} • ${mb} MB`;
  }, [file]);

  const resetForm = () => {
    setTitle("");
    setDirector("");
    setYear(2024);
    setFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Укажи название фильма.");
      return;
    }

    if (!director.trim()) {
      setError("Укажи режиссёра.");
      return;
    }

    if (!file) {
      setError("Выбери MP4-файл.");
      return;
    }

    if (file.type !== "video/mp4") {
      setError("Разрешён только формат MP4.");
      return;
    }

    try {
      setIsSubmitting(true);

      const movie = await createMovie({
        title: title.trim(),
        director: director.trim(),
        year,
      });

      const videoUrl = await uploadVideo(movie.id, file);

      await updateMovie(movie.id, {
        title: movie.title,
        director: movie.director,
        year: movie.year,
        video_url: videoUrl,
      });

      setSuccess("Фильм и видео успешно загружены.");
      resetForm();
      await onSaved();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Произошла ошибка при загрузке.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2>Добавить фильм</h2>
          <p>Метаданные сохраняются в БД, MP4 загружается в MinIO.</p>
        </div>
      </div>

      <form className="movie-form" onSubmit={handleSubmit}>
        <div className="field-grid">
          <label className="field">
            <span>Название</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например, Interstellar"
              required
            />
          </label>

          <label className="field">
            <span>Режиссёр</span>
            <input
              value={director}
              onChange={(e) => setDirector(e.target.value)}
              placeholder="Например, Christopher Nolan"
              required
            />
          </label>

          <label className="field">
            <span>Год</span>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              min={1900}
              max={2100}
              required
            />
          </label>
        </div>

        <label className="upload-box">
          <input
            type="file"
            accept="video/mp4"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
          />
          <div className="upload-content">
            <strong>Выбери MP4-файл</strong>
            <span>{fileLabel}</span>
          </div>
        </label>

        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

        <button className="primary-btn" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Загрузка..." : "Сохранить и загрузить"}
        </button>
      </form>
    </section>
  );
};