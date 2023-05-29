import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const tickets = await prisma.ticketOption.findMany({
    where: { walletId: req.body.address },
  });
  console.log('tickets', tickets);
  return res.status(200).json({ tickets });
}
