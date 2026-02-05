import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'Agent Tools - Deterministic Data Tools',
  description:
    'Agent Tools is an agent-driven platform for deterministic data transformation and formatting. Designed for MCP and A2A systems.',
  keywords: ['data transformation', 'JSON', 'CSV', 'PDF', 'MCP', 'A2A', 'agents'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
