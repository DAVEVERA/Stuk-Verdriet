'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, Minus, X } from 'lucide-react';

export function CommunityChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0); // Dummy state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  // This would be replaced by a real-time subscription
  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     setUnreadCount(prev => prev + 1);
  //   }, 10000);
  //   return () => clearInterval(timer);
  // }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !widgetRef.current) return;
      const parent = widgetRef.current.parentElement;
      if (!parent) return;

      const parentRect = parent.getBoundingClientRect();
      const widgetRect = widgetRef.current.getBoundingClientRect();

      let newX = e.clientX - dragStartPos.current.x;
      let newY = e.clientY - dragStartPos.current.y;

      // Blijf binnen de parent bounds
      newX = Math.max(0, Math.min(newX, parentRect.width - widgetRect.width));
      newY = Math.max(0, Math.min(newY, parentRect.height - widgetRect.height));

      setPosition({ x: newX, y: newY });
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleOpenChat = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  if (!isOpen) {
    return (
      <button
        onClick={handleOpenChat}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-transform hover:scale-110 z-50"
        aria-label={`Open chat ${unreadCount > 0 ? `(${unreadCount} ongelezen berichten)` : ''}`}
      >
        <MessageSquare size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 flex h-6 w-6">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-6 w-6 bg-red-500 text-xs items-center justify-center">
              {unreadCount}
            </span>
          </span>
        )}
      </button>
    );
  }

  return (
    <div
      ref={widgetRef}
      className="fixed bottom-4 right-4 w-full max-w-sm bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex flex-col"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        height: isMinimized ? 'auto' : '32rem',
      }}
    >
      <header
        onMouseDown={handleMouseDown}
        className="chat-widget-header bg-gray-100 p-3 flex justify-between items-center cursor-move rounded-t-lg border-b"
      >
        <h3 className="font-bold text-sm">Community Messenger</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-gray-200 rounded"
            aria-label={isMinimized ? 'Chat maximaliseren' : 'Chat minimaliseren'}
          >
            <Minus size={16} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-200 rounded"
            aria-label="Chat sluiten"
          >
            <X size={16} />
          </button>
        </div>
      </header>

      {!isMinimized && (
        <>
          <div className="flex-grow p-4 h-full overflow-y-auto">
            {/* Placeholder for chat content */}
            <div className="text-center text-gray-500 h-full flex flex-col justify-center">
              <p className="font-semibold">Live Messenger</p>
              <p className="text-sm">Gesprekken en notificaties worden hier binnenkort getoond.</p>
            </div>
          </div>
          <footer className="p-3 border-t bg-gray-50 rounded-b-lg">
            <input
              type="text"
              placeholder="Typ een bericht..."
              className="w-full border rounded-md p-2 text-sm"
            />
          </footer>
        </>
      )}
    </div>
  );
}
