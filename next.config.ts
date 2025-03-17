/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用静态输出
  output: 'export',
  
  // 禁用图像优化，这对静态输出是必要的
  images: {
    unoptimized: true,
  },
  
  // 如果需要部署到子目录，取消注释并修改这一行
  // basePath: '/drawing-app',
  
  // 提高构建和开发性能
  poweredByHeader: false,
  reactStrictMode: true,
  
  // 压缩输出
  compress: true,
  
  // 缓存优化
  onDemandEntries: {
    // 页面保持在内存中的时间（开发模式）
    maxInactiveAge: 60 * 1000,
    // 同时保持在内存中的页面数量
    pagesBufferLength: 2,
  },
  
  // 自定义webpack配置
  webpack: (config) => {
    // 优化打包大小
    config.optimization = {
      ...config.optimization,
      minimize: true,
    };
    
    return config;
  },
};

export default nextConfig;