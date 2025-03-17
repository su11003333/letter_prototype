'use client';

import React, { useState, useEffect, ReactNode } from 'react';

interface NoSSRProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * 禁用服务器端渲染的组件包装器
 * 确保子组件只在客户端渲染
 */
const NoSSR: React.FC<NoSSRProps> = ({ 
  children, 
  fallback = <div style={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>加载中...</div> 
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient ? <>{children}</> : fallback;
};

export default NoSSR;