import {
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import styles from './order.module.css';
import { ABI, SEPOLIA_ADDR } from '../../contractdetails';
import { useEffect, useState } from 'react';
import FlipCard, { BackCard, FrontCard } from './card';
import { ethers } from 'ethers';
export type Ticket = {
  id: string;
  seat?: string;
  ticketId: string;
};

type Props = {
  id: string;
  quantity: number;
};

const Order: React.FC<Props> = ({ id, quantity }) => {
  const [selected, setSelected] = useState<number[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [resalePrice, setResalePrice] = useState<number>(0);
  const [resalePriceEth, setResalePriceEth] = useState<number>(0);

  const { data, isError } = useContractRead({
    address: SEPOLIA_ADDR,
    abi: ABI,
    functionName: 'uuidToTokenId',
    args: [id],
  });
  const tokenId = parseInt(data as string);
  const a = [...new Array(parseInt(quantity.toString())).keys()];
  console.log('a', a);
  const {
    data: resaleData,
    write,
    isLoading,
    isSuccess,
  } = useContractWrite({
    address: SEPOLIA_ADDR,
    abi: ABI,
    functionName: 'setSalesPrice',
    args: [tokenId, resalePriceEth, selected.length],
  });

  const { isSuccess: txSuccess } = useWaitForTransaction({
    hash: resaleData?.hash,
  });

  useEffect(() => {
    (async () => {
      const data = await fetch('/api/fetchUsd');
      const res = await data.json();
      let p = 0;
      if (resalePrice !== undefined) {
        try {
          p = ethers.utils.parseUnits(
            (resalePrice / res.data.ethusd).toString(),
            'ether'
          );
        } catch (e) {
          p = 0;
          console.log('errror setting resalePriceEth');
        }
        setResalePriceEth(p);
      }
    })();
  }, [resalePrice]);

  return (
    <div className={styles.container}>
      <div>ticket: {id}</div>

      <FlipCard>
        <FrontCard isCardFlipped={flipped}>
          <div>quantity: {quantity}</div>
          select tickets to resell:
          <ul className={styles.list}>
            {a.map((t, i) => {
              return (
                <div
                  key={i}
                  onClick={() => {
                    let newSelected = [];
                    if (selected.includes(t)) {
                      newSelected = selected.filter((s) => s != t);
                    } else {
                      newSelected = [...selected, t];
                    }
                    setSelected(newSelected);
                  }}
                  className={`${styles.row} ${
                    selected.includes(t) ? styles.selectedrow : ''
                  }`}
                >
                  ticket: {t}
                </div>
              );
            })}
          </ul>
        </FrontCard>
        <BackCard isCardFlipped={flipped}>
          {!txSuccess ? (
            <form className={styles.form}>
              set resale price
              {resalePrice ? (
                <h2>
                  {selected.length} tickets for ${resalePrice}/ticket
                </h2>
              ) : null}
              <div>
                $
                <input
                  className={styles.input}
                  name="resalePrice"
                  id="resalePrice"
                  type="number"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setResalePrice(parseFloat(e.target.value));
                  }}
                  value={resalePrice}
                />
                <label htmlFor="resalePrice">usd</label>
              </div>
              <button
                type="submit"
                disabled={selected.length == 0 || isLoading || isSuccess}
                className={styles.button}
                onClick={(e: MouseEventHandler<HTMLButtonElement>) => {
                  e.preventDefault();
                  console.log('button clicked');
                  write?.();
                }}
              >
                {isLoading && 'Waiting for approval'}
                {isSuccess && 'pending...'}
                {!isLoading && !isSuccess && 'list for resale'}
              </button>
            </form>
          ) : (
            <div className={styles.form}>resale listing successful!</div>
          )}
        </BackCard>
      </FlipCard>
      <button
        disabled={selected.length == 0 || isLoading}
        onClick={() => setFlipped(!flipped)}
        className={styles.button}
      >
        flip
      </button>
    </div>
  );
};

export default Order;
