import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Github, Linkedin, Loader2, Phone } from "lucide-react"; // 👈 Added Phone icon
import { useFeaturedSpeakers } from "@/hooks/useSpeakers";

const apiUrl = import.meta.env.VITE_API_URL;

export function SpeakersSection() {
  const { data: speakers = [], isLoading } = useFeaturedSpeakers(4);

  // Fallback Image
  const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&q=80";

  // 👇 Helper to display local uploads vs external URLs
  const getImageUrl = (imagePath) => {
    if (!imagePath) return PLACEHOLDER_IMAGE;
    if (imagePath.startsWith("http") || imagePath.startsWith("https")) return imagePath;
    
    // Fix slashes and prepend backend URL
    const cleanPath = imagePath.replace(/\\/g, "/");
    const normalizedPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
    const baseUrl = apiUrl.replace('/api', '');
    return `${baseUrl}${normalizedPath}`;
  };

  // 👇 Fallback handler
  const handleImageError = (e) => {
    e.target.src = PLACEHOLDER_IMAGE;
  };

  return (
    <section className="py-24 relative bg-card/30">
      <div className="absolute inset-0 bg-grid opacity-20" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-primary font-mono text-sm tracking-wider uppercase">
            // Industry Experts
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
            Learn from the Best
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Our speakers are industry leaders who bring real-world experience 
            and cutting-edge insights to every session.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Speakers Grid */}
        {!isLoading && speakers.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {speakers.map((speaker, index) => (
              <div
                key={speaker._id || index}
                className="group text-center animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Avatar */}
                <div className="relative mb-4 mx-auto w-32 h-32 md:w-40 md:h-40">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-cyan-400 p-[2px] group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300">
                    <img
                      src={getImageUrl(speaker.imageUrl)} // 👈 Updated Logic
                      alt={speaker.name}
                      onError={handleImageError}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                </div>

                {/* Info */}
                <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                  {speaker.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-1">
                  {speaker.role}
                </p>
                <p className="text-primary text-xs font-mono">
                  {speaker.specialty}
                </p>

                {/* Social Links */}
                <div className="flex justify-center gap-3 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  
                  {/* 👇 WhatsApp Link */}
                  {speaker.whatsappNumber && (
                    <a 
                      href={`https://wa.me/${speaker.whatsappNumber.replace(/\D/g,'')}`} // Strip non-digits
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-muted-foreground hover:text-green-500 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}

                  {speaker.githubUrl && (
                    <a href={speaker.githubUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  
                  {speaker.linkedinUrl && (
                    <a href={speaker.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-blue-500 transition-colors">
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && speakers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No speakers announced yet.</p>
          </div>
        )}

        {/* View All Button */}
        <div className="text-center">
          <Link to="/speakers">
            <Button variant="hero-outline" size="lg">
              Meet All Speakers
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}