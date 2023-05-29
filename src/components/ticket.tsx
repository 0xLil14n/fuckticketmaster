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
import { watchContractEvent } from '@wagmi/core';
import { ABI, SEPOLIA_ADDR } from '../../contractdetails';

type Props = {
  ticketId: string;
};
const Ticket: React.FC<Props> = ({ ticketId }) => {
  const [qty, setQty] = useState(1);
  const { data } = useContractRead({
    address: SEPOLIA_ADDR,
    abi: ABI,
    functionName: 'publicPrice',
  });
  const account = useAccount();

  const [totalPrice, setTotalPrice] = useState<BigInt>(BigInt(0));
  const {
    data: mintData,
    isLoading: isMintLoading,
    isSuccess: isMintStarted,
    write,
    isError: isMintError,
  } = useContractWrite({
    address: SEPOLIA_ADDR,
    abi: ABI,
    functionName: 'publicMint',
    args: [ticketId, qty],
  });

  let wei = data ? data : 0;
  const ethPrice = ethers.utils.formatEther(wei as ethers.BigNumberish);
  const [price, setPrice] = useState('0.00');

  const { isSuccess: txSuccess } = useWaitForTransaction({
    hash: mintData?.hash,
  });

  const isMinted = txSuccess;

  const unwatch = watchContractEvent(
    {
      address: SEPOLIA_ADDR,
      abi: ABI,
      eventName: 'TicketSold',
    },

    (log) => {
      console.log('ticket sold', log);
    }
  );
  useEffect(() => {
    (async () => {
      const data = await fetch('/api/fetchUsd');
      const res = await data.json();

      const p = (res.data.ethusd * parseFloat(ethPrice)).toFixed(2);
      setPrice(p);
    })();
    return () => {
      unwatch();
    };
  }, []);

  useEffect(() => {
    setTotalPrice((wei as bigint) * BigInt(qty));
  }, [qty, price]);

  return (
    <section className={styles.container}>
      <FlipCard>
        <FrontCard isCardFlipped={isMinted}>
          <div className={` ${styles.ticketcontainer} ${styles.ticket}`}>
            <div className={styles.ticketTitle}>
              <h2>General Admission</h2>
              <h3>${price}/ticket</h3>
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

                  write?.({
                    value: totalPrice as BigInt,
                  });
                  const res = await fetch('/api/reserveTicket', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      qty,
                      ticketId: ticketId.toString(),
                      address: account?.address,
                    }),
                  });
                  const r = await res.json();
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
