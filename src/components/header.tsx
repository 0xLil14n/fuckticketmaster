import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';
import styles from './header.module.css';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

// The approach used in this component shows how to build a sign in and sign out
// component that works on pages which support both client and server side
// rendering, and avoids any flash incorrect content on initial page load.
export default function Header() {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const { address } = useAccount();

  return (
    <header>
      <noscript>
        <style>{`.nojs-show { opacity: 1; top: 0; }`}</style>
      </noscript>
      <div className={styles.container}>
        <div>
          <h1 className={styles.logo}>ftm</h1>
          <h4 className={styles.sublogo}>fuckticketmaster</h4>
        </div>
        <div>
          <div className={styles.signedInStatus}>
            <ConnectButton />
          </div>
          <nav className={styles.nav}>
            <ul className={styles.navItems}>
              <li className={styles.navItem}>
                <Link href="/browse">browse</Link>
              </li>
              {session && (
                <li className={styles.navItem}>
                  <Link href="/listing">list tickets</Link>
                </li>
              )}
              <li className={styles.navItem}>
                <Link href="/orderhistory">order history</Link>
              </li>
              {session && (
                <li className={styles.navItem}>
                  <Link href={`/listings/${address}`}>my listings</Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
