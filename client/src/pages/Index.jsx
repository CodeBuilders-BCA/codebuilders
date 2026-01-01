import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedEvents } from "@/components/home/FeaturedEvents";
import { TeamMembersSection } from "@/components/home/TeamMembersSection";
import { CTASection } from "@/components/home/CTASection";
import MeetTheCodersCTA  from "@/components/home/MeetTheCodersCTA";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturedEvents />
        <MeetTheCodersCTA />
        <TeamMembersSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;