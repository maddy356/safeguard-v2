import { NextResponse } from 'next/server';
import {dbConnect} from '@/lib/db';
import { Form } from '@/lib/models';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const user = searchParams.get('user');
    const role = searchParams.get('role');

    let query = {};
    if (role === 'labourer') {
      query = { submittedBy: user };
    } else if (role === 'manager') {
      query = { status: 'Pending' };
    }
    // Admin sees everything
    
    const forms = await Form.find(query).sort({ inspectionDate: -1 });
    return NextResponse.json(forms);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}