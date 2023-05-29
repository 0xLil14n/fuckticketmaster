import { NextApiRequest, NextApiResponse } from 'next';
import { watchContractEvent } from '@wagmi/core';

import { ABI, SEPOLIA_ADDR } from '../../../contractdetails';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const unwatch = watchContractEvent(
    {
      address: SEPOLIA_ADDR,
      abi: ABI,
      eventName: 'TicketSold',
    },

    (log) => {
      console.log('ticket sold', log);
    }
  );
  res.status(200).json({ data: 'ssdf' });
}
