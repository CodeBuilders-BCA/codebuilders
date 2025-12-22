import { useState, useEffect } from "react";
import axios from "axios";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { X, Loader2, Calendar, Search, Download, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const apiUrl = import.meta.env.VITE_API_URL;

const Memories = () => {
  const [lightbox, setLightbox] = useState(null);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search States
  const [searchName, setSearchName] = useState("");
  const [searchDate, setSearchDate] = useState("");

  // Fetch Events with Memories
  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const res = await axios.get(`${apiUrl}/events`);
        
        // Filter events that actually have memories
        const eventsWithMemories = res.data
          .filter((e) => e.memories && e.memories.length > 0)
          .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

        setEvents(eventsWithMemories);
        setFilteredEvents(eventsWithMemories); // Initialize filtered list
      } catch (error) {
        console.error("Error loading memories:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMemories();
  }, []);

  // Handle Search Filtering
  useEffect(() => {
    let result = events;

    // Filter by Name
    if (searchName) {
      result = result.filter(event => 
        event.title.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    // Filter by Date (Matches YYYY-MM-DD)
    if (searchDate) {
      result = result.filter(event => {
        const eventDate = new Date(event.dateTime).toISOString().split('T')[0];
        return eventDate === searchDate;
      });
    }

    setFilteredEvents(result);
  }, [searchName, searchDate, events]);

  // Handle Image Download
  const handleDownload = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      // Extract filename from URL or default to 'memory.jpg'
      link.download = imageUrl.split('/').pop() || 'memory.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="pt-24 pb-16 flex-1">
        <div className="container mx-auto px-4">
          
          {/* Header Section */}
          <div className="text-center mb-12 space-y-4">
            <span className="text-primary font-mono text-sm tracking-wider uppercase bg-primary/10 px-3 py-1 rounded-full">
              Gallery
            </span>
            <h1 className="text-4xl md:text-6xl font-bold">
              Captured <span className="text-primary">Moments</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Relive the connections, the learning, and the community spirit.
            </p>
          </div>

          {/* 🔍 Search Bar Section */}
          <div className="max-w-4xl mx-auto mb-16 bg-card border border-border p-4 rounded-2xl shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search event by name..." 
                  className="pl-9 bg-background"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>
              <div className="w-full md:w-1/3 relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  type="date" 
                  className="pl-9 bg-background"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                />
              </div>
              {(searchName || searchDate) && (
                <Button 
                  variant="ghost" 
                  onClick={() => { setSearchName(""); setSearchDate(""); }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading gallery...</p>
            </div>
          )}

          {/* Galleries List */}
          {!isLoading && filteredEvents.length > 0 && (
            <div className="space-y-24">
              {filteredEvents.map((event, eventIndex) => (
                <div 
                  key={event._id} 
                  className="animate-fade-in space-y-6" 
                  style={{ animationDelay: `${eventIndex * 0.1}s` }}
                >
                  {/* Event Title & Date */}
                  <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-4 gap-2">
                    <div>
                      <h2 className="text-3xl font-bold text-foreground">{event.title}</h2>
                      <div className="flex items-center gap-2 text-muted-foreground mt-2">
                        <Calendar className="w-4 h-4" />
                        <span className="font-mono text-sm">
                          {event.dateTime ? format(new Date(event.dateTime), "MMMM d, yyyy") : "Date N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
                      {event.memories.length} Photos
                    </div>
                  </div>

                  {/* Image Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {event.memories.map((memory, index) => (
                      <div 
                        key={memory._id || index}
                        onClick={() => setLightbox(memory.url)}
                        className="group relative aspect-square overflow-hidden rounded-xl cursor-pointer bg-secondary/30 border border-transparent hover:border-primary/50 transition-all"
                      >
                        <img
                          src={memory.url}
                          alt={`${event.title} memory ${index + 1}`}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        {/* Overlay with Zoom Icon */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                            <ImageIcon className="text-white opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 w-8 h-8" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredEvents.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed border-border rounded-3xl bg-secondary/5">
              <div className="flex justify-center mb-4">
                <Search className="w-12 h-12 text-muted-foreground/50" />
              </div>
              <p className="text-xl font-semibold text-foreground">No memories found</p>
              <p className="text-muted-foreground mt-2">
                {events.length === 0 
                  ? "We haven't uploaded any photos yet." 
                  : "Try adjusting your search criteria."}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Lightbox Modal */}
      {lightbox && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightbox(null)}
        >
          {/* Top Bar Actions */}
          <div className="absolute top-4 right-4 flex items-center gap-3 z-50">
            {/* 👇 Download Button */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(lightbox);
              }}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-105 backdrop-blur-sm"
              title="Download Image"
            >
              <Download className="w-5 h-5" />
            </button>

            {/* 👇 Close Button */}
            <button 
              onClick={() => setLightbox(null)}
              className="p-3 rounded-full bg-white/10 hover:bg-red-500/80 text-white transition-all hover:scale-105 backdrop-blur-sm"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <img
            src={lightbox}
            alt="Full screen memory"
            className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain select-none"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Memories;