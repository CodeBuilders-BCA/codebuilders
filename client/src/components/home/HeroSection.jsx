import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios"; // 👈 API call ke liye
import { format, isAfter, isValid } from "date-fns"; // 👈 Date formatting ke liye
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Users, Zap, Loader2 } from "lucide-react";

const apiUrl = import.meta.env.VITE_API_URL;

export function HeroSection() {
  const [nextEvent, setNextEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // 👇 Logic to find the nearest upcoming event
  useEffect(() => {
    const fetchNextEvent = async () => {
      try {
        const res = await axios.get(`${apiUrl}/events`);
        const allEvents = res.data;
        const today = new Date();

        // 1. Filter: Future events only
        const upcomingEvents = allEvents.filter((event) => {
          const rawDate = event.dateTime || event.date;
          const eventDate = new Date(rawDate);
          return isValid(eventDate) && isAfter(eventDate, today);
        });

        // 2. Sort: Nearest date first
        upcomingEvents.sort((a, b) => {
          const dateA = new Date(a.dateTime || a.date);
          const dateB = new Date(b.dateTime || b.date);
          return dateA - dateB;
        });

        // 3. Set the first event
        if (upcomingEvents.length > 0) {
          setNextEvent(upcomingEvents[0]);
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
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
      
      {/* Floating Elements */}
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
          
          {/* 👇 Dynamic Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 mb-8 animate-fade-in">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">
              {loading ? (
                <span className="opacity-70">Loading...</span>
              ) : nextEvent ? (
                // Shows the dynamic date
                `Next Event: ${format(new Date(nextEvent.dateTime || nextEvent.date), "MMM d, yyyy")}`
              ) : (
                // Fallback if no upcoming events
                "Join the Community"
              )}
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Build the Future with{" "}
            <span className="text-gradient">Code Builders</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Join world-class technical events, connect with industry leaders, 
            and accelerate your development journey.
          </p>

          {/* CTA Buttons */}
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

          {/* Stats */}
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

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}