// pages/meeting-room/[id].tsx
import type { NextPage } from 'next'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  Mic,
  MicOff,
  Share,
  MessageSquare,
  Users,
  Settings,
  Globe,
  Pencil,
  MousePointer2,
  ArrowLeft,
  PanelLeftClose,
  PanelRightClose,
  Focus
} from 'lucide-react'
import { useWebRTC } from '@/hooks/useWebRTC'
import { CollaborationCanvas } from '@/components/CollaborationCanvas'
import { MeetingLogger } from '@/components/MeetingLogger'

interface Message {
  id: number;
  user: string;
  text: string;
  time: string;
  translated: string;
}

const MeetingRoom: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const userId = `user-${Math.random().toString(36).substr(2, 9)}`;

  const {
    isInitialized,
    connectionStatus,
    connectedUsers,
    startAudio,
    stopAudio,
    startScreenShare,
    stopScreenShare,
    on,
    sendData
  } = useWebRTC(userId);

  // 本地狀態
  const [isMuted, setIsMuted] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [chatVisible, setChatVisible] = useState(true);
  const [participantsVisible, setParticipantsVisible] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('zh-TW');
  const [selectedTool, setSelectedTool] = useState<'pointer' | 'pencil'>('pointer');
  const [showLogs, setShowLogs] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      user: '用戶 1',
      text: '我們來討論這個流程圖的改進方案',
      time: '14:00',
      translated: "Let's discuss how to improve this flowchart"
    },
    {
      id: 2,
      user: '用戶 2',
      text: '我認為這個部分可以優化',
      time: '14:01',
      translated: 'I think this part can be optimized'
    },
  ]);

  // 初始化音訊和監聽器
  useEffect(() => {
    if (isInitialized) {
      // 啟動音訊
      startAudio().catch(console.error);

      // 監聽畫面共享
      on('screenShare', (stream: MediaStream) => {
        const videoElement = document.getElementById('sharedScreen') as HTMLVideoElement;
        if (videoElement) {
          videoElement.srcObject = stream;
        }
      });

      // 監聽連接狀態變化
      on('peer-connected', (peerId: string) => {
        console.log(`Peer connected: ${peerId}`);
      });

      on('peer-disconnected', (peerId: string) => {
        console.log(`Peer disconnected: ${peerId}`);
      });
    }

    return () => {
      stopScreenShare();
      stopAudio();
    };
  }, [isInitialized, startAudio, stopAudio, stopScreenShare, on]);

  // 處理畫面共享切換
  const handleShareToggle = async () => {
    try {
      if (isSharing) {
        stopScreenShare();
        setIsSharing(false);
      } else {
        await startScreenShare();
        setIsSharing(true);
      }
    } catch (error) {
      console.error('Screen sharing error:', error);
    }
  };

  // 處理靜音切換
  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    // 實際的音訊處理邏輯
  };

  // 處理消息發送
  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: messages.length + 1,
      user: '我',
      text,
      time: new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      translated: 'Translation in progress...'
    };

    setMessages([...messages, newMessage]);
    
    // 發送消息到其他參與者
    sendData({
      type: 'chat',
      message: newMessage
    });
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* 頂部工具欄 */}
      <div className="h-16 bg-gray-800 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <h1 className="text-lg font-semibold">
            協作會議室 #{id}
            <span className="ml-2 text-sm text-gray-400">
              {connectionStatus === 'connected' ? '已連接' : '連接中...'}
            </span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <select 
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="bg-gray-700 rounded px-2 py-1"
          >
            <option value="zh-TW">中文</option>
            <option value="en">English</option>
            <option value="ja">日本語</option>
          </select>
          
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            設定
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* 左側參與者列表 */}
        {participantsVisible && (
          <div className="w-64 bg-gray-800 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center">
                <Users className="h-4 w-4 mr-2" />
                參與者 ({connectedUsers.length + 1})
              </h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setParticipantsVisible(false)}
              >
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              {/* 當前用戶 */}
              <div className="p-2 rounded flex items-center justify-between hover:bg-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span>我 (主持人)</span>
                </div>
                <span className="text-xs text-gray-400">
                  {isMuted ? '已靜音' : '發言中'}
                </span>
              </div>

              {/* 連接的用戶 */}
              {connectedUsers.map((user) => (
                <div 
                  key={user}
                  className="p-2 rounded flex items-center justify-between hover:bg-gray-700"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400" />
                    <span>{user}</span>
                  </div>
                  <span className="text-xs text-gray-400">參與者</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 中央協作區域 */}
        <div className="flex-1 flex flex-col">
          {/* 工具欄 */}
          <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center px-4 gap-2">
            <Button 
              variant={selectedTool === 'pointer' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTool('pointer')}
            >
              <MousePointer2 className="h-4 w-4" />
            </Button>
            <Button 
              variant={selectedTool === 'pencil' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTool('pencil')}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <div className="h-6 w-px bg-gray-700 mx-2" />
            {!participantsVisible && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setParticipantsVisible(true)}
              >
                <Users className="h-4 w-4" />
              </Button>
            )}
            {!chatVisible && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setChatVisible(true)}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* 共享區域 */}
          <div className="flex-1 p-4 bg-gray-850 relative">
            {isSharing ? (
              <>
                <video
                  id="sharedScreen"
                  autoPlay
                  className="w-full h-full object-contain"
                />
                <CollaborationCanvas userId={userId} />
              </>
            ) : (
              <div className="absolute inset-0 m-4 bg-gray-700 rounded-lg flex items-center justify-center">
                <Button onClick={handleShareToggle}>
                  <Share className="h-4 w-4 mr-2" />
                  開始共享
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* 右側聊天區域 */}
        {chatVisible && (
          <div className="w-80 bg-gray-800 flex flex-col">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className="font-semibold flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                即時翻譯聊天
              </h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setChatVisible(false)}
              >
                <PanelRightClose className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.map((message) => (
                <div key={message.id} className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{message.user}</span>
                    <span className="text-xs text-gray-400">{message.time}</span>
                  </div>
                  <p className="bg-gray-700 rounded-lg p-2">{message.text}</p>
                  <p className="text-sm text-gray-400 mt-1">{message.translated}</p>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-700">
              <input
                type="text"
                placeholder="輸入訊息..."
                className="w-full bg-gray-700 rounded px-3 py-2"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 日誌顯示 */}
      {showLogs && (
        <div className="absolute right-0 top-0 w-80 h-full bg-gray-800">
          <MeetingLogger userId={userId} />
        </div>
      )}

      {/* 底部控制欄 */}
      <div className="h-16 bg-gray-800 border-t border-gray-700 flex items-center justify-center gap-4">
        <Button
          variant={isMuted ? 'destructive' : 'outline'}
          onClick={handleMuteToggle}
        >
          {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>

        <Button
          variant={isSharing ? 'default' : 'outline'}
          onClick={handleShareToggle}
        >
          <Share className="h-4 w-4 mr-2" />
          {isSharing ? '停止共享' : '開始共享'}
        </Button>

        <Button 
          variant="outline"
          onClick={() => setShowLogs(!showLogs)}
        >
          記錄
        </Button>

        <Button 
          variant="destructive" 
          onClick={() => router.push('/task/1')}
        >
          離開會議
        </Button>
      </div>
    </div>
  );
};

export default MeetingRoom;