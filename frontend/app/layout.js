import './globals.css';

export const metadata = {
  title: 'Japanese Learning Hub',
  description: 'Track your Japanese learning progress across multiple apps',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
