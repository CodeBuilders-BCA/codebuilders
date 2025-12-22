import { useState, useEffect } from "react";
import axios from "axios";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Github, Linkedin, Loader2, Phone } from "lucide-react"; // 👈 Added Phone, Removed Twitter
import { Skeleton } from "@/components/ui/skeleton";

const apiUrl = import.meta.env.VITE_API_URL;

const Speakers = () => {
  const [speakers, setSpeakers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fallback Image
  const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&q=80";

  // 👇 Helper for Image URLs
  const getImageUrl = (imagePath) => {
    if (!imagePath) return PLACEHOLDER_IMAGE;
    if (imagePath.startsWith("http") || imagePath.startsWith("https")) return imagePath;
    const cleanPath = imagePath.replace(/\\/g, "/");
    const normalizedPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
    const baseUrl = apiUrl.replace('/api', '');
    return `${baseUrl}${normalizedPath}`;
  };

  const handleImageError = (e) => {
    e.target.src = PLACEHOLDER_IMAGE;
  };

  // Fetch Speakers from Backend
  useEffect(() => {
    const fetchSpeakers = async () => {
      try {
        const res = await axios.get(`${apiUrl}/speakers`);
        setSpeakers(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSpeakers();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="text-primary font-mono text-sm tracking-wider uppercase">
              // Industry Experts
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mt-4 mb-6">
              Meet Our <span className="text-primary">Speakers</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Learn from industry leaders who bring decades of combined experience 
              and cutting-edge insights to every session.
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="glass rounded-2xl p-6">
                  <Skeleton className="w-32 h-32 rounded-full mx-auto mb-6" />
                  <Skeleton className="h-5 w-3/4 mx-auto mb-2" />
                  <Skeleton className="h-4 w-1/2 mx-auto mb-2" />
                  <Skeleton className="h-3 w-1/3 mx-auto mb-4" />
                  <Skeleton className="h-16 w-full mb-6" />
                  <div className="flex justify-center gap-3">
                    {[...Array(3)].map((_, j) => (
                      <Skeleton key={j} className="w-8 h-8 rounded-lg" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-16">
              <p className="text-destructive">Failed to load speakers.</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && speakers?.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No speakers available yet. Check back soon!</p>
            </div>
          )}

          {/* Speakers Grid */}
          {!isLoading && speakers && speakers.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {speakers.map((speaker, index) => (
                <div
                  key={speaker._id}
                  className="group glass rounded-2xl p-6 hover:border-primary/50 transition-all duration-500 animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Avatar */}
                  <div className="relative mb-6 mx-auto w-32 h-32">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-cyan-400 p-[2px] group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300">
                      <img
                        src={getImageUrl(speaker.imageUrl)}
                        alt={speaker.name}
                        onError={handleImageError}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="text-center">
                    <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                      {speaker.name}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-2">
                      {speaker.role}
                    </p>
                    <p className="text-primary text-xs font-mono mb-4">
                      {speaker.specialty}
                    </p>
                    <p className="text-muted-foreground text-sm mb-6 line-clamp-3">
                      {speaker.bio}
                    </p>

                    {/* 👇 Social Links (Using flattened fields) */}
                    <div className="flex justify-center gap-3">
                      
                      {/* WhatsApp */}
                      {speaker.whatsappNumber && (
                        <a 
                          href={`https://wa.me/${speaker.whatsappNumber.replace(/\D/g,'')}`}
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-green-500 hover:bg-secondary/80 transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      )}

                      {/* GitHub */}
                      {speaker.githubUrl && (
                        <a 
                          href={speaker.githubUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-primary hover:bg-secondary/80 transition-colors"
                        >
                          <Github className="w-4 h-4" />
                        </a>
                      )}

                      {/* LinkedIn */}
                      {speaker.linkedinUrl && (
                        <a 
                          href={speaker.linkedinUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-blue-500 hover:bg-secondary/80 transition-colors"
                        >
                          <Linkedin className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Speakers;