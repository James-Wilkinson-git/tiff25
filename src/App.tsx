import { useState, useEffect } from "react";
import { Heart, HeartOff } from "lucide-react";
import filmData from "./films.json";

interface Film {
  id: string;
  title: string;
  slug: string;
  url: string;
  img: string;
  posterUrl: string;
  description: string;
  isCanadian: boolean;
  isDigital: boolean;
  digitalEndDate: string;
  creators: string[];
  directors: string[];
  interests: string[];
  regionOfInterests: string[];
  genre: string[];
  webProgrammes: string[];
  scheduleItems: any[];
  countries: string;
  languages: string;
  multi: boolean;
  cinemathequeItem: boolean;
  specialProgramming: boolean;
  guests: string[];
  d: string;
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
    <main className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">
        TIFF 2025 Film Explorer
      </h1>
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Search by title or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={programme}
          onChange={(e) => setProgramme(e.target.value)}
          className="lg:w-64 border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {programmes.map((p: string) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {filtered.map((f: Film) => (
          <div
            key={f.id}
            className="border rounded-lg shadow-lg overflow-hidden bg-white"
          >
            <img
              src={f.posterUrl || f.img}
              alt={f.title}
              className="w-full h-64 object-cover"
            />
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-1">{f.title}</h2>
                  {f.isCanadian && (
                    <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mb-2">
                      🇨🇦 Canadian Film
                    </span>
                  )}
                </div>
                <button
                  className="text-gray-500 hover:text-red-500 ml-2"
                  onClick={() => toggleFavorite(f.id)}
                >
                  {favorites.includes(f.id) ? (
                    <Heart className="text-red-500" fill="red" />
                  ) : (
                    <HeartOff />
                  )}
                </button>
              </div>

              {f.description && (
                <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                  {f.description}
                </p>
              )}

              <div className="space-y-3">
                {f.directors.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Director{f.directors.length > 1 ? "s" : ""}
                    </span>
                    <p className="text-sm text-gray-900">
                      {f.directors.join(", ")}
                    </p>
                  </div>
                )}

                {f.languages && (
                  <div>
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Languages
                    </span>
                    <p className="text-sm text-gray-900">{f.languages}</p>
                  </div>
                )}

                {f.countries && (
                  <div>
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Countries
                    </span>
                    <p className="text-sm text-gray-900">{f.countries}</p>
                  </div>
                )}

                {f.creators.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Creators
                    </span>
                    <p className="text-sm text-gray-900">
                      {f.creators.join(", ")}
                    </p>
                  </div>
                )}

                {f.guests.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Special Guests
                    </span>
                    <p className="text-sm text-gray-900">
                      {f.guests.join(", ")}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-2">
                  {f.webProgrammes.map((p: string) => (
                    <span
                      key={p}
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium"
                    >
                      {p}
                    </span>
                  ))}
                  {f.isDigital && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                      📱 Digital
                    </span>
                  )}
                  {f.specialProgramming && (
                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium">
                      ⭐ Special Programming
                    </span>
                  )}
                  {f.cinemathequeItem && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                      🎬 Cinematheque
                    </span>
                  )}
                </div>

                {(f.interests.length > 0 || f.genre.length > 0) && (
                  <div className="pt-2 border-t border-gray-100">
                    {f.genre.length > 0 && (
                      <div className="mb-2">
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                          Genre
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {f.genre.map((g: string) => (
                            <span
                              key={g}
                              className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                            >
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {f.interests.length > 0 && (
                      <div>
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                          Interests
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {f.interests.map((interest: string) => (
                            <span
                              key={interest}
                              className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-3 text-xs text-gray-500 border-t border-gray-100">
                  {f.url && (
                    <a
                      href={`https://www.tiff.net/${f.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-neutral-950 hover:bg-neutral-900 text-white text-xs px-3 py-2 font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 no-underline"
                    >
                      View on TIFF
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">
              No films match your criteria.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
