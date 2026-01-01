import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom"; 
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";

import Index from "./pages/Index";
import Events from "./pages/Events";
import ExternalEvents from "./pages/ExternalEvents";
import ExternalEventDetail from "./pages/ExternalEventDetail";
import Hackathons from "./pages/Hackathons";
import EventDetail from "./pages/EventDetail";
import TeamMembers from "./pages/TeamMembers";
import Memories from "./pages/Memories";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VolunteerPanel from "./pages/volunteer/VolunteerPanel";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import TicketView from "./pages/TicketView";
import Developers from "./pages/Developers";
import Profile from './pages/Profile'; 
import ForgotPassword from './pages/ForgotPassword';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/events" element={<Events />} />
            <Route path="/external-events" element={<ExternalEvents />} />
            <Route path="/external-events/:id" element={<ExternalEventDetail />} />
            <Route path="/hackathons" element={<Hackathons />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/team-members" element={<TeamMembers />} />
            <Route path="/memories" element={<Memories />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/developers" element={<Developers />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* SHARED PROFILE ROUTE */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Volunteer routes */}
            <Route path="/volunteer" element={<VolunteerPanel />} />
            
            {/* Ticket View */}
            <Route path="/ticket/:tokenId" element={<TicketView />} />
            
            {/* 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;