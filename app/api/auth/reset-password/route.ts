import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase';
import * as admin from 'firebase-admin';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'E-mail é obrigatório.' }, { status: 400 });
    }

    const link = await admin.auth().generatePasswordResetLink(email.trim());

    return NextResponse.json({
      success: true,
      message: 'Link de redefinição de senha gerado com sucesso.',
      resetLink: link,
    });
  } catch (err: any) {
    console.error('Password reset error:', err);
    return NextResponse.json({ error: err.message || 'Erro ao enviar e-mail de redefinição.' }, { status: 400 });
  }
}
