import { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'ACNA',
  description: 'American Central News Agency',
  icons: {
    icon: '/acna-icon.png',
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body suppressHydrationWarning>
        <main>{children}</main>
      </body>
    </html>
  );
}
