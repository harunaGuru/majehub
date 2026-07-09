'use client'
import Link from 'next/link';
import React, { useEffect, useState, useRef } from 'react'
import { ChevronRight, Download } from "lucide-react"

type LogType = 'info' | 'error' | 'warning' | 'debug' | 'success';

type LogPayload = {
  type: LogType;
  message: string;
  source: string;
};
type LogResponse = LogPayload & {
  timestamp: string;
}
const LoggersPage = () => {
  const [logs, setLogs] = useState<LogResponse[]>([]);
  const itemRef = useRef<HTMLDivElement>(null)
  const [filterLogs, setFilterLogs] = useState<LogResponse[]>([])

  const LOGS_COLOR: Record<LogType, string> = {
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
    debug: 'text-green-500',
    success: 'text-green-500',
  }
  useEffect(() => {
    const socket = new WebSocket(process.env.NEXT_PUBLIC_WS_SERVER!);
    socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        setLogs((prevLogs) => [...prevLogs, parsed]);
      } catch (error) {
        console.error('Invalid log format:', error);
      }
    };
    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    setFilterLogs(logs)
    if (itemRef.current) {
      const container = itemRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [logs]);



  //download  as log type
  const downloadLogs = () => {
    const csv = filterLogs.map((log) => {
      return `[${new Date(log.timestamp).toLocaleTimeString()}] ${log.source} [${log.type}] ${log.message}`
    }).join('\n');
    const blob = new Blob([csv], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'logs.log';
    a.click();
    URL.revokeObjectURL(url);
  }

  //filtered logs with keyboard
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '1') {
        setFilterLogs(logs.filter((log) => log.type === 'error'));
      }
      else if (event.key === '2') {
        setFilterLogs(logs.filter((log) => log.type === 'success'));
      }
      else if (event.key === '3') {
        setFilterLogs(logs);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [logs]);


  return (
    <div className="min-h-screen w-full flex flex-col p-4">
      <div className="flex items-center justify-between pl-4 lg:pl-0">
        <h1 className="font-poppins text-white font-semibold text-lg tracking-wide">
          Application Logs
        </h1>
        <button
          onClick={downloadLogs}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 border-2 border-gray-600 text-gray-400 text-xs px-2 py-1 rounded-md"
        >
          <Download size={16} />
          Download Logs
        </button>
      </div>
      <div className="flex items-center text-white mb-3 pl-4 lg:pl-0 -mt-2">
        <Link href="/dashboard" className="text-blue-500 opacity-80">
          Dashboard
        </Link>
        <span className="opacity-80">
          <ChevronRight size={20} />
        </span>
        <span>Application Logs</span>
      </div>
      <div ref={itemRef} className="bg-transparent rounded-lg min-h-[70vh] border-[1px] border-slate-900 w-full font-mono mx-auto">
        {filterLogs.length === 0 && <p className="text-white/30 text-sm p-2">Waiting for logs...</p>}
        {filterLogs.map((log, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
            <span className="text-purple-400 text-sm">{log.source}</span>
            <span className={`text-xs ${LOGS_COLOR[log.type as LogType]}`}>
              [{log.type.toUpperCase()}]
            </span>
            <span className="text-white/80 text-sm">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LoggersPage