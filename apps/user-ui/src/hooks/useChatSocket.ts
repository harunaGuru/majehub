'use client';

import { useEffect, useRef } from 'react';

export const useChatSocket = (
  userId?: string,
  onMessage?: (data: any) => void
) => {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!userId) return;

    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL!);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: 'INIT',
          userId,
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage?.(data);
    };

    return () => {
      ws.close();
    };
  }, [userId]);

  return wsRef;
};
