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
  DialogTrigger 
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
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2, Github, Linkedin, Phone } from 'lucide-react'; 

export default function AdminTeamMembers() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState(null);
  const fileInputRef = useRef(null); 
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ['admin-team-members'],
    queryFn: async () => {
      return await apiClient.getTeamMembers();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (formData) => { 
      return await apiClient.createTeamMember(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-team-members'] });
      setIsDialogOpen(false);
      toast({ title: 'Team member added successfully' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, formData }) => { 
      return await apiClient.updateTeamMember(id, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-team-members'] });
      setIsDialogOpen(false);
      setEditingTeamMember(null);
      toast({ title: 'Team member updated successfully' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await apiClient.deleteTeamMember(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-team-members'] });
      toast({ title: 'Team member deleted' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form); 

    // Note: formData automatically handles the file input named 'image' which matches backend

    if (editingTeamMember) {
      updateMutation.mutate({ id: editingTeamMember._id, formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openEditDialog = (teamMember) => {
    setEditingTeamMember(teamMember);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingSpeaker(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Team Members</h2>
            <p className="text-muted-foreground">Manage team members and their roles</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingTeamMember(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Team Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingTeamMember ? 'Edit Team Member' : 'Add Team Member'}</DialogTitle>
                <DialogDescription>
                  {editingTeamMember 
                    ? "Update the team member's profile details." 
                    : "Add a new team member to the list."}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" defaultValue={editingTeamMember?.name} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role (e.g. Senior Engineer)</Label>
                    <Input id="role" name="role" defaultValue={editingTeamMember?.role} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialty">Specialty</Label>
                  <Input id="specialty" name="specialty" defaultValue={editingTeamMember?.specialty} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" name="bio" defaultValue={editingTeamMember?.bio} rows={3} />
                </div>

                {/* File Upload Input */}
                <div className="space-y-2">
                  <Label htmlFor="image">Profile Image</Label>
                  <div className="flex gap-2 items-center">
                    <Input 
                      id="image" 
                      name="image" 
                      type="file" 
                      accept="image/*" 
                      ref={fileInputRef}
                      className="cursor-pointer"
                    />
                  </div>
                  
                  {/* ✅ Updated: Use direct Cloudinary URL */}
                  {editingTeamMember?.imageUrl && (
                     <p className="text-xs text-muted-foreground">
                        Current: <a href={editingTeamMember.imageUrl} target="_blank" rel="noopener noreferrer" className="underline">View Image</a>
                     </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                    <Input id="linkedinUrl" name="linkedinUrl" defaultValue={editingTeamMember?.linkedinUrl} placeholder="https://linkedin.com/in/..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="githubUrl">GitHub URL</Label>
                    <Input id="githubUrl" name="githubUrl" defaultValue={editingTeamMember?.githubUrl} placeholder="https://github.com/..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                    <Input id="whatsappNumber" name="whatsappNumber" defaultValue={editingTeamMember?.whatsappNumber} placeholder="+91 1234567890" />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editingTeamMember ? 'Update' : 'Add Team Member'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

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
                    <TableHead>Profile</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Specialty</TableHead>
                    <TableHead>Socials</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers ?.map((teamMember) => (
                    <TableRow key={teamMember._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            {/* ✅ Updated: Use direct Cloudinary URL */}
                            <AvatarImage src={teamMember.imageUrl} />
                            <AvatarFallback>{teamMember.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {teamMember.name}
                        </div>
                      </TableCell>
                      <TableCell>{teamMember.role}</TableCell>
                      <TableCell>{teamMember.specialty}</TableCell>
                      
                      <TableCell>
                        <div className="flex gap-2">
                          {teamMember.linkedinUrl && <Linkedin className="w-4 h-4 text-blue-500" />}
                          {teamMember.githubUrl && <Github className="w-4 h-4 text-gray-500" />}
                          {teamMember.whatsappNumber && <Phone className="w-4 h-4 text-green-500" />}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(teamMember)}>
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
                              <AlertDialogTitle>Delete Team Member?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove <strong>{teamMember.name}</strong>? This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteMutation.mutate(teamMember._id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}