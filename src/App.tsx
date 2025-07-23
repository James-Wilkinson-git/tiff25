import { useState, useEffect } from "react";
import { Heart, HeartOff, X, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
  scheduleItems: unknown[];
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

// Sortable item component for favorites
function SortableItem({ id, film }: { id: string; film: Film }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
      {...attributes}
    >
      <button
        className="cursor-grab hover:cursor-grabbing text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded p-1"
        {...listeners}
        aria-label={`Drag to reorder ${film.title}`}
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <img
        src={film.posterUrl || film.img}
        alt={`Poster for ${film.title}`}
        className="w-12 h-16 object-cover rounded flex-shrink-0"
        loading="lazy"
      />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 truncate">
          {film.title}
        </h4>
        <p className="text-xs text-gray-600 truncate">
          {film.directors.join(", ")}
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [search, setSearch] = useState<string>("");
  const [programme, setProgramme] = useState<string>("All");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFavorites((items) => {
        const oldIndex = items.indexOf(String(active.id));
        const newIndex = items.indexOf(String(over.id));

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const favoriteFilms = favorites
    .map((id) => typedFilmData.items.find((f) => f.id === id))
    .filter(Boolean) as Film[];

  const filtered = typedFilmData.items.filter((f: Film) => {
    const matchText =
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.description.toLowerCase().includes(search.toLowerCase());
    const matchProgramme =
      programme === "All" || f.webProgrammes.includes(programme);
    return matchText && matchProgramme;
  });

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-white flex">
        {/* Skip link for keyboard navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-6 focus:left-6 bg-blue-600 text-white px-4 py-2 rounded font-semibold z-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Skip to main content
        </a>

        {/* Favorites Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-80 bg-gray-50 border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 lg:static lg:inset-0`}
          aria-label="Favorites sidebar"
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                My Favorites ({favorites.length})
              </h2>
              <button
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close favorites sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {favoriteFilms.length > 0 ? (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    Drag to reorder your favorites. Your top choice will be
                    first.
                  </p>
                  <SortableContext
                    items={favorites}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {favoriteFilms.map((film, index) => (
                        <div key={film.id}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-gray-500 bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center">
                              {index + 1}
                            </span>
                            <span className="text-xs text-gray-500">
                              {index === 0 ? "Top Pick" : `Choice ${index + 1}`}
                            </span>
                          </div>
                          <SortableItem id={film.id} film={film} />
                        </div>
                      ))}
                    </div>
                  </SortableContext>
                </>
              ) : (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">
                    No favorites yet. Click the heart icon on films to add them
                    here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Sidebar overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Main content */}
        <div className="flex-1 lg:ml-0">
          <header className="bg-white border-b border-gray-200">
            <div className="p-6 max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <button
                  className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open favorites sidebar"
                >
                  <Heart className="w-5 h-5" />
                  {favorites.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {favorites.length}
                    </span>
                  )}
                </button>
                <h1 className="text-4xl font-bold text-center text-gray-900 flex-1">
                  TIFF 2025 Film Explorer
                </h1>
                <div className="w-10 lg:hidden" /> {/* Spacer for centering */}
              </div>
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
                    Search through {typedFilmData.items.length} films by title
                    or description
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
                            <p className="text-sm text-gray-900">
                              {f.languages}
                            </p>
                          </div>
                        )}

                        {f.countries && (
                          <div>
                            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1">
                              Countries
                            </span>
                            <p className="text-sm text-gray-900">
                              {f.countries}
                            </p>
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
                              <span aria-hidden="true">⭐</span> Special
                              Programming
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
                              <span className="sr-only">
                                {" "}
                                (opens in new tab)
                              </span>
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
      </div>
    </DndContext>
  );
}
