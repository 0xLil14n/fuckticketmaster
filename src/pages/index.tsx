import Head from 'next/head';
import Image from 'next/image';
import { Inter } from 'next/font/google';
import styles from '@/styles/Home.module.css';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Header from '@/components/header';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  return (
    <>
      <Head>
        <title>fuckticketmaster</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={`${styles.main} ${styles.description}`}>
        <div>
          <h1>fuckticketmaster</h1>
        </div>
      </main>
    </>
  );
}
