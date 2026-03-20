// src/components/MovieList.tsx
import React from "react";
import { Movie } from "../api";

interface Props {
  movies: Movie[];
  onDelete: (id: number) => void;
}

export const MovieList: React.FC<Props> = ({ movies, onDelete }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Director</th>
          <th>Year</th>
          <th>Video</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {movies.map(m => (
          <tr key={m.id}>
            <td>{m.title}</td>
            <td>{m.director}</td>
            <td>{m.year}</td>
            <td>{m.video_url ? <a href={m.video_url} target="_blank">Video</a> : ""}</td>
            <td>
              <button onClick={() => onDelete(m.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};