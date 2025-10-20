import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Search, Trash2, Eye, MailCheck, Phone, User, Calendar } from "lucide-react";
import { useContactMessages, type ContactMessage } from "@/hooks/useContactMessages";

export default function ContactMessages() {
  const { contactMessages, loading, markAsRead, markAsReplied, deleteMessage } = useContactMessages();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const filteredMessages = contactMessages.filter(message => {
    const matchesSearch =
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "unread" && !message.is_read) ||
      (activeTab === "read" && message.is_read) ||
      (activeTab === "replied" && message.replied_at);

    return matchesSearch && matchesTab;
  });

  const handleViewMessage = async (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsDialogOpen(true);
    if (!message.is_read) {
      await markAsRead(message.id);
    }
  };

  const handleMarkAsReplied = async (id: string) => {
    await markAsReplied(id);
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this message?')) {
      await deleteMessage(id);
    }
  };

  const getMessageBadgeVariant = (message: ContactMessage) => {
    if (message.replied_at) return "default";
    if (message.is_read) return "secondary";
    return "destructive";
  };

  const getMessageBadgeText = (message: ContactMessage) => {
    if (message.replied_at) return "Replied";
    if (message.is_read) return "Read";
    return "New";
  };

  const unreadCount = contactMessages.filter(m => !m.is_read).length;
  const repliedCount = contactMessages.filter(m => m.replied_at).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contact Messages</h1>
          <p className="text-muted-foreground">Manage customer inquiries and contact form submissions</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>{unreadCount} unread</span>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Message Inbox</CardTitle>
          <CardDescription>
            View and respond to customer messages from your contact form
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="all">All Messages</TabsTrigger>
                <TabsTrigger value="unread" className="relative">
                  Unread
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="read">Read</TabsTrigger>
                <TabsTrigger value="replied">Replied ({repliedCount})</TabsTrigger>
              </TabsList>

              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </div>

            <TabsContent value={activeTab} className="mt-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contact</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMessages.map((message) => (
                      <TableRow key={message.id} className={!message.is_read ? "bg-muted/30" : ""}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{message.name}</p>
                            <p className="text-sm text-muted-foreground">{message.email}</p>
                            {message.phone && (
                              <p className="text-sm text-muted-foreground">{message.phone}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="font-medium truncate">{message.subject}</p>
                            <p className="text-sm text-muted-foreground truncate">{message.message}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getMessageBadgeVariant(message)}>
                            {getMessageBadgeText(message)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(message.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewMessage(message)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(message.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
            <DialogDescription>
              Contact form submission from {selectedMessage?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Name</span>
                  </div>
                  <p>{selectedMessage.name}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Email</span>
                  </div>
                  <p>{selectedMessage.email}</p>
                </div>

                {selectedMessage.phone && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Phone</span>
                    </div>
                    <p>{selectedMessage.phone}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Date</span>
                  </div>
                  <p>{new Date(selectedMessage.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-medium">Subject</span>
                <p className="text-sm border rounded-md p-3 bg-muted/30">{selectedMessage.subject}</p>
              </div>

              <div className="space-y-2">
                <span className="font-medium">Message</span>
                <div className="text-sm border rounded-md p-4 bg-muted/30 whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <Badge variant={getMessageBadgeVariant(selectedMessage)}>
                  {getMessageBadgeText(selectedMessage)}
                </Badge>

                {!selectedMessage.replied_at && (
                  <Button onClick={() => handleMarkAsReplied(selectedMessage.id)}>
                    <MailCheck className="mr-2 h-4 w-4" />
                    Mark as Replied
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}