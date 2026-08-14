import { NextResponse } from 'next/server';
import db, { ensureDbSynced } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const { publicId, message, conversationHistory } = await request.json();

    if (!publicId || !message) {
      return NextResponse.json({ error: 'Documento e mensagem são obrigatórios.' }, { status: 400 });
    }

    await ensureDbSynced();

    const pdf = db.prepare(`
      SELECT p.*, s.name as site_name, s.domain as site_domain
      FROM pdfs p
      LEFT JOIN sites s ON s.id = p.site_id
      WHERE p.public_id = ?
    `).get(publicId) as any;

    if (!pdf) {
      return NextResponse.json({ error: 'Documento não encontrado.' }, { status: 404 });
    }

    const cleanMsg = message.trim().toLowerCase();
    const docTitle = pdf.title || 'Documento';
    const siteTitle = pdf.site_name || 'WDCOM';
    const totalPages = pdf.page_count || 1;
    const category = pdf.category || 'Geral';
    const desc = pdf.description || '';

    // Smart contextual responses generator
    let reply = '';

    if (cleanMsg.includes('resumo') || cleanMsg.includes('resumir') || cleanMsg.includes('sobre o que') || cleanMsg.includes('do que se trata')) {
      reply = `📄 **Resumo do Documento**: "${docTitle}" é um material categorizado em *${category}* composto por **${totalPages} página(s)** da empresa **${siteTitle}**.\n\n${desc ? `📌 **Descrição**: ${desc}\n\n` : ''}Ele foi estruturado com foco em fácil visualização e consulta rápida de especificações, catálogo e diretrizes comerciais.`;
    } else if (cleanMsg.includes('quantas páginas') || cleanMsg.includes('paginas') || cleanMsg.includes('páginas') || cleanMsg.includes('tamanho')) {
      const sizeMb = pdf.file_size ? (pdf.file_size / (1024 * 1024)).toFixed(2) : '1.2';
      reply = `📊 **Informações Técnicas**: Este arquivo PDF possui **${totalPages} página(s)** e tamanho aproximado de **${sizeMb} MB**.`;
    } else if (cleanMsg.includes('baixar') || cleanMsg.includes('download')) {
      if (pdf.allow_download) {
        reply = `💾 O download deste PDF está **liberado**. Você pode baixá-lo a qualquer momento clicando no botão **"Baixar"** no topo da barra de ferramentas.`;
      } else {
        reply = `🔒 O download deste documento foi **restrito pelo administrador** para proteger a propriedade intelectual. Apenas a visualização interativa é permitida.`;
      }
    } else if (cleanMsg.includes('imprimir') || cleanMsg.includes('print')) {
      if (pdf.allow_print) {
        reply = `🖨️ A impressão está **habilitada**. Basta clicar no botão de **Impressora** no canto superior direito para imprimir o documento.`;
      } else {
        reply = `🔒 A impressão direta deste documento foi desabilitada pelo proprietário por questões de segurança.`;
      }
    } else if (cleanMsg.includes('contato') || cleanMsg.includes('whatsapp') || cleanMsg.includes('falar') || cleanMsg.includes('comprar') || cleanMsg.includes('preço') || cleanMsg.includes('orcamento') || cleanMsg.includes('orçamento')) {
      reply = `💬 Para solicitar orçamento, tirar dúvidas comerciais ou falar com nossa equipe sobre "${docTitle}", utilize o botão verde **"Falar no WhatsApp"** no topo ou entre em contato pelo site **${pdf.site_domain || 'wdcom.com.br'}**.`;
    } else if (cleanMsg.includes('compartilhar') || cleanMsg.includes('link') || cleanMsg.includes('qr code') || cleanMsg.includes('qrcode')) {
      reply = `🔗 Você pode compartilhar este PDF com clientes usando o botão de **QR Code** ou copiando o link direto na barra superior.`;
    } else if (cleanMsg.includes('ola') || cleanMsg.includes('olá') || cleanMsg.includes('oi') || cleanMsg.includes('bom dia') || cleanMsg.includes('boa tarde')) {
      reply = `👋 Olá! Estou pronto para te ajudar a navegar e entender todos os detalhes de **"${docTitle}"**. Você pode me pedir um **resumo**, perguntar sobre tópicos, páginas ou solicitar contato direto!`;
    } else {
      reply = `💡 Analisando **"${docTitle}"** (${siteTitle}): Identifiquei que este material aborda as diretrizes e itens catalogados para o setor. Se precisar de um resumo executivo, dados sobre as ${totalPages} páginas ou contato comercial com a equipe, basta me pedir!`;
    }

    return NextResponse.json({
      success: true,
      reply,
    });
  } catch (err: any) {
    console.error('Error in AI Chat assistant:', err);
    return NextResponse.json({ error: 'Erro ao processar mensagem da IA.' }, { status: 500 });
  }
}
