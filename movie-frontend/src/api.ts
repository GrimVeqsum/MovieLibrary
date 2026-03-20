export interface Movie {
  id: number;
  title: string;
  director: string;
  year: number;
  video_url?: string;
}

const API_URL = "http://localhost:8080";
const VIDEO_URL = "http://localhost:8081";

async function parseJsonSafe<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function getMovies(): Promise<Movie[]> {
  const res = await fetch(`${API_URL}/movies`);
  return parseJsonSafe<Movie[]>(res);
}

export async function createMovie(movie: Partial<Movie>): Promise<Movie> {
  const res = await fetch(`${API_URL}/movies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(movie),
  });
  return parseJsonSafe<Movie>(res);
}

export async function updateMovie(id: number, movie: Partial<Movie>): Promise<Movie> {
  const res = await fetch(`${API_URL}/movies/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(movie),
  });
  return parseJsonSafe<Movie>(res);
}

export async function deleteMovie(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/movies/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
}

export async function uploadVideo(movieId: number, file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${VIDEO_URL}/upload?movie_id=${movieId}`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res.text();
}