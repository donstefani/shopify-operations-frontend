import { useState, useEffect, useRef, useCallback } from 'react';
import { useCustomers } from '@/hooks/useCustomers';

/**
 * Customers Page Component
 * 
 * Displays customer data with real-time updates from webhook events.
 * Shows customer information and order history.
 */
export function Customers() {
  const [itemsPerPage, setItemsPerPage] = useState<number>(50);
  const [cursor, setCursor] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]); // Track cursor history for back navigation
  const [startIndex, setStartIndex] = useState<number>(1); // Track starting index (1-based) for range display
  const [containerHeight, setContainerHeight] = useState<number>(600); // Default height in pixels
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeStartY = useRef<number>(0);
  const resizeStartHeight = useRef<number>(600);

  const { customers, loading, error, refresh, lastFetched, totalCount, pageInfo } = useCustomers({
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
  const endIndex = Math.min(startIndex + customers.length - 1, totalCount);
  const rangeText = customers.length > 0 
    ? `Showing ${startIndex}-${endIndex} of ${totalCount} customers`
    : `Showing 0 of ${totalCount} customers`;

  const formatCustomerTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'disabled': return 'text-red-600 bg-red-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">
            Manage your customer database
            {lastFetched && (
              <span className="ml-2 text-sm">
                (Last updated: {formatCustomerTime(lastFetched.toISOString())})
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
            Add Customer
          </button>
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

      {/* Customers List with Pagination */}
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

        {/* Scrollable Customers List */}
        <div className="flex-1 overflow-y-auto">
          {loading && customers.length === 0 ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading customers...</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">
                No customers found. Add your first customer to get started.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {customers.map((customer) => (
                <div key={customer.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {customer.firstName[0]}{customer.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {customer.firstName} {customer.lastName}
                          </h3>
                          <p className="text-sm text-gray-500">{customer.email}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(customer.status)}`}>
                          {customer.status}
                        </span>
                      </div>
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-500">
                        <div>
                          <span className="font-medium">Phone:</span> {customer.phone || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Total Spent:</span> {customer.totalSpent}
                        </div>
                        <div>
                          <span className="font-medium">Orders:</span> {customer.ordersCount}
                        </div>
                        <div>
                          <span className="font-medium">Joined:</span> {formatCustomerTime(customer.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                        View Profile
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

