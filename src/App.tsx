import { useState, useEffect } from "react";
import { Heart, HeartOff } from "lucide-react";
import filmData from "./films.json";

interface Film {
  id: string;
  title: string;
  description: string;
  posterUrl: string;
  languages: string;
  countries: string;
  webProgrammes: string[];
}

interface FilmData {
  filters: {
    webProgrammes: string[];
    languages: string[];
    countries: string[];
  };
  items: Film[];
}

const typedFilmData = filmData as FilmData;

const programmes: string[] = [
  "All",
  ...new Set(typedFilmData.items.flatMap((f: Film) => f.webProgrammes)),
];

export default function App() {
  const [search, setSearch] = useState<string>("");
  const [programme, setProgramme] = useState<string>("All");
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("favorites");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const filtered = typedFilmData.items.filter((f: Film) => {
    const matchText =
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.description.toLowerCase().includes(search.toLowerCase());
    const matchProgramme =
      programme === "All" || f.webProgrammes.includes(programme);
    return matchText && matchProgramme;
  });

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">TIFF 2025 Film Explorer</h1>
      <div className="flex flex-wrap gap-4 mb-8">
        <input
          type="text"
          className="w-full sm:w-1/2 border border-gray-300 rounded px-3 py-2"
          placeholder="Search by title or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={programme}
          onChange={(e) => setProgramme(e.target.value)}
          className="w-full sm:w-60 border border-gray-300 rounded px-3 py-2"
        >
          {programmes.map((p: string) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((f: Film) => (
          <div key={f.id} className="border rounded shadow overflow-hidden">
            <img
              src={f.posterUrl}
              alt={f.title}
              className="w-full h-64 object-cover"
            />
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-semibold">{f.title}</h2>
                <button
                  className="text-gray-500 hover:text-red-500"
                  onClick={() => toggleFavorite(f.id)}
                >
                  {favorites.includes(f.id) ? (
                    <Heart className="text-red-500" />
                  ) : (
                    <HeartOff />
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-700 mb-2">{f.description}</p>
              <div className="text-sm text-gray-500 mb-1">{f.languages}</div>
              <div className="text-sm text-gray-500 mb-2">{f.countries}</div>
              <div className="flex flex-wrap gap-1">
                {f.webProgrammes.map((p: string) => (
                  <span
                    key={p}
                    className="bg-gray-200 text-sm px-2 py-1 rounded"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p>No films match your criteria.</p>}
      </div>
    </main>
  );
}
