import React, { useEffect, useState, useCallback } from 'react';
import { useWebRTC } from '@/hooks/useWebRTC';

interface MeetingLoggerProps {
  userId: string;
}

interface LogEntry {
  id: string;
  timestamp: number;
  type: 'join' | 'leave' | 'share' | 'message' | 'decision';
  user: string;
  content: string;
}

export const MeetingLogger: React.FC<MeetingLoggerProps> = ({ userId }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const { on, off, sendData } = useWebRTC(userId);

  const addLog = useCallback((type: LogEntry['type'], content: string) => {
    const logEntry: LogEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      type,
      user: 'System',
      content
    };
    setLogs(prev => [...prev, logEntry]);
    sendData({
      type: 'meetingLog',
      log: logEntry
    });
  }, [sendData]);

  useEffect(() => {
    // 處理日誌消息
    const handleLog = (logEntry: LogEntry) => {
      setLogs(prev => [...prev, logEntry]);
    };

    // 處理各種事件
    const handleScreenShare = () => addLog('share', '開始畫面共享');
    const handleScreenShareStop = () => addLog('share', '結束畫面共享');

    // 註冊事件監聽
    on('meetingLog', handleLog);
    on('screenShare', handleScreenShare);
    on('screenShareStop', handleScreenShareStop);

    // 清理函數
    return () => {
      off('meetingLog', handleLog);
      off('screenShare', handleScreenShare);
      off('screenShareStop', handleScreenShareStop);
    };
  }, [on, off, addLog]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-2">
      {logs.map(log => (
        <div
          key={log.id}
          className="text-sm"
        >
          <span className="text-gray-400">{formatTime(log.timestamp)}</span>
          <span className="mx-2">-</span>
          <span className="font-medium">{log.user}</span>
          <span className="mx-2">
            {log.type === 'join' && '加入會議'}
            {log.type === 'leave' && '離開會議'}
            {log.type === 'share' && '畫面共享'}
            {log.type === 'message' && '發送訊息'}
            {log.type === 'decision' && '做出決定'}
          </span>
          <span className="text-gray-300">{log.content}</span>
        </div>
      ))}
    </div>
  );
};
