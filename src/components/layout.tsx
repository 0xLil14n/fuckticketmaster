import Header from './header';
import styles from '@/styles/Home.module.css';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className={` ${styles.description}`}>
      <Header />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
