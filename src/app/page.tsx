'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

// 使用動態導入，確保Canvas組件只在客戶端渲染
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
      加載畫布中...
    </div>
  ),
});

// 常用漢字列表
const commonCharacters = ['大', '小', '中', '水', '火', '山', '木', '人', '口', '日', '月', '金', '土'];

// 可選字體列表
const fontStyles = [
  { id: 'kaiti', name: '楷書', fontFamily: '"KaiTi", "楷体", "STKaiti", "华文楷体", serif' },
  { id: 'songti', name: '宋體', fontFamily: '"SimSun", "宋体", "STSong", "华文宋体", serif' },
  { id: 'heiti', name: '黑體', fontFamily: '"SimHei", "黑体", "STHeiti", "华文黑体", sans-serif' },
  { id: 'fangsong', name: '仿宋', fontFamily: '"FangSong", "仿宋", "STFangsong", "华文仿宋", serif' }
];

export default function Home() {
  // 顏色和筆刷尺寸狀態
  const [brushColor, setBrushColor] = useState('#FF4500');
  const [brushSize, setBrushSize] = useState(30);
  const [bgColor, setBgColor] = useState('#ffffff');
  
  // 當前練習的漢字
  const [currentCharacter, setCurrentCharacter] = useState('大');
  
  // 自定義漢字輸入
  const [customCharacter, setCustomCharacter] = useState('');
  
  // 當前選擇的字體
  const [currentFontStyle, setCurrentFontStyle] = useState(fontStyles[0]);
  
  // 使用預定義顏色列表避免隨機性
  const changeBackground = () => {
    const colors = [
      '#FF5733', '#33FF57', '#3357FF', '#FF33F5', 
      '#33FFF5', '#F5FF33', '#FF3333', '#33FF33'
    ];
    const currentIndex = colors.indexOf(bgColor);
    const nextIndex = (currentIndex + 1) % colors.length;
    setBgColor(colors[nextIndex]);
  };
  
  // 設置練習漢字
  const setCharacter = (char: string) => {
    setCurrentCharacter(char);
  };
  
  // 提交自定義漢字
  const handleCustomCharacter = (e: React.FormEvent) => {
    e.preventDefault();
    if (customCharacter.trim() && customCharacter.length === 1) {
      setCurrentCharacter(customCharacter);
      setCustomCharacter('');
    }
  };

  return (
    <div className="container">
      <main>
        <h1 className="title">漢字遮罩繪圖工具</h1>
        
        <div className="character-selector" style={{
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div>
            <h3 style={{ marginBottom: '10px', textAlign: 'center' }}>選擇練習字</h3>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '8px', 
              justifyContent: 'center',
              maxWidth: '600px'
            }}>
              {commonCharacters.map(char => (
                <button 
                  key={char}
                  onClick={() => setCharacter(char)}
                  style={{
                    width: '40px',
                    height: '40px',
                    fontSize: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: currentCharacter === char ? '#4caf50' : '#f0f0f0',
                    color: currentCharacter === char ? 'white' : 'black',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontFamily: currentFontStyle.fontFamily
                  }}
                >
                  {char}
                </button>
              ))}
            </div>
          </div>
          
          <div style={{ margin: '10px 0' }}>
            <form onSubmit={handleCustomCharacter} style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={customCharacter}
                onChange={(e) => setCustomCharacter(e.target.value)}
                maxLength={1}
                placeholder="輸入自定義漢字"
                style={{
                  padding: '8px',
                  fontSize: '16px',
                  width: '150px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontFamily: currentFontStyle.fontFamily
                }}
              />
              <button 
                type="submit"
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                使用此字
              </button>
            </form>
          </div>
          
          {/* 字體風格選擇 */}
          <div style={{ margin: '10px 0', width: '100%', maxWidth: '600px' }}>
            <h3 style={{ marginBottom: '10px', textAlign: 'center' }}>選擇字體風格</h3>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '8px', 
              justifyContent: 'center'
            }}>
              {fontStyles.map(font => (
                <button 
                  key={font.id}
                  onClick={() => setCurrentFontStyle(font)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: currentFontStyle.id === font.id ? '#4caf50' : '#f0f0f0',
                    color: currentFontStyle.id === font.id ? 'white' : 'black',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontFamily: font.fontFamily,
                    fontSize: '16px'
                  }}
                >
                  {font.name}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="controls">
          <div className="size-control">
            <span>畫筆大小: </span>
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
          <button onClick={changeBackground}>更換背景顏色</button>
        </div>
        
        <div className="canvas-container" style={{ backgroundColor: bgColor }}>
          <DrawingCanvas 
            brushColor={brushColor} 
            brushSize={brushSize} 
            bgColor={bgColor}
            character={currentCharacter}
            fontStyle={currentFontStyle.fontFamily}
          />
        </div>
        
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p>當前練習: <strong style={{ fontSize: '24px', fontFamily: currentFontStyle.fontFamily }}>{currentCharacter}</strong></p>
          <p>字體風格: <span style={{ fontFamily: currentFontStyle.fontFamily }}>{currentFontStyle.name}</span></p>
        </div>
      </main>
    </div>
  );
}