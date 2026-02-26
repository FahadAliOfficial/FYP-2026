"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  createTicket, 
  getMyTickets, 
  getTicket, 
  addMessage 
} from "@/lib/api/tickets";
import { 
  Ticket, 
  TicketCreate, 
  TicketDetail,
  TicketStatus,
  TicketCategory,
  TicketPriority,
} from "@/lib/types/tickets";
import { 
  Clock, 
  MessageSquare, 
  Plus,
  Send,
  Wrench,
  UserCircle,
  FileText,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const categoryIcons = {
  technical: Wrench,
  account: UserCircle,
  exam: FileText,
  general: HelpCircle,
};

const statusColors = {
  open: "bg-blue-500",
  in_progress: "bg-yellow-500",
  resolved: "bg-green-500",
  closed: "bg-gray-500",
};

const statusLabels = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

const priorityColors = {
  low: "bg-gray-400",
  normal: "bg-blue-400",
  high: "bg-orange-400",
  urgent: "bg-red-500",
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

function SupportPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<TicketStatus | "all">("all");
  const [selectedTicket, setSelectedTicket] = useState<TicketDetail | null>(null);
  const [viewingTicket, setViewingTicket] = useState(false);
  const [creatingTicket, setCreatingTicket] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();

  // Create ticket form state
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<TicketCategory>("general");
  const [priority, setPriority] = useState<TicketPriority>("normal");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const messageCount = selectedTicket?.messages.length ?? 0;

  const loadTickets = useCallback(async () => {
    try {
      const status = filterStatus === "all" ? undefined : filterStatus;
      const data = await getMyTickets(status);
      setTickets(data);
    } catch (error) {
      console.error("Failed to load tickets:", error);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  const refreshTicketDetails = useCallback(async () => {
    if (selectedTicket && viewingTicket) {
      try {
        const data = await getTicket(selectedTicket.ticket.id);
        setSelectedTicket(data);
      } catch (error) {
        const message = error instanceof Error ? error.message : "";

        if (message.toLowerCase().includes("ticket not found")) {
          setViewingTicket(false);
          setSelectedTicket(null);
          setReplyMessage("");
          loadTickets();
          return;
        }

        console.error("Failed to refresh ticket:", error);
      }
    }
  }, [selectedTicket, viewingTicket, loadTickets]);

  useEffect(() => {
    loadTickets();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(loadTickets, 10000);
    return () => clearInterval(interval);
  }, [loadTickets]);

  useEffect(() => {
    if (selectedTicket) {
      // Auto-refresh ticket details every 5 seconds when viewing
      const interval = setInterval(() => {
        refreshTicketDetails();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedTicket, refreshTicketDetails]);

  useEffect(() => {
    if (viewingTicket && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [viewingTicket, messageCount]);

  useEffect(() => {
    if (!viewingTicket) return;

    const timeoutId = window.setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }, 80);

    return () => window.clearTimeout(timeoutId);
  }, [viewingTicket, selectedTicket?.ticket.id, messageCount]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    if (subject.length < 5) {
      toast({
        title: "Invalid subject",
        description: "Subject must be at least 5 characters",
        variant: "destructive",
      });
      return;
    }

    if (message.length < 10) {
      toast({
        title: "Message too short",
        description: "Please provide at least 10 characters",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const ticketData: TicketCreate = {
        subject,
        category,
        priority,
        message,
      };

      await createTicket(ticketData);

      toast({
        title: "Ticket created",
        description: "Your support ticket has been submitted successfully",
      });

      // Reset form
      setSubject("");
      setCategory("general");
      setPriority("normal");
      setMessage("");
      setCreatingTicket(false);

      // Reload tickets
      loadTickets();
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error, "Failed to create ticket"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewTicket = async (ticketId: string) => {
    try {
      const data = await getTicket(ticketId);
      setSelectedTicket(data);
      setViewingTicket(true);
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error, "Failed to load ticket"),
        variant: "destructive",
      });
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyMessage.trim() || isSubmittingReply) return;

    setIsSubmittingReply(true);

    try {
      await addMessage(selectedTicket.ticket.id, { message: replyMessage });

      toast({
        title: "Reply sent",
        description: "Your message has been added to the ticket",
      });

      setReplyMessage("");
      refreshTicketDetails();
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error, "Failed to send reply"),
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const filteredTickets = tickets;

  const getFilterButtonClass = (status: TicketStatus | "all") =>
    filterStatus === status
      ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:text-white"
      : "bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="md:pl-64">
        <main className="container mx-auto py-8 px-4 max-w-7xl">
          <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Support Tickets</h1>
          <p className="text-muted-foreground mt-1">
            Get help with issues or ask questions
          </p>
        </div>

        <Dialog open={creatingTicket} onOpenChange={setCreatingTicket}>
          <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief description of your issue"
                  required
                  minLength={5}
                  maxLength={255}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as TicketCategory)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical Issue</SelectItem>
                      <SelectItem value="account">Account</SelectItem>
                      <SelectItem value="exam">Exam Related</SelectItem>
                      <SelectItem value="general">General Question</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Detailed description of your issue or question..."
                  rows={6}
                  required
                  minLength={10}
                  maxLength={5000}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {message.length}/5000 characters
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreatingTicket(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                  {isSubmitting ? "Creating..." : "Create Ticket"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6">
        <Button
          variant="outline"
          className={getFilterButtonClass("all")}
          size="sm"
          onClick={() => setFilterStatus("all")}
        >
          All
        </Button>
        <Button
          variant="outline"
          className={getFilterButtonClass("open")}
          size="sm"
          onClick={() => setFilterStatus("open")}
        >
          Open
        </Button>
        <Button
          variant="outline"
          className={getFilterButtonClass("in_progress")}
          size="sm"
          onClick={() => setFilterStatus("in_progress")}
        >
          In Progress
        </Button>
        <Button
          variant="outline"
          className={getFilterButtonClass("resolved")}
          size="sm"
          onClick={() => setFilterStatus("resolved")}
        >
          Resolved
        </Button>
        <Button
          variant="outline"
          className={getFilterButtonClass("closed")}
          size="sm"
          onClick={() => setFilterStatus("closed")}
        >
          Closed
        </Button>
          </div>

          {/* Tickets List */}
          {loading ? (
        <div className="text-center py-12">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading tickets...</p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <Card className="p-12 text-center">
          <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No tickets found</h3>
          <p className="text-muted-foreground mb-4">
            {filterStatus === "all"
              ? "You haven't created any support tickets yet"
              : `No ${filterStatus.replace("_", " ")} tickets`}
          </p>
          <Button onClick={() => setCreatingTicket(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Ticket
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((ticket) => {
            const CategoryIcon = categoryIcons[ticket.category];
            return (
              <Card
                key={ticket.id}
                className="p-4 hover:border-primary cursor-pointer transition-colors"
                onClick={() => handleViewTicket(ticket.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      <CategoryIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{ticket.subject}</h3>
                        <span className="text-xs text-muted-foreground font-mono">
                          {ticket.ticket_number}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="capitalize">{ticket.category}</span>
                        <span>•</span>
                        <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>{ticket.message_count}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", priorityColors[ticket.priority])} />
                    <div
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium text-white",
                        statusColors[ticket.status]
                      )}
                    >
                      {statusLabels[ticket.status]}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
          )}

          {/* Ticket Detail Dialog */}
          <Dialog open={viewingTicket} onOpenChange={setViewingTicket}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col [&>button]:h-10 [&>button]:w-10 [&>button]:p-2 [&>button_svg]:h-5 [&>button_svg]:w-5">
          {selectedTicket && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-xl mb-2">
                      {selectedTicket.ticket.subject}
                    </DialogTitle>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="font-mono">{selectedTicket.ticket.ticket_number}</span>
                      <span>•</span>
                      <span className="capitalize">{selectedTicket.ticket.category}</span>
                      <span>•</span>
                      <div
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium text-white",
                          statusColors[selectedTicket.ticket.status]
                        )}
                      >
                        {statusLabels[selectedTicket.ticket.status]}
                      </div>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              {/* Messages */}
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto space-y-4 py-4">
                {selectedTicket.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "p-4 rounded-lg",
                      msg.is_staff_reply ? "bg-blue-50 border-l-4 border-blue-500" : "bg-muted"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">
                        {msg.sender_name}
                        {msg.is_staff_reply && (
                          <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                            Support Staff
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  </div>
                ))}
              </div>

              {/* Reply Box */}
              {selectedTicket.ticket.status !== "closed" && (
                <div className="border-t pt-4">
                  <Label className="mb-2 block">Reply to ticket</Label>
                  <div className="space-y-2">
                    <Textarea
                      className="w-full"
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type your message..."
                      rows={3}
                      disabled={isSubmittingReply}
                    />
                    <Button
                      onClick={handleSendReply}
                      disabled={!replyMessage.trim() || isSubmittingReply}
                      className="w-full h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Reply
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
        </main>
      </div>
    </div>
  );
}

export default function SupportPageWrapper() {
  return (
    <ProtectedRoute>
      <SupportPage />
    </ProtectedRoute>
  );
}
