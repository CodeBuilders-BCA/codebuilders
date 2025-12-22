import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom"; 
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Speakers from "./pages/Speakers";
import Memories from "./pages/Memories";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminSpeakers from "./pages/admin/AdminSpeakers";
import AdminRegistrations from "./pages/admin/AdminRegistrations";
import AdminVolunteers from "./pages/admin/AdminVolunteers";
import VolunteerPanel from "./pages/volunteer/VolunteerPanel";
import About from "./pages/About";
import Contact from "./pages/Contact";
import AdminMessages from "./pages/admin/AdminMessages";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import TicketView from "./pages/TicketView";
import AdminMemories from './pages/admin/AdminMemories';
import CertificateDesigner from './pages/admin/CertificateDesigner';
import Profile from './pages/common/Profile'; 
import ForgotPassword from './pages/ForgotPassword';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/speakers" element={<Speakers />} />
          <Route path="/memories" element={<Memories />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* 👇 SHARED PROFILE ROUTE (Auto-adapts for Admin/Volunteer) */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Admin routes */}
          <Route path="/admin" element={<AdminOverview />} />
          <Route path="/admin/events" element={<AdminEvents />} />
          <Route path="/admin/events/:id/certificate" element={<CertificateDesigner />} />
          <Route path="/admin/memories" element={<AdminMemories />} />
          <Route path="/admin/speakers" element={<AdminSpeakers />} />
          <Route path="/admin/registrations" element={<AdminRegistrations />} />
          <Route path="/admin/volunteers" element={<AdminVolunteers />} />
          <Route path="/admin/messages" element={<AdminMessages />} />
          
          {/* Volunteer routes */}
          <Route path="/volunteer" element={<VolunteerPanel />} />
          
          {/* Ticket View */}
          <Route path="/ticket/:tokenId" element={<TicketView />} />
          
          {/* 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;