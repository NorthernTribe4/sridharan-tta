export type TeamRole = 'founder' | 'manager' | 'coach' | 'player'

export interface TeamMember {
  id: string
  full_name: string
  role: TeamRole
  bio: string
  achievements: string[]
  photo_url: string | null
  display_order: number
  short_label: string | null
  category: 'senior' | 'junior' | 'youth' | 'sub_youth' | null
  playing_style: 'attacking' | 'all_round' | 'defensive' | 'power' | 'spin' | null
  age: number | null
  years_training: number | null
  created_at: string
  updated_at: string
}

export interface MatchSet {
  id: string
  match_id: string
  set_number: number
  player1_score: number
  player2_score: number
  created_at: string
}

export interface Match {
  id: string
  match_date: string
  player1_id: string
  player2_id: string
  best_of: 3 | 5 | 7
  winner_id: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface MatchWithSets extends Match {
  sets: MatchSet[]
  player1: Pick<TeamMember, 'id' | 'full_name' | 'short_label' | 'photo_url'>
  player2: Pick<TeamMember, 'id' | 'full_name' | 'short_label' | 'photo_url'>
  winner: Pick<TeamMember, 'id' | 'full_name'> | null
}

export interface ScoreEntryFormValues {
  match_date: string
  player1_id: string
  player2_id: string
  best_of: 3 | 5 | 7
  sets: Array<{ player1_score: number; player2_score: number }>
}

export interface MatchesByMonth {
  monthLabel: string
  monthKey: string
  matches: MatchWithSets[]
}

export interface TeamByRole {
  founders: TeamMember[]
  managers: TeamMember[]
  coaches: TeamMember[]
  players: TeamMember[]
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string | null
  message: string
  is_read: boolean
  created_at: string
}

export interface Review {
  id: string
  reviewer_name: string
  reviewer_role: string
  rating: number
  review_text: string
  is_approved: boolean
  created_at: string
}

export interface MediaPhoto {
  id: string
  title: string
  description: string | null
  photo_url: string
  category: 'training' | 'matches' | 'events' | 'facilities'
  uploaded_at: string
}

export interface MediaVideo {
  id: string
  title: string
  description: string | null
  video_url: string
  thumbnail_url: string | null
  uploaded_at: string
}

export interface NewsArticle {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image: string | null
  author: string
  is_published: boolean
  published_at: string
}

export interface Magazine {
  id: string
  title: string
  cover_image: string
  pdf_url: string
  issue_date: string
  description: string | null
  uploaded_at: string
}
