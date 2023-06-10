import { useAccount, useContractRead, useContractWrite } from 'wagmi';
import { ABI, PRESALE_ABI, SEPOLIA_ADDR } from '../../contractdetails';

const useSignUpForPresale = (eventId: number) => {
  const { address: presaleContractAddress } =
    useGetContractAddressForPresale(eventId);

  const { data, write, isLoading, isSuccess, error } = useContractWrite({
    address: presaleContractAddress,
    abi: PRESALE_ABI,
    functionName: 'addToPresale',
  });
  return { data, addToPresale: write };
};
export default useSignUpForPresale;
const useGetContractAddressForPresale = (eventId: number) => {
  const { data: presaleContract } = useContractRead({
    address: SEPOLIA_ADDR,
    abi: ABI,
    functionName: 'presales',
    args: [BigInt(eventId)],
    onError(error) {
      console.log('error', error);
    },
  });
  return { address: `${presaleContract}` as `0x${string}` };
};

export const useIsSignedUpForPresale = (eventId: number) => {
  const { address: presaleContractAddress } =
    useGetContractAddressForPresale(eventId);

  const { address } = useAccount();
  const { data } = useContractRead({
    address: presaleContractAddress,
    abi: PRESALE_ABI,
    functionName: 'isEligibleForPresale',
    args: [address],
    onError(error) {
      console.log('error', error);
    },
  });
  return { data };
};
