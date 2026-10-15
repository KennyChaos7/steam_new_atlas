import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'NEXT ATLAS · Steam 2026 十月新品节游戏图鉴',description:'探索 Steam 2026 年 10 月新品节官方预览目录，按游戏类型、中文支持和平台寻找下一款心动之作。预览名单非最终阵容。'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="zh-CN"><body>{children}</body></html>}
