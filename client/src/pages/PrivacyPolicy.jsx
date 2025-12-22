import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <Link to="/">
              <Button variant="ghost" className="mb-4 pl-0 hover:pl-2 transition-all">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <Shield className="w-6 h-6" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">Privacy Policy</h1>
            </div>
            <p className="text-muted-foreground">Last updated: December 18, 2024</p>
          </div>

          {/* Content Card */}
          <div className="glass rounded-2xl p-8 border border-border space-y-8">
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to Code Builders. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and sign up for our events.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">2. Information We Collect</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may collect, use, store, and transfer different kinds of personal data about you which we have grouped together follows:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong className="text-foreground">Identity Data:</strong> includes first name, last name, and username.</li>
                <li><strong className="text-foreground">Contact Data:</strong> includes email address and telephone numbers.</li>
                <li><strong className="text-foreground">Technical Data:</strong> includes internet protocol (IP) address, browser type and version, and operating system.</li>
                <li><strong className="text-foreground">Usage Data:</strong> includes information about how you use our website and events.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">3. How We Use Your Data</h2>
              <p className="text-muted-foreground leading-relaxed">
                We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>To register you as a new member or event attendee.</li>
                <li>To manage our relationship with you (e.g., sending event reminders).</li>
                <li>To improve our website, services, and community experience.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">4. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way. We limit access to your personal data to those employees, agents, and other third parties who have a business need to know.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">5. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this privacy policy or our privacy practices, please contact us at: <a href="mailto:privacy@codebuilders.com" className="text-primary hover:underline">privacy@codebuilders.com</a>
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}