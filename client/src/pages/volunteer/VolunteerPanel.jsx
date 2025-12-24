import { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/integrations/api/client';
import { VolunteerLayout } from '@/components/volunteer/VolunteerLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, Camera, XCircle, Users, CheckCircle2, ScanLine, RefreshCcw, MapPin } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

export default function VolunteerPanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedUser, setScannedUser] = useState(null);
  const isProcessing = useRef(false);
  
  const scannerInstanceRef = useRef(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // 1. Fetch Volunteer Profile to get assigned Event ID
  const { data: volunteer } = useQuery({
    queryKey: ['volunteer-info'],
    queryFn: () => apiClient.getVolunteerMe(),
    retry: false 
  });

  // 2. ✅ Fetch Registrations for the SPECIFIC Event (Using the new safe API)
  const { data: registrations = [], isRefetching } = useQuery({
    queryKey: ['volunteer-registrations', volunteer?.assignedEventId],
    queryFn: async () => {
      // Handle both object (populated) and string ID cases
      const eventId = typeof volunteer?.assignedEventId === 'object' 
        ? volunteer.assignedEventId._id 
        : volunteer?.assignedEventId;
      
      if (!eventId) return [];

      // ✅ FIX: Use getEventRegistrations (Volunteer Accessible) instead of getAllRegistrations
      return await apiClient.getEventRegistrations(eventId);
    },
    enabled: !!volunteer?.assignedEventId,
    refetchInterval: 5000, 
  });

  const filteredRegistrations = useMemo(() => {
    return registrations.filter(reg => {
      const term = searchTerm.toLowerCase();
      return !searchTerm || 
        reg.userName.toLowerCase().includes(term) ||
        reg.userEmail.toLowerCase().includes(term) ||
        (reg.tokenId && reg.tokenId.toLowerCase().includes(term));
    }).filter(reg => {
      if (statusFilter === 'attended') return reg.isAttended;
      if (statusFilter === 'pending') return !reg.isAttended;
      return true;
    });
  }, [registrations, searchTerm, statusFilter]);

  const stopScanner = async () => {
    if (scannerInstanceRef.current) {
      try {
        await scannerInstanceRef.current.stop();
        scannerInstanceRef.current = null;
      } catch (err) {
        console.warn("Stop error", err);
      }
    }
    setIsScanning(false);
  };

  const checkInMutation = useMutation({
    mutationFn: (tokenId) => apiClient.checkInRegistration(tokenId),
    onSuccess: (data) => {
      setScannedUser(data); 
      stopScanner();
      queryClient.invalidateQueries({ queryKey: ['volunteer-registrations'] });
      
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(() => {});
      
      toast({ title: "Check-in Successful" });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message || "Invalid QR Code" });
    },
    onSettled: () => {
      setTimeout(() => { isProcessing.current = false; }, 1000);
    }
  });

  useEffect(() => {
    if (isScanning && !scannedUser) {
      const scanner = new Html5Qrcode("qr-reader");
      scannerInstanceRef.current = scanner;

      const config = { 
        fps: 20, 
        qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            return { width: Math.floor(minEdge * 0.7), height: Math.floor(minEdge * 0.7) };
        },
        aspectRatio: window.innerHeight / window.innerWidth
      };

      scanner.start(
        { facingMode: "environment" }, 
        config,
        (decodedText) => {
          if (isProcessing.current || scannedUser) return;
          
          const token = decodedText.includes('/') ? decodedText.split('/').pop() : decodedText;
          if (token) {
            isProcessing.current = true;
            checkInMutation.mutate(token);
          }
        },
        () => {} 
      ).catch(() => setIsScanning(false));

      return () => {
        if (scannerInstanceRef.current) scanner.stop().catch(() => {});
      };
    }
  }, [isScanning, scannedUser]);

  const stats = {
    total: registrations.length,
    attended: registrations.filter((r) => r.isAttended).length,
  };

  // 👈 VERIFICATION PAGE (The Green Success Screen)
  if (scannedUser) {
    return (
      <VolunteerLayout>
        <div className="flex items-center justify-center min-h-[80vh] px-4 animate-in fade-in zoom-in duration-300">
          <Card className="border-emerald-500/50 shadow-2xl max-w-md w-full relative overflow-hidden bg-background">
            <div className="absolute inset-0 bg-emerald-500/5 dark:bg-emerald-500/10" />
            <CardContent className="pt-12 pb-12 text-center relative z-10">
              <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <CheckCircle2 className="w-16 h-16 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">Verified!</h2>
              <p className="text-muted-foreground mb-8 text-sm">Check-in Successful for the event</p>
              
              <div className="bg-background/80 dark:bg-card/50 rounded-2xl p-6 mb-8 border border-emerald-100 dark:border-emerald-900/50 shadow-sm backdrop-blur-sm">
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-[0.2em] mb-2">Attendee Name</p>
                <p className="text-2xl font-bold text-foreground truncate">{scannedUser.userName}</p>
                <div className="flex justify-center mt-4">
                    <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none font-mono text-white">TOKEN: {scannedUser.tokenId}</Badge>
                </div>
              </div>

              <Button size="lg" className="w-full h-14 text-lg font-bold shadow-lg rounded-xl" onClick={() => setScannedUser(null)}>
                <ScanLine className="w-5 h-5 mr-2" /> Scan Next
              </Button>
            </CardContent>
          </Card>
        </div>
      </VolunteerLayout>
    );
  }

  return (
    <VolunteerLayout>
      <style dangerouslySetInnerHTML={{ __html: `
        .fullscreen-scanner { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 9999; background: black; }
        #qr-reader { width: 100% !important; height: 100% !important; border: none !important; }
        #qr-reader video { width: 100% !important; height: 100% !important; object-fit: cover !important; }
        #qr-reader__status_span, #qr-reader__header_message { color: white !important; }
        @keyframes scan { 0%, 100% { top: 0%; } 50% { top: 100%; } }
        .animate-scan-line { animation: scan 2s linear infinite; }
      `}} />

      <div className="space-y-4 max-w-5xl mx-auto pb-24 px-2 pt-4">
        
        {/* Statistics Header */}
        <div className="border border-border rounded-2xl p-5 shadow-sm bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-xl font-bold text-foreground">Volunteer Console</h1>
                    <p className="text-xs text-muted-foreground font-medium italic">Duty: {volunteer?.name}</p>
                </div>
                <Badge className={isRefetching ? "animate-pulse bg-amber-500 text-white" : "bg-emerald-500 text-white"}>
                  {isRefetching ? "Syncing..." : "Live"}
                </Badge>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-primary bg-primary/10 p-2 rounded-lg border border-primary/20">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <h2 className="font-semibold text-xs truncate">
                        {typeof volunteer?.assignedEventId === 'object' ? volunteer.assignedEventId.title : 'No Event Assigned'}
                    </h2>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-emerald-500/10 dark:bg-emerald-900/20 border border-emerald-500/20 dark:border-emerald-500/30 rounded-xl p-3 text-center">
                        <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 leading-none">{stats.attended}</p>
                        <p className="text-[10px] font-bold text-emerald-700/70 dark:text-emerald-400/70 uppercase mt-1">Attended</p>
                    </div>
                    <div className="bg-muted/50 border border-border rounded-xl p-3 text-center">
                        <p className="text-2xl font-black text-foreground leading-none">{stats.total - stats.attended}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Pending</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Fullscreen Scanner */}
        {isScanning && (
          <div className="fullscreen-scanner flex flex-col items-center justify-center">
            <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-[10002] bg-gradient-to-b from-black/80 to-transparent">
              <p className="text-white font-bold tracking-widest text-xs uppercase">QR Scanner Mode</p>
              <Button variant="destructive" size="icon" className="rounded-full w-12 h-12" onClick={stopScanner}><XCircle className="w-8 h-8" /></Button>
            </div>

            <div className="relative w-[280px] h-[280px] border-2 border-white/20 rounded-[40px] z-[10001] pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_15px_#10b981] animate-scan-line"></div>
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
            </div>

            <div id="qr-reader" />
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button onClick={() => setIsScanning(true)} size="lg" className="w-full h-14 shadow-lg text-lg font-bold rounded-2xl">
            <Camera className="w-6 h-6 mr-2" /> Start Scanning
          </Button>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search attendee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-11 rounded-xl bg-background border-border shadow-sm placeholder:text-muted-foreground/50"
              />
            </div>
            
            <div className="flex bg-muted rounded-xl p-1 gap-1">
                {['all', 'attended', 'pending'].map((f) => (
                  <Button 
                    key={f}
                    variant="ghost"
                    size="icon"
                    className={`w-10 h-9 rounded-lg transition-all ${
                        statusFilter === f 
                            ? "bg-background text-foreground shadow-sm" 
                            : "text-muted-foreground hover:bg-background/50"
                    } ${
                        statusFilter === f && f === 'attended' ? "text-emerald-600 dark:text-emerald-400" : ""
                    }`}
                    onClick={() => setStatusFilter(f)}
                  >
                    {f === 'all' && <Users className="w-5 h-5" />}
                    {f === 'attended' && <CheckCircle2 className="w-5 h-5" />}
                    {f === 'pending' && <RefreshCcw className="w-5 h-5" />}
                  </Button>
                ))}
            </div>
          </div>
        </div>

        {/* Attendee List */}
        <Card className="border-border rounded-2xl overflow-hidden bg-card shadow-sm">
          <CardContent className="p-0">
              <div className="divide-y divide-border">
                {filteredRegistrations.map((reg) => (
                  <div key={reg._id} className={`p-4 flex items-center justify-between transition-colors ${
                      reg.isAttended 
                        ? "bg-emerald-500/5 dark:bg-emerald-900/10" 
                        : "hover:bg-muted/30"
                  }`}>
                    <div className="min-w-0 flex-1 mr-3">
                      <p className="font-bold text-sm text-foreground truncate">{reg.userName}</p>
                      <p className="text-[10px] font-mono text-muted-foreground mt-0.5 truncate tracking-tight">{reg.userEmail}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-[9px] h-4 font-mono px-1 border-muted-foreground/30 text-muted-foreground">#{reg.tokenId}</Badge>
                        {reg.isAttended && <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[9px] h-4 border-none uppercase font-bold hover:bg-emerald-200">Verified</Badge>}
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      variant={reg.isAttended ? "outline" : "default"}
                      className={`h-9 px-4 rounded-xl text-xs font-bold transition-all ${
                          reg.isAttended 
                            ? "border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-500 bg-amber-50/50 dark:bg-amber-900/10 hover:bg-amber-100 dark:hover:bg-amber-900/20" 
                            : "shadow-md"
                      }`}
                      onClick={() => {
                        apiClient.toggleRegistrationAttendance(reg._id, !reg.isAttended).then(() => {
                           queryClient.invalidateQueries({ queryKey: ['volunteer-registrations'] });
                           toast({ title: reg.isAttended ? "Check-in Undone" : "Manual Check-in Success" });
                        });
                      }}
                    >
                      {reg.isAttended ? "Undo" : "Verify"}
                    </Button>
                  </div>
                ))}
                {filteredRegistrations.length === 0 && (
                  <div className="p-12 text-center flex flex-col items-center gap-2">
                    <Search className="w-10 h-10 text-muted-foreground opacity-20" />
                    <p className="text-muted-foreground text-sm font-medium">No attendees found</p>
                  </div>
                )}
              </div>
          </CardContent>
        </Card>
      </div>
    </VolunteerLayout>
  );
}