/**
 * Support Tickets API Client
 * 
 * Frontend API functions for support ticket system
 */

import { 
  Ticket, 
  TicketCreate, 
  TicketDetail, 
  TicketStats,
  MessageCreate,
  TicketStatusUpdate,
  TicketAssignment,
  TicketFilters
} from '@/lib/types/tickets';
import { apiClient, del, get, post, formatAPIError } from './client';

function withQuery(endpoint: string, params: URLSearchParams): string {
  const query = params.toString();
  return query ? `${endpoint}?${query}` : endpoint;
}

function toError(error: unknown, fallback: string): Error {
  const message = formatAPIError(error);
  return new Error(message || fallback);
}

// ============================================================================
// Student Functions
// ============================================================================

/**
 * Create a new support ticket
 */
export async function createTicket(data: TicketCreate): Promise<Ticket> {
  try {
    return await post<Ticket>('/api/tickets', data);
  } catch (error) {
    throw toError(error, 'Failed to create ticket');
  }
}

/**
 * Get current user's tickets
 */
export async function getMyTickets(status?: string): Promise<Ticket[]> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);

  try {
    return await get<Ticket[]>(withQuery('/api/tickets/my', params));
  } catch (error) {
    throw toError(error, 'Failed to fetch tickets');
  }
}

/**
 * Get ticket details with messages
 */
export async function getTicket(ticketId: string): Promise<TicketDetail> {
  try {
    return await get<TicketDetail>(`/api/tickets/${ticketId}`);
  } catch (error) {
    throw toError(error, 'Failed to fetch ticket');
  }
}

/**
 * Add a message to a ticket
 */
export async function addMessage(ticketId: string, data: MessageCreate): Promise<unknown> {
  try {
    return await post<unknown>(`/api/tickets/${ticketId}/messages`, data);
  } catch (error) {
    throw toError(error, 'Failed to add message');
  }
}

// ============================================================================
// Admin Functions
// ============================================================================

/**
 * Get all tickets (admin only)
 */
export async function getAllTickets(filters?: TicketFilters): Promise<Ticket[]> {
  const params = new URLSearchParams();
  
  if (filters?.status) params.append('status', filters.status);
  if (filters?.category) params.append('category', filters.category);
  if (filters?.priority) params.append('priority', filters.priority);
  if (filters?.assigned_to) params.append('assigned_to', filters.assigned_to);
  if (filters?.search) params.append('search', filters.search);

  try {
    return await get<Ticket[]>(withQuery('/api/tickets/admin/all', params));
  } catch (error) {
    throw toError(error, 'Failed to fetch tickets');
  }
}

/**
 * Get ticket statistics (admin only)
 */
export async function getTicketStats(): Promise<TicketStats> {
  try {
    return await get<TicketStats>('/api/tickets/admin/stats');
  } catch (error) {
    throw toError(error, 'Failed to fetch stats');
  }
}

/**
 * Update ticket status (admin only)
 */
export async function updateTicketStatus(
  ticketId: string, 
  data: TicketStatusUpdate
): Promise<{ message: string }> {
  try {
    return await apiClient<{ message: string }>(`/api/tickets/admin/${ticketId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  } catch (error) {
    throw toError(error, 'Failed to update status');
  }
}

/**
 * Assign ticket to admin (admin only)
 */
export async function assignTicket(
  ticketId: string, 
  data: TicketAssignment
): Promise<{ message: string }> {
  try {
    return await apiClient<{ message: string }>(`/api/tickets/admin/${ticketId}/assign`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  } catch (error) {
    throw toError(error, 'Failed to assign ticket');
  }
}

/**
 * Delete a ticket (admin only)
 */
export async function deleteTicket(ticketId: string): Promise<{ message: string }> {
  try {
    return await del<{ message: string }>(`/api/tickets/admin/${ticketId}`);
  } catch (error) {
    throw toError(error, 'Failed to delete ticket');
  }
}
