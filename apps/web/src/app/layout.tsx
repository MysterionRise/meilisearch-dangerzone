import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Meilisearch Hybrid Search Demo',
  description: 'Explore the power of hybrid search combining keyword and semantic search',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
