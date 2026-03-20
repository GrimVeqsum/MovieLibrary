// src/App.tsx
import React, { useEffect, useState } from "react";
import { getMovies, deleteMovie, Movie } from "./api";
import { MovieList } from "./components/MovieList";
import { MovieForm } from "./components/MovieForm";
import { UploadVideo } from "./components/UploadVideo";

function App() {
  const [movies, setMovies] = useState<Movie[]>([]);

  const fetchMovies = async () => {
    setMovies(await getMovies());
  };

  useEffect(() => { fetchMovies(); }, []);

  return (
    <div>
      <h1>Movie CRUD + Video Upload</h1>
      <MovieForm onAdd={fetchMovies} />
      <MovieList movies={movies} onDelete={async (id) => { await deleteMovie(id); fetchMovies(); }} />
      <h2>Upload Videos</h2>
      {movies.map(m => <UploadVideo key={m.id} movieId={m.id} onUpload={fetchMovies} />)}
    </div>
  );
}

export default App;