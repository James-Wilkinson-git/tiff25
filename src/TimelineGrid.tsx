import { useState, useMemo } from "react";
import { Calendar, Clock, MapPin, ArrowLeft } from "lucide-react";
import scheduleData from "./schedule.json";

interface ScheduleItem {
  id: string;
  startTime: string;
  endTime: string;
  title: string;
  digital: boolean;
  pressAndIndustry: boolean;
  industry: boolean;
  marketScreening: boolean;
  cancelled: boolean;
  updated: boolean;
  extended: boolean;
  cost: string[];
  accessibility: string[];
  printFormat: string;
  ticketKey: string | null;
  venue: {
    name: string;
    shortName: string;
    room: string;
    venueType: string;
  };
  available: boolean;
  newOrChanged: number;
  audienceType: string;
  url: string;
  guestAttending: boolean;
}

interface ScheduleFilm {
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
  digital: boolean;
  pressAndIndustry: boolean;
  industry: boolean;
  marketScreening: boolean;
  cancelled: boolean;
  updated: boolean;
  extended: boolean;
  cost: string[];
  accessibility: string[];
  printFormat: string;
  ticketKey: string | null;
  venue: {
    name: string;
    shortName: string;
    room: string;
    venueType: string;
  };
  available: boolean;
  newOrChanged: number;
  audienceType: string;
  guestAttending: boolean;
}

interface ScheduleFilm {
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
  scheduleItems: ScheduleItem[];
  countries: string;
  languages: string;
  multi: boolean;
  cinemathequeItem: boolean;
  specialProgramming: boolean;
  guests: unknown[];
  d: string;
}

interface ScheduleData {
  filters: Record<string, unknown>;
  items: ScheduleFilm[];
}

interface TimelineGridProps {
  onBack: () => void;
}

const typedScheduleData = scheduleData as unknown as ScheduleData;

export default function TimelineGrid({ onBack }: TimelineGridProps) {
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [hidePressScreenings, setHidePressScreenings] = useState(true); // Hide by default
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);

  // Get favorites from localStorage
  const [favorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });

  // Get selected screenings from localStorage
  const [selectedScreenings, setSelectedScreenings] = useState<string[]>(() => {
    const saved = localStorage.getItem("selectedScreenings");
    return saved ? JSON.parse(saved) : [];
  });

  // Function to toggle screening selection
  const toggleScreeningSelection = (screeningId: string) => {
    const newSelected = selectedScreenings.includes(screeningId)
      ? selectedScreenings.filter((id) => id !== screeningId)
      : [...selectedScreenings, screeningId];

    setSelectedScreenings(newSelected);
    localStorage.setItem("selectedScreenings", JSON.stringify(newSelected));
  };

  // Define time bounds for the grid (8 AM to 3 AM next day)
  const START_HOUR = 8;
  const END_HOUR = 27; // 3 AM next day
  const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60; // Get all screenings and organize by date
  const allScreenings = useMemo(() => {
    const screenings: Array<{
      film: ScheduleFilm;
      screening: ScheduleItem;
    }> = [];

    typedScheduleData.items.forEach((film) => {
      // Filter by favorites if enabled
      if (showFavoritesOnly && !favorites.includes(film.id)) {
        return;
      }

      const validScreenings = film.scheduleItems.filter((screening) => {
        // Filter out cancelled screenings
        if (screening.cancelled) return false;

        // Filter by selected screenings if enabled
        if (showSelectedOnly && !selectedScreenings.includes(screening.id)) {
          return false;
        }

        // Filter out press screenings if hidden
        if (
          hidePressScreenings &&
          (screening.industry || screening.pressAndIndustry)
        ) {
          return false;
        }

        return true;
      });

      validScreenings.forEach((screening) => {
        screenings.push({ film, screening });
      });
    });

    return screenings.sort(
      (a, b) =>
        new Date(a.screening.startTime).getTime() -
        new Date(b.screening.startTime).getTime()
    );
  }, [
    showFavoritesOnly,
    favorites,
    hidePressScreenings,
    showSelectedOnly,
    selectedScreenings,
  ]);

  // Group screenings by date
  const screeningsByDate = useMemo(
    () =>
      allScreenings.reduce((acc, { film, screening }) => {
        const date = new Date(screening.startTime);
        const dateKey = date.toDateString();

        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push({ film, screening });

        return acc;
      }, {} as { [key: string]: Array<{ film: ScheduleFilm; screening: ScheduleItem }> }),
    [allScreenings]
  );

  // Calculate position and width for a screening in the timeline
  const getScreeningPosition = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);

    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();

    const gridStartMinutes = START_HOUR * 60;
    const relativeStart = Math.max(0, startMinutes - gridStartMinutes);
    const relativeEnd = Math.min(TOTAL_MINUTES, endMinutes - gridStartMinutes);

    const leftPercent = (relativeStart / TOTAL_MINUTES) * 100;
    const widthPercent = ((relativeEnd - relativeStart) / TOTAL_MINUTES) * 100;

    return { leftPercent, widthPercent };
  };

  const formatTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-6 focus:left-6 bg-blue-600 text-white px-4 py-2 rounded font-semibold z-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Skip to main content
      </a>

      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-2 transition-colors"
                aria-label="Back to film explorer"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Timeline Planner (Desktop Only)
              </h1>
            </div>
          </div>

          {/* Screening Type Legend */}
          <div className="mt-3 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 bg-indigo-500 rounded"></div>
              <span className="text-gray-600">Public Screenings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 bg-gray-600 rounded"></div>
              <span className="text-gray-600">Industry Only</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 bg-green-600 rounded"></div>
              <span className="text-gray-600">Selected</span>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showFavoritesOnly}
                onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={favorites.length === 0}
              />
              <span className="text-sm font-medium text-gray-700">
                Show only favorite films ({favorites.length})
              </span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={hidePressScreenings}
                onChange={(e) => {
                  console.log("Checkbox clicked, new value:", e.target.checked);
                  setHidePressScreenings(e.target.checked);
                }}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Hide industry screenings
              </span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showSelectedOnly}
                onChange={(e) => setShowSelectedOnly(e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Show only selected screenings ({selectedScreenings.length})
              </span>
            </label>

            {favorites.length === 0 && (
              <span className="text-xs text-gray-500">
                Add some favorites first to use the favorites filter
              </span>
            )}
          </div>
        </div>
      </header>

      <main id="main-content" className="p-6 mx-auto">
        {/* Time Grid Header */}
        <div className="bg-neutral-50 border-b-2 border-gray-300 pb-2 mb-4 sticky top-[153px] z-20">
          <div className="flex justify-between text-sm text-gray-600">
            {Array.from(
              { length: Math.ceil((END_HOUR - START_HOUR) / 2) },
              (_, i) => {
                const hour = START_HOUR + i * 2;
                const displayHour = hour > 24 ? hour - 24 : hour; // Convert 25,26,27 to 1,2,3
                return (
                  <div key={hour} className="text-center">
                    {displayHour === 12
                      ? "12 PM"
                      : displayHour > 12 && displayHour < 24
                      ? `${displayHour - 12} PM`
                      : displayHour === 24 || displayHour === 0
                      ? "12 AM"
                      : `${displayHour} AM`}
                  </div>
                );
              }
            )}
          </div>
        </div>

        {Object.entries(screeningsByDate).map(([dateKey, dayScreenings]) => (
          <div key={dateKey} className="mb-8">
            {/* Date Header */}
            <div className="sticky top-[183px] py-4 bg-neutral-50 border-b-2 border-current mb-4 z-10">
              <h2 className="text-lg font-semibold">{formatDate(dateKey)}</h2>
            </div>

            {/* Screenings for this day */}
            <div className="space-y-2">
              {dayScreenings.map(({ film, screening }) => {
                const { leftPercent, widthPercent } = getScreeningPosition(
                  screening.startTime,
                  screening.endTime
                );

                // Determine styling based on screening type
                const isIndustry = screening.industry;
                const isPressAndIndustry = screening.pressAndIndustry;

                const getScreeningStyles = () => {
                  if (isIndustry) {
                    return {
                      gradient: "bg-gray-600",
                      hover: "hover:bg-gray-700",
                      border: "border-gray-300",
                    };
                  } else {
                    return {
                      gradient: "bg-indigo-500",
                      hover: "hover:bg-indigo-600",
                      border: "border-gray-200",
                    };
                  }
                };

                const styles = getScreeningStyles();
                const isSelected = selectedScreenings.includes(screening.id);

                return (
                  <div key={screening.id} className="relative">
                    {/* Timeline background */}
                    <div className="w-full h-20 relative bg-gray-100 rounded">
                      {/* Timeline bar with embedded details */}
                      <div
                        className={`absolute h-full ${
                          isSelected
                            ? "bg-green-600 hover:bg-green-700"
                            : `${styles.gradient} ${styles.hover}`
                        } rounded shadow-md cursor-pointer group flex flex-col justify-center p-3 text-white overflow-hidden`}
                        style={{
                          left: `${leftPercent}%`,
                          width: `${Math.max(widthPercent, 15)}%`,
                          minWidth: widthPercent < 15 ? "120px" : "auto",
                        }}
                        onClick={() => toggleScreeningSelection(screening.id)}
                        title={`${film.title} - ${formatTime(
                          screening.startTime
                        )} to ${formatTime(screening.endTime)}${
                          isIndustry
                            ? " • Industry Screening"
                            : isPressAndIndustry
                            ? " • Press & Industry"
                            : ""
                        }`}
                      >
                        {/* Movie title with industry indicator */}
                        <div className="flex items-center gap-1">
                          <h3 className="font-bold text-sm leading-tight truncate">
                            {film.title}
                          </h3>
                        </div>

                        {/* Time and venue info */}
                        <div className="text-xs opacity-90 mt-1 space-y-0.5">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">
                              {formatTime(screening.startTime)} →{" "}
                              {formatTime(screening.endTime)}
                            </span>
                          </div>
                          {/* Location - always show */}
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">
                              {screening.venue.shortName ||
                                screening.venue.name}
                              {screening.venue.room &&
                                ` • ${screening.venue.room}`}
                            </span>
                          </div>
                          {widthPercent > 30 && screening.cost.length > 0 && (
                            <div className="text-yellow-200 font-medium">
                              {screening.cost.join(", ")}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {allScreenings.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No screenings found
            </h3>
            <p className="text-gray-600">
              Try adjusting your venue filters or check back later.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
