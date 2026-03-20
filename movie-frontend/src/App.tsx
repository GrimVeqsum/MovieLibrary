import React, { useEffect, useState } from "react";
import { deleteMovie, getMovies, Movie } from "./api";
import { MovieList } from "./components/MovieList";
import { MovieUpload } from "./components/MovieUpload";
import "./styles.css";

export const App: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const fetchMovies = async () => {
    try {
      setPageError("");
      const data = await getMovies();
      setMovies(data);
    } catch (err) {
      if (err instanceof Error) {
        setPageError(err.message);
      } else {
        setPageError("Не удалось загрузить список фильмов.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMovie(id);
      await fetchMovies();
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Не удалось удалить фильм.");
      }
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  return (
    <div className="page">
      <div className="container">
        <header className="hero">
          <div>
            <p className="eyebrow">Movie Storage Dashboard</p>
            <h1>Фильмы, MP4 и MinIO</h1>
            <p className="hero-text">
              Фронт создаёт запись в БД, отправляет файл в MinIO через video-service
              и сохраняет ссылку на видео в movie-service.
            </p>
          </div>
        </header>

        <MovieUpload onSaved={fetchMovies} />

        {pageError && <div className="alert error">{pageError}</div>}

        {loading ? (
          <section className="card">
            <p className="muted">Загрузка...</p>
          </section>
        ) : (
          <MovieList movies={movies} onDelete={handleDelete} />
        )}
      </div>
    </div>
  );
};

export default App;