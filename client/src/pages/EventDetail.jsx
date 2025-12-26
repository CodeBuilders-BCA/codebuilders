import { useState, useEffect } from "react";
// 1. Add useNavigate and useLocation to imports
import { useParams, Link, useNavigate, useLocation } from "react-router-dom"; 
import axios from "axios";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, MapPin, ArrowLeft, Loader2, Share2, ShieldCheck, AlertCircle, Copy, Image as ImageIcon, X, Download, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, isValid, isPast, addHours } from "date-fns";
import AddToCalendar from "@/components/events/AddToCalendar";

const apiUrl = import.meta.env.VITE_API_URL;

const EventSidebar = ({ 
  event, 
  user, 
  formData, 
  setFormData, 
  isRegistering, 
  setIsRegistering, 
  isSubmitting, 
  handleRegister, 
  handleShare, 
  isDateValid, 
  eventDateObj, 
  isEventOver 
}) => {
  // 2. Initialize hooks for navigation
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast(); // Ensure toast is accessible here

  const handleRegistrationClick = () => {
    // 3. LOGIC: If user is not logged in, send to login page
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to register for this event.",
        variant: "default", // or "destructive" if you want it red
      });
      
      // Navigate to login, passing the current location so you can redirect back later
      // (You will need to handle `location.state.from` in your Login component)
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    // If logged in, show the form
    setIsRegistering(true);
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6 border border-border/50 shadow-xl backdrop-blur-xl">
        <div className="space-y-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-lg text-foreground">
                {isDateValid ? format(eventDateObj, "EEEE, MMM d, yyyy") : "Date TBA"}
              </p>
              <p className="text-muted-foreground">
                {isDateValid ? format(eventDateObj, "h:mm a") : "Time TBA"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-lg text-foreground break-words">{event.venue}</p>
              {event.mapUrl ? (
                <a 
                  href={event.mapUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-muted-foreground text-sm hover:text-primary hover:underline transition-colors flex items-center gap-1"
                >
                  View Map <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <p className="text-muted-foreground text-sm">Map unavailable</p>
              )}
            </div>
          </div>
        </div>

        {event.status === "cancelled" ? (
          <div className="bg-destructive/10 text-destructive rounded-xl p-4 text-center font-bold border border-destructive/20 flex flex-col items-center gap-2">
            <AlertCircle className="w-6 h-6" /> Event Cancelled
          </div>
        ) : isEventOver ? (
          <div className="bg-secondary/50 rounded-xl p-4 text-center border border-border">
            <p className="font-medium text-muted-foreground">This event has ended</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* CTA BUTTON */}
            {!isRegistering && (
              <div className="space-y-3">
                <Button
                  className={`
                    w-full h-12 text-lg font-bold transition-all
                    ${!event.isRegistrationEnabled
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : !user
                        ? "bg-secondary hover:bg-secondary/80 text-foreground" // Different style if not logged in
                        : "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 hover:scale-[1.02]"
                    }
                  `}
                  onClick={handleRegistrationClick} // 4. Use the new handler
                  disabled={!event.isRegistrationEnabled}
                >
                  {!event.isRegistrationEnabled
                    ? "Registration Closed"
                    : !user
                      ? "Login to Register" // Explicit text
                      : "Register Now"}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  {event.maxAttendees
                    ? `${event.maxAttendees} spots available`
                    : "Limited capacity"}
                </p>
              </div>
            )}

            {/* REGISTRATION FORM */}
            <form
              onSubmit={handleRegister}
              className={`space-y-4 ${!isRegistering ? "hidden" : "block"}`}
            >
             {/* ... Form inputs remain the same ... */}
              <h4 className="text-lg font-semibold text-center">
                Complete Your Registration
              </h4>

              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  type="button"
                  onClick={() => setIsRegistering(false)}
                >
                  Cancel
                </Button>
                <Button className="flex-1 font-bold" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Confirm"
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
       {/* Share Button logic... */}
       <div
        className="glass rounded-xl p-4 border border-border/50 items-center justify-between cursor-pointer hover:bg-secondary/30 transition-colors hidden md:flex"
        onClick={handleShare}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <Share2 className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <p className="font-semibold text-sm">Share Event</p>
            <p className="text-xs text-muted-foreground">Invite friends</p>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <Copy className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

// ... EventDetail component remains the same ...

const EventDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [selectedImage, setSelectedImage] = useState(null);

  const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80";

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(`${apiUrl}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(res.data);
        // Only set default form data if not already edited by user (or reset on load)
        setFormData(prev => ({ 
            ...prev,
            name: res.data.name || "", 
            email: res.data.email || "" 
        }));
      } catch (error) {
        setUser(null);
      }
    };

    const fetchEvent = async () => {
      try {
        const res = await axios.get(`${apiUrl}/events/${id}`);
        setEvent(res.data);
      } catch (error) {
        console.error("Event not found", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchEvent();
      fetchUser();
    }
  }, [id]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post(`${apiUrl}/registrations`, {
        eventId: event._id,
        userName: formData.name,
        userEmail: formData.email,
        userPhone: formData.phone,
      });
      toast({ title: "Registration Successful!", description: "Check your email for the ticket." });
      setIsRegistering(false);
      setFormData({ name: "", email: "", phone: "" });
    } catch (err) {
      toast({
        title: "Registration Failed",
        description: err.response?.data?.message || "Something went wrong.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const displayImage = event ? getImageUrl(event.imageUrl || event.image_url) : PLACEHOLDER_IMAGE;

  const handleShare = async () => {
    if (!event) return;
    const eventDate = new Date(event.dateTime).toDateString();
    const eventTime = new Date(event.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const shareTitle = `🚀 Event Alert: ${event.title}`;
    const shareText = `🚀 *Event Alert: ${event.title}*\n\nReady to level up? Join us for an exclusive session at CodeBuilders!\n\n📅 *Date:* ${eventDate} at ${eventTime}\n📍 *Venue:* ${event.venue}\n💡 *Topic:* ${event.shortDescription || "Join us to learn and grow!"}\n\n👇 *Register & Details:*`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        if (event.image) {
          try {
            const response = await fetch(event.image);
            const blob = await response.blob();
            const file = new File([blob], "event-cover.jpg", { type: "image/jpeg" });
            await navigator.share({ title: shareTitle, text: shareText + "\n" + shareUrl, files: [file] });
            return;
          } catch (fileError) { console.warn("Image sharing failed", fileError); }
        }
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
      } catch (err) { console.log("Share canceled", err); }
    } else {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      toast({ title: "Link Copied", description: "Event link copied to clipboard." });
    }
  };

  const handleDownload = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = imageUrl.split('/').pop() || 'memory-image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast({ title: "Download Started", description: "Image saved." });
    } catch (error) { toast({ variant: "destructive", title: "Download Failed", description: "Could not save image." }); }
  };

  const getEmbedUrl = (url) => {
    if (!url) return "";
    if (url.includes("embed") || url.includes("output=embed")) return url;
    return `https://maps.google.com/maps?q=${encodeURIComponent(event.venue)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!event) return <div>Event Not Found</div>;

  const rawDate = event.dateTime || event.date;
  const eventDateObj = rawDate ? new Date(rawDate) : null;
  const isDateValid = eventDateObj && isValid(eventDateObj);
  const isEventOver = isDateValid && isPast(eventDateObj);

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <Helmet>
        <title>{event.title} | CodeBuilders</title>
        <meta name="description" content={event.description} />
      </Helmet>
      <Navbar />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <Link to="/events" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Events
            </Link>
            <Button variant="outline" size="icon" className="md:hidden rounded-full h-10 w-10 border-border/50 bg-background/50 backdrop-blur-sm" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 md:gap-12">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-8 space-y-10">
              <div className="relative w-full aspect-video overflow-hidden rounded-2xl border border-border bg-muted shadow-sm">
                <img src={displayImage} alt={event.title} onError={handleImageError} className="w-full h-full object-contain" />
              </div>

              <div className="space-y-4">
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 leading-tight break-words">{event.title}</h1>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><ShieldCheck className="w-5 h-5 text-primary" /></div>
                    <div><p className="text-xs font-semibold uppercase tracking-wider text-primary">Hosted By</p><span className="font-medium text-foreground">CodeBuilders Team</span></div>
                  </div>
                  {isDateValid && (
                    <AddToCalendar event={{
                      title: event.title, description: event.description, venue: event.venue,
                      date: format(eventDateObj, 'yyyy-MM-dd'), startTime: format(eventDateObj, 'HH:mm'), endTime: format(addHours(eventDateObj, 2), 'HH:mm')
                    }} />
                  )}
                </div>
              </div>

              {/* ✅ 2. MOBILE ONLY SIDEBAR (Passed props) */}
              <div className="block lg:hidden mt-8 mb-8">
                <EventSidebar 
                  event={event}
                  user={user}
                  formData={formData}
                  setFormData={setFormData}
                  isRegistering={isRegistering}
                  setIsRegistering={setIsRegistering}
                  isSubmitting={isSubmitting}
                  handleRegister={handleRegister}
                  handleShare={handleShare}
                  isDateValid={isDateValid}
                  eventDateObj={eventDateObj}
                  isEventOver={isEventOver}
                />
              </div>

              <div className="prose prose-lg prose-invert max-w-none">
                <h3 className="text-2xl font-semibold mb-4 border-l-4 border-primary pl-4">About Event</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap break-words">{event.fullDescription || event.description}</p>
              </div>

              {event.mapUrl && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold border-l-4 border-primary pl-4">Location</h3>
                  <div className="w-full h-[350px] rounded-xl overflow-hidden border border-border shadow-sm bg-muted relative">
                    <iframe src={event.mapUrl.includes("embed") ? event.mapUrl : getEmbedUrl(event.mapUrl)} width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Event Location"></iframe>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-secondary/30 dark:bg-secondary/10 p-4 rounded-xl border border-border/50 backdrop-blur-sm transition-colors duration-300">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <div className="w-12 h-12 rounded-2xl bg-background dark:bg-card flex items-center justify-center border border-border shadow-sm shrink-0"><MapPin className="w-6 h-6 text-primary" /></div>
                      <div><span className="font-bold text-foreground block break-all leading-tight">{event.venue}</span><span className="text-xs text-muted-foreground/80 dark:text-muted-foreground">Tap button to navigate</span></div>
                    </div>
                    <Button asChild variant="outline" className="w-full sm:w-auto shrink-0 gap-2 font-semibold shadow-sm hover:shadow-md transition-all active:scale-95 border-border dark:hover:bg-secondary/50">
                      <a href={event.mapUrl} target="_blank" rel="noopener noreferrer">Open in Google Maps <ExternalLink className="w-4 h-4" /></a>
                    </Button>
                  </div>
                </div>
              )}

              {event.memories && event.memories.length > 0 && (
                <div className="space-y-6 pt-8 border-t border-border">
                  <div className="flex items-center gap-2"><ImageIcon className="w-6 h-6 text-primary" /><h3 className="text-2xl font-semibold">Event Memories</h3></div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {event.memories.map((memory, idx) => (
                      <div key={idx} className="group relative aspect-square overflow-hidden rounded-xl bg-muted cursor-pointer border border-border" onClick={() => setSelectedImage(getImageUrl(memory.url || memory))}>
                        <img src={getImageUrl(memory.url || memory)} alt={`Memory ${idx + 1}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ✅ 3. DESKTOP ONLY SIDEBAR (Passed props) */}
            <div className="lg:col-span-4 hidden lg:block">
              <div className="lg:sticky lg:top-24 space-y-6">
                <EventSidebar 
                  event={event}
                  user={user}
                  formData={formData}
                  setFormData={setFormData}
                  isRegistering={isRegistering}
                  setIsRegistering={setIsRegistering}
                  isSubmitting={isSubmitting}
                  handleRegister={handleRegister}
                  handleShare={handleShare}
                  isDateValid={isDateValid}
                  eventDateObj={eventDateObj}
                  isEventOver={isEventOver}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedImage(null)}>
          <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"><X className="w-8 h-8" /></button>
          <img src={selectedImage} alt="Preview" className="max-w-[90vw] max-h-[85vh] object-contain rounded-md shadow-2xl" onClick={(e) => e.stopPropagation()} />
          <button onClick={(e) => { e.stopPropagation(); handleDownload(selectedImage); }} className="absolute bottom-8 right-8 flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-full font-bold shadow-lg transition-transform hover:scale-105"><Download className="w-5 h-5" /> Download</button>
        </div>
      )}
    </div>
  );
};

export default EventDetail;