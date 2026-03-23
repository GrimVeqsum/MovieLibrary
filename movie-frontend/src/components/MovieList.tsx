import React from "react";
import { Movie } from "../api";

interface Props {
  movies: Movie[];
  onDelete: (id: number) => Promise<void> | void;
  onOpen: (id: number) => void;
}

export const MovieList: React.FC<Props> = ({ movies, onDelete, onOpen }) => {
  if (movies.length === 0) {
    return (
      <section className="card simple-section">
        <div className="empty-state cinematic-empty-state">
          <h2>Видео пока нет</h2>
          <p>Открой вкладку «Добавление», чтобы загрузить первый фильм.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="catalog-section card simple-section">
      <div className="section-heading compact-heading">
        <div>
          <p className="section-kicker">Видеотека</p>
          <h2>Выбери видео</h2>
        </div>
        <div className="catalog-summary">
          <strong>{movies.length}</strong>
          <span>всего</span>
        </div>
      </div>

      <div className="movie-grid tiles-grid">
        {movies.map((movie) => (
          <article className="movie-card tile-card" key={movie.id}>
            <button className="tile-surface" onClick={() => onOpen(movie.id)} type="button">
              <div className="tile-poster" aria-hidden="true">
                {movie.video_url ? (
                  <video
                    className="tile-preview"
                    src={movie.video_url}
                    muted
                    playsInline
                    autoPlay
                    loop
                    preload="metadata"
                  />
                ) : (
                  <div className="tile-placeholder" />
                )}
                <span className={movie.video_url ? "badge ok" : "badge wait"}>
                  {movie.video_url ? "Смотреть" : "Без видео"}
                </span>
              </div>

              <div className="movie-card-body tile-body">
                <div className="movie-title-row tile-title-row">
                  <div>
                    <h3>{movie.title}</h3>
                    <p className="movie-meta single-line-meta">
                      <span>{movie.director}</span>
                      <span>•</span>
                      <span>{movie.year}</span>
                    </p>
                  </div>
                </div>
              </div>
            </button>

            <div className="tile-footer">
              <button className="nav-btn" onClick={() => onOpen(movie.id)} type="button">
                Открыть
              </button>
              <button className="danger-btn" onClick={() => onDelete(movie.id)} type="button">
                Удалить
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};