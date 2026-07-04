/**
 * WebSocket service for real-time annotation collaboration
 * Handles real-time updates, user presence, and live collaboration events
 */

export type CollaborationEventType = 
  | 'annotation:created'
  | 'annotation:updated'
  | 'annotation:deleted'
  | 'annotation:locked'
  | 'annotation:unlocked'
  | 'user:joined'
  | 'user:left'
  | 'comment:added'
  | 'layer:visibility_changed';

export interface CollaborationEvent {
  type: CollaborationEventType;
  projectId: number;
  userId: number;
  userEmail: string;
  data: Record<string, any>;
  timestamp: string;
}

export interface WebSocketMessagePayload {
  action: string;
  project_id: number;
  data?: Record<string, any>;
}

type EventCallback = (event: CollaborationEvent) => void;

class WebSocketCollaborationService {
  private ws: WebSocket | null = null;
  private url: string;
  private projectId: number | null = null;
  private listeners: Map<CollaborationEventType, Set<EventCallback>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private messageQueue: WebSocketMessagePayload[] = [];
  private isConnecting = false;

  constructor(baseUrl: string = '') {
    // Construct WebSocket URL from current location or provided baseUrl
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = baseUrl || window.location.host;
    this.url = `${protocol}//${host}/ws/annotations/`;
  }

  /**
   * Connect to WebSocket server
   */
  connect(projectId: number, token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting) {
        reject(new Error('Connection already in progress'));
        return;
      }

      if (this.ws?.readyState === WebSocket.OPEN) {
        this.projectId = projectId;
        resolve();
        return;
      }

      this.isConnecting = true;
      this.projectId = projectId;

      try {
        this.ws = new WebSocket(`${this.url}?token=${token}&project_id=${projectId}`);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.flushMessageQueue();
          this.sendPresenceUpdate(true);
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.isConnecting = false;
          this.attemptReconnect(projectId, token);
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendPresenceUpdate(false);
      this.ws.close();
    }
    this.ws = null;
    this.projectId = null;
    this.messageQueue = [];
  }

  /**
   * Send a message through WebSocket
   */
  send(action: string, data?: Record<string, any>): void {
    if (!this.projectId) {
      console.warn('No project connected');
      return;
    }

    const message: WebSocketMessagePayload = {
      action,
      project_id: this.projectId,
      data
    };

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.messageQueue.push(message);
    }
  }

  /**
   * Subscribe to collaboration events
   */
  on(eventType: CollaborationEventType, callback: EventCallback): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(eventType)?.delete(callback);
    };
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(data: string): void {
    try {
      const event: CollaborationEvent = JSON.parse(data);
      const callbacks = this.listeners.get(event.type);
      if (callbacks) {
        callbacks.forEach(callback => callback(event));
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  /**
   * Flush queued messages
   */
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift();
      if (message) {
        this.ws.send(JSON.stringify(message));
      }
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(projectId: number, token: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect(projectId, token).catch(error => {
          console.error('Reconnection failed:', error);
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  /**
   * Update user presence
   */
  private sendPresenceUpdate(isActive: boolean): void {
    this.send('presence_update', { is_active: isActive });
  }

  /**
   * Notify annotation creation
   */
  notifyAnnotationCreated(annotationId: number, data: Record<string, any>): void {
    this.send('annotation_created', { annotation_id: annotationId, ...data });
  }

  /**
   * Notify annotation update
   */
  notifyAnnotationUpdated(annotationId: number, data: Record<string, any>): void {
    this.send('annotation_updated', { annotation_id: annotationId, ...data });
  }

  /**
   * Notify annotation deletion
   */
  notifyAnnotationDeleted(annotationId: number): void {
    this.send('annotation_deleted', { annotation_id: annotationId });
  }

  /**
   * Notify annotation lock
   */
  notifyAnnotationLocked(annotationId: number): void {
    this.send('annotation_locked', { annotation_id: annotationId });
  }

  /**
   * Notify annotation unlock
   */
  notifyAnnotationUnlocked(annotationId: number): void {
    this.send('annotation_unlocked', { annotation_id: annotationId });
  }

  /**
   * Notify comment added
   */
  notifyCommentAdded(annotationId: number, commentId: number, text: string): void {
    this.send('comment_added', { annotation_id: annotationId, comment_id: commentId, text });
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Export singleton instance
export const wsCollaborationService = new WebSocketCollaborationService();
