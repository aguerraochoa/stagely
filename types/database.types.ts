export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Priority = 'green' | 'yellow' | 'red'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      festivals: {
        Row: {
          id: string
          name: string
          year: number
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          year: number
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          year?: number
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      festival_days: {
        Row: {
          id: string
          festival_id: string
          day_name: string
          date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          festival_id: string
          day_name: string
          date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          festival_id?: string
          day_name?: string
          date?: string | null
          created_at?: string
        }
      }
      stages: {
        Row: {
          id: string
          festival_day_id: string
          name: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          festival_day_id: string
          name: string
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          festival_day_id?: string
          name?: string
          order_index?: number
          created_at?: string
        }
      }
      sets: {
        Row: {
          id: string
          festival_day_id: string
          stage_id: string
          artist_name: string
          start_time: string
          end_time: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          festival_day_id: string
          stage_id: string
          artist_name: string
          start_time: string
          end_time: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          festival_day_id?: string
          stage_id?: string
          artist_name?: string
          start_time?: string
          end_time?: string
          created_at?: string
          updated_at?: string
        }
      }
      groups: {
        Row: {
          id: string
          name: string
          created_by: string
          invite_code: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_by: string
          invite_code: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_by?: string
          invite_code?: string
          created_at?: string
          updated_at?: string
        }
      }
      group_members: {
        Row: {
          id: string
          group_id: string
          user_id: string
          joined_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          joined_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          joined_at?: string
        }
      }
      user_selections: {
        Row: {
          id: string
          user_id: string
          set_id: string
          priority: Priority
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          set_id: string
          priority: Priority
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          set_id?: string
          priority: Priority
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      priority: Priority
    }
  }
}

// Helper types for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Festival = Database['public']['Tables']['festivals']['Row']
export type FestivalDay = Database['public']['Tables']['festival_days']['Row']
export type Stage = Database['public']['Tables']['stages']['Row']
export type Set = Database['public']['Tables']['sets']['Row']
export type Group = Database['public']['Tables']['groups']['Row']
export type GroupMember = Database['public']['Tables']['group_members']['Row']
export type UserSelection = Database['public']['Tables']['user_selections']['Row']
