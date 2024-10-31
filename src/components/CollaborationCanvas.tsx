import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useWebRTC } from "@/hooks/useWebRTC";
import { DrawingData, Point, AISuggestion } from "@/services/webrtc";
import throttle from 'lodash/throttle';
import { Canvas } from 'react-three-fiber';
import { OrbitControls } from '@react-three/drei';
import ReactFlow, { Background, Controls } from 'react-flow-renderer';

interface DrawingOptions {
  color: string;
  width: number;
  tool: 'pencil' | 'line' | 'rectangle' | 'circle' | 'eraser';
}

interface CursorPosition {
  userId: string;
  x: number;
  y: number;
}

interface Layer {
  id: string;
  visible: boolean;
  locked: boolean;
  data: string;
}

interface CanvasState {
  version: number;
  data: string;
  timestamp: number;
}

export const CollaborationCanvas: React.FC<{ userId: string }> = ({ userId }) => {
  // 基本繪圖狀態
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const { on, sendData } = useWebRTC(userId);

  // 繪圖選項
  const [drawingOptions, setDrawingOptions] = useState<DrawingOptions>({
    color: '#ffffff',
    width: 2,
    tool: 'pencil'
  });

  // 歷史記錄
  const [history, setHistory] = useState<DrawingData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // 游標和圖層管理
  const [cursors, setCursors] = useState<Map<string, CursorPosition>>(new Map());
  const [layers, setLayers] = useState<Layer[]>([
    { id: 'base', visible: true, locked: false, data: '' }
  ]);
  const [activeLayer, setActiveLayer] = useState('base');

  // 視圖控制
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [pointBuffer, setPointBuffer] = useState<Point[]>([]);

  // AI 建議
  const [aiSuggestions, setAISuggestions] = useState<AISuggestion[]>([]);

  // 初始化和清理
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    // 設置畫布尺寸
    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      context.scale(window.devicePixelRatio, window.devicePixelRatio);
      context.translate(offset.x, offset.y);
      context.scale(scale, scale);
    };

    resize();
    window.addEventListener('resize', resize);
    contextRef.current = context;

    // 載入自動保存的數據
    const savedData = localStorage.getItem('canvas-autosave');
    if (savedData) {
      const img = new Image();
      img.onload = () => {
        context.drawImage(img, 0, 0);
      };
      img.src = savedData;
    }

    // 自動保存
    const autoSave = setInterval(() => {
      const data = canvas.toDataURL();
      localStorage.setItem('canvas-autosave', data);
    }, 30000);

    return () => {
      window.removeEventListener('resize', resize);
      clearInterval(autoSave);
    };
  }, [offset, scale]);

  // 事件處理器
  useEffect(() => {
    // 處理其他用戶的繪圖
    const handleDrawing = (data: DrawingData) => {
      drawFromPoints(data.points, data.color, data.width);
    };

    // 處理游標更新
    const handleCursor = (data: CursorPosition) => {
      setCursors(prev => new Map(prev).set(data.userId, data));
    };

    // 處理畫布同步
    const handleSync = (data: CanvasState) => {
      if (!canvasRef.current || !contextRef.current) return;
      const img = new Image();
      img.onload = () => {
        contextRef.current?.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
        contextRef.current?.drawImage(img, 0, 0);
      };
      img.src = data.data;
    };

    // 處理 AI 建議
    const handleAISuggestion = (data: AISuggestion) => {
      setAISuggestions(prev => [...prev, data]);
    };

    // 使用 data 事件進行數據傳輸
    const handleData = (data: any) => {
      switch(data.type) {
        case 'drawing':
          handleDrawing(data);
          break;
        case 'cursor':
          handleCursor(data);
          break;
        case 'sync':
          handleSync(data);
          break;
        case 'ai-suggestion':
          handleAISuggestion(data);
          break;
      }
    };

    on('data', handleData);

    return () => {
      // 清理事件監聽
    };
  }, [on]);

  // 繪圖功能
  const drawFromPoints = useCallback((points: Point[], color: string, width: number) => {
    if (!contextRef.current || points.length < 2) return;

    const context = contextRef.current;
    context.save();
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      context.lineTo(points[i].x, points[i].y);
    }

    context.strokeStyle = color;
    context.lineWidth = width;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.stroke();
    context.restore();
  }, []);

  // 節流的繪圖發送
  const sendDrawingData = useCallback(
    throttle((points: Point[]) => {
      sendData({
        type: 'drawing' as const,
        points,
        color: drawingOptions.color,
        width: drawingOptions.width
      });
      setPointBuffer([]);
    }, 16),
    [drawingOptions, sendData]
  );

  // 鼠標事件處理
  const startDrawing = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const point = {
      x: (e.clientX - rect.left) / scale - offset.x,
      y: (e.clientY - rect.top) / scale - offset.y
    };

    setIsDrawing(true);
    setPointBuffer([point]);
    
    sendData({
      type: 'drawing' as const,
      points: [point],
      color: drawingOptions.color,
      width: drawingOptions.width
    });
  }, [scale, offset, drawingOptions, sendData]);

  const draw = useCallback((e: React.MouseEvent) => {
    if (!isDrawing || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const point = {
      x: (e.clientX - rect.left) / scale - offset.x,
      y: (e.clientY - rect.top) / scale - offset.y
    };

    setPointBuffer(prev => {
      const newBuffer = [...prev, point];
      if (newBuffer.length >= 3) {
        sendDrawingData(newBuffer);
        return [];
      }
      return newBuffer;
    });

    // 更新游標位置
    sendData({
      type: 'cursor',
      userId,
      x: point.x,
      y: point.y
    });
  }, [isDrawing, scale, offset, userId, sendData, sendDrawingData]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    if (pointBuffer.length > 0) {
      sendDrawingData(pointBuffer);
    }
  }, [pointBuffer, sendDrawingData]);

  // 歷史控制
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      // 實現撤銷邏輯
    }
  }, [historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      // 實現重做邏輯
    }
  }, [historyIndex, history.length]);

  // 工具欄控制
  const handleToolChange = (tool: DrawingOptions['tool']) => {
    setDrawingOptions(prev => ({ ...prev, tool }));
  };

  const handleColorChange = (color: string) => {
    setDrawingOptions(prev => ({ ...prev, color }));
  };

  const handleWidthChange = (width: number) => {
    setDrawingOptions(prev => ({ ...prev, width }));
  };

  // 縮放控制
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setScale(prev => Math.max(0.1, Math.min(5, prev * delta)));
    }
  }, []);

  // 渲染游標
  const renderCursors = () => {
    return Array.from(cursors.entries()).map(([userId, pos]) => (
      <div
        key={userId}
        className="absolute w-4 h-4 border-2 border-white rounded-full pointer-events-none"
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      />
    ));
  };

  // 渲染 AI 建議
  const renderAISuggestions = () => {
    return aiSuggestions.map(suggestion => (
      <div key={suggestion.id} className="p-2 bg-gray-800 text-white rounded mb-2">
        <p>{suggestion.content}</p>
        <span className="text-xs text-gray-400">{new Date(suggestion.timestamp).toLocaleString()}</span>
      </div>
    ));
  };

  return (
    <div className="relative w-full h-full" onWheel={handleWheel}>
      <canvas
        ref={canvasRef}
        className="w-full h-full bg-transparent"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
      {renderCursors()}
      
      {/* 工具欄 - 可以根據需要添加到適當位置 */}
      <div className="absolute top-4 left-4 flex gap-2">
        <button onClick={() => handleToolChange('pencil')}>鉛筆</button>
        <button onClick={() => handleToolChange('eraser')}>橡皮擦</button>
        <input 
          type="color" 
          value={drawingOptions.color}
          onChange={e => handleColorChange(e.target.value)}
        />
        <input 
          type="range" 
          min="1" 
          max="20" 
          value={drawingOptions.width}
          onChange={e => handleWidthChange(parseInt(e.target.value))}
        />
        <button onClick={undo}>撤銷</button>
        <button onClick={redo}>重做</button>
      </div>

      {/* 2D 視圖 */}
      <div className="absolute top-4 right-4 w-1/2 h-1/2 bg-white">
        <ReactFlow>
          <Background />
          <Controls />
        </ReactFlow>
      </div>

      {/* 3D 視圖 */}
      <div className="absolute bottom-4 right-4 w-1/2 h-1/2 bg-white">
        <Canvas>
          <OrbitControls />
          {/* 這裡可以添加 3D 圖形 */}
        </Canvas>
      </div>

      {/* AI 建議 */}
      <div className="absolute bottom-4 left-4 w-1/4 h-1/4 bg-white p-2 overflow-y-auto">
        {renderAISuggestions()}
      </div>
    </div>
  );
};
