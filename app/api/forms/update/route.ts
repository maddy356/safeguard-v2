import { dbConnect } from '@/lib/db';
import { Form } from '@/lib/models';
import { NextResponse } from 'next/server';

// Change POST to PATCH
export async function PATCH(req: Request) {
  try {
    await dbConnect();
    
    // Ensure you are destructuring the correct names 
    // (Your dashboard sends 'managerRemarks', not 'remarks')
    const { id, managerRemarks, status } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing Form ID" }, { status: 400 });
    }

    const updatedForm = await Form.findByIdAndUpdate(
      id, 
      { 
        managerRemarks: managerRemarks, 
        status: status || 'Reviewed' 
      }, 
      { new: true }
    );
    
    return NextResponse.json({ success: true, form: updatedForm });
  } catch (error: any) {
    console.error("UPDATE_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}