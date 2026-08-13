import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase';
import * as admin from 'firebase-admin';

export async function POST(request: Request) {
  try {
    const { email, password, name, phone } = await request.json();
    const superEmail = email || 'atendimento@wdcom.com.br';
    const superPassword = password || '#Wdcom2026';
    const superName = name || 'WDCOM Atendimento';

    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(superEmail);
      // Update password if exists
      await admin.auth().updateUser(userRecord.uid, {
        password: superPassword,
        displayName: superName,
        phoneNumber: phone || undefined,
      });
    } catch (e: any) {
      if (e.code === 'auth/user-not-found') {
        userRecord = await admin.auth().createUser({
          email: superEmail,
          password: superPassword,
          displayName: superName,
          emailVerified: true,
          phoneNumber: phone || undefined,
        });
      } else {
        throw e;
      }
    }

    // Set custom claims for role superadmin
    await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'superadmin' });

    // Sync user record to Firestore users collection
    await firestore.collection('users').doc(userRecord.uid).set({
      id: userRecord.uid,
      name: superName,
      email: superEmail,
      role: 'superadmin',
      site_id: null,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { merge: true });

    return NextResponse.json({
      success: true,
      message: 'Super Admin criado/atualizado com sucesso no Firebase Authentication.',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
      },
    });
  } catch (err: any) {
    console.error('Error creating Super Admin in Firebase:', err);
    return NextResponse.json({ error: err.message || 'Erro ao sincronizar Super Admin no Firebase Auth.' }, { status: 500 });
  }
}
