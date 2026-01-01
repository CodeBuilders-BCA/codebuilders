import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/integrations/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Mail, MapPin, Phone, Send, Loader2 } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export default function Contact() {
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data) => apiClient.sendContactMessage(data),
    onSuccess: () => {
      toast({
        title: "Message Sent!",
        description: "We'll get back to you as soon as possible.",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send message.",
      });
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen pt-20 pb-12 relative bg-background text-foreground transition-colors duration-300">
      <Navbar />
      
      <div className="fixed inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] pointer-events-none -z-10" />
      <div className="fixed top-20 right-0 w-72 h-72 bg-primary/10 dark:bg-primary/20 rounded-full blur-[80px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 left-0 w-72 h-72 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[80px] pointer-events-none -z-10" />

      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground tracking-tight">
            Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Touch</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Have questions about upcoming events, speaking opportunities, or just want to say hi? We'd love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Side: Contact Info */}
          <div className="space-y-8">
            <Card className="bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-colors shadow-sm">
              <CardContent className="p-8 space-y-8">
                
                {/* Email Section */}
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1 text-foreground">Email Us</h3>
                    <p className="text-muted-foreground mb-2">For general inquiries and support</p>
                    <a href="mailto:codebuilders100@gmail.com" className="text-primary hover:underline font-medium">
                      codebuilders100@gmail.com
                    </a>
                  </div>
                </div>

                {/* Address Section */}
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1 text-foreground">Visit Us</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Som-Lalit Institute of Computer Applications<br />
                      Navarangpura, Ahmedabad - 380009
                    </p>
                  </div>
                </div>

                {/* Phone Section */}
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1 text-foreground">Call Us</h3>
                    <p className="text-muted-foreground mb-2">Mon-Fri from 9am to 6pm</p>
                    <div className="space-y-1">
                      <a href="tel:+919265328747" className="block text-primary hover:underline font-medium">
                        +91 92653 28747
                      </a>
                      <a href="tel:+919773272749" className="block text-primary hover:underline font-medium">
                        +91 97732 72749
                      </a>
                      <a href="tel:+917016798029" className="block text-primary hover:underline font-medium">
                        +91 70167 98029
                      </a>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Map Placeholder */}
            <div className="h-64 rounded-xl overflow-hidden border border-border shadow-sm grayscale hover:grayscale-0 transition-all duration-500 bg-muted">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14686.517597375094!2d72.50043585!3d23.0373516!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e9b7b96a8a5f3%3A0x7000000000000000!2sAhmedabad%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1710000000000" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Location Map"
              ></iframe>
            </div>
          </div>

          {/* Right Side: Form */}
          <Card className="bg-card/50 backdrop-blur-sm border-border shadow-lg">
            <CardHeader>
              <CardTitle className="text-foreground">Send a Message</CardTitle>
              <CardDescription>Fill out the form below and we'll get back to you shortly.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} className="bg-background border-input" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Email</FormLabel>
                          <FormControl>
                            <Input placeholder="john@example.com" {...field} className="bg-background border-input" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="Speaking Opportunity" {...field} className="bg-background border-input" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us more about your inquiry..." 
                            className="min-h-[120px] bg-background border-input"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full shadow-lg shadow-primary/20" disabled={mutation.isPending}>
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}