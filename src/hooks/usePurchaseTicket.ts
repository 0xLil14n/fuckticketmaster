import { useCallback } from 'react';
import { useContractWrite } from 'wagmi';
import { SEPOLIA_ADDR, ABI } from '../../contractdetails';

const usePurchaseTicket = (ticketId: number) => {
  const {
    data,
    isLoading,
    isSuccess,
    write: purchaseTicket,
    isError,
  } = useContractWrite({
    address: SEPOLIA_ADDR,
    abi: ABI,
    functionName: 'publicMint',
  });
  return {
    purchaseTicket: (qty: number, totalPrice: bigint) => {
      purchaseTicket({ args: [ticketId, qty], value: totalPrice });
    },
    isLoading,
    isError,
    isSuccess,
    data,
  };
};
export default usePurchaseTicket;
