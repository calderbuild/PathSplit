import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PathSplit - 人生平行宇宙',
  description: '一个把人生决策变成可追问产品体验的应用: 三条路径，一张证据卡，一次真人继续追问。',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
