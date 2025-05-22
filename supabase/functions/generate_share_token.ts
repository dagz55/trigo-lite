import { serve } from "https://deno.land/x/sift@0.6.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: req.headers.get("Authorization")! } } },
  );

  const { ride_id } = await req.json();
  if (!ride_id) return new Response("ride_id required", { status: 400 });

  // 10-char, URL-safe slug
  const token = crypto.randomUUID().replace(/-/g, "").slice(0, 10);

  const { error } = await supabase
    .from("rides")
    .update({ share_token: token, share_token_expires: "now() + interval '6 hours'" })
    .eq("id", ride_id);

  if (error) return new Response(error.message, { status: 500 });

  return new Response(JSON.stringify({ token }), {
    headers: { "Content-Type": "application/json" },
  });
});
