import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom"; // 👈 Import useSearchParams
import { format, isValid } from "date-fns";
import { Calendar, MapPin, Users, ArrowRight, Search, Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

const apiUrl = import.meta.env.VITE_API_URL;

const Events = () => {
  // 👇 1. Get Search Params from URL
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter = searchParams.get("filter") || "all";

  // 👇 2. Initialize State with URL param
  const [filter, setFilter] = useState(initialFilter);
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fallback Image URL
  const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80";

  // Fetch Events from Backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${apiUrl}/events`);
        setEvents(response.data);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // 👇 3. Update Filter when URL changes (e.g. Navigation from Navbar)
  useEffect(() => {
    const filterParam = searchParams.get("filter");
    if (filterParam && ["all", "upcoming", "past"].includes(filterParam)) {
      setFilter(filterParam);
    }
  }, [searchParams]);

  // Handler to update both State and URL
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    // Update URL without reloading page
    setSearchParams(newFilter === "all" ? {} : { filter: newFilter });
  };

  // Logic: Construct the correct Image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return PLACEHOLDER_IMAGE;

    if (imagePath.startsWith("http") || imagePath.startsWith("https")) {
      return imagePath;
    }

    const cleanPath = imagePath.replace(/\\/g, "/");
    const normalizedPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
    const baseUrl = apiUrl.replace('/api', '');
    return `${baseUrl}${normalizedPath}`;
  };

  const handleImageError = (e) => {
    e.target.src = PLACEHOLDER_IMAGE;
  };

  // UPDATED: Comprehensive Search Logic
  const filteredEvents = events.filter((event) => {
    // 1. Status Filter (Tab Selection)
    const matchesStatus = filter === "all" ? true : event.status === filter;

    // 2. Search Filter (Text Input)
    if (!search) return matchesStatus;

    const term = search.toLowerCase();
    
    const eventDate = new Date(event.dateTime || event.date);
    const dateStrShort = isValid(eventDate) ? format(eventDate, "MMM d yyyy").toLowerCase() : "";
    const dateStrLong = isValid(eventDate) ? format(eventDate, "MMMM d yyyy").toLowerCase() : "";

    const matchesSearch =
      event.title?.toLowerCase().includes(term) ||          
      event.venue?.toLowerCase().includes(term) ||          
      event.description?.toLowerCase().includes(term) ||    
      dateStrShort.includes(term) ||                        
      dateStrLong.includes(term);                           

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="text-primary font-mono text-sm tracking-wider uppercase">
              // Discover Events
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mt-4 mb-6">
              Upcoming & Past <span className="text-primary">Events</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Find the perfect event to level up your skills and connect with 
              fellow developers.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, venue, date..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
              {["all", "upcoming", "past"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleFilterChange(tab)} // 👈 Use new handler
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

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {/* Events Grid */}
          {!isLoading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event, index) => {
                
                // Date Logic
                const rawDate = event.dateTime || event.date;
                const eventDateObj = new Date(rawDate);
                const isDateValid = isValid(eventDateObj);

                const displayImage = getImageUrl(event.imageUrl || event.image_url);

                return (
                  <div
                    key={event._id}
                    className="group glass rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-500"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden bg-gray-200">
                      <img
                        src={displayImage}
                        alt={event.title}
                        onError={handleImageError} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                          event.status === "upcoming" 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted text-foreground"
                        }`}>
                          {event.status}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">
                        {event.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {event.description}
                      </p>

                      {/* Meta */}
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-primary" />
                          {isDateValid ? format(eventDateObj, "MMM d, yyyy") : "TBA"}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span className="truncate max-w-[100px]">{event.venue}</span>
                        </div>
                        {(event.max_attendees || event.maxAttendees) && (
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-primary" />
                            {event.maxAttendees || event.max_attendees}+ spots
                          </div>
                        )}
                      </div>

                      <Link to={`/events/${event._id}`}>
                        <Button 
                          variant={event.status === "upcoming" ? "outline" : "secondary"} 
                          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                        >
                          {event.status === "upcoming" ? "Register Now" : "View Details"}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!isLoading && filteredEvents.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No events found matching your criteria.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Events;