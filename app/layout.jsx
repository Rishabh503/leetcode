// app/layout.js
import './globals.css';

export const metadata = {
  title: 'LeetCode Tracker',
  description: 'Track and analyze your LeetCode progress',
};

import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}