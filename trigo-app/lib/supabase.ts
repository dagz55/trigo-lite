import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  password_hash: string
  date_of_birth: string
  gender: string
  address?: string
  city: string
  agree_to_terms: boolean
  agree_to_marketing: boolean
  email_verified: boolean
  phone_verified: boolean
  created_at: string
  updated_at: string
}

export interface UserInsert {
  first_name: string
  last_name: string
  email: string
  phone?: string
  password_hash: string
  date_of_birth: string
  gender: string
  address?: string
  city: string
  agree_to_terms: boolean
  agree_to_marketing: boolean
}
