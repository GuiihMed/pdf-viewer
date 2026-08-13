import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const now = new Date().toISOString();
    const passwordHash = bcrypt.hashSync('#Wdcom2026', 10);

    // 1. Initialize Users collection
    await firestore.collection('users').doc('usr_admin_wdcom').set({
      id: 'usr_admin_wdcom',
      name: 'WDCOM Atendimento',
      email: 'atendimento@wdcom.com.br',
      password_hash: passwordHash,
      role: 'superadmin',
      site_id: null,
      status: 'active',
      created_at: now,
      updated_at: now,
    }, { merge: true });

    // 2. Initialize Sites collection placeholder doc
    await firestore.collection('sites').doc('_init').set({
      initialized: true,
      created_at: now,
    }, { merge: true });

    // 3. Initialize Tags collection placeholder doc
    await firestore.collection('tags').doc('_init').set({
      initialized: true,
      created_at: now,
    }, { merge: true });

    // 4. Initialize Pdfs collection placeholder doc
    await firestore.collection('pdfs').doc('_init').set({
      initialized: true,
      created_at: now,
    }, { merge: true });

    // 5. Initialize System Global State doc
    const initialSystemState = {
      users: [
        {
          id: 'usr_admin_wdcom',
          name: 'WDCOM Atendimento',
          email: 'atendimento@wdcom.com.br',
          password_hash: passwordHash,
          role: 'superadmin',
          site_id: null,
          status: 'active',
          created_at: now,
          updated_at: now,
        }
      ],
      sites: [],
      tags: [],
      pdfs: [],
      pdf_tags: [],
      allowed_domains: [],
      pdf_views: [],
      last_initialized: now,
    };

    await firestore.collection('system').doc('db_state').set(initialSystemState, { merge: true });

    return NextResponse.json({
      success: true,
      message: 'Coleções e Banco de dados criados com sucesso no Cloud Firestore!',
      collectionsCreated: ['users', 'sites', 'tags', 'pdfs', 'system/db_state'],
      projectId: 'pdf-viewer-c4b04',
    });
  } catch (err: any) {
    console.error('Error initializing Firestore DB:', err);
    return NextResponse.json({ error: err.message || 'Erro ao inicializar o banco no Cloud Firestore.' }, { status: 500 });
  }
}
