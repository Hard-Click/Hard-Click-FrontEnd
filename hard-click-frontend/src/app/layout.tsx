import './globals.css';
import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        {children}

        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
