import React, { useEffect, useMemo, useState } from "react";
import { deleteMovie, getMovies, Movie } from "./api";
import { MovieList } from "./components/MovieList";
import { MovieUpload } from "./components/MovieUpload";
import "./styles.css";

type ViewMode = "home" | "upload";

export const App: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [activeView, setActiveView] = useState<ViewMode>("home");
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);

  const fetchMovies = async () => {
    try {
      setPageError("");
      const data = await getMovies();
      setMovies(data);
    } catch (err) {
      if (err instanceof Error) {
        setPageError(err.message);
      } else {
        setPageError("Не удалось загрузить список видео.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMovie(id);
      if (selectedMovieId === id) {
        setSelectedMovieId(null);
      }
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

  const selectedMovie = useMemo(
    () => movies.find((movie) => movie.id === selectedMovieId) ?? null,
    [movies, selectedMovieId],
  );

  return (
    <div className="page page-shell">
      <div className="container narrow-container">
        <header className="topbar card">
          <div className="brand-block">
            <p className="eyebrow">Movienter</p>
            <h1>Видео</h1>
          </div>

          <nav className="topbar-nav" aria-label="Разделы приложения">
            <button
              className={activeView === "home" ? "nav-btn active" : "nav-btn"}
              onClick={() => setActiveView("home")}
              type="button"
            >
              Видео
            </button>
            <button
              className={activeView === "upload" ? "nav-btn active" : "nav-btn"}
              onClick={() => setActiveView("upload")}
              type="button"
            >
              Добавление
            </button>
          </nav>
        </header>

        {pageError && <div className="alert error">{pageError}</div>}

        {activeView === "home" ? (
          loading ? (
            <section className="card simple-section">
              <p className="muted">Загрузка видео...</p>
            </section>
          ) : selectedMovie ? (
            <section className="card video-detail-section simple-section">
              <div className="section-heading compact-heading detail-header">
                <div>
                  <p className="section-kicker">Просмотр</p>
                  <h2>{selectedMovie.title}</h2>
                  <p>
                    {selectedMovie.director} • {selectedMovie.year}
                  </p>
                </div>
                <button className="nav-btn" onClick={() => setSelectedMovieId(null)} type="button">
                  Назад к плиткам
                </button>
              </div>

              {selectedMovie.video_url ? (
                <div className="detail-player-block">
                  <video
                    className="detail-video-player"
                    controls
                    preload="metadata"
                    src={selectedMovie.video_url}
                  />
                  <div className="detail-actions">
                    <a
                      className="video-link"
                      href={selectedMovie.video_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Открыть отдельно
                    </a>
                    <button
                      className="danger-btn"
                      onClick={() => handleDelete(selectedMovie.id)}
                      type="button"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ) : (
                <p className="muted">Для этого фильма видео ещё не загружено.</p>
              )}
            </section>
          ) : (
            <MovieList
              movies={movies}
              onDelete={handleDelete}
              onOpen={(movieId) => setSelectedMovieId(movieId)}
            />
          )
        ) : (
          <section className="upload-layout single-column-layout">
            <article className="card upload-intro compact-intro">
              <p className="eyebrow">Movienter Studio</p>
              <h2>Добавить фильм</h2>
              <p>Заполни карточку и прикрепи MP4-файл. После сохранения видео появится во вкладке «Видео».</p>
            </article>

            <MovieUpload onSaved={fetchMovies} />
          </section>
        )}
      </div>
    </div>
  );
};

export default App;