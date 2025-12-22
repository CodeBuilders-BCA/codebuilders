import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Users, ArrowRight, Loader2 } from "lucide-react";
import { format, isValid } from "date-fns"; 
import { useFeaturedEvents } from "@/hooks/useEvents"; 

const apiUrl = import.meta.env.VITE_API_URL;

export function FeaturedEvents() {
  const { data: events = [], isLoading } = useFeaturedEvents(3);

  // Fallback Image Constant
  const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80";

  // 👇 1. ADDED: Helper logic to handle Local vs External URLs
  const getImageUrl = (imagePath) => {
    if (!imagePath) return PLACEHOLDER_IMAGE; // Fallback if null

    // If it's an external link (http/https), return as is
    if (imagePath.startsWith("http") || imagePath.startsWith("https")) {
      return imagePath;
    }

    // If it's a local upload, fix slashes and prepend backend URL
    const cleanPath = imagePath.replace(/\\/g, "/");
    const normalizedPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;

    const baseUrl = apiUrl.replace('/api', '');
    return `${baseUrl}${normalizedPath}`;
  };

  // 👇 2. UPDATED: Fallback for broken images
  const handleImageError = (e) => {
    e.target.src = PLACEHOLDER_IMAGE;
  };

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-primary font-mono text-sm tracking-wider uppercase">
            // Upcoming Events
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
            Don't Miss Out
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Register for our upcoming events and be part of the most exciting 
            tech community gatherings.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Events Grid */}
        {!isLoading && events.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {events.map((event, index) => {
              
              // DATE LOGIC
              const rawDate = event.dateTime || event.date; 
              const eventDateObj = new Date(rawDate);
              const isDateValid = isValid(eventDateObj);

              // 👇 3. UPDATED: Use the helper function here
              const displayImage = getImageUrl(event.imageUrl || event.image_url);

              return (
                <div
                  key={event._id}
                  className="group glass rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-500 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={displayImage} // 👈 Using the processed URL
                      alt={event.title}
                      onError={handleImageError} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                        event.status === "upcoming" 
                          ? "bg-primary/90 text-primary-foreground" 
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
                      <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all">
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

        {!isLoading && events.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-6">No upcoming events at the moment.</p>
          </div>
        )}

        {/* View All Button */}
        <div className="text-center">
          <Link to="/events">
            <Button variant="hero-outline" size="lg">
              View All Events
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}