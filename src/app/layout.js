import { Toaster } from 'react-hot-toast';
import '../styles/globals.css';

export const metadata = {
  title: 'RentFlow — Rent Management System',
  description: 'Modern rent management for landlords and property owners',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-surface text-slate-100 min-h-screen antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e1e35',
              color: '#e2e8f0',
              border: '1px solid #2a2a4a',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#34d399', secondary: '#1e1e35' } },
            error: { iconTheme: { primary: '#f87171', secondary: '#1e1e35' } },
          }}
        />
      </body>
    </html>
  );
}
