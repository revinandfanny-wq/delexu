import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'DIKSS BOT PANEL', description: 'Kelola bot WhatsApp dari satu panel.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="id"><body>{children}</body></html>; }
