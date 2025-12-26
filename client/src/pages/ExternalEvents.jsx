import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { format, isValid, isPast } from "date-fns";
import { Calendar, MapPin, Users, ArrowRight, Search, Loader2, ExternalLink, User } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useExternalEvents } from "@/hooks/useExternalEvents";

const ExternalEvents = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter = searchParams.get("filter") || "all";
  const [filter, setFilter] = useState(initialFilter);
  const [search, setSearch] = useState("");

  const { data: events, isLoading, error } = useExternalEvents("event", null);

  useEffect(() => {
    const filterParam = searchParams.get("filter");
    if (filterParam && ["all", "upcoming", "past"].includes(filterParam)) {
      setFilter(filterParam);
    }
  }, [searchParams]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setSearchParams(newFilter === "all" ? {} : { filter: newFilter });
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return PLACEHOLDER_IMAGE;
    if (imagePath.startsWith("http") || imagePath.startsWith("https")) return imagePath;
    return imagePath;
  };

  const handleImageError = (e) => {
    e.target.src = PLACEHOLDER_IMAGE;
  };

  const filteredEvents = events?.filter((event) => {
    const eventDate = new Date(event.date);
    const isDateValid = isValid(eventDate);

    let computedStatus = event.status;
    if (isDateValid) {
      if (isPast(eventDate)) {
        computedStatus = 'past';
      } else if (!computedStatus) {
        computedStatus = 'upcoming';
      }
    }
    if (!computedStatus) computedStatus = 'upcoming';

    const matchesStatus = filter === "all" ? true : computedStatus === filter;

    if (!search) return matchesStatus;

    const term = search.toLowerCase();
    const dateStrShort = isDateValid ? format(eventDate, "MMM d yyyy").toLowerCase() : "";
    const dateStrLong = isDateValid ? format(eventDate, "MMMM d yyyy").toLowerCase() : "";

    const matchesSearch =
      event.title?.toLowerCase().includes(term) ||
      event.venue?.toLowerCase().includes(term) ||
      event.description?.toLowerCase().includes(term) ||
      event.organizer?.toLowerCase().includes(term) ||
      dateStrShort.includes(term) ||
      dateStrLong.includes(term);

    return matchesStatus && matchesSearch;
  });

  const getPageTitle = () => {
    if (filter === "upcoming") return "Upcoming";
    if (filter === "past") return "Past";
    return "All";
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>External Events | CodeBuilders</title>
      </Helmet>

      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary font-mono text-sm tracking-wider uppercase">
              // External Events
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mt-4 mb-6">
              {getPageTitle()} <span className="text-primary">External Events</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover exciting events from the community and beyond.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, venue, organizer, date..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>

            <div className="flex gap-2">
              {["all", "upcoming", "past"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleFilterChange(tab)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    filter === tab
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {isLoading && (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {!isLoading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents?.map((event, index) => {
                const eventDateObj = new Date(event.date);
                const isDateValid = isValid(eventDateObj);

                let displayStatus = event.status;
                if (isDateValid) {
                  displayStatus = isPast(eventDateObj) ? 'past' : 'upcoming';
                }

                const displayImage = getImageUrl(event.imageUrl);

                return (
                  <Link
                    key={event._id}
                    to={`/external-events/${event._id}`}
                    className="group glass rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-500 h-full flex flex-col block"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                  <div
                    key={event._id}
                    className="group glass rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-500 h-full flex flex-col block cursor-pointer"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="relative h-48 overflow-hidden bg-gray-200 shrink-0">
                      <img
                        src={displayImage}
                        alt={event.title}
                        onError={handleImageError}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute top-4 right-4 flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                          event.type === "hackathon"
                            ? "bg-destructive text-destructive-foreground"
                            : "bg-primary text-primary-foreground"
                        }`}>
                          {event.type}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                          displayStatus === "upcoming"
                            ? "bg-secondary text-secondary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {displayStatus}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">
                        {event.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-grow">
                        {event.description}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-primary" />
                          {isDateValid ? format(eventDateObj, "MMM d, yyyy") : "TBA"}
                        </div>
                        {event.venue && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span className="truncate max-w-[100px]">{event.venue}</span>
                          </div>
                        )}
                        {event.organizer && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4 text-primary" />
                            <span className="truncate max-w-[100px]">{event.organizer}</span>
                          </div>
                        )}
                      </div>

                      
                      <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        View Details
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                  </Link>
                );
              })}
            </div>
          )}

          {!isLoading && filteredEvents?.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No external events found matching your criteria.</p>
              {filter !== 'all' && (
                <Button variant="link" onClick={() => handleFilterChange('all')}>View All Events</Button>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ExternalEvents;