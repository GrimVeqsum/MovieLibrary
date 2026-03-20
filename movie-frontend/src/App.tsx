import React, { useEffect, useMemo, useState } from "react";
import { deleteMovie, getMovies, Movie } from "./api";
import { MovieList } from "./components/MovieList";
import { MovieUpload } from "./components/MovieUpload";
import "./styles.css";

type ViewMode = "home" | "upload";

const heroTags = ["Премьеры", "Коллекция HD", "Смотри сразу"];

const storefrontHighlights = [
  {
    label: "Выбор редакции",
    title: "Истории, в которые хочется возвращаться",
    description: "Тёмные триллеры, большие драмы и кино для долгих вечеров — всё в одном месте.",
  },
  {
    label: "Новый релиз",
    title: "Свежие находки для домашнего просмотра",
    description: "Добавляй новинки в каталог и собирай витрину так, будто это собственный онлайн-кинотеатр.",
  },
  {
    label: "Вечерний сеанс",
    title: "Запускай фильм без лишних экранов и подсказок",
    description: "На главной — только атмосфера, подборки и карточки, которые хочется открыть.",
  },
];

export const App: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [activeView, setActiveView] = useState<ViewMode>("home");

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

  const featuredMovie = useMemo(() => {
    if (movies.length === 0) {
      return null;
    }

    return movies.find((movie) => movie.video_url) ?? movies[0];
  }, [movies]);

  const withVideoCount = movies.filter((movie) => movie.video_url).length;
  const latestMovies = movies.slice(0, 6);

  return (
    <div className="page page-shell">
      <div className="container">
        <header className="topbar card">
          <div className="brand-block">
            <p className="eyebrow">Movienter</p>
            <h1>Кино, которое хочется включить прямо сейчас</h1>
          </div>

          <nav className="topbar-nav" aria-label="Разделы приложения">
            <button
              className={activeView === "home" ? "nav-btn active" : "nav-btn"}
              onClick={() => setActiveView("home")}
              type="button"
            >
              Главная
            </button>
            <button
              className={activeView === "upload" ? "nav-btn active" : "nav-btn"}
              onClick={() => setActiveView("upload")}
              type="button"
            >
              Загрузка
            </button>
          </nav>
        </header>

        {pageError && <div className="alert error">{pageError}</div>}

        {activeView === "home" ? (
          <>
            <section className="hero hero-streaming card">
              <div className="hero-copy">
                <p className="eyebrow">MOVIENTER ORIGINAL SELECTION</p>
                <h2>
                  {featuredMovie
                    ? `Сегодня на главной — ${featuredMovie.title}`
                    : "Открой свою домашнюю витрину кино"}
                </h2>
                <p className="hero-text">
                  {featuredMovie
                    ? `Режиссёр ${featuredMovie.director}, ${featuredMovie.year}. Атмосферная главная, крупные карточки и быстрый доступ к просмотру — как у настоящего кино-сервиса.`
                    : "Movienter собирает каталог в формате большого кино-сервиса: тёмный экран, выразительные карточки и ничего лишнего между зрителем и фильмом."}
                </p>

                <div className="hero-tags" aria-label="Ключевые особенности">
                  {heroTags.map((tag) => (
                    <span className="pill" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="hero-actions">
                  <button
                    className="primary-btn"
                    type="button"
                    onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}
                  >
                    Смотреть каталог
                  </button>
                  <button
                    className="secondary-btn"
                    type="button"
                    onClick={() => setActiveView("upload")}
                  >
                    Добавить фильм
                  </button>
                </div>
              </div>

              <div className="hero-featured">
                <p className="featured-label">В центре внимания</p>
                {featuredMovie ? (
                  <div className="featured-card">
                    <div className="featured-card-top">
                      <span className="badge ok">
                        {featuredMovie.video_url ? "Доступно сейчас" : "Скоро в каталоге"}
                      </span>
                      <span className="featured-year">{featuredMovie.year}</span>
                    </div>
                    <h3>{featuredMovie.title}</h3>
                    <p>{featuredMovie.director}</p>
                    <div className="featured-meta-grid">
                      <div>
                        <strong>{movies.length}</strong>
                        <span>титулов в Movienter</span>
                      </div>
                      <div>
                        <strong>{withVideoCount}</strong>
                        <span>готово к просмотру</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="featured-card empty-featured">
                    <h3>Movienter ждёт первую премьеру</h3>
                    <p>Добавь фильм во вкладке «Загрузка», чтобы заполнить витрину новым релизом.</p>
                  </div>
                )}
              </div>
            </section>

            <section className="highlights-grid">
              {storefrontHighlights.map((item) => (
                <article className="card info-card" key={item.title}>
                  <p className="section-kicker">{item.label}</p>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </section>

            {loading ? (
              <section className="card">
                <p className="muted">Загрузка каталога...</p>
              </section>
            ) : (
              <>
                {latestMovies.length > 0 && (
                  <section className="card preview-strip-card">
                    <div className="section-heading">
                      <div>
                        <p className="section-kicker">Сейчас смотрят</p>
                        <h2>Популярное на этой неделе</h2>
                      </div>
                    </div>
                    <div className="preview-strip">
                      {latestMovies.map((movie) => (
                        <article className="preview-poster" key={`preview-${movie.id}`}>
                          <span className="preview-year">{movie.year}</span>
                          <strong>{movie.title}</strong>
                          <span>{movie.director}</span>
                        </article>
                      ))}
                    </div>
                  </section>
                )}

                <MovieList movies={movies} onDelete={handleDelete} />
              </>
            )}
          </>
        ) : (
          <section className="upload-layout">
            <article className="card upload-intro">
              <p className="eyebrow">Movienter Studio</p>
              <h2>Добавь новый релиз в витрину</h2>
              <p>
                Загрузи карточку фильма и видео, чтобы свежий релиз сразу занял место в
                каталоге Movienter.
              </p>
              <ul className="upload-tips">
                <li>Название, режиссёр и год формируют карточку релиза.</li>
                <li>MP4 добавляется к фильму и открывается прямо из каталога.</li>
                <li>После сохранения новинка сразу появляется на главной странице.</li>
              </ul>
            </article>

            <MovieUpload onSaved={fetchMovies} />
          </section>
        )}
      </div>
    </div>
  );
};

export default App;