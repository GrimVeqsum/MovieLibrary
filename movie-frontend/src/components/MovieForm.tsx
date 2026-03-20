// src/components/MovieForm.tsx
import React, { useState } from "react";
import { createMovie } from "../api";

interface Props {
  onAdd: () => void;
}

export const MovieForm: React.FC<Props> = ({ onAdd }) => {
  const [title, setTitle] = useState("");
  const [director, setDirector] = useState("");
  const [year, setYear] = useState(2023);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMovie({ title, director, year });
    setTitle(""); setDirector(""); setYear(2023);
    onAdd();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required />
      <input value={director} onChange={e => setDirector(e.target.value)} placeholder="Director" required />
      <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} required />
      <button type="submit">Add Movie</button>
    </form>
  );
};