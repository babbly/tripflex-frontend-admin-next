import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { token } = await req.json();

  if (!token) {
    return NextResponse.json(
      { message: 'Token is required.' },
      { status: 400 },
    );
  }

  try {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken || verificationToken.expires < new Date()) {
      return NextResponse.json(
        { message: 'Invalid or expired token.' },
        { status: 400 },
      );
    }

    return NextResponse.json({ message: 'Token is valid.' }, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: 'Token verification failed.' },
      { status: 500 },
    );
  }
}
