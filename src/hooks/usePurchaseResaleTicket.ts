import { useContractWrite } from 'wagmi';
import { ABI, SEPOLIA_ADDR } from '../../contractdetails';

const usePurchaseResaleTicket = (ticketId: number) => {
  const {
    data,
    write: purchaseResale,
    isLoading,
    isSuccess,
    isError,
  } = useContractWrite({
    address: SEPOLIA_ADDR,
    abi: ABI,
    functionName: 'buyResoldToken',
  });
  return {
    purchaseResale: (listedById: string, qty: number, priceInWei: bigint) => {
      purchaseResale({ args: [listedById, ticketId, qty], value: priceInWei });
    },
    isLoading,
    isSuccess,
    data,
    isError,
  };
};
export default usePurchaseResaleTicket;
