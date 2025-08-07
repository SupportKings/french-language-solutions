export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      account: {
        Row: {
          accessToken: string | null
          accessTokenExpiresAt: string | null
          accountId: string
          createdAt: string
          id: string
          idToken: string | null
          password: string | null
          providerId: string
          refreshToken: string | null
          refreshTokenExpiresAt: string | null
          scope: string | null
          updatedAt: string
          userId: string
        }
        Insert: {
          accessToken?: string | null
          accessTokenExpiresAt?: string | null
          accountId: string
          createdAt: string
          id: string
          idToken?: string | null
          password?: string | null
          providerId: string
          refreshToken?: string | null
          refreshTokenExpiresAt?: string | null
          scope?: string | null
          updatedAt: string
          userId: string
        }
        Update: {
          accessToken?: string | null
          accessTokenExpiresAt?: string | null
          accountId?: string
          createdAt?: string
          id?: string
          idToken?: string | null
          password?: string | null
          providerId?: string
          refreshToken?: string | null
          refreshTokenExpiresAt?: string | null
          scope?: string | null
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: Database["public"]["Enums"]["audit_action_enum"]
          change_type: string | null
          changed_at: string | null
          changed_by: string | null
          client_id: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          record_id: string
          table_name: string
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action_enum"]
          change_type?: string | null
          changed_at?: string | null
          changed_by?: string | null
          client_id?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id: string
          table_name: string
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action_enum"]
          change_type?: string | null
          changed_at?: string | null
          changed_by?: string | null
          client_id?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string
          table_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      call_feedback: {
        Row: {
          call_date: string
          call_type: Database["public"]["Enums"]["call_type_enum"]
          client_id: string
          feedback_text: string | null
          id: string
          rating: number | null
          submitted_at: string | null
        }
        Insert: {
          call_date: string
          call_type: Database["public"]["Enums"]["call_type_enum"]
          client_id: string
          feedback_text?: string | null
          id?: string
          rating?: number | null
          submitted_at?: string | null
        }
        Update: {
          call_date?: string
          call_type?: Database["public"]["Enums"]["call_type_enum"]
          client_id?: string
          feedback_text?: string | null
          id?: string
          rating?: number | null
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_feedback_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      certifications: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          issuer: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          issuer: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          issuer?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      checklist_items: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_required: boolean | null
          sort_order: number
          template_id: string
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_required?: boolean | null
          sort_order: number
          template_id: string
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_required?: boolean | null
          sort_order?: number
          template_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "checklist_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_templates: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          type?: string
        }
        Relationships: []
      }
      client_activity: {
        Row: {
          activity_date: string
          checkin_completed: boolean | null
          client_id: string
          created_at: string | null
          id: string
          is_active: boolean
          meals_tracked: number | null
          messages_sent: number | null
          one_on_one_call_attended: boolean | null
          team_call_attended: boolean | null
          workouts_logged: number | null
        }
        Insert: {
          activity_date: string
          checkin_completed?: boolean | null
          client_id: string
          created_at?: string | null
          id?: string
          is_active: boolean
          meals_tracked?: number | null
          messages_sent?: number | null
          one_on_one_call_attended?: boolean | null
          team_call_attended?: boolean | null
          workouts_logged?: number | null
        }
        Update: {
          activity_date?: string
          checkin_completed?: boolean | null
          client_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean
          meals_tracked?: number | null
          messages_sent?: number | null
          one_on_one_call_attended?: boolean | null
          team_call_attended?: boolean | null
          workouts_logged?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "client_activity_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_assignments: {
        Row: {
          assigned_by: string | null
          assignment_type: string
          client_id: string
          created_at: string | null
          end_date: string | null
          id: string
          start_date: string
          user_id: string
        }
        Insert: {
          assigned_by?: string | null
          assignment_type: string
          client_id: string
          created_at?: string | null
          end_date?: string | null
          id?: string
          start_date: string
          user_id: string
        }
        Update: {
          assigned_by?: string | null
          assignment_type?: string
          client_id?: string
          created_at?: string | null
          end_date?: string | null
          id?: string
          start_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      client_goals: {
        Row: {
          assigned_by: string | null
          client_id: string
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          current_value: number | null
          description: string | null
          due_date: string | null
          goal_type_id: string | null
          id: string
          notes: string | null
          priority: string | null
          started_at: string | null
          status: string | null
          target_value: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_by?: string | null
          client_id: string
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          current_value?: number | null
          description?: string | null
          due_date?: string | null
          goal_type_id?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          started_at?: string | null
          status?: string | null
          target_value?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_by?: string | null
          client_id?: string
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          current_value?: number | null
          description?: string | null
          due_date?: string | null
          goal_type_id?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          started_at?: string | null
          status?: string | null
          target_value?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_goals_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_goals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_goals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_goals_goal_type_id_fkey"
            columns: ["goal_type_id"]
            isOneToOne: false
            referencedRelation: "goal_types"
            referencedColumns: ["id"]
          },
        ]
      }
      client_nps: {
        Row: {
          client_assignment_id: string | null
          client_id: string
          created_at: string | null
          id: string
          notes: string | null
          nps_score: number
          recorded_by: string | null
          recorded_date: string
        }
        Insert: {
          client_assignment_id?: string | null
          client_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          nps_score: number
          recorded_by?: string | null
          recorded_date: string
        }
        Update: {
          client_assignment_id?: string | null
          client_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          nps_score?: number
          recorded_by?: string | null
          recorded_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_nps_client_assignment_id_fkey"
            columns: ["client_assignment_id"]
            isOneToOne: false
            referencedRelation: "client_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_nps_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_nps_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      client_onboarding_progress: {
        Row: {
          checklist_item_id: string
          client_id: string
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          id: string
          is_completed: boolean | null
          notes: string | null
        }
        Insert: {
          checklist_item_id: string
          client_id: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          notes?: string | null
        }
        Update: {
          checklist_item_id?: string
          client_id?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_onboarding_progress_checklist_item_id_fkey"
            columns: ["checklist_item_id"]
            isOneToOne: false
            referencedRelation: "checklist_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_onboarding_progress_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_onboarding_progress_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      client_testimonials: {
        Row: {
          allow_public_sharing: boolean | null
          client_id: string
          content: string | null
          created_at: string | null
          id: string
          recorded_by: string | null
          recorded_date: string
          testimonial_type: Database["public"]["Enums"]["testimonial_type_enum"]
          testimonial_url: string | null
        }
        Insert: {
          allow_public_sharing?: boolean | null
          client_id: string
          content?: string | null
          created_at?: string | null
          id?: string
          recorded_by?: string | null
          recorded_date: string
          testimonial_type: Database["public"]["Enums"]["testimonial_type_enum"]
          testimonial_url?: string | null
        }
        Update: {
          allow_public_sharing?: boolean | null
          client_id?: string
          content?: string | null
          created_at?: string | null
          id?: string
          recorded_by?: string | null
          recorded_date?: string
          testimonial_type?: Database["public"]["Enums"]["testimonial_type_enum"]
          testimonial_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_testimonials_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_testimonials_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      client_units: {
        Row: {
          base_units: number
          calculated_units: number
          calculation_date: string
          client_id: string
          coach_id: string
          created_at: string | null
          escalations_factor: number | null
          id: string
          messages_factor: number | null
          nps_factor: number | null
          subjective_difficulty: number | null
          time_since_start_factor: number | null
          wins_factor: number | null
        }
        Insert: {
          base_units?: number
          calculated_units: number
          calculation_date: string
          client_id: string
          coach_id: string
          created_at?: string | null
          escalations_factor?: number | null
          id?: string
          messages_factor?: number | null
          nps_factor?: number | null
          subjective_difficulty?: number | null
          time_since_start_factor?: number | null
          wins_factor?: number | null
        }
        Update: {
          base_units?: number
          calculated_units?: number
          calculation_date?: string
          client_id?: string
          coach_id?: string
          created_at?: string | null
          escalations_factor?: number | null
          id?: string
          messages_factor?: number | null
          nps_factor?: number | null
          subjective_difficulty?: number | null
          time_since_start_factor?: number | null
          wins_factor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "client_units_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_units_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      client_win_tags: {
        Row: {
          id: string
          tag_id: string
          win_id: string
        }
        Insert: {
          id?: string
          tag_id: string
          win_id: string
        }
        Update: {
          id?: string
          tag_id?: string
          win_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_win_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "win_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_win_tags_win_id_fkey"
            columns: ["win_id"]
            isOneToOne: false
            referencedRelation: "client_wins"
            referencedColumns: ["id"]
          },
        ]
      }
      client_wins: {
        Row: {
          client_id: string
          created_at: string | null
          description: string | null
          id: string
          recorded_by: string | null
          title: string
          win_date: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          recorded_by?: string | null
          title: string
          win_date: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          recorded_by?: string | null
          title?: string
          win_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_wins_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_wins_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          churned_at: string | null
          consultation_form_completed: boolean | null
          created_at: string | null
          created_by: string | null
          email: string
          end_date: string | null
          first_name: string
          id: string
          last_name: string
          offboard_date: string | null
          onboarding_notes: string | null
          paused_at: string | null
          phone: string | null
          platform_access_status: string | null
          platform_link: string | null
          product_id: string | null
          renewal_date: string | null
          start_date: string
          status: string | null
          updated_at: string | null
          vip_terms_signed: boolean | null
        }
        Insert: {
          churned_at?: string | null
          consultation_form_completed?: boolean | null
          created_at?: string | null
          created_by?: string | null
          email: string
          end_date?: string | null
          first_name: string
          id?: string
          last_name: string
          offboard_date?: string | null
          onboarding_notes?: string | null
          paused_at?: string | null
          phone?: string | null
          platform_access_status?: string | null
          platform_link?: string | null
          product_id?: string | null
          renewal_date?: string | null
          start_date: string
          status?: string | null
          updated_at?: string | null
          vip_terms_signed?: boolean | null
        }
        Update: {
          churned_at?: string | null
          consultation_form_completed?: boolean | null
          created_at?: string | null
          created_by?: string | null
          email?: string
          end_date?: string | null
          first_name?: string
          id?: string
          last_name?: string
          offboard_date?: string | null
          onboarding_notes?: string | null
          paused_at?: string | null
          phone?: string | null
          platform_access_status?: string | null
          platform_link?: string | null
          product_id?: string | null
          renewal_date?: string | null
          start_date?: string
          status?: string | null
          updated_at?: string | null
          vip_terms_signed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_capacity: {
        Row: {
          coach_id: string
          created_at: string | null
          id: string
          is_paused: boolean | null
          max_client_units: number
          max_new_clients_per_week: number | null
          paused_at: string | null
          updated_at: string | null
        }
        Insert: {
          coach_id: string
          created_at?: string | null
          id?: string
          is_paused?: boolean | null
          max_client_units: number
          max_new_clients_per_week?: number | null
          paused_at?: string | null
          updated_at?: string | null
        }
        Update: {
          coach_id?: string
          created_at?: string | null
          id?: string
          is_paused?: boolean | null
          max_client_units?: number
          max_new_clients_per_week?: number | null
          paused_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_capacity_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: true
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_comments: {
        Row: {
          coach_id: string
          comment: string
          created_at: string | null
          id: string
          is_internal: boolean | null
          user_id: string
        }
        Insert: {
          coach_id: string
          comment: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          user_id: string
        }
        Update: {
          coach_id?: string
          comment?: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_comments_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_onboarding: {
        Row: {
          coach_id: string
          created_at: string | null
          current_status_start_date: string
          graduation_date: string | null
          id: string
          premier_coach_id: string | null
          start_date: string
          status_code: number
          status_name: string
          updated_at: string | null
        }
        Insert: {
          coach_id: string
          created_at?: string | null
          current_status_start_date: string
          graduation_date?: string | null
          id?: string
          premier_coach_id?: string | null
          start_date: string
          status_code: number
          status_name: string
          updated_at?: string | null
        }
        Update: {
          coach_id?: string
          created_at?: string | null
          current_status_start_date?: string
          graduation_date?: string | null
          id?: string
          premier_coach_id?: string | null
          start_date?: string
          status_code?: number
          status_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_onboarding_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_onboarding_premier_coach_id_fkey"
            columns: ["premier_coach_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_payments: {
        Row: {
          client_id: string
          coach_id: string
          cost_per_day: number
          created_at: string | null
          days_covered: number
          id: string
          is_paid: boolean | null
          paid_at: string | null
          payment_date: string
          total_amount: number
        }
        Insert: {
          client_id: string
          coach_id: string
          cost_per_day: number
          created_at?: string | null
          days_covered: number
          id?: string
          is_paid?: boolean | null
          paid_at?: string | null
          payment_date: string
          total_amount: number
        }
        Update: {
          client_id?: string
          coach_id?: string
          cost_per_day?: number
          created_at?: string | null
          days_covered?: number
          id?: string
          is_paid?: boolean | null
          paid_at?: string | null
          payment_date?: string
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "coach_payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_payments_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_teams: {
        Row: {
          coach_id: string
          created_at: string | null
          end_date: string | null
          id: string
          premier_coach_id: string
          start_date: string
        }
        Insert: {
          coach_id: string
          created_at?: string | null
          end_date?: string | null
          id?: string
          premier_coach_id: string
          start_date: string
        }
        Update: {
          coach_id?: string
          created_at?: string | null
          end_date?: string | null
          id?: string
          premier_coach_id?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_teams_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_teams_premier_coach_id_fkey"
            columns: ["premier_coach_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_settings: {
        Row: {
          created_at: string | null
          created_by: string | null
          effective_date: string
          id: string
          setting_name: string
          setting_value: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          effective_date: string
          id?: string
          setting_name: string
          setting_value: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          effective_date?: string
          id?: string
          setting_name?: string
          setting_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "financial_settings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      goal_types: {
        Row: {
          category: string | null
          category_id: string | null
          created_at: string | null
          default_duration_days: number | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_measurable: boolean | null
          name: string
          unit_of_measure: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          category_id?: string | null
          created_at?: string | null
          default_duration_days?: number | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_measurable?: boolean | null
          name: string
          unit_of_measure?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          category_id?: string | null
          created_at?: string | null
          default_duration_days?: number | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_measurable?: boolean | null
          name?: string
          unit_of_measure?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goal_types_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "goal_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      passkey: {
        Row: {
          aaguid: string | null
          backedUp: boolean
          counter: number
          createdAt: string | null
          credentialID: string
          deviceType: string
          id: string
          name: string | null
          publicKey: string
          transports: string | null
          userId: string
        }
        Insert: {
          aaguid?: string | null
          backedUp: boolean
          counter: number
          createdAt?: string | null
          credentialID: string
          deviceType: string
          id: string
          name?: string | null
          publicKey: string
          transports?: string | null
          userId: string
        }
        Update: {
          aaguid?: string | null
          backedUp?: boolean
          counter?: number
          createdAt?: string | null
          credentialID?: string
          deviceType?: string
          id?: string
          name?: string | null
          publicKey?: string
          transports?: string | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "passkey_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_plans: {
        Row: {
          client_id: string
          created_at: string | null
          created_by: string | null
          id: string
          is_deferred_pif: boolean | null
          number_of_payments: number
          payment_amount: number
          payment_frequency: Database["public"]["Enums"]["payment_frequency_enum"]
          payment_source: string | null
          payment_type: string | null
          start_date: string
          term_end_date: string
          total_amount: number
        }
        Insert: {
          client_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_deferred_pif?: boolean | null
          number_of_payments: number
          payment_amount: number
          payment_frequency: Database["public"]["Enums"]["payment_frequency_enum"]
          payment_source?: string | null
          payment_type?: string | null
          start_date: string
          term_end_date: string
          total_amount: number
        }
        Update: {
          client_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_deferred_pif?: boolean | null
          number_of_payments?: number
          payment_amount?: number
          payment_frequency?: Database["public"]["Enums"]["payment_frequency_enum"]
          payment_source?: string | null
          payment_type?: string | null
          start_date?: string
          term_end_date?: string
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "payment_plans_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          client_id: string
          created_at: string | null
          due_date: string
          id: string
          payment_date: string
          payment_method: string | null
          payment_plan_id: string
          status: Database["public"]["Enums"]["payment_status_enum"]
          stripe_transaction_id: string | null
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string | null
          due_date: string
          id?: string
          payment_date: string
          payment_method?: string | null
          payment_plan_id: string
          status: Database["public"]["Enums"]["payment_status_enum"]
          stripe_transaction_id?: string | null
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string | null
          due_date?: string
          id?: string
          payment_date?: string
          payment_method?: string | null
          payment_plan_id?: string
          status?: Database["public"]["Enums"]["payment_status_enum"]
          stripe_transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_payment_plan_id_fkey"
            columns: ["payment_plan_id"]
            isOneToOne: false
            referencedRelation: "payment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          client_unit: number
          created_at: string | null
          default_duration_months: number | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          client_unit?: number
          created_at?: string | null
          default_duration_months?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          client_unit?: number
          created_at?: string | null
          default_duration_months?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          permissions: Json | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          permissions?: Json | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          permissions?: Json | null
        }
        Relationships: []
      }
      session: {
        Row: {
          createdAt: string
          expiresAt: string
          id: string
          impersonatedBy: string | null
          ipAddress: string | null
          token: string
          updatedAt: string
          userAgent: string | null
          userId: string
        }
        Insert: {
          createdAt: string
          expiresAt: string
          id: string
          impersonatedBy?: string | null
          ipAddress?: string | null
          token: string
          updatedAt: string
          userAgent?: string | null
          userId: string
        }
        Update: {
          createdAt?: string
          expiresAt?: string
          id?: string
          impersonatedBy?: string | null
          ipAddress?: string | null
          token?: string
          updatedAt?: string
          userAgent?: string | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      specialization_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      specializations: {
        Row: {
          category: string | null
          category_id: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "specializations_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "specialization_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          data_type: string
          description: string | null
          id: string
          setting_key: string
          setting_value: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          data_type: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          data_type?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_comments: {
        Row: {
          comment: string
          created_at: string | null
          id: string
          is_internal: boolean | null
          ticket_id: string
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          ticket_id: string
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_comments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          assigned_to: string | null
          client_id: string | null
          closed_at: string | null
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_executive: boolean | null
          priority: Database["public"]["Enums"]["ticket_priority_enum"] | null
          reminder_date: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["ticket_status_enum"] | null
          ticket_type: Database["public"]["Enums"]["ticket_type_enum"]
          title: string
          unpause_date: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          client_id?: string | null
          closed_at?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_executive?: boolean | null
          priority?: Database["public"]["Enums"]["ticket_priority_enum"] | null
          reminder_date?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status_enum"] | null
          ticket_type: Database["public"]["Enums"]["ticket_type_enum"]
          title: string
          unpause_date?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          client_id?: string | null
          closed_at?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_executive?: boolean | null
          priority?: Database["public"]["Enums"]["ticket_priority_enum"] | null
          reminder_date?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status_enum"] | null
          ticket_type?: Database["public"]["Enums"]["ticket_type_enum"]
          title?: string
          unpause_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user: {
        Row: {
          banExpires: string | null
          banned: boolean | null
          banReason: string | null
          bio: string | null
          calendar_link: string | null
          createdAt: string
          email: string
          emailVerified: boolean
          id: string
          image: string | null
          name: string
          role: string | null
          updatedAt: string
        }
        Insert: {
          banExpires?: string | null
          banned?: boolean | null
          banReason?: string | null
          bio?: string | null
          calendar_link?: string | null
          createdAt: string
          email: string
          emailVerified: boolean
          id: string
          image?: string | null
          name: string
          role?: string | null
          updatedAt: string
        }
        Update: {
          banExpires?: string | null
          banned?: boolean | null
          banReason?: string | null
          bio?: string | null
          calendar_link?: string | null
          createdAt?: string
          email?: string
          emailVerified?: boolean
          id?: string
          image?: string | null
          name?: string
          role?: string | null
          updatedAt?: string
        }
        Relationships: []
      }
      user_certifications: {
        Row: {
          certificate_url: string | null
          certification_id: string
          created_at: string | null
          date_achieved: string
          expiry_date: string | null
          id: string
          user_id: string
          verified: boolean | null
        }
        Insert: {
          certificate_url?: string | null
          certification_id: string
          created_at?: string | null
          date_achieved: string
          expiry_date?: string | null
          id?: string
          user_id: string
          verified?: boolean | null
        }
        Update: {
          certificate_url?: string | null
          certification_id?: string
          created_at?: string | null
          date_achieved?: string
          expiry_date?: string | null
          id?: string
          user_id?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "user_certifications_certification_id_fkey"
            columns: ["certification_id"]
            isOneToOne: false
            referencedRelation: "certifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_certifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user_specializations: {
        Row: {
          created_at: string | null
          id: string
          is_primary: boolean | null
          specialization_id: string
          user_id: string
          years_experience: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          specialization_id: string
          user_id: string
          years_experience?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          specialization_id?: string
          user_id?: string
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_specializations_specialization_id_fkey"
            columns: ["specialization_id"]
            isOneToOne: false
            referencedRelation: "specializations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_specializations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      verification: {
        Row: {
          createdAt: string | null
          expiresAt: string
          id: string
          identifier: string
          updatedAt: string | null
          value: string
        }
        Insert: {
          createdAt?: string | null
          expiresAt: string
          id: string
          identifier: string
          updatedAt?: string | null
          value: string
        }
        Update: {
          createdAt?: string | null
          expiresAt?: string
          id?: string
          identifier?: string
          updatedAt?: string | null
          value?: string
        }
        Relationships: []
      }
      win_tags: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_client_units: {
        Args: { client_uuid: string }
        Returns: number
      }
      current_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_client_id_from_record: {
        Args: { table_name: string; record_data: Json }
        Returns: string
      }
      set_user_id: {
        Args: { user_id: string }
        Returns: undefined
      }
      trigger_client_unit_webhook: {
        Args: { client_uuid: string }
        Returns: undefined
      }
    }
    Enums: {
      audit_action_enum: "INSERT" | "UPDATE" | "DELETE"
      call_type_enum: "onboarding" | "check_in" | "monthly" | "other"
      payment_frequency_enum: "monthly" | "bi_weekly" | "weekly" | "one_time"
      payment_status_enum: "pending" | "completed" | "failed" | "refunded"
      testimonial_type_enum: "video" | "text" | "google_review" | "other"
      ticket_priority_enum: "low" | "medium" | "high" | "urgent"
      ticket_status_enum:
        | "open"
        | "in_progress"
        | "resolved"
        | "closed"
        | "paused"
      ticket_type_enum:
        | "billing"
        | "tech_problem"
        | "escalation"
        | "coaching_transfer"
        | "retention"
        | "pausing"
        | "other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      audit_action_enum: ["INSERT", "UPDATE", "DELETE"],
      call_type_enum: ["onboarding", "check_in", "monthly", "other"],
      payment_frequency_enum: ["monthly", "bi_weekly", "weekly", "one_time"],
      payment_status_enum: ["pending", "completed", "failed", "refunded"],
      testimonial_type_enum: ["video", "text", "google_review", "other"],
      ticket_priority_enum: ["low", "medium", "high", "urgent"],
      ticket_status_enum: [
        "open",
        "in_progress",
        "resolved",
        "closed",
        "paused",
      ],
      ticket_type_enum: [
        "billing",
        "tech_problem",
        "escalation",
        "coaching_transfer",
        "retention",
        "pausing",
        "other",
      ],
    },
  },
} as const
