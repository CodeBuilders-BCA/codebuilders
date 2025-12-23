import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/integrations/api/client";
import { VolunteerLayout } from "@/components/volunteer/VolunteerLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Camera,
  XCircle,
  Users,
  CheckCircle2,
  ScanLine,
  AlertTriangle,
  RefreshCcw,
  MapPin
} from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function VolunteerPanel() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isScanning, setIsScanning] = useState(false);
  const [scannedUser, setScannedUser] = useState(null);

  const scannerRef = useRef(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  /* ------------------ DATA ------------------ */

  const { data: volunteer, isError } = useQuery({
    queryKey: ["volunteer-info"],
    queryFn: () => apiClient.getVolunteerMe(),
    retry: false
  });

  const { data: registrations = [], isRefetching } = useQuery({
    queryKey: ["volunteer-registrations", volunteer?.assignedEventId],
    queryFn: async () => {
      if (!volunteer?.assignedEventId) return [];
      const eventId =
        typeof volunteer.assignedEventId === "object"
          ? volunteer.assignedEventId._id
          : volunteer.assignedEventId;
      return apiClient.getAllRegistrations(eventId);
    },
    enabled: !!volunteer?.assignedEventId,
    refetchInterval: 3000
  });

  /* ------------------ FILTER ------------------ */

  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      const matchesSearch =
        !searchTerm ||
        reg.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.tokenId?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "attended" && reg.isAttended) ||
        (statusFilter === "pending" && !reg.isAttended);

      return matchesSearch && matchesStatus;
    });
  }, [registrations, searchTerm, statusFilter]);

  /* ------------------ MUTATIONS ------------------ */

  const checkInMutation = useMutation({
    mutationFn: (tokenId) => apiClient.checkInRegistration(tokenId),
    onSuccess: (data) => {
      setScannedUser(data);
      setIsScanning(false);

      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }

      queryClient.invalidateQueries({
        queryKey: ["volunteer-registrations"]
      });

      new Audio(
        "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
      ).play().catch(() => {});
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Check-in Failed",
        description: err.message || "Invalid QR Code"
      });
    }
  });

  const toggleAttendance = useMutation({
    mutationFn: ({ id, isAttended }) =>
      apiClient.toggleRegistrationAttendance(id, isAttended),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["volunteer-registrations"]
      });
      toast({ title: "Attendance updated" });
    }
  });

  /* ------------------ SCANNER (MOBILE SAFE) ------------------ */

  useEffect(() => {
    if (!isScanning || scannedUser) return;

    const timer = setTimeout(() => {
      if (!document.getElementById("qr-reader")) return;
      if (scannerRef.current) return;

      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
          videoConstraints: {
            facingMode: "environment" // ✅ mobile rear camera
          }
        },
        false
      );

      scannerRef.current = scanner;

      scanner.render(
        (decodedText) => {
          if (checkInMutation.isPending) return;

          const token = decodedText.includes("/")
            ? decodedText.split("/").pop()
            : decodedText;

          if (token) checkInMutation.mutate(token);
        },
        () => {}
      );
    }, 150);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [isScanning, scannedUser]);

  const handleScanNext = () => {
    setScannedUser(null);
    setIsScanning(true);
  };

  const stats = {
    total: registrations.length,
    attended: registrations.filter((r) => r.isAttended).length
  };

  /* ------------------ STATES ------------------ */

  if (isError) {
    return (
      <VolunteerLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full">
            <CardContent className="pt-8 text-center">
              <AlertTriangle className="mx-auto mb-4 text-destructive" />
              <h2 className="text-xl font-bold">Access Denied</h2>
              <p className="text-muted-foreground">
                Volunteer profile not found.
              </p>
            </CardContent>
          </Card>
        </div>
      </VolunteerLayout>
    );
  }

  if (scannedUser) {
    return (
      <VolunteerLayout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <Card className="max-w-md w-full border-emerald-500">
            <CardContent className="pt-10 text-center">
              <CheckCircle2 className="mx-auto w-16 h-16 text-emerald-600 mb-4" />
              <h2 className="text-3xl font-bold text-emerald-700">Verified</h2>
              <p className="mb-6 text-muted-foreground">
                Check-in Successful
              </p>

              <p className="text-xl font-bold truncate">
                {scannedUser.userName}
              </p>
              <Badge className="mt-3 bg-emerald-500">
                TOKEN: {scannedUser.tokenId}
              </Badge>

              <Button
                className="mt-8 w-full"
                size="lg"
                onClick={handleScanNext}
              >
                <ScanLine className="mr-2 w-4 h-4" /> Scan Next
              </Button>
            </CardContent>
          </Card>
        </div>
      </VolunteerLayout>
    );
  }

  /* ------------------ MAIN UI ------------------ */

  return (
    <VolunteerLayout>
      <div className="space-y-4 max-w-5xl mx-auto pb-20">

        <Button
          onClick={() => setIsScanning((s) => !s)}
          size="lg"
          variant={isScanning ? "destructive" : "default"}
          className="w-full"
        >
          {isScanning ? (
            <>
              <XCircle className="mr-2 w-5 h-5" /> Stop Camera
            </>
          ) : (
            <>
              <Camera className="mr-2 w-5 h-5" /> Scan Ticket
            </>
          )}
        </Button>

        {isScanning && (
          <Card className="border-2 border-primary overflow-hidden">
            <div className="text-xs text-center py-2 animate-pulse">
              Point camera at QR code
            </div>
            <CardContent className="p-0 bg-black">
              <div
                id="qr-reader"
                className="w-full"
                style={{ minHeight: "320px" }} // ✅ critical mobile fix
              />
            </CardContent>
          </Card>
        )}

        {/* Remaining list UI unchanged */}
      </div>
    </VolunteerLayout>
  );
}
