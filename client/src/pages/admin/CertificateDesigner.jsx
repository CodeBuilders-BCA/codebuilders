import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Draggable from "react-draggable"; 
import { apiClient } from "@/integrations/api/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, ArrowLeft, Send, Type, Settings2, RefreshCcw } from "lucide-react"; 
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const apiUrl = import.meta.env.VITE_API_URL;
// 🔒 LOCKED WIDTH: This matches the Backend logic for scaling.
const DESIGNER_WIDTH = 800;

const FONT_OPTIONS = [
  { label: "Sans Serif (Helvetica)", value: "Helvetica" },
  { label: "Serif (Times New Roman)", value: "Times-Roman" },
  { label: "Monospace (Courier)", value: "Courier" },
  { label: "Handwritten (Great Vibes)", value: "Great Vibes" },
];

export default function CertificateDesigner() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const nodeRef = useRef(null); // Ref for Draggable item

  // State
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [fontSize, setFontSize] = useState(40);
  const [fontFamily, setFontFamily] = useState(FONT_OPTIONS[3].value); // Default to Great Vibes
  const [previewName, setPreviewName] = useState("John Doe");

  const { data: event, isLoading, isError } = useQuery({
    queryKey: ["event", id],
    queryFn: () => apiClient.getEventById(id),
    retry: 1, 
  });

  // Load Saved Configuration
  useEffect(() => {
    if (event) {
      // Logic: If coordinates are invalid (negative or zero), reset to center (400, 300)
      const initialX = Number(event.certNameX) > 0 ? Number(event.certNameX) : 400;
      const initialY = Number(event.certNameY) > 0 ? Number(event.certNameY) : 300;

      setPosition({ x: initialX, y: initialY });
      setFontSize(Number(event.certFontSize) || 40);
      setFontFamily(event.certFontFamily || FONT_OPTIONS[3].value);
    }
  }, [event]);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const formData = new FormData();
      formData.append("certNameX", Math.round(data.x));
      formData.append("certNameY", Math.round(data.y));
      formData.append("certFontSize", data.fontSize);
      formData.append("certFontFamily", data.fontFamily);
      return await apiClient.updateEvent(id, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["event", id]);
      toast({ title: "Saved", description: "Layout updated successfully." });
    },
    onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message }),
  });

  const sendCertificatesMutation = useMutation({
    mutationFn: async () => await apiClient.sendCertificates(id),
    onSuccess: () => toast({ title: "Sent", description: "Emails queued." }),
    onError: (err) => toast({ variant: "destructive", title: "Error", description: err.message }),
  });

  // Handle Drag Stop
  const handleDragStop = (e, data) => {
    // Ensure we only save positive coordinates
    const newX = Math.max(0, data.x);
    const newY = Math.max(0, data.y);
    setPosition({ x: newX, y: newY });
  };

  const handleResetPosition = () => {
    setPosition({ x: 400, y: 300 }); // Reset to approximate center
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;
  if (isError || !event) return <div className="p-10 text-center text-red-500">Error loading event data.</div>;

  const baseUrl = apiUrl.replace('/api', '');
  const bgImage = event.certificateTemplateUrl ? `${baseUrl}${event.certificateTemplateUrl}` : null;

  return (
    <AdminLayout>
      {/* Inject Font for Preview */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');`}</style>

      <div className="flex flex-col h-[calc(100vh-100px)]">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b pb-4 mb-4 bg-white p-4 -mx-4 -mt-4 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin/events")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <div>
              <h1 className="text-xl font-bold">Certificate Designer</h1>
              <p className="text-sm text-muted-foreground">Customize: <span className="font-semibold text-primary">{event.title}</span></p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => updateMutation.mutate({ ...position, fontSize, fontFamily })} 
              disabled={updateMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" /> Save Layout
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive"><Send className="w-4 h-4 mr-2" /> Send to Attendees</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Bulk Send</AlertDialogTitle>
                  <AlertDialogDescription>This will generate PDFs for all registered attendees and email them.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => sendCertificatesMutation.mutate()}>Yes, Send</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Main Workspace */}
        <div className="flex flex-1 gap-6 overflow-hidden">
          
          {/* Left: Canvas Area */}
          <div className="flex-1 bg-gray-100 rounded-xl border border-gray-200 overflow-auto flex items-start justify-center p-10 relative">
            {!bgImage ? (
              <div className="text-gray-400 mt-20 flex flex-col items-center">
                <p>No certificate template uploaded.</p>
                <Button variant="link" onClick={() => navigate(`/admin/events/${id}/edit`)}>Upload Template</Button>
              </div>
            ) : (
              // 🖼️ IMAGE CONTAINER (Fixed Width 800px)
              <div 
                className="relative shadow-2xl border border-gray-300 bg-white select-none"
                style={{ width: `${DESIGNER_WIDTH}px`, height: "auto" }} // Locked width
              >
                {/* Background Image */}
                <img 
                  src={bgImage} 
                  alt="Certificate Template" 
                  className="w-full h-auto block pointer-events-none" 
                  onDragStart={(e) => e.preventDefault()} 
                />

                {/* ✨ DRAGGABLE NAME PLACEHOLDER */}
                <Draggable
                  nodeRef={nodeRef}
                  bounds="parent"  // Keeps drag inside the image
                  position={position} // Controlled position state
                  onStop={handleDragStop}
                >
                  <div 
                    ref={nodeRef}
                    className="absolute cursor-move border-2 border-dashed border-blue-500 hover:bg-blue-500/10 px-4 py-1 rounded transition-colors group"
                    style={{ 
                      // Force absolute positioning relative to top-left
                      top: 0, 
                      left: 0,
                      fontSize: `${fontSize}px`,
                      fontFamily: fontFamily.includes("Great Vibes") ? "'Great Vibes', cursive" : 
                                  fontFamily.includes("Times") ? "'Times New Roman', serif" :
                                  fontFamily.includes("Courier") ? "'Courier New', monospace" : 
                                  "Helvetica, sans-serif",
                      color: "#000",
                      whiteSpace: "nowrap",
                      zIndex: 50, // Ensure it's on top
                    }}
                  >
                    {previewName}
                    {/* Tooltip hint */}
                    <div className="absolute -top-6 left-0 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Drag to position
                    </div>
                  </div>
                </Draggable>
              </div>
            )}
          </div>

          {/* Right: Controls Panel */}
          <div className="w-80 bg-white p-5 rounded-xl border border-gray-200 h-fit space-y-6 shadow-sm overflow-y-auto">
            
            {/* 1. Content Section */}
            <div>
              <h3 className="font-semibold mb-3 border-b pb-2 text-sm uppercase text-gray-500 flex items-center gap-2">
                <Type className="w-4 h-4" /> Content
              </h3>
              <div className="space-y-3">
                <Label>Preview Name</Label>
                <Input value={previewName} onChange={(e) => setPreviewName(e.target.value)} placeholder="e.g. John Doe" />
                <p className="text-xs text-muted-foreground">Type a name to test layout sizing.</p>
              </div>
            </div>

            {/* 2. Style Section */}
            <div>
              <h3 className="font-semibold mb-3 border-b pb-2 text-sm uppercase text-gray-500 flex items-center gap-2">
                <Settings2 className="w-4 h-4" /> Style
              </h3>
              <div className="space-y-4">
                <div>
                  <Label>Font Family</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                  >
                    {FONT_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Font Size (px)</Label>
                  <Input type="number" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} />
                </div>
              </div>
            </div>

            {/* 3. Position Section */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
               <div className="flex justify-between items-center mb-3">
                 <h4 className="text-xs font-bold uppercase text-slate-500">Coordinates</h4>
                 <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleResetPosition} title="Reset to Center">
                   <RefreshCcw className="w-3 h-3" />
                 </Button>
               </div>
               <div className="grid grid-cols-2 gap-4 text-center">
                 <div>
                   <Label className="text-xs text-slate-400 mb-1 block">X Position</Label>
                   <div className="text-lg font-mono font-bold text-slate-700 bg-white border rounded py-1">{Math.round(position.x)}</div>
                 </div>
                 <div>
                   <Label className="text-xs text-slate-400 mb-1 block">Y Position</Label>
                   <div className="text-lg font-mono font-bold text-slate-700 bg-white border rounded py-1">{Math.round(position.y)}</div>
                 </div>
               </div>
            </div>

            <div className="text-xs text-blue-600 bg-blue-50 p-3 rounded leading-relaxed border border-blue-100">
              <strong>Info:</strong> Coordinates are relative to the certificate image (Top-Left is 0,0). Drag the name to update automatically.
            </div>

          </div>
        </div>
      </div>
    </AdminLayout>
  );
}