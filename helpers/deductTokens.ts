import { createClient } from "@/lib/supabase/client";

export async function deductTokens(userId: string, amount: number) {
  if (!userId || amount <= 0) return;

  // OPTION A: Ideally use RPC if you created the SQL function above
  const supabase = createClient();
  const { error } = await supabase.rpc('decrement_credits', {
    userid: userId,
    amount: amount
  });
}