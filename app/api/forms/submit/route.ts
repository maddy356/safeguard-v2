import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Form } from '@/lib/models';

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();
  const newForm = await Form.create(body);
  return NextResponse.json(newForm);
}