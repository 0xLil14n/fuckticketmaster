import { useContractWrite, useWaitForTransaction } from 'wagmi';
import { ChangeEvent, ReactElement, useEffect, useState } from 'react';
import styles from './listing.module.css';
import { BigNumber, ethers } from 'ethers';
import { ABI, SEPOLIA_ADDR } from '../../../contractdetails';
import SubmitButton from '@/components/Form/SubmitButton';
import Input from '@/components/Form/Input';
import ErrorMessage from '@/components/Form/ErrorMessage';

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

  const [maxSupplyError, setMaxSupplyError] = useState(false);
  const [eventNameError, setEventNameError] = useState(false);
  const [priceError, setPriceError] = useState(false);
  const [timeError, setTimeError] = useState(false);
  const [dateError, setDateError] = useState(false);
  const [venueNameError, setVenueNameError] = useState(false);

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

  const handleSubmit = () => {
    if (!eventName) {
      setEventNameError(true);
      return;
    }
    if (maxSupply <= 0) {
      setMaxSupplyError(true);
      return;
    }
    if (!venueName) {
      setVenueNameError(true);
      return;
    }
    if (priceUsd <= 0) {
      setPriceError(true);
      return;
    }
    if (!time) {
      setTimeError(true);
      return;
    }

    write?.();
  };

  return (
    <div>
      Create Listing
      <div className={styles.container}>
        <form className={styles.form}>
          <Input
            type="text"
            onChange={(e) => {
              setEventName(e.target.value);
              setEventNameError(false);
            }}
            label="Event Name"
            value={eventName}
            hasError={eventNameError}
            errorMessage="Event Name required."
          />

          <Input
            label="Max Supply"
            onChange={(e) => {
              setMaxSupply(parseInt(e.target.value));
              setMaxSupplyError(false);
            }}
            value={maxSupply}
            hasError={maxSupplyError}
            errorMessage="Please enter valid max supply."
          />

          <Input
            label="Price (USD)"
            onChange={(e) => {
              setPriceUsd(parseInt(e.target.value));
              setPriceError(false);
            }}
            value={priceUsd}
            hasError={priceError}
            errorMessage="Please enter valid price."
          />
          <Input
            label="Venue Name"
            onChange={(e) => {
              setVenueName(e.target.value);
              setVenueNameError(false);
            }}
            value={venueName}
            hasError={venueNameError}
            errorMessage="Please enter a valid venue name."
          />

          <Input
            value={date}
            type="date"
            label="Date"
            onChange={(e) => {
              setDate(e.target.value);
              setDateError(false);
            }}
            hasError={dateError}
            errorMessage="Please enter a date."
          />
          <div>
            <select
              className={`${styles.dropdown} ${timeError ? styles.error : ''}`}
              name="time"
              id="time"
              onChange={(e) => {
                setTime(e.target.value);
                setTimeError(false);
              }}
            >
              <option value="">--select time--</option>
              {[...new Array(9).keys()].map((i) => {
                const timeString = `${3 + i}:00pm`;
                return <option value={timeString}>{timeString}</option>;
              })}
            </select>
            {timeError && <ErrorMessage errorMessage="Select a time." />}
          </div>

          <SubmitButton
            handleSubmit={handleSubmit}
            label="Create Tickets"
            isDisabled={false}
          />
        </form>
      </div>
    </div>
  );
};

export default Listing;
