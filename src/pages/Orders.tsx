import { useState, useEffect, useRef, useCallback } from 'react';
import { useOrders } from '@/hooks/useOrders';

/**
 * Orders Page Component
 * 
 * Displays customer orders with real-time updates from webhook events.
 * Shows order details and status information.
 */
export function Orders() {
  const [itemsPerPage, setItemsPerPage] = useState<number>(50);
  const [cursor, setCursor] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]); // Track cursor history for back navigation
  const [startIndex, setStartIndex] = useState<number>(1); // Track starting index (1-based) for range display
  const [containerHeight, setContainerHeight] = useState<number>(600); // Default height in pixels
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeStartY = useRef<number>(0);
  const resizeStartHeight = useRef<number>(600);

  const { orders, loading, error, refresh, lastFetched, totalCount, pageInfo } = useOrders({
    autoRefresh: false, // Disable auto-refresh when paginating
    limit: itemsPerPage,
    cursor
  });

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
  const endIndex = Math.min(startIndex + orders.length - 1, totalCount);
  const rangeText = orders.length > 0 
    ? `Showing ${startIndex}-${endIndex} of ${totalCount} orders`
    : `Showing 0 of ${totalCount} orders`;

  const formatOrderTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      case 'fulfilled': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">
            View and manage customer orders
            {lastFetched && (
              <span className="ml-2 text-sm">
                (Last updated: {formatOrderTime(lastFetched.toISOString())})
              </span>
            )}
          </p>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      {/* Orders List with Pagination */}
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

        {/* Scrollable Orders List */}
        <div className="flex-1 overflow-y-auto">
          {loading && orders.length === 0 ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">
                No orders found. Orders will appear here once customers make purchases.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {orders.map((order) => (
                <div key={order.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {order.orderNumber}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                        <div>
                          <span className="font-medium">Customer:</span> {order.customerName}
                        </div>
                        <div>
                          <span className="font-medium">Total:</span> {order.totalPrice}
                        </div>
                        <div>
                          <span className="font-medium">Created:</span> {formatOrderTime(order.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                        View Details
                      </button>
                      <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200">
                        Edit
                      </button>
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

