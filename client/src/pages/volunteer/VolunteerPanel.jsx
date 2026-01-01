import { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/integrations/api/client';
import { VolunteerLayout } from '@/components/volunteer/VolunteerLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, Camera, XCircle, Users, CheckCircle2, ScanLine, RefreshCcw, MapPin, Loader2, AlertCircle, XOctagon } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

export default function VolunteerPanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Scanner States
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  
  // Result States
  const [scannedUser, setScannedUser] = useState(null); // ✅ Green Screen Data
  const [scanError, setScanError] = useState(null);     // ❌ Red Screen Data
  
  const isProcessing = useRef(false);
  const scannerInstanceRef = useRef(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // 1. Get Volunteer Info
  const { data: volunteer } = useQuery({
    queryKey: ['volunteer-info'],
    queryFn: () => apiClient.getVolunteerMe(),
    retry: false 
  });

  // 2. Get Registrations
  const { data: registrations = [], isRefetching } = useQuery({
    queryKey: ['volunteer-registrations', volunteer?.assignedEventId],
    queryFn: async () => {
      const eventId = typeof volunteer?.assignedEventId === 'object' 
        ? volunteer.assignedEventId._id 
        : volunteer?.assignedEventId;
      
      if (!eventId) return [];
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

  // ✅ Stop Scanner Completely
  const closeScanner = async () => {
    if (scannerInstanceRef.current) {
      try {
        await scannerInstanceRef.current.stop();
        scannerInstanceRef.current = null;
      } catch (err) {
        console.warn("Stop error", err);
      }
    }
    setIsScanning(false);
    setIsCameraLoading(false);
    setScannedUser(null);
    setScanError(null);
    isProcessing.current = false;
  };

  // ✅ Start Next Scan (Reset Overlays)
  const handleScanNext = () => {
    setScannedUser(null);
    setScanError(null);
    // Add small delay to prevent immediate re-scan of same code
    setTimeout(() => {
        isProcessing.current = false;
    }, 1000);
  };

  const playSound = (type) => {
    const url = type === 'success' 
        ? 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' 
        : 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3';
    new Audio(url).play().catch(() => {});
  };

  const checkInMutation = useMutation({
    mutationFn: (tokenId) => apiClient.checkInRegistration(tokenId),
    onSuccess: (data) => {
      setScannedUser(data); 
      queryClient.invalidateQueries({ queryKey: ['volunteer-registrations'] });
      playSound('success');
    },
    onError: (error) => {
      setScanError({
        title: "Scanning Failed",
        message: error.response?.data?.message || error.message || "Invalid Token",
        details: "Please check the ticket status."
      });
      playSound('error');
    }
  });

  useEffect(() => {
    if (isScanning && !scannerInstanceRef.current) {
      setIsCameraLoading(true);
      const scanner = new Html5Qrcode("qr-reader");
      scannerInstanceRef.current = scanner;

      const isMobile = window.innerWidth < 768;
      const config = { 
        fps: 20, 
        qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            return { width: Math.floor(minEdge * 0.7), height: Math.floor(minEdge * 0.7) };
        },
        aspectRatio: isMobile ? window.innerHeight / window.innerWidth : 1.333333 
      };

      scanner.start(
        { facingMode: "environment" }, 
        config,
        (decodedText) => {
          // ✅ Block scanning if processing or showing result
          if (isProcessing.current || scannedUser || scanError) return;
          
          const token = decodedText.includes('/') ? decodedText.split('/').pop() : decodedText;
          
          if (token) {
            isProcessing.current = true; // Lock immediately

            // ✅ 1. LOCAL CHECK: Check if attendee exists locally first
            // This catches "Already Scanned" instantly without API call
            const existingReg = registrations.find(r => r.tokenId === token);

            if (existingReg) {
                if (existingReg.isAttended) {
                    // ❌ ALREADY CHECKED IN ERROR
                    setScanError({
                        title: "Already Scanned!",
                        message: `${existingReg.userName} is already marked present.`,
                        details: `Token: ${token}`
                    });
                    playSound('error');
                    return; // Stop here, don't call API
                }
                // If found but not attended, proceed to API for official sync
            }

            // ✅ 2. API CALL
            checkInMutation.mutate(token);
          }
        },
        () => {} 
      )
      .then(() => setIsCameraLoading(false))
      .catch(() => {
         setIsScanning(false);
         setIsCameraLoading(false);
      });

      return () => {};
    }
  }, [isScanning, registrations]); // Dependency added to check registrations

  const stats = {
    total: registrations.length,
    attended: registrations.filter((r) => r.isAttended).length,
  };

  return (
    <VolunteerLayout>
      <style dangerouslySetInnerHTML={{ __html: `
        .scanner-container { 
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; 
            z-index: 9999; background: black; 
            display: flex; flex-direction: column; align-items: center; justify-content: center;
        }
        .scanner-box { width: 100%; height: 100%; position: relative; }
        #qr-reader { width: 100% !important; height: 100% !important; border: none !important; }
        #qr-reader video { width: 100% !important; height: 100% !important; object-fit: cover !important; }

        @media (min-width: 768px) {
            .scanner-container { background: rgba(0, 0, 0, 0.9); backdrop-filter: blur(5px); }
            .scanner-box {
                width: 600px; height: 500px; border-radius: 20px; overflow: hidden;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                border: 1px solid rgba(255,255,255,0.1); background: black;
            }
            #qr-reader video { object-fit: contain !important; }
        }
      `}} />

      <div className="space-y-4 max-w-5xl mx-auto pb-24 px-2 pt-4">
        
        {/* Stats Header */}
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

        {/* ✅ SCANNER INTERFACE */}
        {isScanning && (
          <div className="scanner-container">
            <div className="scanner-box relative">
                
                {/* Header */}
                <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-[10002] bg-gradient-to-b from-black/80 to-transparent">
                    <p className="text-white font-bold tracking-widest text-xs uppercase pl-2">
                        {isCameraLoading ? "Initializing..." : "Scanning..."}
                    </p>
                    <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 hover:bg-white/20 text-white" onClick={closeScanner}>
                        <XCircle className="w-8 h-8" />
                    </Button>
                </div>

                {/* Loading */}
                {isCameraLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-[10000] text-white bg-black">
                        <Loader2 className="w-10 h-10 animate-spin text-primary mb-2" />
                        <p className="text-sm font-medium text-white/70">Starting Camera...</p>
                    </div>
                )}

                {/* ✅ 1. SUCCESS SCREEN (GREEN) */}
                {scannedUser && (
                    <div className="absolute inset-0 z-[10005] bg-background/95 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in zoom-in-95 duration-200">
                        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mb-4 shadow-lg animate-bounce">
                            <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">Verified!</h2>
                        <p className="text-muted-foreground text-sm mb-6">Check-in Successful</p>
                        
                        <div className="bg-card w-full max-w-sm rounded-xl border border-border p-4 shadow-sm text-center mb-6">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Attendee</p>
                            <p className="text-xl font-bold text-foreground truncate">{scannedUser.userName}</p>
                            <p className="text-xs text-muted-foreground mt-1">{scannedUser.userEmail}</p>
                        </div>

                        <Button size="lg" className="w-full max-w-xs h-12 text-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20" onClick={handleScanNext}>
                            <ScanLine className="w-5 h-5 mr-2" /> Start Next
                        </Button>
                    </div>
                )}

                {/* ✅ 2. ERROR SCREEN (RED - DUPLICATE SCAN) */}
                {scanError && (
                    <div className="absolute inset-0 z-[10005] bg-background/95 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in shake duration-300">
                        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4 shadow-lg">
                            <XOctagon className="w-12 h-12 text-red-600 dark:text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-red-600 dark:text-red-500 mb-1 text-center">{scanError.title}</h2>
                        <p className="text-foreground font-medium text-center px-4 mb-1">{scanError.message}</p>
                        <p className="text-muted-foreground text-xs text-center mb-6">{scanError.details}</p>

                        <Button size="lg" variant="destructive" className="w-full max-w-xs h-12 text-lg font-bold shadow-lg shadow-red-500/20" onClick={handleScanNext}>
                            <RefreshCcw className="w-5 h-5 mr-2" /> Scan Next
                        </Button>
                    </div>
                )}

                <div id="qr-reader" />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button onClick={() => setIsScanning(true)} size="lg" className="w-full h-14 shadow-lg text-lg font-bold rounded-2xl">
            <Camera className="w-6 h-6 mr-2" /> Start Scanning
          </Button>

          {/* Search Bar */}
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
                    key={f} variant="ghost" size="icon"
                    className={`w-10 h-9 rounded-lg transition-all ${statusFilter === f ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:bg-background/50"} ${statusFilter === f && f === 'attended' ? "text-emerald-600 dark:text-emerald-400" : ""}`}
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

        {/* List */}
        <Card className="border-border rounded-2xl overflow-hidden bg-card shadow-sm">
          <CardContent className="p-0">
              <div className="divide-y divide-border">
                {filteredRegistrations.map((reg) => (
                  <div key={reg._id} className={`p-4 flex items-center justify-between transition-colors ${reg.isAttended ? "bg-emerald-500/5 dark:bg-emerald-900/10" : "hover:bg-muted/30"}`}>
                    <div className="min-w-0 flex-1 mr-3">
                      <p className="font-bold text-sm text-foreground truncate">{reg.userName}</p>
                      <p className="text-[10px] font-mono text-muted-foreground mt-0.5 truncate tracking-tight">{reg.userEmail}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-[9px] h-4 font-mono px-1 border-muted-foreground/30 text-muted-foreground">#{reg.tokenId}</Badge>
                        {reg.isAttended && <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[9px] h-4 border-none uppercase font-bold hover:bg-emerald-200">Verified</Badge>}
                      </div>
                    </div>
                    
                    <Button
                      size="sm" variant={reg.isAttended ? "outline" : "default"}
                      className={`h-9 px-4 rounded-xl text-xs font-bold transition-all ${reg.isAttended ? "border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-500 bg-amber-50/50 dark:bg-amber-900/10 hover:bg-amber-100 dark:hover:bg-amber-900/20" : "shadow-md"}`}
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