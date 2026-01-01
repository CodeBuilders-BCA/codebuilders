import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/integrations/api/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Loader2, Mail, Calendar, RefreshCcw, Reply, CheckCircle2, MailOpen } from 'lucide-react';
import { format } from 'date-fns';
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

export default function AdminMessages() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch Messages
  const { data: messages, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: () => apiClient.getContactMessages(),
  });

  // ✅ Calculate Unread Count
  const unreadCount = messages?.filter(msg => !msg.isRead).length || 0;

  // ✅ Mark as Read Mutation
  const markReadMutation = useMutation({
    mutationFn: (id) => apiClient.markMessageAsRead(id), // Ensure this API exists
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
      // Toast optional rakh sakte hain taaki spam na lage
    },
    onError: (err) => {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => apiClient.deleteContactMessage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
      toast({ title: 'Message deleted successfully' });
    },
    onError: (err) => {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    },
  });

  const handleReply = (email, subject, originalMessage, senderName, id) => {
    // 1. Auto Mark as Read when replying
    markReadMutation.mutate(id);

    // 2. Prepare the body
    const replyBody = `\n\n\n--------------------------------------------------\nOn ${new Date().toLocaleDateString()}, ${senderName} wrote:\n\n${originalMessage}`;
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent("Re: " + subject)}&body=${encodeURIComponent(replyBody)}`;
    window.open(gmailUrl, '_blank');
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Inbox</h2>
            <p className="text-muted-foreground">Manage inquiries from the contact form</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCcw className={`w-4 h-4 mr-2 ${isRefetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <Card className="glass border-border">
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="w-5 h-5 text-primary" />
              Messages
              {/* ✅ Show Unread Count instead of Total */}
              {unreadCount > 0 ? (
                <Badge variant="destructive" className="ml-2 animate-pulse">{unreadCount} New</Badge>
              ) : (
                <Badge variant="secondary" className="ml-2">All Caught Up</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {messages?.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-secondary/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MailOpen className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium">No messages yet</p>
                <p className="text-muted-foreground text-sm">New inquiries will appear here.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[150px]">Date</TableHead>
                    <TableHead className="w-[200px]">Sender</TableHead>
                    <TableHead className="w-[200px]">Subject</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((msg) => {
                    const isUnread = !msg.isRead; // Check if unread

                    return (
                      <TableRow 
                        key={msg._id} 
                        className={`group transition-colors ${
                          isUnread ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-secondary/20 opacity-80"
                        }`}
                      >
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground align-top pt-4">
                          <div className={`flex items-center gap-2 ${isUnread ? "font-bold text-foreground" : ""}`}>
                            <Calendar className="w-3 h-3" />
                            {format(new Date(msg.createdAt), 'MMM d, yyyy')}
                          </div>
                          <div className="pl-5 pt-1 opacity-50">
                            {format(new Date(msg.createdAt), 'h:mm a')}
                          </div>
                        </TableCell>
                        
                        <TableCell className="align-top pt-4">
                          <div className={`font-medium text-foreground ${isUnread ? "font-bold" : ""}`}>
                            {msg.name}
                            {isUnread && <div className="inline-block w-2 h-2 bg-blue-500 rounded-full ml-2" />}
                          </div>
                          <a 
                            href={`mailto:${msg.email}`} 
                            className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5"
                          >
                            {msg.email}
                          </a>
                        </TableCell>
                        
                        <TableCell className="align-top pt-4">
                          <Badge variant="outline" className={`font-normal truncate max-w-[180px] block text-center ${isUnread ? "border-primary/50 bg-primary/5" : ""}`}>
                            {msg.subject}
                          </Badge>
                        </TableCell>
                        
                        <TableCell className="align-top pt-4">
                          <div className={`max-w-md text-sm leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all ${isUnread ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                            {msg.message}
                          </div>
                        </TableCell>
                        
                        <TableCell className="text-right align-top pt-3">
                          <div className="flex items-center justify-end gap-1">
                            
                            {/* ✅ Mark as Seen Button */}
                            {isUnread && (
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    title="Mark as Seen"
                                    onClick={() => markReadMutation.mutate(msg._id)}
                                    className="text-blue-500 hover:text-blue-600 hover:bg-blue-500/10"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                </Button>
                            )}

                            {/* Reply */}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              title="Reply via Gmail"
                              onClick={() => handleReply(msg.email, msg.subject, msg.message, msg.name, msg._id)}
                              className="hover:text-primary hover:bg-primary/10"
                            >
                              <Reply className="w-4 h-4" />
                            </Button>

                            {/* Delete */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Message?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this message? This cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => deleteMutation.mutate(msg._id)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
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