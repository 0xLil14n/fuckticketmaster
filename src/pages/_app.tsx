import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import type { AppProps } from 'next/app';
import { configureChains, createConfig, sepolia, WagmiConfig } from 'wagmi';
import {
  arbitrum,
  goerli,
  localhost,
  mainnet,
  optimism,
  polygon,
} from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { SessionProvider } from 'next-auth/react';
import { RainbowKitSiweNextAuthProvider } from '@rainbow-me/rainbowkit-siwe-next-auth';
import Layout from '@/components/layout';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import client from '../../apolloclient';
import { ApolloProvider } from '@apollo/client';

export const { chains, publicClient, webSocketPublicClient } = configureChains(
  [goerli, sepolia],
  [
    publicProvider(),
    // jsonRpcProvider({ rpc: (chain) => ({ http: `127.0.0.1:7545` }) }),
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'RainbowKit App',
  projectId: 'YOUR_PROJECT_ID',
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <SessionProvider session={pageProps.session} refetchInterval={0}>
        <RainbowKitSiweNextAuthProvider>
          <RainbowKitProvider chains={chains}>
            <ApolloProvider client={client}>
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </ApolloProvider>
          </RainbowKitProvider>
        </RainbowKitSiweNextAuthProvider>
      </SessionProvider>
    </WagmiConfig>
  );
}

export default MyApp;
