import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;


serve(async () => {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const today = new Date();
  const d3 = new Date();
  d3.setDate(today.getDate() + 3);
  const dates = [
    today.toISOString().slice(0, 10),
    d3.toISOString().slice(0, 10),
  ];

  const { data: bills } = await supabase
    .from('bills')
    .select('id, description, due_date, amount, user_id')
    .in('due_date', dates)
    .eq('status', 'pending');

  // TODO: fetch user push tokens and send notifications via FCM
  if (bills && bills.length) {
    for (const bill of bills) {
      console.log('Would notify user', bill.user_id, 'about bill', bill.id);
    }
  }

  return new Response(JSON.stringify({ processed: bills?.length ?? 0 }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
