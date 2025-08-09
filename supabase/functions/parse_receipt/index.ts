import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import Tesseract from "npm:tesseract.js@5";

// Simple helpers to pull basic info from OCR text
function parseText(text: string) {
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const description = lines[1] || lines[0] || null;

  const valueMatch = text.match(/(\d+[.,]\d{2})/);
  const value = valueMatch ? Number(valueMatch[1].replace(/\./g, '').replace(',', '.')) : null;

  const dateMatch = text.match(/(\d{2}[/-]\d{2}[/-]\d{4})/);
  let date: string | null = null;
  if (dateMatch) {
    const [d,m,y] = dateMatch[1].replace(/-/g,'/').split('/');
    date = `${y}-${m}-${d}`;
  }

  const cnpjMatch = text.match(/(\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2})/);
  const cnpj = cnpjMatch ? cnpjMatch[1] : null;

  let payment_method: string | null = null;
  if (/pix/i.test(text)) payment_method = 'Pix';
  else if (/cart[aã]o/i.test(text)) payment_method = 'Cartão';
  else if (/dinheiro/i.test(text)) payment_method = 'Dinheiro';
  else if (/boleto/i.test(text)) payment_method = 'Boleto';
  else if (/transfer/i.test(text)) payment_method = 'Transferência';

  const lower = text.toLowerCase();
  let category = 'Outros';
  if (/(mercado|supermerc|padaria)/i.test(lower)) category = 'Alimentação';
  else if (/(uber|taxi|posto|gasolina)/i.test(lower)) category = 'Transporte';
  else if (/(aluguel|condominio)/i.test(lower)) category = 'Moradia';
  else if (/(farmacia|saúde|saude)/i.test(lower)) category = 'Saúde';

  return { description, value, date, cnpj, payment_method, category };
}

serve(async (req) => {
  try {
    const { path } = await req.json();
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;

    const { data: file, error: downloadError } = await supabase.storage.from('receipts').download(path);
    if (downloadError) throw downloadError;

    const buffer = await file.arrayBuffer();
    const { data: { text } } = await Tesseract.recognize(buffer, 'por');

    const parsed = parseText(text);

    await supabase.from('receipt_parses').insert({
      user_id: userId,
      file_path: path,
      description: parsed.description,
      amount: parsed.value,
      date: parsed.date,
      cnpj: parsed.cnpj,
      payment_method: parsed.payment_method,
      category: parsed.category,
      raw_text: text,
    });

    return new Response(JSON.stringify(parsed), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY')!
      );
      const { path } = await req.json().catch(() => ({ path: null }));
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;
      if (path && userId) {
        await supabase.from('receipt_parses').insert({
          user_id: userId,
          file_path: path,
          error: String(err),
        });
      }
    } catch {
      // ignore logging errors
    }

    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// In production we may migrate to Google Vision or AWS Textract for better OCR accuracy.
