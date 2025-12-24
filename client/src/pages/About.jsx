import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Code2, 
  Users, 
  Calendar, 
  Trophy, 
  Rocket, 
  Heart, 
  ArrowRight, 
  Globe2 
} from "lucide-react";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";

export default function About() {
  // ✅ अपडेट 1: रंगों को Dark/Light mode के लिए 'dark:' क्लास के साथ अपडेट किया
  const stats = [
    { label: "Community Members", value: "1,000+", icon: Users, color: "text-blue-600 dark:text-blue-400" },
    { label: "Events Hosted", value: "10+", icon: Calendar, color: "text-purple-600 dark:text-purple-400" },
    { label: "Expert Speakers", value: "20+", icon: Trophy, color: "text-amber-600 dark:text-amber-400" },
    { label: "Projects Built", value: "50+", icon: Code2, color: "text-emerald-600 dark:text-emerald-400" },
  ];

  const values = [
    {
      title: "Learn & Grow",
      description: "We believe in continuous learning. Our workshops and seminars are designed to keep you updated with the latest tech stacks.",
      icon: Rocket,
    },
    {
      title: "Community First",
      description: "We are more than just a group of coders. We are a supportive family that helps each other debug life and code.",
      icon: Heart,
    },
    {
      title: "Open Source",
      description: "We advocate for open source. Contributing to public projects and sharing knowledge is at the core of our philosophy.",
      icon: Globe2,
    },
  ];

  return (
    // ✅ अपडेट 2: बेस बैकग्राउंड और टेक्स्ट कलर सेट किया
    <div className="min-h-screen pt-16 bg-background text-foreground transition-colors duration-300">
      <Navbar />

      {/* Background Elements - Opacity को एडजस्ट किया ताकि Dark Mode में ज्यादा ब्राइट न हो */}
      <div className="fixed inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] pointer-events-none -z-10" />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-primary/10 dark:bg-primary/20 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge variant="outline" className="mb-4 px-4 py-1 border-primary/50 text-primary bg-primary/5">
          About Code Builders
        </Badge>
        
        {/* ✅ अपडेट 3: हेडलाइन को Dark/Light दोनों में दिखने योग्य बनाया */}
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground tracking-tight">
          Building the Future, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
            One Line of Code at a Time.
          </span>
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Code Builders is a premier tech community dedicated to bridging the gap between theoretical knowledge and real-world application.
        </p>
        
        <div className="flex justify-center gap-4">
          <Link to="/events">
            <Button size="lg" className="gap-2 shadow-lg shadow-primary/20">
              Explore Events <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="outline" size="lg" className="bg-background hover:bg-accent">
              Join Community
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            // ✅ अपडेट 4: कार्ड का बैकग्राउंड और बॉर्डर Theme-aware बनाया
            <Card key={index} className="bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 shadow-sm dark:shadow-none">
              <CardContent className="p-6 text-center">
                <div className={`mx-auto w-12 h-12 rounded-full bg-accent/50 dark:bg-accent/20 flex items-center justify-center mb-4 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-bold mb-1 text-foreground">{stat.value}</h3>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Mission Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Our Mission
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              At Code Builders, we aim to create an ecosystem where students, professionals, and enthusiasts come together to share knowledge.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We focus on hands-on workshops, hackathons, and expert sessions to ensure our members are industry-ready. Whether you are just starting with "Hello World" or deploying microservices, there is a place for you here.
            </p>
          </div>
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary to-purple-600 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition duration-500" />
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80" 
              alt="Team collaborating" 
              className="relative rounded-xl border border-border shadow-2xl w-full object-cover grayscale hover:grayscale-0 transition duration-500"
            />
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="container mx-auto px-4 py-20 mb-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Why Join Us?</h2>
          <p className="text-muted-foreground">The core values that drive our community forward.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {values.map((val, index) => (
            // ✅ अपडेट 5: कार्ड्स को hover effect और theme colors के साथ अपडेट किया
            <Card key={index} className="bg-card border-border hover:bg-accent/50 hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <val.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">{val.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {val.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      
      <Footer />
    </div>
  );
}