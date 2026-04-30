'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Posts', href: '/admin/posts' },
  { label: 'Comments', href: '/admin/comments' },
  { label: 'Settings', href: '/admin/about' },

];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [signOutError, setSignOutError] = useState(false);

  const handleSignOut = async () => {
    setSignOutError(false);
    const res = await fetch('/api/auth', { method: 'DELETE' });

    if (!res.ok) {
      setSignOutError(true);
      return;
    }

    router.push('/admin/login');
  };

  return (
    <aside
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: 220,
        height: '100vh',
        background: 'var(--bg2)',
        borderRight: '0.5px solid var(--bdr)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 0',
        zIndex: 100,
      }}
    >
      <Link
        href="/"
        style={{
          fontFamily: 'var(--font-cormorant), serif',
          fontSize: 17,
          fontStyle: 'italic',
          color: 'var(--txt)',
          textDecoration: 'none',
          padding: '0 1.5rem',
          marginBottom: '0.35rem',
          display: 'block',
        }}
      >
        nsisongeffiong.com
      </Link>

      <span
        style={{
          fontFamily: 'var(--font-dm-mono), monospace',
          fontSize: 10,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--txt3)',
          padding: '0 1.5rem',
          marginBottom: '1.5rem',
          display: 'block',
        }}
      >
        Admin
      </span>

      <hr
        style={{
          height: '0.5px',
          background: 'var(--bdr)',
          marginBottom: '1.5rem',
          border: 'none',
        }}
      />

      <nav style={{ flex: 1 }}>
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'block',
                padding: '0.6rem 1.5rem',
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: 11,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                borderLeft: isActive
                  ? '2px solid var(--teal-mid)'
                  : '2px solid transparent',
                color: isActive ? 'var(--teal-mid)' : 'var(--txt2)',
                background: isActive ? 'var(--bg3)' : 'none',
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: '0 1.5rem', marginBottom: '1rem' }}>
        <ThemeToggle />
      </div>

      {signOutError && (
        <p
          style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: 10,
            color: 'var(--danger)',
            padding: '0 1.5rem',
            marginBottom: '0.5rem',
          }}
        >
          Sign out failed. Try again.
        </p>
      )}

      <button
        onClick={handleSignOut}
        type="button"
        style={{
          margin: '1.5rem',
          width: 'calc(100% - 3rem)',
          fontFamily: 'var(--font-dm-mono), monospace',
          fontSize: 10,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          background: 'none',
          border: '0.5px solid var(--bdr2)',
          color: 'var(--txt3)',
          padding: '0.6rem',
          borderRadius: 3,
          cursor: 'pointer',
        }}
      >
        ← Sign out
      </button>
    </aside>
  );
}
