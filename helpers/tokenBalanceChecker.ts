import { createClient } from "@/lib/supabase/client";

export async function hasSufficientBalance(userId: string, estimatedCost: number): Promise<boolean> {
  if (!userId) return false;
  const supabase = createClient();

  const { data, error } = await supabase
    .from('user_credits')
    .select('token_balance')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    // If user doesn't exist in credits table, create them with starter tokens
    if (error?.code === 'PGRST116') { // Code for "No rows found"
       const { error: insertError } = await supabase
        .from('user_credits')
        .insert([{ user_id: userId, token_balance: 10000 }]); // 10k starter tokens

       if (!insertError) return 10000 >= estimatedCost;
    }
    console.error("Error checking balance:", error);
    return false;
  }

  return (data.token_balance || 0) >= estimatedCost;
}

export async function checkTokenBalance(userId: string): Promise<number> {
  if (!userId) return 0;
  const supabase = createClient();

  const { data, error } = await supabase
    .from('user_credits')
    .select('token_balance')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    // If user doesn't exist in credits table, create them with starter tokens
    if (error?.code === 'PGRST116') { // Code for "No rows found"
       const { error: insertError } = await supabase
        .from('user_credits')
        .insert([{ user_id: userId, token_balance: 10000 }]); // 10k starter tokens

       if (!insertError) return 10000;
    }
    console.error("Error checking balance:", error);
    return 0;
  }

  return (data.token_balance || 0);
}
