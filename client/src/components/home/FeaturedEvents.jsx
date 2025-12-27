import { Button, buttonVariants } from "@/components/ui/button"; 
import { cn } from "@/lib/utils"; 
import { Link } from "react-router-dom";
import { Calendar, MapPin, Users, ArrowRight, Loader2 } from "lucide-react";
import { format, isValid, isPast, isToday } from "date-fns"; // ✅ isToday add kiya
import { useFeaturedEvents } from "@/hooks/useEvents"; 

const apiUrl = import.meta.env.VITE_API_URL;

export function FeaturedEvents() {
  const { data: events = [], isLoading } = useFeaturedEvents(3);

  // Fallback Image
  const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80";

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

  // ✅ FILTER & SORT LOGIC
  // Sirf Today aur Future events rakhenge
  const upcomingEvents = events
    .filter((event) => {
        const rawDate = event.dateTime || event.date;
        const eventDateObj = new Date(rawDate);
        // Agar date valid hai, aur (Future hai YA Today hai) to true return karo
        // Note: isPast thoda strict hota hai, isliye isToday alag se check kiya
        return isValid(eventDateObj) && (!isPast(eventDateObj) || isToday(eventDateObj));
    })
    .sort((a, b) => {
        // Nearest date pehle dikhao
        const dateA = new Date(a.dateTime || a.date);
        const dateB = new Date(b.dateTime || b.date);
        return dateA - dateB; 
    });

  // Agar loading nahi hai aur events bhi nahi hai, to pura section hide karna hai ya sirf grid?
  // User ne kaha: "events ke div ko hide karo & view all event vala button dikhao"
  
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

        {/* ✅ Events Grid (Sirf tab dikhega jab upcomingEvents honge) */}
        {!isLoading && upcomingEvents.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {upcomingEvents.map((event, index) => {
              
              const rawDate = event.dateTime || event.date; 
              const eventDateObj = new Date(rawDate);
              const isDateValid = isValid(eventDateObj);
              
              // Status Badge Logic
              const isHappeningToday = isToday(eventDateObj);
              const displayStatus = isHappeningToday ? "Happening Today" : "Upcoming";

              const displayImage = getImageUrl(event.imageUrl || event.image_url);

              return (
                <Link
                  to={`/events/${event._id}`}
                  key={event._id}
                  className="group glass rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-500 animate-fade-in h-full flex flex-col"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Image Section */}
                  <div className="relative h-48 overflow-hidden shrink-0">
                    <img
                      src={displayImage} 
                      alt={event.title}
                      onError={handleImageError} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                    
                    {/* ✅ Dynamic Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-semibold uppercase",
                        isHappeningToday 
                          ? "bg-green-600 text-white animate-pulse" // Today wala alag highlight
                          : "bg-primary/90 text-primary-foreground"
                      )}>
                        {displayStatus}
                      </span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">
                      {event.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-grow">
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

                    {/* Button */}
                    <div 
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                      )}
                    >
                      Register Now
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
            // ✅ Agar koi upcoming event nahi hai, to Grid hide ho jayega
            // Aur ye message dikhega (Optional, aap isse hata bhi sakte ho)
            !isLoading && (
                <div className="text-center py-8 mb-8">
                    <p className="text-muted-foreground">No upcoming events scheduled at the moment.</p>
                </div>
            )
        )}

        {/* View All Button - Ye hamesha dikhega */}
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