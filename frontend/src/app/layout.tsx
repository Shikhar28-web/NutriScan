import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NutriScan AI — Know What You Eat',
  description:
    'AI-powered food health analysis. Scan any packaged food barcode and get instant health insights, disease risk assessments, and personalized nutrition guidance.',
  keywords: ['nutrition', 'food scanner', 'health', 'AI', 'barcode', 'ingredient analysis'],
  openGraph: {
    title: 'NutriScan AI',
    description: 'Scan your food. Know what you eat.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg-primary text-white antialiased">{children}</body>
    </html>
  );
}
