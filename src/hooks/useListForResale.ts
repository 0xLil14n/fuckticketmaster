import { useWaitForTransaction, useContractWrite } from 'wagmi';
import { ABI, SEPOLIA_ADDR } from '../../contractdetails';
import { BigNumber } from 'ethers';

const useListForResale = () => {
  const { data, write, isLoading, isSuccess, error } = useContractWrite({
    address: SEPOLIA_ADDR,
    abi: ABI,
    functionName: 'setSalesPrice',
  });

  const { isSuccess: txSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  return {
    listForResale: (
      ticketId: string,
      resalePriceEth: BigNumber,
      quantity: number
    ) => {
      write?.({ args: [ticketId, resalePriceEth, quantity] });
    },
    data,
    isLoading,
    isSuccess,
    txSuccess,
    error,
  };
};
export default useListForResale;
