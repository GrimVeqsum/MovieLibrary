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
        <div className="empty-state cinematic-empty-state">
          <p className="section-kicker">Movienter</p>
          <h2>Премьера ещё не добавлена</h2>
          <p>Когда появится первый фильм, главная страница превратится в полноценную кино-витрину.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="catalog-section card">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Каталог Movienter</p>
          <h2>Смотри по настроению</h2>
          <p>Выбирай фильм, открывай карточку и запускай просмотр без лишних экранов.</p>
        </div>
        <div className="catalog-summary">
          <strong>{movies.length}</strong>
          <span>фильмов в подборке</span>
        </div>
      </div>

      <div className="movie-grid">
        {movies.map((movie, index) => (
          <article className="movie-card" key={movie.id}>
            <div className="movie-poster" aria-hidden="true">
              <span className="poster-index">0{index + 1}</span>
              <span className={movie.video_url ? "badge ok" : "badge wait"}>
                {movie.video_url ? "Смотреть" : "Скоро"}
              </span>
            </div>

            <div className="movie-card-body">
              <div className="movie-title-row">
                <h3>{movie.title}</h3>
                <span className="movie-year">{movie.year}</span>
              </div>

              <p className="movie-meta">
                <span>{movie.director}</span>
                <span>•</span>
                <span>Карточка #{movie.id}</span>
              </p>

              {movie.video_url ? (
                <div className="video-preview-block compact">
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
                    Открыть плеер
                  </a>
                </div>
              ) : (
                <p className="muted">Видео ещё не загружено, но карточка уже ждёт своего релиза.</p>
              )}

              <div className="movie-actions">
                <button className="danger-btn" onClick={() => onDelete(movie.id)} type="button">
                  Удалить
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};