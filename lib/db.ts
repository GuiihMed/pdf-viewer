import fs from 'fs';
import path from 'path';
import os from 'os';
import bcrypt from 'bcryptjs';
import { firestore } from './firebase';

function getWritableDir(subDir: string): string {
  try {
    const localPath = path.join(process.cwd(), subDir);
    if (!fs.existsSync(localPath)) {
      fs.mkdirSync(localPath, { recursive: true });
    }
    const testFile = path.join(localPath, '.write_test');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    return localPath;
  } catch (e) {
    const tmpPath = path.join(os.tmpdir(), subDir);
    if (!fs.existsSync(tmpPath)) {
      fs.mkdirSync(tmpPath, { recursive: true });
    }
    return tmpPath;
  }
}

const dataDir = getWritableDir('data');
const dbJsonPath = path.join(dataDir, 'db.json');

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  site_id: string | null;
  status: 'active' | 'pending' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface Site {
  id: string;
  name: string;
  domain: string;
  slug: string;
  description: string;
  wix_webhook_url?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description: string;
  created_at: string;
}

export interface Pdf {
  id: string;
  public_id: string;
  title: string;
  description: string;
  category: string;
  original_filename: string;
  storage_path: string;
  file_size: number;
  page_count: number;
  site_id: string | null;
  status: string;
  allow_download: number;
  allow_print: number;
  allow_embed: number;
  restrict_domains: number;
  created_at: string;
  updated_at: string;
}

export interface PdfTag {
  pdf_id: string;
  tag_id: string;
}

export interface AllowedDomain {
  id: string;
  pdf_id: string;
  domain: string;
}

export interface PdfView {
  id: string;
  pdf_id: string;
  viewed_at: string;
  referrer: string;
  user_agent: string;
  device: string;
  browser: string;
  ip_hash?: string;
}

export interface DatabaseState {
  users: User[];
  sites: Site[];
  tags: Tag[];
  pdfs: Pdf[];
  pdf_tags: PdfTag[];
  allowed_domains: AllowedDomain[];
  pdf_views: PdfView[];
}

const DEFAULT_SUPERADMIN_PASSWORD_HASH = bcrypt.hashSync('#Wdcom2026', 10);

function getDefaultState(): DatabaseState {
  const now = new Date().toISOString();
  return {
    users: [
      {
        id: 'usr_admin_wdcom',
        name: 'WDCOM Atendimento',
        email: 'atendimento@wdcom.com.br',
        password_hash: DEFAULT_SUPERADMIN_PASSWORD_HASH,
        role: 'superadmin',
        site_id: null,
        status: 'active',
        created_at: now,
        updated_at: now,
      },
    ],
    sites: [],
    tags: [],
    pdfs: [],
    pdf_tags: [],
    allowed_domains: [],
    pdf_views: [],
  };
}

function sanitizeAndEnsureSuperadmin(data: Partial<DatabaseState> | null | undefined): DatabaseState {
  const defaults = getDefaultState();
  if (!data) return defaults;

  const users = Array.isArray(data.users) ? [...data.users] : [];
  const superadminIndex = users.findIndex(
    (u) => u && u.email && u.email.toLowerCase() === 'atendimento@wdcom.com.br'
  );

  if (superadminIndex === -1) {
    users.unshift(defaults.users[0]);
  } else {
    users[superadminIndex] = {
      ...users[superadminIndex],
      role: 'superadmin',
      status: 'active',
      site_id: null,
      password_hash: users[superadminIndex].password_hash || DEFAULT_SUPERADMIN_PASSWORD_HASH,
    };
  }

  return {
    users: users.map((u) => ({
      id: u.id,
      name: u.name || 'Usuário',
      email: (u.email || '').toLowerCase().trim(),
      password_hash: u.password_hash || DEFAULT_SUPERADMIN_PASSWORD_HASH,
      role: u.role || 'client',
      site_id: u.site_id || null,
      status: u.status || 'active',
      created_at: u.created_at || new Date().toISOString(),
      updated_at: u.updated_at || new Date().toISOString(),
    })),
    sites: Array.isArray(data.sites)
      ? data.sites.map((s) => ({
          id: s.id,
          name: s.name || '',
          domain: (s.domain || '').toLowerCase().trim(),
          slug: s.slug || (s.name || '').toLowerCase().replace(/[^a-z0-9]/g, '-'),
          description: s.description || '',
          wix_webhook_url: s.wix_webhook_url || null,
          status: s.status || 'active',
          created_at: s.created_at || new Date().toISOString(),
          updated_at: s.updated_at || new Date().toISOString(),
        }))
      : [],
    tags: Array.isArray(data.tags)
      ? data.tags.map((t) => ({
          id: t.id,
          name: t.name || '',
          slug: t.slug || (t.name || '').toLowerCase().replace(/[^a-z0-9]/g, '-'),
          description: t.description || '',
          created_at: t.created_at || new Date().toISOString(),
        }))
      : [],
    pdfs: Array.isArray(data.pdfs)
      ? data.pdfs.map((p) => ({
          id: p.id,
          public_id: p.public_id,
          title: p.title || 'Sem título',
          description: p.description || '',
          category: p.category || 'Geral',
          original_filename: p.original_filename || 'documento.pdf',
          storage_path: p.storage_path || '',
          file_size: Number(p.file_size) || 0,
          page_count: Number(p.page_count) || 1,
          site_id: p.site_id || null,
          status: p.status || 'active',
          allow_download: p.allow_download !== undefined ? Number(p.allow_download) : 1,
          allow_print: p.allow_print !== undefined ? Number(p.allow_print) : 1,
          allow_embed: p.allow_embed !== undefined ? Number(p.allow_embed) : 1,
          restrict_domains: p.restrict_domains !== undefined ? Number(p.restrict_domains) : 0,
          created_at: p.created_at || new Date().toISOString(),
          updated_at: p.updated_at || new Date().toISOString(),
        }))
      : [],
    pdf_tags: Array.isArray(data.pdf_tags) ? data.pdf_tags : [],
    allowed_domains: Array.isArray(data.allowed_domains) ? data.allowed_domains : [],
    pdf_views: Array.isArray(data.pdf_views) ? data.pdf_views : [],
  };
}

let memoryState: DatabaseState | null = null;
let firestoreSyncPromise: Promise<void> | null = null;

function loadLocalFileState(): DatabaseState | null {
  if (fs.existsSync(dbJsonPath)) {
    try {
      const raw = fs.readFileSync(dbJsonPath, 'utf8');
      const parsed = JSON.parse(raw);
      return sanitizeAndEnsureSuperadmin(parsed);
    } catch (e) {
      console.warn('Error reading local db.json:', e);
    }
  }
  return null;
}

export async function persistStateAsync(): Promise<void> {
  if (!memoryState) return;
  try {
    fs.writeFileSync(dbJsonPath, JSON.stringify(memoryState, null, 2), 'utf8');
  } catch (e) {
    console.warn('Could not write local db.json:', e);
  }

  // 1. Sync metadata to Google Cloud Firestore (stripping base64 from main doc if heavy)
  try {
    const mainDocState = {
      ...memoryState,
      pdfs: memoryState.pdfs.map((p) => {
        // Strip heavy base64 payload from the central db_state doc to prevent Firestore 1MB doc size limit
        const cleanName = p.storage_path.split('|||')[0];
        return {
          ...p,
          storage_path: cleanName,
        };
      }),
    };

    await firestore.collection('system').doc('db_state').set(mainDocState);

    // 2. Save individual PDF payloads into 'pdf_files' collection
    for (const p of memoryState.pdfs) {
      if (p.storage_path.includes('|||data:application/pdf;base64,')) {
        const payload = p.storage_path.split('|||data:application/pdf;base64,')[1];
        if (payload) {
          await firestore.collection('pdf_files').doc(p.public_id).set({
            publicId: p.public_id,
            pdfId: p.id,
            originalFilename: p.original_filename,
            base64Data: payload,
            updatedAt: new Date().toISOString(),
          }).catch((err) => console.warn(`Error storing PDF file ${p.public_id}:`, err.message));
        }
      }
    }
  } catch (err: any) {
    console.warn('Firestore set error:', err.message);
  }
}

function persistState() {
  persistStateAsync().catch(() => {});
}

function getState(): DatabaseState {
  if (!memoryState) {
    const local = loadLocalFileState();
    memoryState = local || getDefaultState();
  }
  return memoryState;
}

export async function ensureDbSynced(): Promise<DatabaseState> {
  const current = getState();
  try {
    const doc = await firestore.collection('system').doc('db_state').get();
    if (doc.exists) {
      const remoteData = doc.data() as DatabaseState;
      if (remoteData) {
        const sanitized = sanitizeAndEnsureSuperadmin(remoteData);
        // Merge items from remote
        if (sanitized.pdfs.length > 0) {
          sanitized.pdfs.forEach((rPdf) => {
            const idx = current.pdfs.findIndex((p) => p.id === rPdf.id || p.public_id === rPdf.public_id);
            if (idx >= 0) {
              current.pdfs[idx] = rPdf;
            } else {
              current.pdfs.push(rPdf);
            }
          });
        }
        if (sanitized.sites.length > 0) {
          sanitized.sites.forEach((rSite) => {
            const idx = current.sites.findIndex((s) => s.id === rSite.id);
            if (idx >= 0) {
              current.sites[idx] = rSite;
            } else {
              current.sites.push(rSite);
            }
          });
        }
        if (sanitized.tags.length > 0) {
          sanitized.tags.forEach((rTag) => {
            const idx = current.tags.findIndex((t) => t.id === rTag.id);
            if (idx >= 0) {
              current.tags[idx] = rTag;
            } else {
              current.tags.push(rTag);
            }
          });
        }
        if (sanitized.users.length > 0) {
          sanitized.users.forEach((rUser) => {
            const idx = current.users.findIndex((u) => u.id === rUser.id || u.email.toLowerCase() === rUser.email.toLowerCase());
            if (idx >= 0) {
              current.users[idx] = rUser;
            } else {
              current.users.push(rUser);
            }
          });
        }
        if (Array.isArray(sanitized.pdf_tags)) current.pdf_tags = sanitized.pdf_tags;
        if (Array.isArray(sanitized.allowed_domains)) current.allowed_domains = sanitized.allowed_domains;
        if (Array.isArray(sanitized.pdf_views)) current.pdf_views = sanitized.pdf_views;

        try {
          fs.writeFileSync(dbJsonPath, JSON.stringify(current, null, 2), 'utf8');
        } catch (e) {}
      }
    }
  } catch (err: any) {
    console.warn('Error during ensureDbSynced from Firestore:', err.message);
  }
  return current;
}

export const db = {
  prepare(query: string) {
    return {
      get(...params: any[]) {
        const results = executeQuery(query, params);
        return results[0] || undefined;
      },
      all(...params: any[]) {
        return executeQuery(query, params);
      },
      run(...params: any[]) {
        return executeMutation(query, params);
      },
    };
  },
};

function executeQuery(sql: string, params: any[]): any[] {
  const current = getState();
  const cleanSql = sql.replace(/\s+/g, ' ').trim();

  // 1. Users Queries
  if (cleanSql.includes('FROM users WHERE email =')) {
    const email = (params[0] || '').toLowerCase().trim();
    return current.users.filter((u) => u.email.toLowerCase() === email);
  }
  if (cleanSql.includes('FROM users WHERE id =')) {
    const id = params[0];
    return current.users.filter((u) => u.id === id);
  }
  if (cleanSql.includes('FROM users ORDER BY') || cleanSql.includes('FROM users')) {
    return [...current.users].sort(
      (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );
  }
  if (cleanSql.includes('COUNT(*) as count FROM users')) {
    return [{ count: current.users.length }];
  }

  // 2. Sites Queries
  if (cleanSql.includes('COUNT(*) as count FROM sites')) {
    return [{ count: current.sites.length }];
  }
  if (cleanSql.includes('FROM sites WHERE slug = ? OR id = ?') || cleanSql.includes('FROM sites WHERE id = ? OR slug = ?')) {
    const term = (params[0] || '').toLowerCase().trim();
    return current.sites.filter((s) => s.id === params[0] || s.slug === term || s.domain === term);
  }
  if (cleanSql.includes('FROM sites WHERE id =')) {
    return current.sites.filter((s) => s.id === params[0]);
  }
  if (cleanSql.includes('FROM sites WHERE status = "active"') || cleanSql.includes("FROM sites WHERE status = 'active'")) {
    return current.sites.filter((s) => s.status === 'active').sort((a, b) => a.name.localeCompare(b.name));
  }
  if (cleanSql.includes('FROM sites s') || cleanSql.includes('FROM sites')) {
    return current.sites
      .map((s) => {
        const pdfsCount = current.pdfs.filter((p) => p.site_id === s.id).length;
        const pdfIds = current.pdfs.filter((p) => p.site_id === s.id).map((p) => p.id);
        const totalViews = current.pdf_views.filter((v) => pdfIds.includes(v.pdf_id)).length;
        return { ...s, pdfs_count: pdfsCount, total_views: totalViews };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  // 3. Tags Queries
  if (cleanSql.includes('COUNT(*) as count FROM tags')) {
    return [{ count: current.tags.length }];
  }
  if (cleanSql.includes('FROM tags t') || cleanSql.includes('FROM tags')) {
    return current.tags
      .map((t) => {
        const pdfsCount = current.pdf_tags.filter((pt) => pt.tag_id === t.id).length;
        return { ...t, pdfs_count: pdfsCount };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  // 4. Analytics and Views Queries
  if (cleanSql.includes("COUNT(*) as count FROM pdfs WHERE status = 'active'")) {
    return [{ count: current.pdfs.filter((p) => p.status === 'active').length }];
  }
  if (cleanSql.includes("COUNT(*) as count FROM pdfs WHERE status = 'inactive'")) {
    return [{ count: current.pdfs.filter((p) => p.status === 'inactive').length }];
  }
  if (cleanSql.includes('COUNT(*) as count FROM pdfs')) {
    return [{ count: current.pdfs.length }];
  }
  if (cleanSql.includes('COUNT(*) as count FROM pdf_views WHERE viewed_at >= datetime')) {
    if (cleanSql.includes('-7 days')) {
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      return [{ count: current.pdf_views.filter((v) => v.viewed_at >= sevenDaysAgo).length }];
    }
    if (cleanSql.includes('-30 days')) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
      return [{ count: current.pdf_views.filter((v) => v.viewed_at >= thirtyDaysAgo).length }];
    }
  }
  if (cleanSql.includes('COUNT(*) as count FROM pdf_views')) {
    return [{ count: current.pdf_views.length }];
  }
  if (cleanSql.includes('FROM pdf_views WHERE') && !cleanSql.includes('COUNT')) {
    return [...current.pdf_views];
  }
  if (cleanSql.includes("strftime('%Y-%m-%d', viewed_at)")) {
    const map = new Map<string, number>();
    for (let i = 13; i >= 0; i--) {
      const dStr = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      map.set(dStr, 0);
    }
    current.pdf_views.forEach((v) => {
      const dStr = v.viewed_at ? v.viewed_at.slice(0, 10) : '';
      if (map.has(dStr)) {
        map.set(dStr, (map.get(dStr) || 0) + 1);
      }
    });
    return Array.from(map.entries()).map(([date, count]) => ({ date, count }));
  }

  // 5. PDFs and Gallery Queries
  if (cleanSql.includes('FROM pdfs p') || cleanSql.includes('FROM pdfs WHERE') || cleanSql.includes('FROM pdfs')) {
    let list = current.pdfs.map((p) => {
      const site = current.sites.find((s) => s.id === p.site_id);
      const viewsCount = current.pdf_views.filter((v) => v.pdf_id === p.id).length;
      const tagRels = current.pdf_tags.filter((pt) => pt.pdf_id === p.id);
      const tagList = current.tags.filter((t) => tagRels.some((r) => r.tag_id === t.id));
      const tagsInfo = tagList.map((t) => `${t.id}:${t.name}:${t.slug}`).join(';');
      const tagsNameList = tagList.map((t) => t.name).join(', ');
      const allowed = current.allowed_domains
        .filter((ad) => ad.pdf_id === p.id)
        .map((ad) => ad.domain)
        .join(';');

      return {
        ...p,
        site_name: site ? site.name : null,
        site_domain: site ? site.domain : null,
        site_slug: site ? site.slug : null,
        views_count: viewsCount,
        tags_info: tagsInfo,
        tags_list: tagsNameList,
        allowed_domains_info: allowed,
      };
    });

    if (cleanSql.includes('WHERE status = "active"') || cleanSql.includes("WHERE status = 'active'") || cleanSql.includes("p.status = 'active'")) {
      list = list.filter((p) => p.status === 'active');
    }

    // Public ID filter
    if (cleanSql.includes('p.public_id = ?') || cleanSql.includes('WHERE public_id = ?')) {
      const targetPublicId = params.find(
        (p) => typeof p === 'string' && !p.startsWith('%') && p.length < 40 && !p.startsWith('site_') && !p.startsWith('tag_')
      ) || params[0];
      if (targetPublicId) {
        list = list.filter((p) => p.public_id === targetPublicId);
      }
    }

    // Direct ID filter
    if (cleanSql.includes('p.id = ?') || cleanSql.includes('WHERE id = ?')) {
      const id = params[0];
      if (id) {
        list = list.filter((p) => p.id === id || p.public_id === id);
      }
    }

    // Site ID filter
    if (cleanSql.includes('p.site_id = ?')) {
      const sId = params.find((p) => typeof p === 'string' && (p.startsWith('site_') || p === 'siteId' || p.length > 5));
      if (sId) {
        list = list.filter((p) => p.site_id === sId);
      }
    }

    // Category filter
    if (cleanSql.includes('p.category = ?')) {
      const cat = params.find((p) => typeof p === 'string' && !p.startsWith('%') && !p.startsWith('site_'));
      if (cat) {
        list = list.filter((p) => p.category === cat);
      }
    }

    // Status filter
    if (cleanSql.includes('p.status = ?')) {
      const st = params.find((p) => p === 'active' || p === 'inactive');
      if (st) {
        list = list.filter((p) => p.status === st);
      }
    }

    // Search term filter (%term%)
    const searchParam = params.find((p) => typeof p === 'string' && p.startsWith('%') && p.endsWith('%'));
    if (searchParam) {
      const term = searchParam.replace(/%/g, '').toLowerCase().trim();
      list = list.filter(
        (p) =>
          (p.title && p.title.toLowerCase().includes(term)) ||
          (p.description && p.description.toLowerCase().includes(term)) ||
          (p.original_filename && p.original_filename.toLowerCase().includes(term)) ||
          (p.public_id && p.public_id.toLowerCase().includes(term))
      );
    }

    // Tag filter
    if (cleanSql.includes('pdf_tags') && cleanSql.includes('tags t')) {
      const tagParam = params.find((p) => typeof p === 'string' && !p.startsWith('%') && !p.startsWith('site_'));
      if (tagParam) {
        const matchingTag = current.tags.find(
          (t) => t.slug === tagParam || t.id === tagParam || t.name.toLowerCase() === tagParam.toLowerCase()
        );
        if (matchingTag) {
          const pdfIdsWithTag = current.pdf_tags.filter((pt) => pt.tag_id === matchingTag.id).map((pt) => pt.pdf_id);
          list = list.filter((p) => pdfIdsWithTag.includes(p.id));
        }
      }
    }

    if (cleanSql.includes('LIMIT 6')) {
      return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6);
    }

    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  return [];
}

function executeMutation(sql: string, params: any[]) {
  const current = getState();
  const cleanSql = sql.replace(/\s+/g, ' ').trim();

  // 1. Users Mutations
  if (cleanSql.includes('INSERT INTO users')) {
    const existingIdx = current.users.findIndex((u) => u.email.toLowerCase() === params[2].toLowerCase());
    const newUser: User = {
      id: params[0],
      name: params[1],
      email: params[2].toLowerCase().trim(),
      password_hash: params[3],
      role: params[4],
      site_id: params[5] || null,
      status: params[6] || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (existingIdx >= 0) {
      current.users[existingIdx] = newUser;
    } else {
      current.users.push(newUser);
    }
  }

  if (cleanSql.includes('UPDATE users SET status =')) {
    // UPDATE users SET status = ? WHERE id = ?
    const statusVal = params[0];
    const userId = params[1];
    const user = current.users.find((u) => u.id === userId);
    if (user) {
      user.status = statusVal;
      if (params.length > 2 && params[2]) {
        user.site_id = params[2];
      }
      user.updated_at = new Date().toISOString();
    }
  } else if (cleanSql.includes('UPDATE users SET email =')) {
    // UPDATE users SET email = ? WHERE id = ?
    const newEmail = (params[0] || '').toLowerCase().trim();
    const userId = params[1];
    const user = current.users.find((u) => u.id === userId);
    if (user) {
      user.email = newEmail;
      user.updated_at = new Date().toISOString();
    }
  } else if (cleanSql.includes('UPDATE users SET password_hash =')) {
    // UPDATE users SET password_hash = ? WHERE id = ?
    const newHash = params[0];
    const userId = params[1];
    const user = current.users.find((u) => u.id === userId);
    if (user) {
      user.password_hash = newHash;
      user.updated_at = new Date().toISOString();
    }
  } else if (cleanSql.includes('UPDATE users SET name =') || cleanSql.includes('UPDATE users SET')) {
    // UPDATE users SET name = ?, role = ?, site_id = ? WHERE id = ?
    const userId = params[params.length - 1];
    const user = current.users.find((u) => u.id === userId);
    if (user) {
      user.name = params[0] || user.name;
      user.role = params[1] || user.role;
      user.site_id = params[2] || null;
      user.updated_at = new Date().toISOString();
    }
  }

  if (cleanSql.includes('DELETE FROM users WHERE')) {
    const userId = params[0];
    current.users = current.users.filter((u) => u.id !== userId);
  }

  // 2. Sites Mutations
  if (cleanSql.includes('INSERT INTO sites')) {
    const siteId = params[0];
    const name = params[1];
    const domain = params[2];
    const slug = params[3];
    const description = params[4];
    const wix_webhook_url = params.length >= 7 ? params[5] : null;
    const status = params.length >= 7 ? params[6] : params[5] || 'active';

    const existingIdx = current.sites.findIndex((s) => s.id === siteId);
    const newSite: Site = {
      id: siteId,
      name,
      domain: (domain || '').toLowerCase().trim(),
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      description: description || '',
      wix_webhook_url: wix_webhook_url || null,
      status: status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      current.sites[existingIdx] = newSite;
    } else {
      current.sites.push(newSite);
    }
  }

  if (cleanSql.includes('UPDATE sites')) {
    const siteId = params[params.length - 1];
    const site = current.sites.find((s) => s.id === siteId);
    if (site) {
      site.name = params[0];
      site.domain = (params[1] || '').toLowerCase().trim();
      site.slug = params[2];
      site.description = params[3];
      if (params.length >= 7) {
        site.wix_webhook_url = params[4] || null;
        site.status = params[5] || 'active';
      } else {
        site.status = params[4] || 'active';
      }
      site.updated_at = new Date().toISOString();
    }
  }

  if (cleanSql.includes('DELETE FROM sites')) {
    current.sites = current.sites.filter((s) => s.id !== params[0]);
  }

  // 3. Tags Mutations
  if (cleanSql.includes('INSERT INTO tags')) {
    const tagId = params[0];
    const existingIdx = current.tags.findIndex((t) => t.id === tagId);
    const newTag: Tag = {
      id: tagId,
      name: params[1],
      slug: params[2],
      description: params[3] || '',
      created_at: new Date().toISOString(),
    };
    if (existingIdx >= 0) {
      current.tags[existingIdx] = newTag;
    } else {
      current.tags.push(newTag);
    }
  }

  if (cleanSql.includes('UPDATE tags')) {
    const tagId = params[3];
    const tag = current.tags.find((t) => t.id === tagId);
    if (tag) {
      tag.name = params[0];
      tag.slug = params[1];
      tag.description = params[2];
    }
  }

  if (cleanSql.includes('DELETE FROM tags')) {
    current.tags = current.tags.filter((t) => t.id !== params[0]);
    current.pdf_tags = current.pdf_tags.filter((pt) => pt.tag_id !== params[0]);
  }

  // 4. PDFs Mutations
  if (cleanSql.includes('INSERT INTO pdfs')) {
    const now = new Date().toISOString();
    const pdfId = params[0];
    const existingIdx = current.pdfs.findIndex((p) => p.id === pdfId);

    const newPdf: Pdf = {
      id: pdfId,
      public_id: params[1],
      title: params[2],
      description: params[3] || '',
      category: params[4] || 'Geral',
      original_filename: params[5],
      storage_path: params[6],
      file_size: Number(params[7]) || 0,
      page_count: Number(params[8]) || 1,
      site_id: params[9] || null,
      status: params[10] || 'active',
      allow_download: Number(params[11]) || 0,
      allow_print: Number(params[12]) || 0,
      allow_embed: Number(params[13]) || 0,
      restrict_domains: Number(params[14]) || 0,
      created_at: params.length >= 16 ? params[15] : now,
      updated_at: params.length >= 17 ? params[16] : now,
    };

    if (existingIdx >= 0) {
      current.pdfs[existingIdx] = newPdf;
    } else {
      current.pdfs.push(newPdf);
    }
  }

  if (cleanSql.includes('UPDATE pdfs SET title =') || cleanSql.includes('UPDATE pdfs SET')) {
    const pdfId = params[params.length - 1];
    const pdf = current.pdfs.find((p) => p.id === pdfId);
    if (pdf) {
      pdf.title = params[0];
      pdf.description = params[1] || '';
      pdf.category = params[2] || 'Geral';
      pdf.site_id = params[3] || null;
      pdf.status = params[4] || 'active';
      pdf.allow_download = Number(params[5]) || 0;
      pdf.allow_print = Number(params[6]) || 0;
      pdf.allow_embed = Number(params[7]) || 0;
      pdf.restrict_domains = Number(params[8]) || 0;
      pdf.updated_at = new Date().toISOString();
    }
  }

  if (cleanSql.includes('UPDATE pdfs SET original_filename =')) {
    const pdfId = params[4];
    const pdf = current.pdfs.find((p) => p.id === pdfId);
    if (pdf) {
      pdf.original_filename = params[0];
      pdf.storage_path = params[1];
      pdf.file_size = Number(params[2]) || 0;
      pdf.page_count = Number(params[3]) || 1;
      pdf.updated_at = new Date().toISOString();
    }
  }

  if (cleanSql.includes('DELETE FROM pdfs WHERE id =') || cleanSql.includes('DELETE FROM pdfs WHERE')) {
    const pdfId = params[0];
    current.pdfs = current.pdfs.filter((p) => p.id !== pdfId);
    current.pdf_tags = current.pdf_tags.filter((pt) => pt.pdf_id !== pdfId);
    current.allowed_domains = current.allowed_domains.filter((ad) => ad.pdf_id !== pdfId);
    current.pdf_views = current.pdf_views.filter((pv) => pv.pdf_id !== pdfId);
  }

  // 5. Relations (Tags, Domains, Views)
  if (cleanSql.includes('INSERT INTO pdf_tags')) {
    current.pdf_tags.push({ pdf_id: params[0], tag_id: params[1] });
  }
  if (cleanSql.includes('DELETE FROM pdf_tags')) {
    current.pdf_tags = current.pdf_tags.filter((pt) => pt.pdf_id !== params[0]);
  }

  if (cleanSql.includes('INSERT INTO allowed_domains')) {
    current.allowed_domains.push({ id: params[0], pdf_id: params[1], domain: params[2] });
  }
  if (cleanSql.includes('DELETE FROM allowed_domains')) {
    current.allowed_domains = current.allowed_domains.filter((ad) => ad.pdf_id !== params[0]);
  }

  if (cleanSql.includes('INSERT INTO pdf_views')) {
    current.pdf_views.push({
      id: params[0],
      pdf_id: params[1],
      referrer: params[2] || 'Direct',
      user_agent: params[3] || '',
      device: params[4] || 'Desktop',
      browser: params[5] || 'Outro',
      viewed_at: new Date().toISOString(),
    });
  }

  persistState();
}

export default db;
