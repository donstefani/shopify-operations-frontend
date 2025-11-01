import { useState, useEffect, useRef, useCallback } from 'react';
import { useWebhookEvents } from '@/hooks/useWebhookEvents';
import { WebhookEvent } from '@/lib/event-client';

/**
 * Events Page Component
 * 
 * Displays real-time webhook events from Shopify with filtering and polling controls.
 * Shows events as they happen in the store with detailed information.
 */
export function Events() {
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [pollInterval, setPollInterval] = useState<number>(5000);
  const [isPollingEnabled] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState<number>(50);
  const [cursor, setCursor] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]); // Track cursor history for back navigation
  const [startIndex, setStartIndex] = useState<number>(1); // Track starting index (1-based) for range display
  const [containerHeight, setContainerHeight] = useState<number>(600); // Default height in pixels
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeStartY = useRef<number>(0);
  const resizeStartHeight = useRef<number>(600);

  const { 
    events, 
    stats, 
    loading, 
    error, 
    isPolling, 
    refresh, 
    startPolling, 
    stopPolling,
    lastFetched,
    totalCount,
    pageInfo
  } = useWebhookEvents({
    topic: selectedTopic || undefined,
    pollInterval,
    autoStart: isPollingEnabled && cursor === null, // Disable auto-start when paginating
    limit: itemsPerPage,
    cursor
  });

  // Available webhook topics for filtering
  const webhookTopics = [
    { value: '', label: 'All Events' },
    { value: 'orders/create', label: 'Orders Created' },
    { value: 'orders/updated', label: 'Orders Updated' },
    { value: 'orders/paid', label: 'Orders Paid' },
    { value: 'orders/cancelled', label: 'Orders Cancelled' },
    { value: 'orders/fulfilled', label: 'Orders Fulfilled' },
    { value: 'products/create', label: 'Products Created' },
    { value: 'products/update', label: 'Products Updated' },
    { value: 'products/delete', label: 'Products Deleted' },
    { value: 'customers/create', label: 'Customers Created' },
    { value: 'customers/update', label: 'Customers Updated' },
  ];

  const handleRefresh = async () => {
    setCursor(null);
    setCursorHistory([]);
    setStartIndex(1);
    await refresh();
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCursor(null);
    setCursorHistory([]);
    setStartIndex(1);
  };

  const handleNextPage = () => {
    if (pageInfo.hasNextPage && pageInfo.endCursor) {
      setCursorHistory([...cursorHistory, cursor || '']);
      setCursor(pageInfo.endCursor);
      setStartIndex(startIndex + itemsPerPage);
    }
  };

  const handlePreviousPage = () => {
    if (cursorHistory.length > 0) {
      const newHistory = [...cursorHistory];
      const previousCursor = newHistory.pop() || null;
      setCursorHistory(newHistory);
      setCursor(previousCursor);
      setStartIndex(Math.max(1, startIndex - itemsPerPage));
    } else {
      setCursor(null);
      setStartIndex(1);
    }
  };

  // Sync startIndex when cursor changes to null (first page)
  useEffect(() => {
    if (cursor === null) {
      setStartIndex(1);
    }
  }, [cursor]);

  // Stop polling when paginating
  useEffect(() => {
    if (cursor !== null && isPolling) {
      stopPolling();
    }
  }, [cursor, isPolling, stopPolling]);

  // Handle resize drag
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    resizeStartY.current = e.clientY;
    resizeStartHeight.current = containerHeight;
  }, [containerHeight]);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    const deltaY = e.clientY - resizeStartY.current;
    const newHeight = Math.max(300, Math.min(1200, resizeStartHeight.current + deltaY)); // Min 300px, Max 1200px
    setContainerHeight(newHeight);
  }, [isResizing]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Set up global mouse event listeners for resize
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  const canGoPrevious = cursorHistory.length > 0 || cursor !== null;

  // Calculate the range for display (e.g., "1-50 of 223")
  const endIndex = Math.min(startIndex + events.length - 1, totalCount);
  const rangeText = events.length > 0 
    ? `Showing ${startIndex}-${endIndex} of ${totalCount} events`
    : `Showing 0 of ${totalCount} events`;

  const formatEventTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getEventIcon = (topic: string) => {
    if (topic.startsWith('orders/')) return '🛒';
    if (topic.startsWith('products/')) return '📦';
    if (topic.startsWith('customers/')) return '👤';
    return '🔔';
  };

  const getEventStatusColor = (status: string) => {
    switch (status) {
      case 'processed': return 'text-green-600 bg-green-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Webhook Events</h1>
          <p className="text-muted-foreground">
            Real-time webhook events from Shopify
            {lastFetched && (
              <span className="ml-2 text-sm">
                (Last updated: {formatEventTime(lastFetched.toISOString())})
              </span>
            )}
          </p>
        </div>
        
        {/* Polling Controls */}
        <div className="flex items-center space-x-4">
          <button
            onClick={isPolling ? stopPolling : startPolling}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              isPolling 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isPolling ? 'Stop Polling' : 'Start Polling'}
          </button>
          
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-card border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="w-8 h-8 bg-blue-500 rounded-full opacity-10"></div>
            </div>
          </div>
          
          <div className="p-4 bg-card border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Orders</p>
                <p className="text-2xl font-bold">
                  {(stats.byTopic['orders/create'] || 0) + 
                   (stats.byTopic['orders/updated'] || 0) + 
                   (stats.byTopic['orders/paid'] || 0)}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-500 rounded-full opacity-10"></div>
            </div>
          </div>
          
          <div className="p-4 bg-card border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Products</p>
                <p className="text-2xl font-bold">
                  {(stats.byTopic['products/create'] || 0) + 
                   (stats.byTopic['products/update'] || 0)}
                </p>
              </div>
              <div className="w-8 h-8 bg-purple-500 rounded-full opacity-10"></div>
            </div>
          </div>
          
          <div className="p-4 bg-card border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Customers</p>
                <p className="text-2xl font-bold">
                  {(stats.byTopic['customers/create'] || 0) + 
                   (stats.byTopic['customers/update'] || 0)}
                </p>
              </div>
              <div className="w-8 h-8 bg-orange-500 rounded-full opacity-10"></div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div>
          <label htmlFor="topic-filter" className="block text-sm font-medium text-muted-foreground mb-1">
            Filter by Topic
          </label>
          <select
            id="topic-filter"
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {webhookTopics.map((topic) => (
              <option key={topic.value} value={topic.value}>
                {topic.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="poll-interval" className="block text-sm font-medium text-muted-foreground mb-1">
            Poll Interval (ms)
          </label>
          <select
            id="poll-interval"
            value={pollInterval}
            onChange={(e) => setPollInterval(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={2000}>2 seconds</option>
            <option value={5000}>5 seconds</option>
            <option value={10000}>10 seconds</option>
            <option value={30000}>30 seconds</option>
          </select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      {/* Events List with Pagination */}
      <div 
        ref={containerRef}
        className="bg-card border rounded-lg flex flex-col" 
        style={{ height: `${containerHeight}px`, minHeight: '300px', maxHeight: '1200px' }}
      >
        {/* Pagination Controls - Fixed at top */}
        <div className="border-b border-gray-200 p-4 bg-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label htmlFor="itemsPerPage" className="text-sm font-medium text-gray-700">
                Items per page:
              </label>
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              {rangeText}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePreviousPage}
              disabled={!canGoPrevious || loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={!pageInfo.hasNextPage || loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>

        {/* Scrollable Events List */}
        <div className="flex-1 overflow-y-auto">
          {loading && events.length === 0 ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading webhook events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">
                No webhook events found{selectedTopic && ` for topic: ${selectedTopic}`}.
                Events will appear here as they are processed.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {events.map((event: WebhookEvent) => (
                <div key={event.event_id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{getEventIcon(event.topic)}</span>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">
                            {event.topic.replace('/', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEventStatusColor(event.status || 'processed')}`}>
                            {event.status || 'processed'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatEventTime(event.created_at)}
                        </p>
                        {(event as any).error_message && (
                          <p className="text-sm text-red-600 mt-1">
                            Error: {(event as any).error_message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">ID: {event.event_id}</p>
                      <p className="text-sm text-gray-500">Shop: {event.shop_domain}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resize Handle - Draggable at bottom */}
        <div
          onMouseDown={handleResizeStart}
          className="h-2 bg-gray-200 hover:bg-blue-500 cursor-ns-resize transition-colors flex items-center justify-center group flex-shrink-0"
          style={{ cursor: isResizing ? 'ns-resize' : 'ns-resize' }}
        >
          <div className="w-12 h-0.5 bg-gray-400 group-hover:bg-blue-600 transition-colors"></div>
        </div>
      </div>
    </div>
  );
}

