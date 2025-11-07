import { API_URLS } from './constants';

/**
 * Event Manager REST API Client
 * 
 * This client handles communication with the event-manager service
 * to fetch webhook events and statistics.
 */

export interface WebhookEvent {
  event_id: string;
  topic: string;
  shop_domain: string;
  created_at: string;
  event_data: Record<string, any>;
  ttl: number;
  // Add status field for UI compatibility (will be set to 'processed' by default)
  status?: string;
}

export interface WebhookEventStats {
  total: number;
  byTopic: Record<string, number>;
  byStatus: Record<string, number>;
  recent: WebhookEvent[];
  lastEvent: string | null;
}

export interface WebhookEventsResponse {
  success: boolean;
  message: string;
  data: WebhookEvent[];
  pagination: {
    limit: number;
    hasMore: boolean;
  };
}

export interface WebhookEventStatsResponse {
  success: boolean;
  message: string;
  data: WebhookEventStats;
}

export interface WebhookEventResponse {
  success: boolean;
  message: string;
  data: WebhookEvent;
}

class EventClient {
  private baseUrl: string;

  constructor() {
    // Use the base URL directly (should not include /api/events)
    this.baseUrl = API_URLS.EVENT;
  }

  /**
   * Get webhook events for a shop
   */
  async getWebhookEvents(
    shopDomain: string,
    options: {
      limit?: number;
      topic?: string;
      cursor?: string;
    } = {}
  ): Promise<WebhookEventsResponse> {
    const params = new URLSearchParams({
      shop: shopDomain,
      limit: (options.limit || 50).toString(),
      ...(options.topic && { topic: options.topic }),
      ...(options.cursor && { cursor: options.cursor })
    });

    const response = await fetch(`${this.baseUrl}/api/events?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 304 (Not Modified) is a successful cached response, should be treated as ok
    if (!response.ok && response.status !== 304) {
      throw new Error(`Failed to fetch webhook events: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get webhook event statistics for a shop
   */
  async getWebhookEventStats(shopDomain: string): Promise<WebhookEventStatsResponse> {
    const params = new URLSearchParams({
      shop: shopDomain
    });

    const response = await fetch(`${this.baseUrl}/api/events/stats?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 304 (Not Modified) is a successful cached response, should be treated as ok
    if (!response.ok && response.status !== 304) {
      throw new Error(`Failed to fetch webhook event stats: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get a specific webhook event by ID
   */
  async getWebhookEvent(shopDomain: string, eventId: string): Promise<WebhookEventResponse> {
    const params = new URLSearchParams({
      shop: shopDomain
    });

    const response = await fetch(`${this.baseUrl}/api/events/${eventId}?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 304 (Not Modified) is a successful cached response, should be treated as ok
    if (!response.ok && response.status !== 304) {
      throw new Error(`Failed to fetch webhook event: ${response.statusText}`);
    }

    return await response.json();
  }
}

// Export singleton instance
export const eventClient = new EventClient();
