/**
 * Support Ticket Types
 * 
 * TypeScript definitions for the support ticket system
 */

export type TicketCategory = 'technical' | 'account' | 'exam' | 'general';
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface TicketCreate {
  subject: string;
  category: TicketCategory;
  priority?: TicketPriority;
  message: string;
}

export interface MessageCreate {
  message: string;
}

export interface TicketStatusUpdate {
  status: TicketStatus;
}

export interface TicketAssignment {
  assigned_to: string | null;
}

export interface Ticket {
  id: string;
  ticket_number: string;
  user_id: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  message_count: number;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_name: string;
  message: string;
  is_staff_reply: boolean;
  created_at: string;
}

export interface TicketDetail {
  ticket: Ticket;
  messages: TicketMessage[];
}

export interface TicketStats {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
  by_category: Record<TicketCategory, number>;
  by_priority: Record<TicketPriority, number>;
  avg_resolution_time_hours: number | null;
}

// UI-only types
export interface TicketFilters {
  status?: TicketStatus;
  category?: TicketCategory;
  priority?: TicketPriority;
  assigned_to?: string;
  search?: string;
}
