import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios"; 
import { format, isAfter, isValid, isToday, startOfDay } from "date-fns"; // 👈 isToday aur startOfDay add kiya
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Users, Zap, Loader2 } from "lucide-react";

const apiUrl = import.meta.env.VITE_API_URL;

export function HeroSection() {
  const [nextEvent, setNextEvent] = useState(null);
  const [isEventToday, setIsEventToday] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNextEvent = async () => {
      try {
        const res = await axios.get(`${apiUrl}/events`);
        const allEvents = res.data;
        const todayStart = startOfDay(new Date()); // Aaj subah 00:00:00

        // 1. Filter: Valid events only
        const activeEvents = allEvents.filter((event) => {
          const rawDate = event.dateTime || event.date;
          const eventDate = new Date(rawDate);
          // Valid date HO aur (Aaj ho YA Future mein ho)
          // Hum 'todayStart' se compare kar rahe hain taaki aaj ke events shaam tak dikhein
          return isValid(eventDate) && (isToday(eventDate) || isAfter(eventDate, todayStart));
        });

        // 2. Sort: Nearest date first
        activeEvents.sort((a, b) => {
          const dateA = new Date(a.dateTime || a.date);
          const dateB = new Date(b.dateTime || b.date);
          return dateA - dateB;
        });

        // 3. Set the first event
        if (activeEvents.length > 0) {
          const firstEvent = activeEvents[0];
          setNextEvent(firstEvent);
          // Check agar ye event aaj hi hai
          setIsEventToday(isToday(new Date(firstEvent.dateTime || firstEvent.date)));
        } else {
            setNextEvent(null);
        }

      } catch (error) {
        console.error("Error fetching events", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNextEvent();
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* ... (Background Effects same rahenge) ... */}
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
      
      {/* ... (Floating Elements same rahenge) ... */}
      <div className="absolute top-32 left-20 hidden lg:block animate-float">
        <div className="glass p-4 rounded-xl border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.2)]">
          <code className="text-primary font-mono text-sm">{"<CodeBuilders />"}</code>
        </div>
      </div>

      <div className="absolute bottom-32 right-20 hidden lg:block animate-float" style={{ animationDelay: "2s" }}>
        <div className="glass p-4 rounded-xl border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
          <code className="text-cyan-400 font-mono text-sm">npm run build</code>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* 👇 UPDATED DYNAMIC BADGE */}
          <div className="inline-block mb-8 animate-fade-in">
             {loading ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm font-medium opacity-70">Loading...</span>
                </div>
             ) : nextEvent ? (
                // CASE 1: Event Hai (Today or Upcoming) -> Simple Badge (Not Link)
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30">
                    <Zap className={`w-4 h-4 ${isEventToday ? "text-green-500 animate-pulse" : "text-primary"}`} />
                    <span className="text-sm font-medium">
                        {isEventToday 
                            ? "Happening Today!" 
                            : `Next Event: ${format(new Date(nextEvent.dateTime || nextEvent.date), "MMM d, yyyy")}`
                        }
                    </span>
                </div>
             ) : (
                // CASE 2: No Event -> Clickable Link to Login/Signup
                <Link to="/login" className="group">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 group-hover:border-primary/60 transition-colors cursor-pointer">
                        <Users className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium group-hover:text-primary transition-colors">
                            Join the Community
                        </span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors ml-1" />
                    </div>
                </Link>
             )}
          </div>

          {/* ... (Main Heading, Subheading, Buttons, Stats same rahenge) ... */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Build the Future with{" "}
            <span className="text-gradient">Code Builders</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Join world-class technical events, connect with industry leaders, 
            and accelerate your development journey.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Link to="/events">
              <Button variant="hero" size="xl">
                Explore Events
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/speakers">
              <Button variant="hero-outline" size="xl">
                Meet Speakers
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.4s" }}>
            {[
              { icon: Calendar, value: "10+", label: "Events Hosted" },
              { icon: Users, value: "5K+", label: "Developers" },
              { icon: Zap, value: "20+", label: "Speakers" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gradient">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}