declare namespace Deno {
  export const env: {
    get(key: string): string | undefined;
  };
}

declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export function serve(handler: (req: Request) => Promise<Response> | Response): Promise<void>;
}

declare module "https://esm.sh/@supabase/supabase-js@2" {
  import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2/dist/module/lib/SupabaseClient.d.ts"; // This might need adjustment
  export function createClient(supabaseUrl: string, supabaseKey: string): SupabaseClient;
}
