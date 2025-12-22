import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/integrations/api/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud, X, Image as ImageIcon, Trash2 } from 'lucide-react';

export default function AdminMemories() {
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // 1. Fetch All Events (for the dropdown)
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['admin-events-list'],
    queryFn: () => apiClient.getEvents(),
  });

  // 2. Fetch Existing Memories (when an event is selected)
  const { data: existingMemories, isLoading: memoriesLoading } = useQuery({
    queryKey: ['event-memories', selectedEventId],
    queryFn: () => apiClient.getEventMemories(selectedEventId),
    enabled: !!selectedEventId, // Only run if event is selected
  });

  // 3. Upload Mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData) => {
      return await apiClient.uploadEventMemories(selectedEventId, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['event-memories', selectedEventId]);
      toast({ title: "Images uploaded successfully!" });
      setSelectedFiles([]);
      setPreviews([]);
    },
    onError: (err) => {
      toast({ variant: "destructive", title: "Upload failed", description: err.message });
    }
  });

  // 4. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (imageId) => apiClient.deleteEventMemory(selectedEventId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries(['event-memories', selectedEventId]);
      toast({ title: "Image deleted" });
    }
  });

  // --- Handlers ---

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      addFiles(files);
    }
  };

  const addFiles = (files) => {
    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    
    setSelectedFiles(prev => [...prev, ...files]);
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (!selectedEventId) return toast({ variant: "destructive", title: "Select an event first" });
    if (selectedFiles.length === 0) return toast({ variant: "destructive", title: "No files selected" });

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('images', file); // 'images' must match your backend middleware key
    });

    uploadMutation.mutate(formData);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Event Memories</h2>
          <p className="text-gray-500">Upload photos for past events to display in the gallery.</p>
        </div>

        {/* Step 1: Select Event */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">1. Select Event</CardTitle>
          </CardHeader>
          <CardContent>
            {eventsLoading ? (
              <Loader2 className="animate-spin w-5 h-5 text-gray-400" />
            ) : (
              <select
                className="w-full md:w-1/2 p-2.5 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
              >
                <option value="">-- Choose an Event --</option>
                {events?.map((event) => (
                  <option key={event._id} value={event._id}>
                    {event.title} ({new Date(event.dateTime).toLocaleDateString()})
                  </option>
                ))}
              </select>
            )}
          </CardContent>
        </Card>

        {selectedEventId && (
          <>
            {/* Step 2: Upload Area */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">2. Upload Images</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Drag Drop Zone */}
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-2 pointer-events-none">
                    <div className="p-4 bg-primary/10 rounded-full">
                      <UploadCloud className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      SVG, PNG, JPG or GIF (max. 5MB per file)
                    </p>
                  </div>
                </div>

                {/* Previews */}
                {previews.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Selected ({previews.length})</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {previews.map((src, index) => (
                        <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                          <img src={src} alt="preview" className="w-full h-full object-cover" />
                          <button
                            onClick={() => removeFile(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button 
                        onClick={handleUpload} 
                        disabled={uploadMutation.isPending}
                        className="w-full sm:w-auto"
                      >
                        {uploadMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Upload {previews.length} Images
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 3: Existing Gallery */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Current Gallery</span>
                  <span className="text-sm font-normal text-gray-500">
                    {existingMemories?.length || 0} images
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {memoriesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : existingMemories && existingMemories.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {existingMemories.map((img) => (
                      <div key={img._id} className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                        {/* Assuming backend returns { url: '...', _id: '...' } */}
                        <img 
                          src={img.url} 
                          alt="Memory" 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteMutation.mutate(img._id)}
                            className="h-8 w-8 p-0 rounded-full"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                    <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No memories uploaded for this event yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}