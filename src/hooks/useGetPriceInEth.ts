import { BigNumber, ethers } from 'ethers';
import { useCallback, useEffect, useState } from 'react';

const useGetPriceInEth = () => {
  const [priceOfEthInUsd, setPriceOfEthInUsd] = useState(null);
  useEffect(() => {
    const abortController = new AbortController();

    (async () => {
      const data = await fetch('/api/fetchUsd', {
        signal: abortController.signal,
      });
      const res = await data.json();
      setPriceOfEthInUsd(res.data.ethusd);
    })();
    return () => abortController.abort();
  }, []);

  return useCallback(
    (priceInUsd: number) => {
      if (!priceOfEthInUsd) {
        return null;
      }
      const priceInEth = ethers.utils.parseUnits(
        (priceInUsd / priceOfEthInUsd).toString(),
        'ether'
      );
      return priceInEth;
    },
    [priceOfEthInUsd]
  );
};
export default useGetPriceInEth;
