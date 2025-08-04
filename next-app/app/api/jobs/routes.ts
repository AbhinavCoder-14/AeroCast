import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    const jobs = await prisma.job.findMany();
    return NextResponse.json(jobs);
}