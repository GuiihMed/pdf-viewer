import fs from 'fs';
import path from 'path';
import os from 'os';
import bcrypt from 'bcryptjs';

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
const uploadsDir = getWritableDir('uploads');
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

interface DatabaseState {
  users: User[];
  sites: Site[];
  tags: Tag[];
  pdfs: Pdf[];
  pdf_tags: PdfTag[];
  allowed_domains: AllowedDomain[];
  pdf_views: PdfView[];
}

function createMinimalPdfBuffer(title: string, pages: number = 3): Buffer {
  const content = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 55 >>
stream
BT
/F1 18 Tf
50 700 Td
(${title}) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000350 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
424
%%EOF`;
  return Buffer.from(content, 'utf-8');
}

function loadState(): DatabaseState {
  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();
  const passwordHash = bcrypt.hashSync('#Wdcom2026', 10);

  let parsed: DatabaseState | null = null;
  if (fs.existsSync(dbJsonPath)) {
    try {
      const data = fs.readFileSync(dbJsonPath, 'utf8');
      parsed = JSON.parse(data);
    } catch (e) {
      console.error('Error loading db.json:', e);
    }
  }

  const defaultUsers: User[] = [
    {
      id: 'usr_admin_wdcom',
      name: 'WDCOM Atendimento',
      email: 'atendimento@wdcom.com.br',
      password_hash: passwordHash,
      role: 'superadmin',
      site_id: null,
      status: 'active',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
  ];

  if (parsed) {
    // Ensure superadmin always exists and stays updated
    const superadminExists = parsed.users.some(u => u.email === 'atendimento@wdcom.com.br');
    if (!superadminExists) {
      parsed.users.unshift(defaultUsers[0]);
    } else {
      // Update superadmin password hash in case it changed
      const sa = parsed.users.find(u => u.email === 'atendimento@wdcom.com.br');
      if (sa) {
        sa.password_hash = passwordHash;
        sa.role = 'superadmin';
        sa.site_id = null;
        sa.status = 'active';
      }
    }
    // Ensure all users have site_id and status fields
    parsed.users = parsed.users.map(u => ({
      ...u,
      site_id: u.site_id !== undefined ? u.site_id : null,
      status: u.status || 'active',
    }));
    return parsed;
  }

  const sites: Site[] = [
    { id: 'site_01', name: 'Meu Site Principal', domain: 'meusite.com', slug: 'meusite', description: 'Website principal da marca', status: 'active', created_at: now.toISOString(), updated_at: now.toISOString() },
    { id: 'site_02', name: 'Empresa Corporativa', domain: 'empresa.com.br', slug: 'empresa', description: 'Portal corporativo oficial', status: 'active', created_at: now.toISOString(), updated_at: now.toISOString() },
    { id: 'site_03', name: 'Portal Tech', domain: 'portaltech.io', slug: 'portaltech', description: 'Blog e documentações técnicas', status: 'active', created_at: now.toISOString(), updated_at: now.toISOString() },
  ];

  const tags: Tag[] = [
    { id: 'tag_01', name: 'Catálogo', slug: 'catalogo', description: 'Documentos de linhas de produtos', created_at: now.toISOString() },
    { id: 'tag_02', name: 'Produtos', slug: 'produtos', description: 'Fichas técnicas e especificações', created_at: now.toISOString() },
    { id: 'tag_03', name: '2026', slug: '2026', description: 'Ano de referência', created_at: now.toISOString() },
    { id: 'tag_04', name: 'Marketing', slug: 'marketing', description: 'Apresentações e folhetos', created_at: now.toISOString() },
    { id: 'tag_05', name: 'Manuais', slug: 'manuais', description: 'Guias do usuário e instruções', created_at: now.toISOString() },
    { id: 'tag_06', name: 'Relatórios', slug: 'relatorios', description: 'Relatórios corporativos', created_at: now.toISOString() },
  ];

  const pdf1Buffer = createMinimalPdfBuffer('Catálogo Oficial de Produtos 2026', 4);
  const pdf2Buffer = createMinimalPdfBuffer('Manual de Integração do Cliente v2', 3);
  const pdf3Buffer = createMinimalPdfBuffer('Relatório Anual de Sustentabilidade', 5);
  const pdf4Buffer = createMinimalPdfBuffer('Guia Rápido de Instalação e Uso', 2);

  const pdf1File = 'catalogo-2026-8f72a91c.pdf';
  const pdf2File = 'manual-cliente-b73ca91e.pdf';
  const pdf3File = 'relatorio-sustentabilidade-c92fa812.pdf';
  const pdf4File = 'guia-instalacao-d41ea567.pdf';

  try {
    fs.writeFileSync(path.join(uploadsDir, pdf1File), pdf1Buffer);
    fs.writeFileSync(path.join(uploadsDir, pdf2File), pdf2Buffer);
    fs.writeFileSync(path.join(uploadsDir, pdf3File), pdf3Buffer);
    fs.writeFileSync(path.join(uploadsDir, pdf4File), pdf4Buffer);
  } catch (e) {}

  const pdfs: Pdf[] = [
    {
      id: 'pdf_01',
      public_id: '8f72a91c',
      title: 'Catálogo de Produtos 2026',
      description: 'Catálogo completo com tabela de preços e imagens dos lançamentos.',
      category: 'Catálogo',
      original_filename: 'catalogo-2026.pdf',
      storage_path: pdf1File,
      file_size: pdf1Buffer.length,
      page_count: 4,
      site_id: 'site_01',
      status: 'active',
      allow_download: 1,
      allow_print: 1,
      allow_embed: 1,
      restrict_domains: 0,
      created_at: daysAgo(25),
      updated_at: daysAgo(25),
    },
    {
      id: 'pdf_02',
      public_id: 'b73ca91e',
      title: 'Manual do Cliente v2',
      description: 'Guia do usuário e instruções de primeiros passos.',
      category: 'Manual',
      original_filename: 'manual-cliente-v2.pdf',
      storage_path: pdf2File,
      file_size: pdf2Buffer.length,
      page_count: 3,
      site_id: 'site_02',
      status: 'active',
      allow_download: 1,
      allow_print: 1,
      allow_embed: 1,
      restrict_domains: 1,
      created_at: daysAgo(18),
      updated_at: daysAgo(18),
    },
    {
      id: 'pdf_03',
      public_id: 'c92fa812',
      title: 'Relatório Anual de Sustentabilidade',
      description: 'Balanço social, metas ESG e diretrizes ambientais.',
      category: 'Relatório',
      original_filename: 'relatorio-sustentabilidade.pdf',
      storage_path: pdf3File,
      file_size: pdf3Buffer.length,
      page_count: 5,
      site_id: 'site_03',
      status: 'active',
      allow_download: 0,
      allow_print: 1,
      allow_embed: 1,
      restrict_domains: 0,
      created_at: daysAgo(10),
      updated_at: daysAgo(10),
    },
    {
      id: 'pdf_04',
      public_id: 'd41ea567',
      title: 'Guia Rápido de Instalação',
      description: 'Instruções ilustradas de configuração rápida.',
      category: 'Manual',
      original_filename: 'guia-rapido.pdf',
      storage_path: pdf4File,
      file_size: pdf4Buffer.length,
      page_count: 2,
      site_id: 'site_01',
      status: 'active',
      allow_download: 1,
      allow_print: 1,
      allow_embed: 1,
      restrict_domains: 0,
      created_at: daysAgo(3),
      updated_at: daysAgo(3),
    },
  ];

  const pdf_tags: PdfTag[] = [
    { pdf_id: 'pdf_01', tag_id: 'tag_01' },
    { pdf_id: 'pdf_01', tag_id: 'tag_02' },
    { pdf_id: 'pdf_01', tag_id: 'tag_03' },
    { pdf_id: 'pdf_02', tag_id: 'tag_04' },
    { pdf_id: 'pdf_02', tag_id: 'tag_05' },
    { pdf_id: 'pdf_03', tag_id: 'tag_03' },
    { pdf_id: 'pdf_03', tag_id: 'tag_06' },
    { pdf_id: 'pdf_04', tag_id: 'tag_05' },
  ];

  const allowed_domains: AllowedDomain[] = [
    { id: 'dom_01', pdf_id: 'pdf_02', domain: 'empresa.com.br' },
    { id: 'dom_02', pdf_id: 'pdf_02', domain: 'www.empresa.com.br' },
  ];

  const referrers = ['https://meusite.com/produtos', 'https://empresa.com.br/sobre', 'https://portaltech.io/docs', 'https://google.com', 'Direct'];
  const devices = ['Desktop', 'Mobile', 'Tablet'];
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
  const pdf_views: PdfView[] = [];

  let viewCounter = 1;
  for (let day = 30; day >= 0; day--) {
    const viewsCount = Math.floor(Math.random() * 18) + 5;
    for (let v = 0; v < viewsCount; v++) {
      const pId = ['pdf_01', 'pdf_01', 'pdf_02', 'pdf_03', 'pdf_04'][Math.floor(Math.random() * 5)];
      const ref = referrers[Math.floor(Math.random() * referrers.length)];
      const dev = devices[Math.floor(Math.random() * devices.length)];
      const br = browsers[Math.floor(Math.random() * browsers.length)];
      const viewDate = new Date(now.getTime() - day * 86400000 + Math.floor(Math.random() * 80000000)).toISOString();

      pdf_views.push({
        id: `vw_${viewCounter++}`,
        pdf_id: pId,
        viewed_at: viewDate,
        referrer: ref,
        user_agent: 'Mozilla/5.0 ...',
        device: dev,
        browser: br,
      });
    }
  }

  const newState: DatabaseState = {
    users: defaultUsers,
    sites,
    tags,
    pdfs,
    pdf_tags,
    allowed_domains,
    pdf_views,
  };

  try {
    fs.writeFileSync(dbJsonPath, JSON.stringify(newState, null, 2), 'utf8');
  } catch (e) {}
  return newState;
}

let state: DatabaseState = loadState();

function saveState() {
  try {
    fs.writeFileSync(dbJsonPath, JSON.stringify(state, null, 2), 'utf8');
  } catch (e) {
    console.warn('Could not persist state to db.json:', e);
  }
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
  state = loadState();
  const cleanSql = sql.replace(/\s+/g, ' ').trim();

  // Users lookup
  if (cleanSql.includes('FROM users WHERE email =')) {
    const email = params[0];
    return state.users.filter(u => u.email.toLowerCase() === email.toLowerCase());
  }
  if (cleanSql.includes('FROM users WHERE id =')) {
    const id = params[0];
    return state.users.filter(u => u.id === id);
  }
  if (cleanSql.includes('FROM users ORDER BY')) {
    return [...state.users].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  }
  if (cleanSql.includes('COUNT(*) as count FROM users')) {
    return [{ count: state.users.length }];
  }

  // Sites queries
  if (cleanSql.includes('COUNT(*) as count FROM sites')) {
    return [{ count: state.sites.length }];
  }
  if (cleanSql.includes('FROM sites s')) {
    return state.sites.map(s => {
      const pdfsCount = state.pdfs.filter(p => p.site_id === s.id).length;
      const pdfIds = state.pdfs.filter(p => p.site_id === s.id).map(p => p.id);
      const totalViews = state.pdf_views.filter(v => pdfIds.includes(v.pdf_id)).length;
      return { ...s, pdfs_count: pdfsCount, total_views: totalViews };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }
  if (cleanSql.includes('FROM sites WHERE id =')) {
    return state.sites.filter(s => s.id === params[0]);
  }

  // Tags queries
  if (cleanSql.includes('COUNT(*) as count FROM tags')) {
    return [{ count: state.tags.length }];
  }
  if (cleanSql.includes('FROM tags t')) {
    return state.tags.map(t => {
      const pdfsCount = state.pdf_tags.filter(pt => pt.tag_id === t.id).length;
      return { ...t, pdfs_count: pdfsCount };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }

  // PDFs queries
  if (cleanSql.includes("COUNT(*) as count FROM pdfs WHERE status = 'active'")) {
    return [{ count: state.pdfs.filter(p => p.status === 'active').length }];
  }
  if (cleanSql.includes("COUNT(*) as count FROM pdfs WHERE status = 'inactive'")) {
    return [{ count: state.pdfs.filter(p => p.status === 'inactive').length }];
  }
  if (cleanSql.includes('COUNT(*) as count FROM pdfs')) {
    return [{ count: state.pdfs.length }];
  }

  // PDF Views counts
  if (cleanSql.includes('COUNT(*) as count FROM pdf_views WHERE viewed_at >= datetime')) {
    if (cleanSql.includes('-7 days')) {
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      return [{ count: state.pdf_views.filter(v => v.viewed_at >= sevenDaysAgo).length }];
    }
    if (cleanSql.includes('-30 days')) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
      return [{ count: state.pdf_views.filter(v => v.viewed_at >= thirtyDaysAgo).length }];
    }
  }
  if (cleanSql.includes('COUNT(*) as count FROM pdf_views')) {
    return [{ count: state.pdf_views.length }];
  }

  // Raw pdf_views for multi-tenant filtering
  if (cleanSql.includes('FROM pdf_views WHERE') && !cleanSql.includes('COUNT')) {
    return [...state.pdf_views];
  }

  // Chart view trends
  if (cleanSql.includes("strftime('%Y-%m-%d', viewed_at)")) {
    const map = new Map<string, number>();
    for (let i = 13; i >= 0; i--) {
      const dStr = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      map.set(dStr, 0);
    }
    state.pdf_views.forEach(v => {
      const dStr = v.viewed_at ? v.viewed_at.slice(0, 10) : '';
      if (map.has(dStr)) {
        map.set(dStr, (map.get(dStr) || 0) + 1);
      }
    });
    return Array.from(map.entries()).map(([date, count]) => ({ date, count }));
  }

  // PDF lookup by id or public_id
  if (cleanSql.includes('FROM pdfs p') || cleanSql.includes('FROM pdfs WHERE')) {
    let list = state.pdfs.map(p => {
      const site = state.sites.find(s => s.id === p.site_id);
      const viewsCount = state.pdf_views.filter(v => v.pdf_id === p.id).length;
      const tagRels = state.pdf_tags.filter(pt => pt.pdf_id === p.id);
      const tagList = state.tags.filter(t => tagRels.some(r => r.tag_id === t.id));
      const tagsInfo = tagList.map(t => `${t.id}:${t.name}:${t.slug}`).join(';');
      const tagsNameList = tagList.map(t => t.name).join(', ');
      const allowed = state.allowed_domains.filter(ad => ad.pdf_id === p.id).map(ad => ad.domain).join(';');

      return {
        ...p,
        site_name: site ? site.name : null,
        site_domain: site ? site.domain : null,
        views_count: viewsCount,
        tags_info: tagsInfo,
        tags_list: tagsNameList,
        allowed_domains_info: allowed,
      };
    });

    if (cleanSql.includes('p.public_id = ?') || cleanSql.includes('WHERE public_id = ?')) {
      const targetPublicId = params[params.length - 1] || params[0];
      list = list.filter(p => p.public_id === targetPublicId);
    }
    if (cleanSql.includes('p.id = ?')) {
      const id = params[0];
      list = list.filter(p => p.id === id || p.public_id === id);
    }
    if (cleanSql.includes('p.site_id = ?')) {
      const sId = params[params.indexOf('p.site_id = ?') > -1 ? params.length - 1 : 0];
      if (sId) list = list.filter(p => p.site_id === sId);
    }
    if (cleanSql.includes('p.status = ?')) {
      const st = params[params.length - 1];
      if (st) list = list.filter(p => p.status === st);
    }

    const searchParam = params.find(p => typeof p === 'string' && p.startsWith('%') && p.endsWith('%'));
    if (searchParam) {
      const term = searchParam.replace(/%/g, '').toLowerCase();
      list = list.filter(p =>
        (p.title && p.title.toLowerCase().includes(term)) ||
        (p.description && p.description.toLowerCase().includes(term)) ||
        (p.original_filename && p.original_filename.toLowerCase().includes(term)) ||
        (p.public_id && p.public_id.toLowerCase().includes(term))
      );
    }

    if (cleanSql.includes('LIMIT 6')) {
      return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6);
    }

    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  return [];
}

function executeMutation(sql: string, params: any[]) {
  state = loadState();
  const cleanSql = sql.replace(/\s+/g, ' ').trim();

  if (cleanSql.includes('INSERT INTO users')) {
    state.users.push({
      id: params[0],
      name: params[1],
      email: params[2],
      password_hash: params[3],
      role: params[4],
      site_id: params[5] || null,
      status: params[6] || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  if (cleanSql.includes('UPDATE users SET status =')) {
    const userId = params[1];
    const user = state.users.find(u => u.id === userId);
    if (user) {
      user.status = params[0];
      if (params[2]) user.site_id = params[2];
      user.updated_at = new Date().toISOString();
    }
  }

  if (cleanSql.includes('UPDATE users SET')) {
    const userId = params[params.length - 1];
    const user = state.users.find(u => u.id === userId);
    if (user) {
      user.name = params[0];
      user.role = params[1];
      user.site_id = params[2] || null;
      user.updated_at = new Date().toISOString();
    }
  }

  if (cleanSql.includes('DELETE FROM users WHERE')) {
    const userId = params[0];
    state.users = state.users.filter(u => u.id !== userId);
  }

  if (cleanSql.includes('INSERT INTO sites')) {
    state.sites.push({
      id: params[0],
      name: params[1],
      domain: params[2],
      slug: params[3],
      description: params[4],
      status: params[5],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  if (cleanSql.includes('UPDATE sites')) {
    const siteId = params[5];
    const site = state.sites.find(s => s.id === siteId);
    if (site) {
      site.name = params[0];
      site.domain = params[1];
      site.slug = params[2];
      site.description = params[3];
      site.status = params[4];
      site.updated_at = new Date().toISOString();
    }
  }
  if (cleanSql.includes('DELETE FROM sites')) {
    state.sites = state.sites.filter(s => s.id !== params[0]);
  }

  if (cleanSql.includes('INSERT INTO tags')) {
    state.tags.push({
      id: params[0],
      name: params[1],
      slug: params[2],
      description: params[3],
      created_at: new Date().toISOString(),
    });
  }
  if (cleanSql.includes('UPDATE tags')) {
    const tagId = params[3];
    const tag = state.tags.find(t => t.id === tagId);
    if (tag) {
      tag.name = params[0];
      tag.slug = params[1];
      tag.description = params[2];
    }
  }
  if (cleanSql.includes('DELETE FROM tags')) {
    state.tags = state.tags.filter(t => t.id !== params[0]);
  }

  if (cleanSql.includes('INSERT INTO pdfs')) {
    const now = new Date().toISOString();
    state.pdfs.push({
      id: params[0],
      public_id: params[1],
      title: params[2],
      description: params[3],
      category: params[4],
      original_filename: params[5],
      storage_path: params[6],
      file_size: params[7],
      page_count: params[8],
      site_id: params[9],
      status: params[10],
      allow_download: params[11],
      allow_print: params[12],
      allow_embed: params[13],
      restrict_domains: params[14],
      created_at: now,
      updated_at: now,
    });
  }
  if (cleanSql.includes('UPDATE pdfs SET title =')) {
    const pdfId = params[9];
    const pdf = state.pdfs.find(p => p.id === pdfId);
    if (pdf) {
      pdf.title = params[0];
      pdf.description = params[1];
      pdf.category = params[2];
      pdf.site_id = params[3];
      pdf.status = params[4];
      pdf.allow_download = params[5];
      pdf.allow_print = params[6];
      pdf.allow_embed = params[7];
      pdf.restrict_domains = params[8];
      pdf.updated_at = new Date().toISOString();
    }
  }
  if (cleanSql.includes('UPDATE pdfs SET original_filename =')) {
    const pdfId = params[4];
    const pdf = state.pdfs.find(p => p.id === pdfId);
    if (pdf) {
      pdf.original_filename = params[0];
      pdf.storage_path = params[1];
      pdf.file_size = params[2];
      pdf.page_count = params[3];
      pdf.updated_at = new Date().toISOString();
    }
  }
  if (cleanSql.includes('DELETE FROM pdfs WHERE id =')) {
    const pdfId = params[0];
    state.pdfs = state.pdfs.filter(p => p.id !== pdfId);
    state.pdf_tags = state.pdf_tags.filter(pt => pt.pdf_id !== pdfId);
    state.allowed_domains = state.allowed_domains.filter(ad => ad.pdf_id !== pdfId);
    state.pdf_views = state.pdf_views.filter(pv => pv.pdf_id !== pdfId);
  }

  if (cleanSql.includes('INSERT INTO pdf_tags')) {
    state.pdf_tags.push({ pdf_id: params[0], tag_id: params[1] });
  }
  if (cleanSql.includes('DELETE FROM pdf_tags')) {
    state.pdf_tags = state.pdf_tags.filter(pt => pt.pdf_id !== params[0]);
  }

  if (cleanSql.includes('INSERT INTO allowed_domains')) {
    state.allowed_domains.push({ id: params[0], pdf_id: params[1], domain: params[2] });
  }
  if (cleanSql.includes('DELETE FROM allowed_domains')) {
    state.allowed_domains = state.allowed_domains.filter(ad => ad.pdf_id !== params[0]);
  }

  if (cleanSql.includes('INSERT INTO pdf_views')) {
    state.pdf_views.push({
      id: params[0],
      pdf_id: params[1],
      referrer: params[2],
      user_agent: params[3],
      device: params[4],
      browser: params[5],
      viewed_at: new Date().toISOString(),
    });
  }

  saveState();
}

export default db;
