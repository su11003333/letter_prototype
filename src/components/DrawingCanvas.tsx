'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';

interface DrawingCanvasProps {
  brushColor: string;
  brushSize: number;
  bgColor: string;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ brushColor, brushSize, bgColor }) => {
  // 三個畫布層的引用
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);  // 底層 - 背景
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);     // 中間層 - 繪圖層
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);        // 頂層 - 遮罩層
  
  // 離屏畫布，用於遮罩操作
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState<{ x: number, y: number } | null>(null);
  const [canvasSize, setCanvasSize] = useState(600);
  const [characterMask, setCharacterMask] = useState<HTMLCanvasElement | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  // 創建字符遮罩
  const createCharacterMask = useCallback((size: number) => {
    // 創建臨時畫布存儲遮罩形狀
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = size;
    tempCanvas.height = size;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (tempCtx) {
      // 繪製漢字"大"
      tempCtx.fillStyle = 'white';  // 使用白色表示可繪製區域
      const fontSize = Math.floor(size * 0.85);
      tempCtx.font = `bold ${fontSize}px "SimHei", "Microsoft YaHei", sans-serif`;
      tempCtx.textAlign = 'center';
      tempCtx.textBaseline = 'middle';
      tempCtx.fillText('大', size / 2, size / 2);
    }
    
    return tempCanvas;
  }, []);
  
  // 初始化背景
  const initBackground = useCallback(() => {
    const canvas = backgroundCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 設置背景顏色
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [bgColor]);
  
  // 繪製遮罩和可視區域指示
  const drawMask = useCallback(() => {
    const canvas = maskCanvasRef.current;
    if (!canvas || !characterMask) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 清除遮罩畫布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 繪製半透明的灰色背景表示不可繪製區域
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.globalCompositeOperation = 'destination-out';
    
    // 繪製漢字"大"形狀的洞
    ctx.drawImage(characterMask, 0, 0);
    
    // 重置混合模式
    ctx.globalCompositeOperation = 'source-over';
  }, [characterMask]);
  
  // 在離屏畫布上繪製，然後應用遮罩
  const drawToOffscreen = useCallback((fromX: number, fromY: number, toX: number, toY: number) => {
    if (!offscreenCanvasRef.current || !drawingCanvasRef.current || !characterMask) return;
    
    const offscreenCtx = offscreenCanvasRef.current.getContext('2d');
    const drawCtx = drawingCanvasRef.current.getContext('2d');
    
    if (!offscreenCtx || !drawCtx) return;
    
    // 清除離屏畫布
    offscreenCtx.clearRect(0, 0, canvasSize, canvasSize);
    // 複製當前繪圖到離屏畫布
    offscreenCtx.drawImage(drawingCanvasRef.current, 0, 0);
    
    // 在離屏畫布上繪製新線條
    offscreenCtx.strokeStyle = brushColor;
    offscreenCtx.lineWidth = brushSize;
    offscreenCtx.lineCap = 'round';
    offscreenCtx.lineJoin = 'round';
    
    offscreenCtx.beginPath();
    offscreenCtx.moveTo(fromX, fromY);
    offscreenCtx.lineTo(toX, toY);
    offscreenCtx.stroke();
    
    // 繪製端點
    offscreenCtx.fillStyle = brushColor;
    offscreenCtx.beginPath();
    offscreenCtx.arc(toX, toY, brushSize / 2, 0, Math.PI * 2);
    offscreenCtx.fill();
    
    // 清除繪圖畫布
    drawCtx.clearRect(0, 0, canvasSize, canvasSize);
    
    // 設置繪圖畫布混合模式，先正常繪製
    drawCtx.globalCompositeOperation = 'source-over';
    // 繪製離屏畫布內容
    drawCtx.drawImage(offscreenCanvasRef.current, 0, 0);
    
    // 應用遮罩：設置混合模式為只在字符形狀內顯示
    drawCtx.globalCompositeOperation = 'destination-in';
    drawCtx.drawImage(characterMask, 0, 0);
    
    // 重置混合模式
    drawCtx.globalCompositeOperation = 'source-over';
  }, [canvasSize, brushColor, brushSize]);
  
  // 在客戶端初始化
  useEffect(() => {
    setIsClient(true);
    
    // 計算畫布尺寸，適應不同屏幕
    const size = Math.min(600, window.innerWidth - 40);
    setCanvasSize(size);
    
    // 創建離屏畫布
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = size;
    offscreenCanvas.height = size;
    offscreenCanvasRef.current = offscreenCanvas;
    
    // 創建字符遮罩
    const mask = createCharacterMask(size);
    setCharacterMask(mask);
    
    // 監聽窗口大小變化
    const handleResize = () => {
      const newSize = Math.min(600, window.innerWidth - 40);
      if (newSize !== canvasSize) {
        setCanvasSize(newSize);
        
        // 更新離屏畫布
        const newOffscreenCanvas = document.createElement('canvas');
        newOffscreenCanvas.width = newSize;
        newOffscreenCanvas.height = newSize;
        offscreenCanvasRef.current = newOffscreenCanvas;
        
        // 更新字符遮罩
        const newMask = createCharacterMask(newSize);
        setCharacterMask(newMask);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [canvasSize, createCharacterMask]);
  
  // 當背景顏色、畫布大小或遮罩變化時，重新初始化
  useEffect(() => {
    if (isClient && characterMask) {
      initBackground();
      drawMask();
    }
  }, [bgColor, canvasSize, isClient, characterMask, initBackground, drawMask]);
  
  // 處理事件 - 統一鼠標和觸摸事件
  const getEventPosition = useCallback((e: React.MouseEvent | React.TouchEvent): { x: number, y: number } | null => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;
    
    // 判斷是鼠標事件還是觸摸事件
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }, []);
  
  // 鼠標/觸摸按下事件處理
  const handleStart = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    
    const pos = getEventPosition(e);
    if (!pos) return;
    
    setLastPos(pos);
    
    // 開始繪製
    drawToOffscreen(pos.x, pos.y, pos.x, pos.y);
  }, [getEventPosition, drawToOffscreen]);
  
  // 鼠標/觸摸移動事件處理
  const handleMove = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPos) return;
    
    const pos = getEventPosition(e);
    if (!pos) return;
    
    // 繪製線段
    drawToOffscreen(lastPos.x, lastPos.y, pos.x, pos.y);
    
    // 更新上一個位置
    setLastPos(pos);
  }, [isDrawing, lastPos, getEventPosition, drawToOffscreen]);
  
  // 鼠標/觸摸釋放事件處理
  const handleEnd = useCallback(() => {
    setIsDrawing(false);
    setLastPos(null);
  }, []);
  
  // 清除繪圖
  const clearCanvas = useCallback(() => {
    const canvas = drawingCanvasRef.current;
    
    if (canvas) {
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // 清空繪圖層
        ctx.clearRect(0, 0, canvasSize, canvasSize);
      }
    }
  }, [canvasSize]);
  
  // 下載圖像
  const downloadImage = useCallback(() => {
    const backgroundCanvas = backgroundCanvasRef.current;
    const drawingCanvas = drawingCanvasRef.current;
    
    if (!backgroundCanvas || !drawingCanvas) return;
    
    // 創建合成畫布
    const compositeCanvas = document.createElement('canvas');
    compositeCanvas.width = canvasSize;
    compositeCanvas.height = canvasSize;
    const compCtx = compositeCanvas.getContext('2d');
    
    if (!compCtx) return;
    
    // 繪製背景
    compCtx.drawImage(backgroundCanvas, 0, 0);
    
    // 繪製已經應用了遮罩的繪圖畫布
    compCtx.drawImage(drawingCanvas, 0, 0);
    
    // 創建下載鏈接
    const link = document.createElement('a');
    link.download = '汉字大绘图.png';
    link.href = compositeCanvas.toDataURL('image/png');
    link.click();
  }, [canvasSize]);
  
  // 如果不在客戶端，返回null
  if (!isClient) {
    return null;
  }
  
  // 畫布的共用樣式
  const canvasStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: '4px'
  };
  
  return (
    <div style={{ width: canvasSize, margin: '0 auto' }}>
      <div className="canvas-buttons" style={{ marginBottom: '10px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <button onClick={clearCanvas} style={{ padding: '5px 10px' }}>清除绘图</button>
        <button onClick={downloadImage} style={{ padding: '5px 10px' }}>下载图片</button>
      </div>
      
      <div style={{ position: 'relative', width: canvasSize, height: canvasSize, margin: '0 auto', border: '1px solid #ccc', borderRadius: '4px' }}>
        {/* 底層 - 背景層 */}
        <canvas
          ref={backgroundCanvasRef}
          width={canvasSize}
          height={canvasSize}
          style={{
            ...canvasStyle,
            zIndex: 1
          }}
        />
        
        {/* 中間層 - 繪圖層，已經應用了遮罩 */}
        <canvas
          ref={drawingCanvasRef}
          width={canvasSize}
          height={canvasSize}
          style={{
            ...canvasStyle,
            zIndex: 2
          }}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />
        
        {/* 頂層 - 遮罩層，顯示灰色遮罩和"大"字形狀的透明區域 */}
        <canvas
          ref={maskCanvasRef}
          width={canvasSize}
          height={canvasSize}
          style={{
            ...canvasStyle,
            zIndex: 3,
            pointerEvents: 'none' // 不接收鼠標事件，讓事件透過到繪圖層
          }}
        />
      </div>
      
      <div style={{ marginTop: '10px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
        請在"大"字範圍內繪圖，只有大字內的筆畫會被顯示
      </div>
    </div>
  );
};

export default DrawingCanvas;