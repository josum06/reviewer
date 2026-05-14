import { connectDB } from '@/lib/mongoose';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    // ── Validate fields ───────────────────────────────────
    if (!name || !email || !password)
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });

    // ── Only BPIT emails ──────────────────────────────────
    if (!email.toLowerCase().endsWith('@bpit.edu.in'))
      return NextResponse.json({ error: 'Only @bpit.edu.in emails are allowed' }, { status: 403 });

    // ── Password strength ─────────────────────────────────
    if (password.length < 6)
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });

    await connectDB();

    // ── Check duplicate ───────────────────────────────────
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing)
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });

    // ── Hash & save ───────────────────────────────────────
    const hashed = await bcrypt.hash(password, 10);
    await User.create({ name, email: email.toLowerCase(), password: hashed, provider: 'credentials' });

    return NextResponse.json({ success: true }, { status: 201 });

  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}