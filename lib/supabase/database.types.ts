// Auto-generate the full version with:
//   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/database.types.ts
// This skeleton is sufficient for the app to compile.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type TeamRole = 'founder' | 'manager' | 'coach' | 'player'

export interface Database {
  public: {
    Tables: {
      team_members: {
        Row: {
          id: string
          full_name: string
          role: TeamRole
          bio: string
          achievements: string[]
          photo_url: string | null
          display_order: number
          short_label: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          role: TeamRole
          bio?: string
          achievements?: string[]
          photo_url?: string | null
          display_order?: number
          short_label?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['team_members']['Insert']>
      }
      matches: {
        Row: {
          id: string
          match_date: string
          player1_id: string
          player2_id: string
          best_of: number
          winner_id: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          match_date: string
          player1_id: string
          player2_id: string
          best_of: number
          winner_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['matches']['Insert']>
      }
      match_sets: {
        Row: {
          id: string
          match_id: string
          set_number: number
          player1_score: number
          player2_score: number
          created_at: string
        }
        Insert: {
          id?: string
          match_id: string
          set_number: number
          player1_score: number
          player2_score: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['match_sets']['Insert']>
      }
      authorized_scorers: {
        Row: {
          user_id: string
          added_at: string
          note: string | null
        }
        Insert: {
          user_id: string
          added_at?: string
          note?: string | null
        }
        Update: Partial<Database['public']['Tables']['authorized_scorers']['Insert']>
      }
    }
    Functions: {
      is_authorized_scorer: { Args: Record<never, never>; Returns: boolean }
      compute_match_winner: { Args: { p_match_id: string }; Returns: string | null }
    }
    Enums: {
      team_role: TeamRole
    }
  }
}
