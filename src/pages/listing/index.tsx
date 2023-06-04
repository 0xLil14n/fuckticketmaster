import { useContractWrite, useWaitForTransaction } from 'wagmi';
import { ChangeEvent, ReactElement, useEffect, useState } from 'react';
import styles from './listing.module.css';
import { BigNumber, ethers } from 'ethers';
import { ABI, SEPOLIA_ADDR } from '../../../contractdetails';

type Props<T> = {
  id: string;
  placeholder: string;
  label: string;
  value: T;
  onChange: (_: ChangeEvent<HTMLInputElement>) => void;
};

const FormInput: React.FC<Props<string | number>> = ({
  placeholder,
  id,
  value,
  onChange,
  label,
}): JSX.Element => {
  return (
    <div>
      <input
        className={styles.input}
        required
        name={id}
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        pattern="[[\w]+[\s]*]+"
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
};

const Listing = () => {
  const [eventName, setEventName] = useState('');
  const [maxSupply, setMaxSupply] = useState(0);

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [priceUsd, setPriceUsd] = useState(0);
  const [priceInWei, setPriceInWei] = useState<BigInt | null>(null);
  const [venueName, setVenueName] = useState('');

  const dateTime = `${date} ${time}`;
  const {
    data: resaleData,
    write,
    isLoading,
    isSuccess,
    isError,
  } = useContractWrite({
    address: SEPOLIA_ADDR,
    abi: ABI,
    functionName: 'createTicket',

    args: [maxSupply, priceInWei, eventName, dateTime, venueName],
  });

  const { data: txnReceipt, isSuccess: txSuccess } = useWaitForTransaction({
    hash: resaleData?.hash,
  });

  useEffect(() => {
    (async () => {
      const data = await fetch('/api/fetchUsd');
      const res = await data.json();
      try {
        const priceEth = priceUsd / res.data.ethusd;
        const wei = ethers.utils.parseEther(priceEth.toString()).toBigInt();
        setPriceInWei(wei);
      } catch (e) {
        console.log('error parsing eth', priceUsd);
      }
    })();
  }, [priceUsd]);
  const min = new Date().toLocaleDateString('fr-ca');

  return (
    <div>
      create listing {date} {time}
      price: {priceInWei?.toString()}
      <form className={styles.form}>
        <FormInput
          value={eventName}
          onChange={(e) => {
            setEventName(e.target.value);
          }}
          id="eventName"
          placeholder="event name"
          label="event name"
        />
        <div>
          <input
            className={styles.input}
            type="number"
            name="maxSupply"
            id="maxSupply"
            placeholder="max supply"
            value={maxSupply}
            onChange={(e) => setMaxSupply(parseInt(e.target.value))}
          />
          <label htmlFor="maxSupply">max supply</label>
        </div>
        <div>
          <input
            type="number"
            name="price"
            id="price"
            placeholder="price (usd)"
            value={priceUsd}
            onChange={(e) => setPriceUsd(parseInt(e.target.value))}
          />
          <label htmlFor="price">price (usd)</label>
        </div>
        <div>
          <input
            name="venue"
            id="venue"
            placeholder="venue name"
            value={venueName}
            onChange={(e) => setVenueName(e.target.value)}
          />
          <label htmlFor="venue">venue</label>
        </div>
        <div>
          <input
            min={min}
            type="date"
            name="date"
            id="date"
            placeholder="date"
            onChange={(e) => setDate(e.target.value)}
          />
          <select
            name="time"
            id="time"
            onChange={(e) => setTime(e.target.value)}
          >
            <option value="">--select time--</option>
            {[...new Array(9).keys()].map((i) => {
              const timeString = `${3 + i}:00pm`;
              return <option value={timeString}>{timeString}</option>;
            })}
          </select>
          <label htmlFor="time">date</label>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            write?.();
          }}
        >
          create tickets
        </button>
      </form>
    </div>
  );
};

export default Listing;
