import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  const user = getAuthUser();
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({
    authenticated: true,
    user: {
      userId: user.userId,
      email: user.email,
      name: user.name,
      role: user.role,
      siteId: user.siteId || null,
    },
  });
}
