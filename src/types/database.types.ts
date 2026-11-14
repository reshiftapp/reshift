export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: string | null
          city: string | null
          avatar_url: string | null
          moderator_role: 'volunteer' | 'content_editor' | 'moderator' | 'super_admin' | null
          mobile_number: string | null
          id_card_url: string | null
          approval_status: 'pending' | 'approved' | 'rejected'
          rejection_reason: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          is_suspended: boolean
          suspension_reason: string | null
          suspended_at: string | null
          suspended_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: string | null
          city?: string | null
          avatar_url?: string | null
          moderator_role?: 'volunteer' | 'content_editor' | 'moderator' | 'super_admin' | null
          mobile_number?: string | null
          id_card_url?: string | null
          approval_status?: 'pending' | 'approved' | 'rejected'
          rejection_reason?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          is_suspended?: boolean
          suspension_reason?: string | null
          suspended_at?: string | null
          suspended_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: string | null
          city?: string | null
          avatar_url?: string | null
          moderator_role?: 'volunteer' | 'content_editor' | 'moderator' | 'super_admin' | null
          mobile_number?: string | null
          id_card_url?: string | null
          approval_status?: 'pending' | 'approved' | 'rejected'
          rejection_reason?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          is_suspended?: boolean
          suspension_reason?: string | null
          suspended_at?: string | null
          suspended_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      auth_otp_codes: {
        Row: {
          id: string
          email: string
          otp_hash: string
          expires_at: string
          verified: boolean
          attempts: number
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          otp_hash: string
          expires_at: string
          verified?: boolean
          attempts?: number
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          otp_hash?: string
          expires_at?: string
          verified?: boolean
          attempts?: number
          created_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          id: string
          city: string
          name: string
          for_whom: 'Girls' | 'Boys' | 'Any' | string
          location: string
          distance_km: number | null
          monthly_rent: number
          is_verified: boolean
          amenities: string[] | null
          description: string | null
          rating: number | null
          latitude: number | null
          longitude: number | null
          image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          city: string
          name: string
          for_whom: string
          location: string
          distance_km?: number | null
          monthly_rent: number
          is_verified?: boolean
          amenities?: string[] | null
          description?: string | null
          rating?: number | null
          latitude?: number | null
          longitude?: number | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          city?: string
          name?: string
          for_whom?: string
          location?: string
          distance_km?: number | null
          monthly_rent?: number
          is_verified?: boolean
          amenities?: string[] | null
          description?: string | null
          rating?: number | null
          latitude?: number | null
          longitude?: number | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          id: string
          city: string
          title: string
          event_date: string
          venue: string
          category: string
          image_url: string | null
          is_featured: boolean
          sort_order: number
          is_active: boolean
          description: string | null
          expires_at: string | null
        }
        Insert: {
          id?: string
          city: string
          title: string
          event_date: string
          venue: string
          category: string
          image_url?: string | null
          is_featured?: boolean
          sort_order?: number
          is_active?: boolean
          description?: string | null
          expires_at?: string | null
        }
        Update: {
          id?: string
          city?: string
          title?: string
          event_date?: string
          venue?: string
          category?: string
          image_url?: string | null
          is_featured?: boolean
          sort_order?: number
          is_active?: boolean
          description?: string | null
          expires_at?: string | null
        }
        Relationships: []
      }
      food_spots: {
        Row: {
          id: string
          city: string
          name: string
          location: string
          distance_km: number | null
          rating: number | null
          cuisine: string | null
          price_range: string | null
          is_available_now: boolean
          latitude: number | null
          longitude: number | null
        }
        Insert: {
          id?: string
          city: string
          name: string
          location: string
          distance_km?: number | null
          rating?: number | null
          cuisine?: string | null
          price_range?: string | null
          is_available_now?: boolean
          latitude?: number | null
          longitude?: number | null
        }
        Update: {
          id?: string
          city?: string
          name?: string
          location?: string
          distance_km?: number | null
          rating?: number | null
          cuisine?: string | null
          price_range?: string | null
          is_available_now?: boolean
          latitude?: number | null
          longitude?: number | null
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          id: string
          author_id: string
          content: string
          category: string
          city: string | null
          community_slug: string | null
          is_pinned: boolean
          is_hidden: boolean
          hidden_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          content: string
          category: string
          city?: string | null
          community_slug?: string | null
          is_pinned?: boolean
          is_hidden?: boolean
          hidden_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          content?: string
          category?: string
          city?: string | null
          community_slug?: string | null
          is_pinned?: boolean
          is_hidden?: boolean
          hidden_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_replies: {
        Row: {
          id: string
          post_id: string
          author_id: string
          body: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          author_id: string
          body: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          author_id?: string
          body?: string
          created_at?: string
        }
        Relationships: []
      }
      community_categories: {
        Row: {
          slug: string
          name: string
          description: string | null
          icon: string | null
          sort_order: number
          is_active: boolean
        }
        Insert: {
          slug: string
          name: string
          description?: string | null
          icon?: string | null
          sort_order?: number
          is_active?: boolean
        }
        Update: {
          slug?: string
          name?: string
          description?: string | null
          icon?: string | null
          sort_order?: number
          is_active?: boolean
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          id: string
          ticket_number: string | null
          user_id: string | null
          user_email: string | null
          category: string
          subject: string
          description: string
          priority: 'High' | 'Medium' | 'Low' | string
          status: 'Open' | 'In Review' | 'Resolved' | 'Closed' | string
          resolved_at: string | null
          resolved_by: string | null
          internal_status: string | null
          created_at: string
        }
        Insert: {
          id?: string
          ticket_number?: string | null
          user_id?: string | null
          user_email?: string | null
          category: string
          subject: string
          description: string
          priority?: string
          status?: string
          resolved_at?: string | null
          resolved_by?: string | null
          internal_status?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          ticket_number?: string | null
          user_id?: string | null
          user_email?: string | null
          category?: string
          subject?: string
          description?: string
          priority?: string
          status?: string
          resolved_at?: string | null
          resolved_by?: string | null
          internal_status?: string | null
          created_at?: string
        }
        Relationships: []
      }
      ticket_notes: {
        Row: {
          id: string
          ticket_id: string
          moderator_id: string
          note: string
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          moderator_id: string
          note: string
          created_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          moderator_id?: string
          note?: string
          created_at?: string
        }
        Relationships: []
      }
      relocation_steps: {
        Row: {
          id: string
          title: string
          subtitle: string | null
          sort_order: number
          is_active: boolean
        }
        Insert: {
          id: string
          title: string
          subtitle?: string | null
          sort_order?: number
          is_active?: boolean
        }
        Update: {
          id?: string
          title?: string
          subtitle?: string | null
          sort_order?: number
          is_active?: boolean
        }
        Relationships: []
      }
      user_relocation_steps: {
        Row: {
          user_id: string
          step_id: string
          is_completed: boolean
          updated_at: string
        }
        Insert: {
          user_id: string
          step_id: string
          is_completed?: boolean
          updated_at?: string
        }
        Update: {
          user_id?: string
          step_id?: string
          is_completed?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      transport_stops: {
        Row: {
          id: string
          city: string
          name: string
          distance: string | null
          route_info: string | null
          latitude: number | null
          longitude: number | null
          is_active: boolean
        }
        Insert: {
          id?: string
          city: string
          name: string
          distance?: string | null
          route_info?: string | null
          latitude?: number | null
          longitude?: number | null
          is_active?: boolean
        }
        Update: {
          id?: string
          city?: string
          name?: string
          distance?: string | null
          route_info?: string | null
          latitude?: number | null
          longitude?: number | null
          is_active?: boolean
        }
        Relationships: []
      }
      bus_routes: {
        Row: {
          id: string
          city: string
          route_number: string
          origin: string
          destination: string
          next_bus_minutes: number | null
          subsequent_buses_minutes: string | null
          current_stop_index: number | null
          is_active: boolean
        }
        Insert: {
          id?: string
          city: string
          route_number: string
          origin: string
          destination: string
          next_bus_minutes?: number | null
          subsequent_buses_minutes?: string | null
          current_stop_index?: number | null
          is_active?: boolean
        }
        Update: {
          id?: string
          city?: string
          route_number?: string
          origin?: string
          destination?: string
          next_bus_minutes?: number | null
          subsequent_buses_minutes?: string | null
          current_stop_index?: number | null
          is_active?: boolean
        }
        Relationships: []
      }
      bus_route_stops: {
        Row: {
          route_id: string
          stop_order: number
          stop_name: string
        }
        Insert: {
          route_id: string
          stop_order: number
          stop_name: string
        }
        Update: {
          route_id?: string
          stop_order?: number
          stop_name?: string
        }
        Relationships: []
      }
      essential_places: {
        Row: {
          id: string
          city: string
          name: string
          category: string
          address: string | null
          phone_number: string | null
          latitude: number | null
          longitude: number | null
          is_open: boolean
        }
        Insert: {
          id?: string
          city: string
          name: string
          category: string
          address?: string | null
          phone_number?: string | null
          latitude?: number | null
          longitude?: number | null
          is_open?: boolean
        }
        Update: {
          id?: string
          city?: string
          name?: string
          category?: string
          address?: string | null
          phone_number?: string | null
          latitude?: number | null
          longitude?: number | null
          is_open?: boolean
        }
        Relationships: []
      }
      local_guides: {
        Row: {
          id: string
          city: string
          title: string
          description: string | null
          category: string | null
          image_url: string | null
        }
        Insert: {
          id?: string
          city: string
          title: string
          description?: string | null
          category?: string | null
          image_url?: string | null
        }
        Update: {
          id?: string
          city?: string
          title?: string
          description?: string | null
          category?: string | null
          image_url?: string | null
        }
        Relationships: []
      }
      internet_plans: {
        Row: {
          id: string
          city: string
          provider_name: string
          plan_subtitle: string | null
          speed_mbps: number | null
          price_per_month: number | null
          status: string | null
          phone_number: string | null
          is_available: boolean
        }
        Insert: {
          id?: string
          city: string
          provider_name: string
          plan_subtitle?: string | null
          speed_mbps?: number | null
          price_per_month?: number | null
          status?: string | null
          phone_number?: string | null
          is_available?: boolean
        }
        Update: {
          id?: string
          city?: string
          provider_name?: string
          plan_subtitle?: string | null
          speed_mbps?: number | null
          price_per_month?: number | null
          status?: string | null
          phone_number?: string | null
          is_available?: boolean
        }
        Relationships: []
      }
      emergency_services: {
        Row: {
          id: string
          city: string
          name: string
          category: string
          phone_number: string
          description: string | null
          sort_order: number | null
        }
        Insert: {
          id?: string
          city: string
          name: string
          category: string
          phone_number: string
          description?: string | null
          sort_order?: number | null
        }
        Update: {
          id?: string
          city?: string
          name?: string
          category?: string
          phone_number?: string
          description?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      explore_cards: {
        Row: {
          id: string
          city: string
          title: string
          subtitle: string
          image_url: string | null
          action_route: string
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          city: string
          title: string
          subtitle: string
          image_url?: string | null
          action_route?: string
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          city?: string
          title?: string
          subtitle?: string
          image_url?: string | null
          action_route?: string
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      app_banners: {
        Row: {
          id: string
          placement: string
          image_url: string
          title: string | null
          subtitle: string | null
          action_url: string | null
          is_active: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          placement: string
          image_url: string
          title?: string | null
          subtitle?: string | null
          action_url?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          placement?: string
          image_url?: string
          title?: string | null
          subtitle?: string | null
          action_url?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
        }
        Relationships: []
      }
      push_notifications: {
        Row: {
          id: string
          title: string
          body: string
          target_city: string[]
          target_audience: string
          notification_type: string
          image_url: string | null
          deep_link: string | null
          scheduled_at: string | null
          sent_at: string | null
          sent_by: string | null
          delivery_count: number
          status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          body: string
          target_city?: string[]
          target_audience?: string
          notification_type?: string
          image_url?: string | null
          deep_link?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          sent_by?: string | null
          delivery_count?: number
          status?: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          body?: string
          target_city?: string[]
          target_audience?: string
          notification_type?: string
          image_url?: string | null
          deep_link?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          sent_by?: string | null
          delivery_count?: number
          status?: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
          created_at?: string
        }
        Relationships: []
      }
      moderator_audit_log: {
        Row: {
          id: string
          moderator_id: string | null
          action: string
          table_name: string
          record_id: string | null
          old_value: Json | null
          new_value: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          moderator_id?: string | null
          action: string
          table_name: string
          record_id?: string | null
          old_value?: Json | null
          new_value?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          moderator_id?: string | null
          action?: string
          table_name?: string
          record_id?: string | null
          old_value?: Json | null
          new_value?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: []
      }
      cities: {
        Row: {
          id: string
          name: string
          label: string
          state: string
          latitude: number
          longitude: number
          is_active: boolean
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          name: string
          label?: string
          state: string
          latitude: number
          longitude: number
          is_active?: boolean
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          label?: string
          state?: string
          latitude?: number
          longitude?: number
          is_active?: boolean
          created_at?: string
          created_by?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
