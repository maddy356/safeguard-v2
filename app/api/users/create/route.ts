import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { User } from '@/lib/models';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { username, password, role } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    // Standardize to lowercase to match your dashboard logic
    const cleanUsername = username.toLowerCase().trim();
    const cleanRole = role.toLowerCase().trim();

    const existingUser = await User.findOne({ username: cleanUsername });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    const newUser = await User.create({
      username: cleanUsername,
      password, 
      role: cleanRole
    });

    return NextResponse.json({ message: "User created successfully" }, { status: 201 });
  } catch (error) {
    console.error("CREATE_USER_ERROR:", error);
    return NextResponse.json({ 
      message: error instanceof Error ? error.message : "Database error" 
    }, { status: 500 });
  }
}