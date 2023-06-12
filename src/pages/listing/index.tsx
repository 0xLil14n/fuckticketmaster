import { useContractWrite, useWaitForTransaction } from 'wagmi';
import { ChangeEvent, ReactElement, useEffect, useState } from 'react';
import styles from './listing.module.css';
import { BigNumber, ethers } from 'ethers';
import { ABI, SEPOLIA_ADDR } from '../../../contractdetails';
import SubmitButton from '@/components/Form/SubmitButton';
import Input from '@/components/Form/Input';
import ErrorMessage from '@/components/Form/ErrorMessage';
import { dateInSecs } from '@/utils/date';
import { useSession } from 'next-auth/react';

type Props<T> = {
  id: string;
  placeholder: string;
  label: string;
  value: T;
  onChange: (_: ChangeEvent<HTMLInputElement>) => void;
};

const Listing = () => {
  const [eventName, setEventName] = useState('');
  const [maxSupply, setMaxSupply] = useState(0);
  const [isPresale, setIsPresale] = useState(false);

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [priceUsd, setPriceUsd] = useState(0);
  const [priceInWei, setPriceInWei] = useState<BigInt | null>(null);
  const [venueName, setVenueName] = useState('');

  const [presaleStartDate, setPresaleStartDate] = useState(0);
  const [presaleCloseDate, setPresaleCloseDate] = useState(0);

  const [maxSupplyError, setMaxSupplyError] = useState(false);
  const [eventNameError, setEventNameError] = useState(false);
  const [priceError, setPriceError] = useState(false);
  const [timeError, setTimeError] = useState(false);
  const [dateError, setDateError] = useState(false);
  const [venueNameError, setVenueNameError] = useState(false);
  const [hasPresaleError, setHasPresaleError] = useState(false);
  const { data: session, status } = useSession();
  const dateTime = `${date} ${time}`;
  const {
    data: createTicketData,
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

  const { data: txnReceipt, isSuccess: createTicketTxSuccess } =
    useWaitForTransaction({
      hash: createTicketData?.hash,
    });

  const {
    data: createPresaleData,
    write: createPresale,
    isLoading: isCreatePresaleLoading,
    isSuccess: isCreatePresaleSuccess,
    isError: isCreatePresaleError,
  } = useContractWrite({
    address: SEPOLIA_ADDR,
    abi: ABI,
    functionName: 'createPresale',

    args: [
      maxSupply,
      priceInWei,
      eventName,
      dateTime,
      venueName,
      presaleStartDate,
      presaleCloseDate,
    ],
  });
  const { data: presaleTxnReceipt, isSuccess: createPresaleTxSuccess } =
    useWaitForTransaction({
      hash: createPresaleData?.hash,
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
  if (!session) {
    return <div> please log in</div>;
  }

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
    if (
      isPresale &&
      (!presaleStartDate ||
        !presaleCloseDate ||
        presaleStartDate >= presaleCloseDate)
    ) {
      setHasPresaleError(true);
      return;
    }
    if (isPresale) {
      createPresale();
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
            type="text"
            onChange={(e) => {
              console.log('venue name', e.target.value);
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
                return (
                  <option key={i} value={timeString}>
                    {timeString}
                  </option>
                );
              })}
            </select>
            {timeError && <ErrorMessage errorMessage="Select a time." />}
          </div>

          <PresaleForm
            isPresale={isPresale}
            setIsPresale={setIsPresale}
            setPresaleCloseDate={setPresaleCloseDate}
            setPresaleStartDate={setPresaleStartDate}
            hasPresaleError={hasPresaleError}
            setHasPresaleError={setHasPresaleError}
          />
          <SubmitButton
            handleSubmit={handleSubmit}
            label="Create Tickets"
            isDisabled={false}
          />
        </form>
        {(createPresaleTxSuccess || createTicketTxSuccess) && (
          <div className={styles.success}>ticket created successfully!</div>
        )}
      </div>
    </div>
  );
};

type PresaleProps = {
  isPresale: boolean;
  setIsPresale: (_: boolean) => void;
  setPresaleStartDate: (_: number) => void;
  setPresaleCloseDate: (_: number) => void;
  hasPresaleError: boolean;
  setHasPresaleError: (_: boolean) => void;
};

const PresaleForm: React.FC<PresaleProps> = ({
  isPresale,
  setIsPresale,
  setPresaleStartDate,
  setPresaleCloseDate,
  hasPresaleError,
  setHasPresaleError,
}) => {
  const [startDate, setStartDate] = useState('');
  const [closeDate, setCloseDate] = useState('');
  const presaleErrorMessage = 'Invalid presale dates.';
  return (
    <>
      <div className={styles.checkboxContainer}>
        <input
          type="checkbox"
          checked={isPresale}
          onChange={() => {
            setIsPresale(!isPresale);
          }}
        />
        <label>Is Presale</label>
      </div>
      {isPresale && (
        <div className={styles.dateComponent}>
          <Input
            value={startDate}
            label="Presale Start Date"
            type="datetime-local"
            onChange={(e) => {
              setPresaleStartDate(dateInSecs(e.target.value));
              setStartDate(e.target.value);
              setHasPresaleError(false);
            }}
            hasError={hasPresaleError}
            errorMessage={presaleErrorMessage}
          />
          <Input
            value={closeDate}
            label="Presale Close Date"
            type="datetime-local"
            onChange={(e) => {
              setPresaleCloseDate(dateInSecs(e.target.value));
              setCloseDate(e.target.value);
              setHasPresaleError(false);
            }}
            hasError={hasPresaleError}
            errorMessage={presaleErrorMessage}
          />
        </div>
      )}
    </>
  );
};

export default Listing;
