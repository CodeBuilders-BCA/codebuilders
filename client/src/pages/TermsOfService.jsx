import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsOfService() {
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
                <FileText className="w-6 h-6" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">Terms of Service</h1>
            </div>
            <p className="text-muted-foreground">Last updated: December 18, 2024</p>
          </div>

          {/* Content Card */}
          <div className="glass rounded-2xl p-8 border border-border space-y-8">
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">1. Agreement to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using the Code Builders website and services, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">2. Code of Conduct</h2>
              <p className="text-muted-foreground leading-relaxed">
                Code Builders is dedicated to providing a harassment-free experience for everyone. We do not tolerate harassment of community members in any form.
              </p>
              <p className="text-muted-foreground font-semibold mt-2">You agree not to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Use the service for any unlawful purpose.</li>
                <li>Harass, abuse, or harm another person.</li>
                <li>Spam or post irrelevant content in community discussions.</li>
                <li>Attempt to gain unauthorized access to the platform.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">3. Event Registration</h2>
              <p className="text-muted-foreground leading-relaxed">
                When you register for an event, you agree to provide accurate and complete information. We reserve the right to cancel your registration if we discover that you have provided false information or violated our Code of Conduct.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">4. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                The service and its original content, features, and functionality are and will remain the exclusive property of Code Builders. Our content may not be used in connection with any product or service without the prior written consent of Code Builders.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">5. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-primary">6. Changes</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}