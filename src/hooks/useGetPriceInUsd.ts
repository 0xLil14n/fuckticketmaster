import { ethers } from 'ethers';
import { useCallback, useEffect, useState } from 'react';

const useGetPriceInUsd = () => {
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
    (priceInWei: ethers.BigNumberish) => {
      if (!priceOfEthInUsd) {
        return 0;
      }
      const ethPrice = ethers.utils.formatEther(priceInWei);
      const p = (priceOfEthInUsd * parseFloat(ethPrice)).toFixed(2);
      return p;
    },
    [priceOfEthInUsd]
  );
};
export default useGetPriceInUsd;
