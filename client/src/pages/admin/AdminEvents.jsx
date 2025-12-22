import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/integrations/api/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2, FileCheck, Send, Settings2, Ticket, Image as ImageIcon, MapPin } from 'lucide-react';
import { format, isPast } from 'date-fns'; 
import { useNavigate } from 'react-router-dom';

const apiUrl = import.meta.env.VITE_API_URL;

export default function AdminEvents() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const fileInputRef = useRef(null);
  const certInputRef = useRef(null);
  const navigate = useNavigate();
  
  // State for Toggles
  const [regEnabled, setRegEnabled] = useState(true);
  const [certEnabled, setCertEnabled] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: events, isLoading } = useQuery({
    queryKey: ['admin-events'],
    queryFn: async () => {
      return await apiClient.getEvents();
    },
  });

  // --- MUTATIONS ---
  
  const createMutation = useMutation({
    mutationFn: async (formData) => await apiClient.createEvent(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      setIsDialogOpen(false);
      toast({ title: 'Event created successfully' });
    },
    onError: (error) => toast({ variant: 'destructive', title: 'Error', description: error.message }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, formData }) => {
      return await apiClient.updateEvent(id, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      setIsDialogOpen(false);
      setEditingEvent(null);
      toast({ title: 'Event updated successfully' });
    },
    onError: (error) => toast({ variant: 'destructive', title: 'Error', description: error.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (_id) => await apiClient.deleteEvent(_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      toast({ title: 'Event deleted successfully' });
    },
    onError: (error) => toast({ variant: 'destructive', title: 'Error', description: error.message }),
  });

  const sendCertificatesMutation = useMutation({
    mutationFn: async (eventId) => await apiClient.sendCertificates(eventId),
    onSuccess: () => toast({ title: 'Certificates sent successfully', description: 'Emails are being queued.' }),
    onError: (error) => toast({ variant: 'destructive', title: 'Failed to send', description: error.message })
  });

  // --- HELPER: Parse Date for 12h Form ---
  const getEventDateParts = (isoString) => {
    // Default: Tomorrow 9:00 AM
    if (!isoString) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return { 
            date: format(tomorrow, 'yyyy-MM-dd'), 
            hour: '9', 
            minute: '00', 
            ampm: 'AM' 
        };
    }
    
    const d = new Date(isoString);
    let h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    
    h = h % 12;
    h = h ? h : 12; // Convert 0 to 12

    return {
      date: format(d, 'yyyy-MM-dd'),
      hour: h.toString(),
      minute: m.toString().padStart(2, '0'), // Ensure "05" format
      ampm
    };
  };

  const defaultParts = getEventDateParts(editingEvent?.dateTime);

  // --- HANDLERS ---

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    // 1. Manually Reconstruct DateTime from 12h parts
    const datePart = formData.get('datePart');
    const hourPart = formData.get('timeHour');
    const minutePart = formData.get('timeMinute');
    const ampmPart = formData.get('timeAmPm');

    let hour24 = parseInt(hourPart, 10);
    if (ampmPart === 'PM' && hour24 !== 12) hour24 += 12;
    if (ampmPart === 'AM' && hour24 === 12) hour24 = 0;

    const finalIsoString = new Date(`${datePart}T${hour24.toString().padStart(2, '0')}:${minutePart}:00`).toISOString();
    
    // Replace the split fields with the single expected field
    formData.set('dateTime', finalIsoString);
    formData.delete('datePart');
    formData.delete('timeHour');
    formData.delete('timeMinute');
    formData.delete('timeAmPm');

    // 2. Append Toggles
    formData.set('isRegistrationEnabled', String(regEnabled)); 
    formData.set('isCertificateEnabled', String(certEnabled));

    // 3. Calc Status
    const status = new Date(finalIsoString) < new Date() ? 'past' : 'upcoming';
    formData.set('status', status);

    if (editingEvent) {
      updateMutation.mutate({ id: editingEvent._id, formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openEditDialog = (event) => {
    setEditingEvent(event);
    setRegEnabled(event.isRegistrationEnabled ?? true);
    setCertEnabled(event.isCertificateEnabled ?? false);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingEvent(null);
    setRegEnabled(true);
    setCertEnabled(false);
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    const baseUrl = apiUrl.replace('/api', '');
    return path.startsWith('http') ? path : `${baseUrl}${path}`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Events</h2>
            <p className="text-muted-foreground">Manage events and certificates</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingEvent(null);
                setRegEnabled(true);
                setCertEnabled(false);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingEvent ? 'Edit Event' : 'Create Event'}</DialogTitle>
                <DialogDescription>
                  Configure event details and certificate settings.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6 mt-4" encType="multipart/form-data">
                
                {/* --- Basic Details --- */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium border-b pb-2">Basic Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input id="title" name="title" defaultValue={editingEvent?.title} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="venue">Venue (Display Name)</Label>
                      <Input id="venue" name="venue" defaultValue={editingEvent?.venue} required placeholder="e.g. Grand Hall, NYC" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mapUrl" className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      Google Maps Link
                    </Label>
                    <Input 
                      id="mapUrl" 
                      name="mapUrl" 
                      defaultValue={editingEvent?.mapUrl} 
                      placeholder="Paste Google Maps Share Link here..." 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Short Description</Label>
                    <Textarea id="description" name="description" defaultValue={editingEvent?.description ?? ''} rows={2} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullDescription">Full Description</Label>
                    <Textarea id="fullDescription" name="fullDescription" defaultValue={editingEvent?.fullDescription ?? ''} rows={4} />
                  </div>

                  {/* 👇 UPDATED: 12-Hour Date & Time Picker */}
                  <div className="grid grid-cols-2 gap-4">
                    
                    {/* Date Picker */}
                    <div className="space-y-2">
                      <Label htmlFor="datePart">Date</Label>
                      <Input
                        id="datePart"
                        name="datePart"
                        type="date"
                        defaultValue={defaultParts.date}
                        required
                      />
                    </div>
                    
                    {/* Time Picker (Hour : Minute : AM/PM) */}
                    <div className="space-y-2">
                      <Label>Time</Label>
                      <div className="flex gap-2">
                        {/* Hour */}
                        <div className="flex-1">
                            <select 
                                name="timeHour" 
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                defaultValue={defaultParts.hour}
                            >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                                    <option key={h} value={h}>{h}</option>
                                ))}
                            </select>
                        </div>
                        
                        <span className="self-center font-bold">:</span>
                        
                        {/* Minute */}
                        <div className="flex-1">
                             <select 
                                name="timeMinute" 
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                defaultValue={defaultParts.minute}
                            >
                                {Array.from({ length: 60 }, (_, i) => i).map((m) => {
                                    const minStr = m.toString().padStart(2, '0');
                                    return <option key={minStr} value={minStr}>{minStr}</option>;
                                })}
                            </select>
                        </div>

                        {/* AM/PM */}
                        <div className="flex-1">
                            <select 
                                name="timeAmPm" 
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                defaultValue={defaultParts.ampm}
                            >
                                <option value="AM">AM</option>
                                <option value="PM">PM</option>
                            </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                      <Label htmlFor="maxAttendees">Max Attendees</Label>
                      <Input id="maxAttendees" name="maxAttendees" type="number" defaultValue={editingEvent?.maxAttendees ?? 500} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 items-start">
                    <div className="space-y-2">
                      <Label htmlFor="image">Event Image</Label>
                      <Input id="image" name="image" type="file" accept="image/*" ref={fileInputRef} />
                      {editingEvent?.imageUrl && (
                        <div className="mt-2 w-24 h-24 rounded overflow-hidden border">
                          <img src={getImageUrl(editingEvent.imageUrl)} alt="Current Event" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <Switch
                      id="isRegistrationEnabled"
                      checked={regEnabled}
                      onCheckedChange={setRegEnabled}
                    />
                    <Label htmlFor="isRegistrationEnabled">Enable Registration</Label>
                  </div>
                </div>

                {/* --- Certificate Settings --- */}
                <div className="space-y-4 bg-secondary/20 p-4 rounded-lg border border-border">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <h3 className="text-lg font-medium flex items-center gap-2">
                        <FileCheck className="w-5 h-5 text-primary" />
                        Certificate Settings
                      </h3>
                      <div className="flex items-center gap-2">
                        <Switch
                          id="isCertificateEnabled"
                          checked={certEnabled}
                          onCheckedChange={setCertEnabled}
                        />
                        <Label htmlFor="isCertificateEnabled">Enable</Label>
                      </div>
                    </div>

                    {certEnabled && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="space-y-2">
                          <Label htmlFor="certFile">Certificate Template (Image)</Label>
                          <Input id="certFile" name="certFile" type="file" accept="image/*" ref={certInputRef} />
                          <p className="text-xs text-muted-foreground">Upload a JPG/PNG without any name on it.</p>
                          
                          {editingEvent?.certificateTemplateUrl && (
                             <div className="mt-3 p-2 bg-white rounded border border-gray-200">
                               <div className="flex items-center gap-2 mb-2 text-green-600 text-xs font-semibold">
                                 <FileCheck className="w-3 h-3"/> Active Template Loaded
                               </div>
                               <img src={getImageUrl(editingEvent.certificateTemplateUrl)} alt="Template" className="w-full h-auto max-h-32 object-contain" />
                             </div>
                          )}
                        </div>
                        
                        {editingEvent ? (
                          <div className="bg-white p-4 rounded border border-gray-200 text-center space-y-3 shadow-sm">
                            <p className="text-sm text-gray-500">
                              Use the visual designer to position the name and adjust the font.
                            </p>
                            <Button 
                              type="button"
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={() => {
                                setIsDialogOpen(false);
                                navigate(`/admin/events/${editingEvent._id}/certificate`);
                              }}
                            >
                              <Settings2 className="w-4 h-4 mr-2" />
                              Open Certificate Designer
                            </Button>
                          </div>
                        ) : (
                          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded flex items-center gap-2">
                             <Loader2 className="w-4 h-4" />
                             Please save the event first to configure the certificate layout.
                          </div>
                        )}
                      </div>
                    )}
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editingEvent ? 'Update Event' : 'Create Event'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* --- Events Table --- */}
        <Card className="glass border-border">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registration</TableHead>
                    <TableHead>Certificates</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events?.map((event) => {
                    const isEventPast = isPast(new Date(event.dateTime));
                    
                    return (
                      <TableRow key={event._id}>
                        <TableCell className="font-medium flex items-center gap-2">
                          {event.imageUrl ? (
                            <img src={getImageUrl(event.imageUrl)} className="w-8 h-8 rounded object-cover" alt="" />
                          ) : (
                            <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center">
                              <ImageIcon className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                          {event.title}
                        </TableCell>
                        
                        {/* 12-Hour Format in Table */}
                        <TableCell>
                            {event.dateTime 
                                ? format(new Date(event.dateTime), 'MMM d, yyyy h:mm a') 
                                : 'TBA'}
                        </TableCell>
                        
                        <TableCell>
                          <Badge variant={isEventPast ? 'secondary' : 'default'} className={isEventPast ? 'text-muted-foreground' : ''}>
                            {isEventPast ? 'Ended' : 'Upcoming'}
                          </Badge>
                        </TableCell>

                        <TableCell>
                            {event.isRegistrationEnabled ? (
                              <Badge variant="outline" className="border-blue-500 text-blue-500 gap-1">
                                <Ticket className="w-3 h-3" /> Open
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground gap-1">
                                Closed
                              </Badge>
                            )}
                        </TableCell>

                        <TableCell>
                            {event.isCertificateEnabled ? (
                              <Badge variant="outline" className="border-green-500 text-green-500 gap-1">
                                <FileCheck className="w-3 h-3" /> Enabled
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground">Disabled</Badge>
                            )}
                        </TableCell>
                        
                        <TableCell className="text-right flex items-center justify-end gap-2">
                          {event.isCertificateEnabled && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 border-primary/50 text-primary hover:bg-primary/10">
                                    <Send className="w-3 h-3 mr-2" /> Send Certs
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Send Certificates?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Email certificates to all attendees of <b>{event.title}</b>?
                                      <br/><br/>
                                      <span className="text-xs text-amber-600 bg-amber-50 p-1 rounded">
                                        ⚠️ Ensure you have registrations for this event ID.
                                      </span>
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => sendCertificatesMutation.mutate(event._id)}>
                                      Send Emails
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}

                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(event)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Event?</AlertDialogTitle>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteMutation.mutate(event._id)}
                                  className="bg-destructive"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}