'use client';
import React, { useEffect, useState } from 'react';
import styles from './ticket.module.css';
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi';

import { ethers } from 'ethers';
import FlipCard, { BackCard, FrontCard } from './card';
import { ABI, SEPOLIA_ADDR } from '../../contractdetails';
import { gql, useQuery } from '@apollo/client';
import useGetPriceInUsd from '@/hooks/useGetPriceInUsd';

type Props = {
  ticketId: number;
  isResale: boolean;
};

const eventsQuery = gql`
  query EventsQuery($eventId: String!) {
    event(id: $eventId) {
      eventName
      date
      id
      venueName
      eventOwner {
        id
      }
    }
  }
`;
const Ticket: React.FC<Props> = ({ ticketId, isResale }) => {
  const { data: eventsData, loading } = useQuery(eventsQuery, {
    variables: { eventId: ticketId.toString() },
  });
  const getPriceInUsd = useGetPriceInUsd();
  const [qty, setQty] = useState(1);
  const { data } = useContractRead({
    address: SEPOLIA_ADDR,
    abi: ABI,
    functionName: 'tokenListPrices',
    args: [BigInt(ticketId)],
    onError(error) {
      console.log('error', error);
    },
  });

  const [totalPrice, setTotalPrice] = useState<BigInt>(BigInt(0));

  const {
    data: mintData,
    isLoading: isMintLoading,
    isSuccess: isMintStarted,
    write: purchaseTicket,
    isError: isMintError,
  } = useContractWrite({
    address: SEPOLIA_ADDR,
    abi: ABI,
    functionName: 'publicMint',
    args: [ticketId, qty],
  });

  let wei = data ? data : BigInt(0);

  const priceInUsd = getPriceInUsd(wei as ethers.BigNumberish);

  const [price, setPrice] = useState(priceInUsd);
  useEffect(() => {
    setPrice(priceInUsd);
  }, [priceInUsd]);

  const { isSuccess: txSuccess } = useWaitForTransaction({
    hash: mintData?.hash,
  });

  const isMinted = txSuccess;

  useEffect(() => {
    setTotalPrice((wei as bigint) * BigInt(qty));
  }, [qty, price, wei]);

  return (
    <section className={styles.container}>
      <FlipCard>
        <FrontCard isCardFlipped={isMinted}>
          <div className={` ${styles.ticketcontainer} ${styles.ticket}`}>
            <div className={styles.ticketTitle}>
              <h1>{eventsData?.event.eventName}</h1>
              <h2>{eventsData?.event.venueName}</h2>
              <h2>{eventsData?.event.date}</h2>

              <h3>${price}/ticket</h3>
              {isResale && <p>certified resale</p>}
            </div>

            <form className={styles.form}>
              <div className={styles.quantity}>
                <button
                  disabled={qty == 0}
                  type="button"
                  name="sub"
                  onClick={() => setQty((q) => q - 1)}
                  className={styles.qtyButton}
                >
                  -
                </button>
                <label htmlFor="quantity">{qty}</label>
                <button
                  type="button"
                  name="add"
                  onClick={() => setQty((q) => q + 1)}
                  className={styles.qtyButton}
                >
                  +
                </button>
              </div>
              <button
                disabled={isMintLoading || isMintStarted}
                onClick={async (e) => {
                  e.preventDefault();

                  purchaseTicket?.({
                    value: totalPrice as bigint,
                  });
                }}
                className={styles.button}
                data-mint-loading={isMintLoading}
                data-mint-started={isMintStarted}
              >
                {isMintLoading && 'Waiting for approval'}
                {isMintStarted && 'Purchasing...'}
                {!isMintLoading && !isMintStarted && 'Purchase'}
              </button>
            </form>
          </div>
        </FrontCard>
        <BackCard isCardFlipped={isMinted}>
          <div className={styles.backcard}>
            <div>Purchased successfully!</div>
            <a
              target="_blank"
              href={`https://sepolia.etherscan.io/tx/${mintData?.hash}`}
              style={{ color: 'blue' }}
            >
              View on Etherscan
            </a>
          </div>
        </BackCard>
      </FlipCard>
    </section>
  );
};
export default Ticket;
