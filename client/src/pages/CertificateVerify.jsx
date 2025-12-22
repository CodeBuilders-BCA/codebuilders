import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { CheckCircle, XCircle, Loader2, Award, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { format } from "date-fns";

const apiUrl = import.meta.env.VITE_API_URL;

export default function CertificateVerify() {
  const { certificateId } = useParams(); // Get ID from URL
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const verifyCertificate = async () => {
      try {
        setLoading(true);
        // We reuse the registration endpoint since Token ID = Certificate ID usually
        // If you built a specific /api/certificates/:id endpoint, use that instead.
        const response = await axios.get(`${apiUrl}/registrations/ticket/${certificateId}`);
        setData(response.data);
        setError(false);
      } catch (err) {
        console.error("Verification failed:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (certificateId) {
      verifyCertificate();
    }
  }, [certificateId]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-grow flex items-center justify-center p-4 pt-24">
        <Card className="w-full max-w-md shadow-2xl border-t-4 border-t-primary">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold">Certificate Verification</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-6">
            
            {/* 1. LOADING STATE */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-10 space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Verifying Certificate ID...</p>
              </div>
            )}

            {/* 2. ERROR / INVALID STATE */}
            {!loading && error && (
              <div className="text-center space-y-4 py-6">
                <div className="bg-red-100 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                  <XCircle className="w-10 h-10 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-600">Invalid Certificate</h3>
                  <p className="text-muted-foreground mt-2">
                    The certificate ID <span className="font-mono font-bold text-foreground">"{certificateId}"</span> could not be verified.
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    It may be fake or revoked.
                  </p>
                </div>
                <Link to="/">
                  <Button variant="outline" className="mt-4">Go to Homepage</Button>
                </Link>
              </div>
            )}

            {/* 3. SUCCESS / VERIFIED STATE */}
            {!loading && !error && data && (
              <div className="space-y-6 animate-fade-in">
                {/* Status Badge */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 text-green-700">
                  <CheckCircle className="w-6 h-6 shrink-0" />
                  <div>
                    <p className="font-bold text-lg">Verified Authentic</p>
                    <p className="text-xs opacity-90">Issued by CodeBuilders Community</p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">Presented To</p>
                    <h2 className="text-2xl font-bold text-primary mt-1">{data.userName}</h2>
                  </div>

                  <div className="bg-secondary/50 p-4 rounded-lg space-y-3">
                    <div className="flex items-start gap-3">
                      <Award className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold">Event</p>
                        <p className="text-sm text-muted-foreground">{data.eventId?.title}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold">Date</p>
                        <p className="text-sm text-muted-foreground">
                          {data.eventId?.dateTime ? format(new Date(data.eventId.dateTime), "MMMM d, yyyy") : "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold">Location</p>
                        <p className="text-sm text-muted-foreground truncate max-w-[200px]">{data.eventId?.venue}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center pt-2">
                    <p className="text-xs text-muted-foreground">Certificate ID: {data.tokenId}</p>
                  </div>
                </div>

                <Link to="/events">
                  <Button className="w-full">Explore More Events</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}