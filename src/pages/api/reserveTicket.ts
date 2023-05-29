import { PrismaClient } from '@prisma/client';
import { id } from 'ethers/lib/utils';
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {};
const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const body = req.body;
  console.log('request body', body);
  const ticket = await prisma.ticket.findFirst({
    where: { id: body.ticketId },
  });
  console.log('ticket', body.qty);
  if (ticket && (ticket?.supplyLeft ?? 0) - body.qty >= 0) {
    await prisma.ticketOption.create({
      data: { ticketId: ticket.id, walletId: body.address },
    });
    console.log('successfully created');
  }
  res
    .status(200)
    .json({ ticketSupply: ticket?.supplyLeft, onChainId: ticket?.onChainId });
}
