import './globals.css';
import Providers from './components/Providers';
import ConditionalLayout from './components/ConditionalLayout';

export const metadata = {
  title: 'BPIT Pulse — Social Media Sentiment Analyser',
  description: 'Sentiment analysis dashboard for Bhagwan Parshuram Institute of Technology.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Hind:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body>
        <Providers>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </Providers>
      </body>
    </html>
  );
}