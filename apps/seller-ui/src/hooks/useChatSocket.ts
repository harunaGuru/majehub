'use client';

import { useEffect, useRef } from 'react';

export const useChatSocket = (
  sellerId?: string,
  onMessage?: (data: any) => void
) => {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!sellerId) return;

    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL!);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: 'INIT',
          userId: sellerId,
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
  }, [sellerId]);

  return wsRef;
};
