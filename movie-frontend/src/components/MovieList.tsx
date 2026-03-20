import React from "react";
import { Movie } from "../api";

interface Props {
  movies: Movie[];
  onDelete: (id: number) => Promise<void> | void;
}

export const MovieList: React.FC<Props> = ({ movies, onDelete }) => {
  if (movies.length === 0) {
    return (
      <section className="card">
        <div className="empty-state">
          <h2>Фильмов пока нет</h2>
          <p>Добавь первый фильм через форму выше.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2>Список фильмов</h2>
          <p>Данные берутся из Movie Service.</p>
        </div>
      </div>

      <div className="movie-list">
        {movies.map((movie) => (
          <article className="movie-item" key={movie.id}>
            <div className="movie-main">
              <div className="movie-title-row">
                <h3>{movie.title}</h3>
                <span className={movie.video_url ? "badge ok" : "badge wait"}>
                  {movie.video_url ? "Видео загружено" : "Без видео"}
                </span>
              </div>

              <p className="movie-meta">
                <span>{movie.director}</span>
                <span>•</span>
                <span>{movie.year}</span>
                <span>•</span>
                <span>ID: {movie.id}</span>
              </p>

              {movie.video_url ? (
                <div className="video-preview-block">
                  <video
                    className="video-preview"
                    controls
                    preload="metadata"
                    src={movie.video_url}
                  />
                  <a
                    className="video-link"
                    href={movie.video_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Открыть видео
                  </a>
                </div>
              ) : (
                <p className="muted">Видео ещё не прикреплено.</p>
              )}
            </div>

            <button className="danger-btn" onClick={() => onDelete(movie.id)}>
              Удалить
            </button>
          </article>
        ))}
      </div>
    </section>
  );
};