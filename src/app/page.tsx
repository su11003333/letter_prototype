'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

// 使用动态导入，确保Canvas组件只在客户端渲染
const DrawingCanvas = dynamic(() => import('@/components/DrawingCanvas'), {
  ssr: false,
  loading: () => (
    <div style={{ 
      width: '100%', 
      height: '600px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f0f0f0',
      borderRadius: '4px'
    }}>
      加载画布中...
    </div>
  ),
});

export default function Home() {
  const [brushColor, setBrushColor] = useState('#FF4500');
  const [brushSize, setBrushSize] = useState(60);
  const [bgColor, setBgColor] = useState('#ffffff');
  
  // 使用预定义颜色列表避免随机性
  const changeBackground = () => {
    const colors = [
      '#FF5733', '#33FF57', '#3357FF', '#FF33F5', 
      '#33FFF5', '#F5FF33', '#FF3333', '#33FF33'
    ];
    const currentIndex = colors.indexOf(bgColor);
    const nextIndex = (currentIndex + 1) % colors.length;
    setBgColor(colors[nextIndex]);
  };

  return (
    <div className="container">
      <main>
        <h1 className="title">汉字"大"遮罩绘图工具</h1>
        
        <div className="controls">
          <div className="size-control">
            <span>画笔大小: </span>
            <input 
              type="range" 
              min="1" 
              max="120" 
              value={brushSize} 
              onChange={(e) => setBrushSize(parseInt(e.target.value))} 
            />
            <span>{brushSize}px</span>
          </div>
          <input 
            type="color" 
            value={brushColor} 
            onChange={(e) => setBrushColor(e.target.value)} 
          />
          <button onClick={changeBackground}>更换背景颜色</button>
        </div>
        
        <div className="canvas-container" style={{ backgroundColor: bgColor }}>
          <DrawingCanvas 
            brushColor={brushColor} 
            brushSize={brushSize} 
            bgColor={bgColor}
          />
        </div>
      </main>
    </div>
  );
}