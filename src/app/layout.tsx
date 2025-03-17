import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '汉字"大"遮罩绘图工具',
  description: '在汉字"大"的形状内进行创意绘图',
  // 添加适合静态网站的元数据
  viewport: 'width=device-width, initial-scale=1',
  authors: [{ name: '作者名称' }],
  keywords: ['汉字', '绘图', '创意', '遮罩绘图'],
  // 给搜索引擎指明这是静态页面
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}