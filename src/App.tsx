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
    <div className="min-h-screen bg-white">
      {/* Skip link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-6 focus:left-6 bg-blue-600 text-white px-4 py-2 rounded font-semibold z-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Skip to main content
      </a>

      <header className="bg-white border-b border-gray-200">
        <div className="p-6 max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 text-center text-gray-900">
            TIFF 2025 Film Explorer
          </h1>
          <p className="text-center text-gray-700 mb-6">
            Discover films from the Toronto International Film Festival 2025
          </p>
        </div>
      </header>

      <main id="main-content" className="p-6 max-w-7xl mx-auto" role="main">
        <section aria-label="Search and Filter Films" className="mb-8">
          <h2 className="sr-only">Search and Filter Options</h2>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label
                htmlFor="search-input"
                className="block text-sm font-medium text-gray-800 mb-2"
              >
                Search Films
              </label>
              <input
                id="search-input"
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="Search by title or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-describedby="search-help"
              />
              <div id="search-help" className="sr-only">
                Search through {typedFilmData.items.length} films by title or
                description
              </div>
            </div>
            <div className="lg:w-64">
              <label
                htmlFor="programme-select"
                className="block text-sm font-medium text-gray-800 mb-2"
              >
                Filter by Programme
              </label>
              <select
                id="programme-select"
                value={programme}
                onChange={(e) => setProgramme(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
                aria-describedby="programme-help"
              >
                {programmes.map((p: string) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <div id="programme-help" className="sr-only">
                Filter films by programme category
              </div>
            </div>
          </div>
          <div
            className="mt-4 text-sm text-gray-700"
            aria-live="polite"
            aria-atomic="true"
          >
            Showing {filtered.length} of {typedFilmData.items.length} films
            {programme !== "All" && ` in ${programme}`}
            {search && ` matching "${search}"`}
          </div>
        </section>

        <section aria-label="Film Results">
          <h2 className="sr-only">Film Listings</h2>
          <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {filtered.map((f: Film) => (
              <article
                key={f.id}
                className="border border-gray-200 rounded-lg shadow-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
                role="article"
                aria-labelledby={`film-title-${f.id}`}
              >
                <div className="relative">
                  <img
                    src={f.posterUrl || f.img}
                    alt={`Movie poster for ${f.title}`}
                    className="w-full h-64 object-cover"
                    loading="lazy"
                  />
                  <button
                    className="absolute top-3 right-3 min-w-[44px] min-h-[44px] p-2 rounded-full bg-white/90 hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200 flex items-center justify-center"
                    onClick={() => toggleFavorite(f.id)}
                    aria-label={
                      favorites.includes(f.id)
                        ? `Remove ${f.title} from favorites`
                        : `Add ${f.title} to favorites`
                    }
                    type="button"
                  >
                    {favorites.includes(f.id) ? (
                      <Heart
                        className="w-5 h-5 text-red-500"
                        fill="currentColor"
                      />
                    ) : (
                      <HeartOff className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                </div>
                <div className="p-6">
                  <div className="mb-3">
                    <h3
                      id={`film-title-${f.id}`}
                      className="text-xl font-bold mb-2 text-gray-900"
                    >
                      {f.title}
                    </h3>
                    {f.isCanadian && (
                      <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mb-2 font-medium">
                        <span aria-hidden="true">🇨🇦</span> Canadian Film
                      </span>
                    )}
                  </div>

                  {f.description && (
                    <p className="text-sm text-gray-800 mb-4 leading-relaxed">
                      {f.description}
                    </p>
                  )}

                  <div className="space-y-3">
                    {f.directors.length > 0 && (
                      <div>
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1">
                          Director{f.directors.length > 1 ? "s" : ""}
                        </span>
                        <p className="text-sm text-gray-900">
                          {f.directors.join(", ")}
                        </p>
                      </div>
                    )}

                    {f.languages && (
                      <div>
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1">
                          Languages
                        </span>
                        <p className="text-sm text-gray-900">{f.languages}</p>
                      </div>
                    )}

                    {f.countries && (
                      <div>
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1">
                          Countries
                        </span>
                        <p className="text-sm text-gray-900">{f.countries}</p>
                      </div>
                    )}

                    {f.creators.length > 0 && (
                      <div>
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1">
                          Creators
                        </span>
                        <p className="text-sm text-gray-900">
                          {f.creators.join(", ")}
                        </p>
                      </div>
                    )}

                    {f.guests.length > 0 && (
                      <div>
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1">
                          Special Guests
                        </span>
                        <p className="text-sm text-gray-900">
                          {f.guests.join(", ")}
                        </p>
                      </div>
                    )}

                    <div
                      className="flex flex-wrap gap-2 pt-2"
                      role="list"
                      aria-label="Film categories and attributes"
                    >
                      {f.webProgrammes.map((p: string) => (
                        <span
                          key={p}
                          className="bg-blue-100 text-blue-900 text-xs px-2 py-1 rounded-full font-medium"
                          role="listitem"
                        >
                          {p}
                        </span>
                      ))}
                      {f.isDigital && (
                        <span
                          className="bg-green-100 text-green-900 text-xs px-2 py-1 rounded-full font-medium"
                          role="listitem"
                        >
                          <span aria-hidden="true">📱</span> Digital
                        </span>
                      )}
                      {f.specialProgramming && (
                        <span
                          className="bg-purple-100 text-purple-900 text-xs px-2 py-1 rounded-full font-medium"
                          role="listitem"
                        >
                          <span aria-hidden="true">⭐</span> Special Programming
                        </span>
                      )}
                      {f.cinemathequeItem && (
                        <span
                          className="bg-yellow-100 text-yellow-900 text-xs px-2 py-1 rounded-full font-medium"
                          role="listitem"
                        >
                          <span aria-hidden="true">🎬</span> Cinematheque
                        </span>
                      )}
                    </div>

                    {(f.interests.length > 0 || f.genre.length > 0) && (
                      <div className="pt-2 border-t border-gray-100">
                        {f.genre.length > 0 && (
                          <div className="mb-2">
                            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1">
                              Genre
                            </span>
                            <div
                              className="flex flex-wrap gap-1"
                              role="list"
                              aria-label="Film genres"
                            >
                              {f.genre.map((g: string) => (
                                <span
                                  key={g}
                                  className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded font-medium"
                                  role="listitem"
                                >
                                  {g}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {f.interests.length > 0 && (
                          <div>
                            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1">
                              Interests
                            </span>
                            <div
                              className="flex flex-wrap gap-1"
                              role="list"
                              aria-label="Film interests"
                            >
                              {f.interests.map((interest: string) => (
                                <span
                                  key={interest}
                                  className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded font-medium"
                                  role="listitem"
                                >
                                  {interest}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="pt-3 border-t border-gray-100">
                      {f.url && (
                        <a
                          href={`https://www.tiff.net/${f.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block bg-gray-900 hover:bg-gray-800 focus:bg-gray-800 text-white text-sm px-4 py-2 rounded font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 no-underline"
                          aria-label={`View ${f.title} details on TIFF website (opens in new tab)`}
                        >
                          View on TIFF
                          <span className="sr-only"> (opens in new tab)</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
            {filtered.length === 0 && (
              <div
                className="col-span-full text-center py-12"
                role="status"
                aria-live="polite"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No films found
                </h3>
                <p className="text-gray-600">
                  No films match your current search criteria. Try adjusting
                  your search or filter.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
