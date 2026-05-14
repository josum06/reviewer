'use client';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

export default function ConditionalLayout({ children }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // Never show header/footer on auth pages
  const isAuthPage = pathname?.startsWith('/auth');

  // Show header/footer only when signed in and not on auth pages
  const showLayout = !isAuthPage && status === 'authenticated';

  return (
    <>
      {showLayout && <Header />}
      <main>{children}</main>
      {showLayout && <Footer />}
    </>
  );
}