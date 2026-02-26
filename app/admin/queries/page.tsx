"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  getAllTickets,
  getTicketStats,
  getTicket,
  updateTicketStatus,
  assignTicket,
  addMessage,
  deleteTicket,
} from "@/lib/api/tickets";
import {
  Ticket,
  TicketDetail,
  TicketStats,
  TicketFilters,
} from "@/lib/types/tickets";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  MessageSquare,
  Send,
  Trash2,
  UserCheck,
  Wrench,
  UserCircle,
  FileText,
  HelpCircle,
  RefreshCw,
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

export default function AdminQueriesPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TicketFilters>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<TicketDetail | null>(null);
  const [viewingTicket, setViewingTicket] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();

  const messageCount = selectedTicket?.messages.length ?? 0;

  useEffect(() => {
    loadTickets();
    loadStats();

    // Auto-refresh every 2 seconds
    const interval = setInterval(() => {
      loadTickets();
      loadStats();
    }, 2000);

    return () => clearInterval(interval);
  }, [filters, searchQuery]);

  useEffect(() => {
    if (selectedTicket) {
      // Auto-refresh ticket details every 3 seconds when viewing
      const interval = setInterval(() => {
        refreshTicketDetails();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedTicket]);

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

  const loadTickets = async () => {
    try {
      const data = await getAllTickets({ ...filters, search: searchQuery || undefined });
      setTickets(data);
    } catch (error) {
      console.error("Failed to load tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await getTicketStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const refreshTicketDetails = async () => {
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
  };

  const handleViewTicket = async (ticketId: string) => {
    try {
      const data = await getTicket(ticketId);
      setSelectedTicket(data);
      setViewingTicket(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load ticket",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (ticketId: string, status: string) => {
    try {
      await updateTicketStatus(ticketId, { status: status as any });
      toast({
        title: "Status updated",
        description: "Ticket status has been updated successfully",
      });
      loadTickets();
      if (selectedTicket?.ticket.id === ticketId) {
        refreshTicketDetails();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleAssign = async (ticketId: string, userId: string | null) => {
    try {
      await assignTicket(ticketId, { assigned_to: userId });
      toast({
        title: "Ticket assigned",
        description: userId ? "Ticket has been assigned" : "Ticket unassigned",
      });
      loadTickets();
      if (selectedTicket?.ticket.id === ticketId) {
        refreshTicketDetails();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to assign ticket",
        variant: "destructive",
      });
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyMessage.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      await addMessage(selectedTicket.ticket.id, { message: replyMessage });

      toast({
        title: "Reply sent",
        description: "Your reply has been added to the ticket",
      });

      setReplyMessage("");
      refreshTicketDetails();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reply",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (ticketId: string) => {
    if (!confirm("Are you sure you want to delete this ticket? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteTicket(ticketId);
      toast({
        title: "Ticket deleted",
        description: "The ticket has been permanently deleted",
      });
      setViewingTicket(false);
      setSelectedTicket(null);
      loadTickets();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete ticket",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Support Tickets</h1>
          <p className="text-muted-foreground mt-1">
            Manage student support tickets and queries
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={() => { loadTickets(); loadStats(); }}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
          </Card>

          <Card className="p-4 border-blue-200 bg-blue-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Open</p>
                <p className="text-2xl font-bold text-blue-700">{stats.open}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4 border-yellow-200 bg-yellow-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-700">{stats.in_progress}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </Card>

          <Card className="p-4 border-green-200 bg-green-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Resolved</p>
                <p className="text-2xl font-bold text-green-700">{stats.resolved}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Closed</p>
                <p className="text-2xl font-bold">{stats.closed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <Label>Search</Label>
          <Input
            placeholder="Ticket # or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div>
          <Label>Status</Label>
          <Select
            value={filters.status || "all"}
            onValueChange={(v) =>
              setFilters({ ...filters, status: v === "all" ? undefined : (v as any) })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Category</Label>
          <Select
            value={filters.category || "all"}
            onValueChange={(v) =>
              setFilters({ ...filters, category: v === "all" ? undefined : (v as any) })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="account">Account</SelectItem>
              <SelectItem value="exam">Exam</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Priority</Label>
          <Select
            value={filters.priority || "all"}
            onValueChange={(v) =>
              setFilters({ ...filters, priority: v === "all" ? undefined : (v as any) })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="text-center py-12">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        <Card className="p-12 text-center">
          <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No tickets found</h3>
          <p className="text-muted-foreground">
            No support tickets match your current filters
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => {
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
                        {ticket.assigned_to && (
                          <>
                            <span>•</span>
                            <UserCheck className="h-3 w-3" />
                            <span>Assigned</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className={cn("w-2 h-2 rounded-full", priorityColors[ticket.priority])}
                    />
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
        <DialogContent className="max-w-5xl h-[92vh] max-h-[92vh] overflow-hidden flex flex-col [&>button]:h-10 [&>button]:w-10 [&>button]:p-2 [&>button_svg]:h-5 [&>button_svg]:w-5">
          {selectedTicket && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <DialogTitle className="text-xl mb-2">
                      {selectedTicket.ticket.subject}
                    </DialogTitle>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                      <span className="font-mono">{selectedTicket.ticket.ticket_number}</span>
                      <span>•</span>
                      <span className="capitalize">{selectedTicket.ticket.category}</span>
                      <span>•</span>
                      <span>{new Date(selectedTicket.ticket.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Admin Actions */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={selectedTicket.ticket.status}
                      onValueChange={(v) => handleStatusChange(selectedTicket.ticket.id, v)}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Priority</Label>
                    <div
                      className={cn(
                        "h-9 px-3 rounded-md flex items-center text-xs font-medium text-white",
                        priorityColors[selectedTicket.ticket.priority]
                      )}
                    >
                      {selectedTicket.ticket.priority.toUpperCase()}
                    </div>
                  </div>

                  <div>
                    <Label>Actions</Label>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={() => handleDelete(selectedTicket.ticket.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
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
                      msg.is_staff_reply
                        ? "bg-blue-50 border-l-4 border-blue-500"
                        : "bg-muted"
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
                      placeholder="Type your reply..."
                      rows={3}
                      disabled={isSubmitting}
                    />
                    <Button
                      onClick={handleSendReply}
                      disabled={!replyMessage.trim() || isSubmitting}
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
    </div>
  );
}
