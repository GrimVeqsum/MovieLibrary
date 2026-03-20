// src/api.ts
export interface Movie {
  id: number;
  title: string;
  director: string;
  year: number;
  video_url?: string;
}

const API_URL = "http://localhost:8080";
const VIDEO_URL = "http://localhost:8081";

// Movie Service CRUD
export async function getMovies(): Promise<Movie[]> {
  const res = await fetch(`${API_URL}/movies`);
  return res.json();
}

export async function createMovie(movie: Partial<Movie>) {
  const res = await fetch(`${API_URL}/movies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(movie),
  });
  return res.json();
}

export async function updateMovie(id: number, movie: Partial<Movie>) {
  const res = await fetch(`${API_URL}/movies/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(movie),
  });
  return res.json();
}

export async function deleteMovie(id: number) {
  await fetch(`${API_URL}/movies/${id}`, { method: "DELETE" });
}

// Video Service upload
export async function uploadVideo(movieId: number, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${VIDEO_URL}/upload?movie_id=${movieId}`, {
    method: "POST",
    body: formData,
  });
  const url = await res.text();
  return url;
}