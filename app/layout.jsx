// app/layout.js
import './globals.css';

export const metadata = {
  title: 'LeetCode Tracker',
  description: 'Track and analyze your LeetCode progress',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}