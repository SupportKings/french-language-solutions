export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
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
          createdAt?: string
          id: string
          idToken?: string | null
          password?: string | null
          providerId: string
          refreshToken?: string | null
          refreshTokenExpiresAt?: string | null
          scope?: string | null
          updatedAt?: string
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
      athlete_applications: {
        Row: {
          athlete_id: string | null
          commitment_date: string | null
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          internal_notes: string | null
          is_deleted: boolean | null
          last_interaction_at: string | null
          offer_date: string | null
          offer_notes: string | null
          origin_campaign_id: string | null
          origin_lead_list_id: string | null
          origin_lead_list_priority: number | null
          program_id: string | null
          scholarship_amount_per_year: number | null
          scholarship_percent: number | null
          stage: Database["public"]["Enums"]["application_stage_enum"] | null
          start_date: string | null
          university_id: string | null
          updated_at: string | null
        }
        Insert: {
          athlete_id?: string | null
          commitment_date?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          internal_notes?: string | null
          is_deleted?: boolean | null
          last_interaction_at?: string | null
          offer_date?: string | null
          offer_notes?: string | null
          origin_campaign_id?: string | null
          origin_lead_list_id?: string | null
          origin_lead_list_priority?: number | null
          program_id?: string | null
          scholarship_amount_per_year?: number | null
          scholarship_percent?: number | null
          stage?: Database["public"]["Enums"]["application_stage_enum"] | null
          start_date?: string | null
          university_id?: string | null
          updated_at?: string | null
        }
        Update: {
          athlete_id?: string | null
          commitment_date?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          internal_notes?: string | null
          is_deleted?: boolean | null
          last_interaction_at?: string | null
          offer_date?: string | null
          offer_notes?: string | null
          origin_campaign_id?: string | null
          origin_lead_list_id?: string | null
          origin_lead_list_priority?: number | null
          program_id?: string | null
          scholarship_amount_per_year?: number | null
          scholarship_percent?: number | null
          stage?: Database["public"]["Enums"]["application_stage_enum"] | null
          start_date?: string | null
          university_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "athlete_applications_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_applications_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_applications_origin_campaign_id_fkey"
            columns: ["origin_campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_applications_origin_lead_list_id_fkey"
            columns: ["origin_lead_list_id"]
            isOneToOne: false
            referencedRelation: "school_lead_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_applications_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_applications_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      athlete_results: {
        Row: {
          altitude: boolean | null
          athlete_id: string | null
          date_recorded: string | null
          deleted_at: string | null
          deleted_by: string | null
          event_id: string | null
          hand_timed: boolean | null
          id: string
          internal_notes: string | null
          is_deleted: boolean | null
          location: string | null
          organized_event: boolean | null
          performance_mark: number | null
          wind: number | null
        }
        Insert: {
          altitude?: boolean | null
          athlete_id?: string | null
          date_recorded?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          event_id?: string | null
          hand_timed?: boolean | null
          id?: string
          internal_notes?: string | null
          is_deleted?: boolean | null
          location?: string | null
          organized_event?: boolean | null
          performance_mark?: number | null
          wind?: number | null
        }
        Update: {
          altitude?: boolean | null
          athlete_id?: string | null
          date_recorded?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          event_id?: string | null
          hand_timed?: boolean | null
          id?: string
          internal_notes?: string | null
          is_deleted?: boolean | null
          location?: string | null
          organized_event?: boolean | null
          performance_mark?: number | null
          wind?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "athlete_results_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_results_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_results_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      athletes: {
        Row: {
          act_score: number | null
          athlete_net_url: string | null
          city: string | null
          contact_email: string | null
          contract_date: string | null
          country: string | null
          date_of_birth: string | null
          deleted_at: string | null
          deleted_by: string | null
          discord_channel_id: string | null
          discord_channel_url: string | null
          discord_username: string | null
          full_name: string
          gender: Database["public"]["Enums"]["athlete_gender_enum"] | null
          go_live_date: string | null
          google_drive_folder_url: string | null
          gpa: number | null
          graduation_year: number | null
          high_school: string | null
          id: string
          initial_cash_collected_usd: number | null
          initial_contract_amount_usd: number | null
          initial_payment_type:
            | Database["public"]["Enums"]["payment_type_enum"]
            | null
          instagram_handle: string | null
          internal_notes: string | null
          is_deleted: boolean | null
          last_sales_call_at: string | null
          lead_source: string | null
          milesplit_url: string | null
          onboarding_form_data: Json | null
          phone: string | null
          sales_call_note: string | null
          sales_call_recording_url: string | null
          sales_closer_id: string | null
          sales_setter_id: string | null
          sat_score: number | null
          sending_email_id: string | null
          state: string | null
          student_type: Database["public"]["Enums"]["student_type_enum"] | null
          year_entering_university: number | null
        }
        Insert: {
          act_score?: number | null
          athlete_net_url?: string | null
          city?: string | null
          contact_email?: string | null
          contract_date?: string | null
          country?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          discord_channel_id?: string | null
          discord_channel_url?: string | null
          discord_username?: string | null
          full_name: string
          gender?: Database["public"]["Enums"]["athlete_gender_enum"] | null
          go_live_date?: string | null
          google_drive_folder_url?: string | null
          gpa?: number | null
          graduation_year?: number | null
          high_school?: string | null
          id?: string
          initial_cash_collected_usd?: number | null
          initial_contract_amount_usd?: number | null
          initial_payment_type?:
            | Database["public"]["Enums"]["payment_type_enum"]
            | null
          instagram_handle?: string | null
          internal_notes?: string | null
          is_deleted?: boolean | null
          last_sales_call_at?: string | null
          lead_source?: string | null
          milesplit_url?: string | null
          onboarding_form_data?: Json | null
          phone?: string | null
          sales_call_note?: string | null
          sales_call_recording_url?: string | null
          sales_closer_id?: string | null
          sales_setter_id?: string | null
          sat_score?: number | null
          sending_email_id?: string | null
          state?: string | null
          student_type?: Database["public"]["Enums"]["student_type_enum"] | null
          year_entering_university?: number | null
        }
        Update: {
          act_score?: number | null
          athlete_net_url?: string | null
          city?: string | null
          contact_email?: string | null
          contract_date?: string | null
          country?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          discord_channel_id?: string | null
          discord_channel_url?: string | null
          discord_username?: string | null
          full_name?: string
          gender?: Database["public"]["Enums"]["athlete_gender_enum"] | null
          go_live_date?: string | null
          google_drive_folder_url?: string | null
          gpa?: number | null
          graduation_year?: number | null
          high_school?: string | null
          id?: string
          initial_cash_collected_usd?: number | null
          initial_contract_amount_usd?: number | null
          initial_payment_type?:
            | Database["public"]["Enums"]["payment_type_enum"]
            | null
          instagram_handle?: string | null
          internal_notes?: string | null
          is_deleted?: boolean | null
          last_sales_call_at?: string | null
          lead_source?: string | null
          milesplit_url?: string | null
          onboarding_form_data?: Json | null
          phone?: string | null
          sales_call_note?: string | null
          sales_call_recording_url?: string | null
          sales_closer_id?: string | null
          sales_setter_id?: string | null
          sat_score?: number | null
          sending_email_id?: string | null
          state?: string | null
          student_type?: Database["public"]["Enums"]["student_type_enum"] | null
          year_entering_university?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "athletes_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athletes_sales_closer_id_fkey"
            columns: ["sales_closer_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athletes_sales_setter_id_fkey"
            columns: ["sales_setter_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athletes_sending_email_id_fkey"
            columns: ["sending_email_id"]
            isOneToOne: false
            referencedRelation: "email_sending_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action_details: Json | null
          id: string
          record_id: string | null
          table_name: string | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          action_details?: Json | null
          id: string
          record_id?: string | null
          table_name?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          action_details?: Json | null
          id?: string
          record_id?: string | null
          table_name?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      ball_knowledge: {
        Row: {
          about_coach_id: string | null
          about_program_id: string | null
          about_university_id: string | null
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          from_athlete_id: string | null
          id: string
          internal_notes: string | null
          is_deleted: boolean | null
          note: string
          review_after: string | null
          source_type: string | null
          updated_at: string | null
        }
        Insert: {
          about_coach_id?: string | null
          about_program_id?: string | null
          about_university_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          from_athlete_id?: string | null
          id?: string
          internal_notes?: string | null
          is_deleted?: boolean | null
          note: string
          review_after?: string | null
          source_type?: string | null
          updated_at?: string | null
        }
        Update: {
          about_coach_id?: string | null
          about_program_id?: string | null
          about_university_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          from_athlete_id?: string | null
          id?: string
          internal_notes?: string | null
          is_deleted?: boolean | null
          note?: string
          review_after?: string | null
          source_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ball_knowledge_about_coach_id_fkey"
            columns: ["about_coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ball_knowledge_about_program_id_fkey"
            columns: ["about_program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ball_knowledge_about_university_id_fkey"
            columns: ["about_university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ball_knowledge_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ball_knowledge_from_athlete_id_fkey"
            columns: ["from_athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_status: {
        Row: {
          created_at: string
          error_time_hours: number | null
          id: string
          status_name: string
          updated_at: string
          warning_time_hours: number | null
        }
        Insert: {
          created_at?: string
          error_time_hours?: number | null
          id?: string
          status_name: string
          updated_at?: string
          warning_time_hours?: number | null
        }
        Update: {
          created_at?: string
          error_time_hours?: number | null
          id?: string
          status_name?: string
          updated_at?: string
          warning_time_hours?: number | null
        }
        Relationships: []
      }
      campaign_leads: {
        Row: {
          application_id: string | null
          campaign_id: string | null
          coach_id: string | null
          deleted_at: string | null
          deleted_by: string | null
          first_reply_at: string | null
          id: string
          include_reason: string | null
          included_at: string | null
          internal_notes: string | null
          is_deleted: boolean | null
          program_id: string | null
          source_lead_list_id: string | null
          status:
            | Database["public"]["Enums"]["campaign_lead_status_enum"]
            | null
          university_id: string | null
          university_job_id: string | null
        }
        Insert: {
          application_id?: string | null
          campaign_id?: string | null
          coach_id?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          first_reply_at?: string | null
          id?: string
          include_reason?: string | null
          included_at?: string | null
          internal_notes?: string | null
          is_deleted?: boolean | null
          program_id?: string | null
          source_lead_list_id?: string | null
          status?:
            | Database["public"]["Enums"]["campaign_lead_status_enum"]
            | null
          university_id?: string | null
          university_job_id?: string | null
        }
        Update: {
          application_id?: string | null
          campaign_id?: string | null
          coach_id?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          first_reply_at?: string | null
          id?: string
          include_reason?: string | null
          included_at?: string | null
          internal_notes?: string | null
          is_deleted?: boolean | null
          program_id?: string | null
          source_lead_list_id?: string | null
          status?:
            | Database["public"]["Enums"]["campaign_lead_status_enum"]
            | null
          university_id?: string | null
          university_job_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_leads_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "athlete_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_leads_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_leads_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_leads_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_leads_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_leads_source_lead_list_id_fkey"
            columns: ["source_lead_list_id"]
            isOneToOne: false
            referencedRelation: "school_lead_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_leads_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_leads_university_job_id_fkey"
            columns: ["university_job_id"]
            isOneToOne: false
            referencedRelation: "university_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          athlete_id: string | null
          daily_send_cap: number | null
          deleted_at: string | null
          deleted_by: string | null
          end_date: string | null
          id: string
          internal_notes: string | null
          is_deleted: boolean | null
          leads_loaded: number | null
          leads_remaining: number | null
          leads_total: number | null
          name: string | null
          primary_lead_list_id: string | null
          seed_campaign_id: string | null
          sending_tool_campaign_url: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["campaign_status_enum"] | null
          type: Database["public"]["Enums"]["campaign_type_enum"] | null
        }
        Insert: {
          athlete_id?: string | null
          daily_send_cap?: number | null
          deleted_at?: string | null
          deleted_by?: string | null
          end_date?: string | null
          id?: string
          internal_notes?: string | null
          is_deleted?: boolean | null
          leads_loaded?: number | null
          leads_remaining?: number | null
          leads_total?: number | null
          name?: string | null
          primary_lead_list_id?: string | null
          seed_campaign_id?: string | null
          sending_tool_campaign_url?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status_enum"] | null
          type?: Database["public"]["Enums"]["campaign_type_enum"] | null
        }
        Update: {
          athlete_id?: string | null
          daily_send_cap?: number | null
          deleted_at?: string | null
          deleted_by?: string | null
          end_date?: string | null
          id?: string
          internal_notes?: string | null
          is_deleted?: boolean | null
          leads_loaded?: number | null
          leads_remaining?: number | null
          leads_total?: number | null
          name?: string | null
          primary_lead_list_id?: string | null
          seed_campaign_id?: string | null
          sending_tool_campaign_url?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status_enum"] | null
          type?: Database["public"]["Enums"]["campaign_type_enum"] | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_primary_lead_list_id_fkey"
            columns: ["primary_lead_list_id"]
            isOneToOne: false
            referencedRelation: "school_lead_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_seed_campaign_id_fkey"
            columns: ["seed_campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_definition_items: {
        Row: {
          checklist_definition_id: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          id: string
          internal_notes: string | null
          is_deleted: boolean | null
          required: boolean | null
          sort_order: number | null
          title: string | null
        }
        Insert: {
          checklist_definition_id?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string
          internal_notes?: string | null
          is_deleted?: boolean | null
          required?: boolean | null
          sort_order?: number | null
          title?: string | null
        }
        Update: {
          checklist_definition_id?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string
          internal_notes?: string | null
          is_deleted?: boolean | null
          required?: boolean | null
          sort_order?: number | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_definition_items_checklist_definition_id_fkey"
            columns: ["checklist_definition_id"]
            isOneToOne: false
            referencedRelation: "checklist_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_definition_items_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_definitions: {
        Row: {
          deleted_at: string | null
          deleted_by: string | null
          id: string
          internal_notes: string | null
          is_deleted: boolean | null
          name: string | null
          type: string | null
        }
        Insert: {
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          internal_notes?: string | null
          is_deleted?: boolean | null
          name?: string | null
          type?: string | null
        }
        Update: {
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          internal_notes?: string | null
          is_deleted?: boolean | null
          name?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_definitions_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_items: {
        Row: {
          blocked_reason: string | null
          checklist_id: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          done_at: string | null
          done_by_team_member_id: string | null
          id: string
          internal_notes: string | null
          is_applicable: boolean | null
          is_deleted: boolean | null
          is_done: boolean | null
          required: boolean | null
          sort_order: number | null
          template_item_id: string | null
          title: string | null
        }
        Insert: {
          blocked_reason?: string | null
          checklist_id?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          done_at?: string | null
          done_by_team_member_id?: string | null
          id: string
          internal_notes?: string | null
          is_applicable?: boolean | null
          is_deleted?: boolean | null
          is_done?: boolean | null
          required?: boolean | null
          sort_order?: number | null
          template_item_id?: string | null
          title?: string | null
        }
        Update: {
          blocked_reason?: string | null
          checklist_id?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          done_at?: string | null
          done_by_team_member_id?: string | null
          id?: string
          internal_notes?: string | null
          is_applicable?: boolean | null
          is_deleted?: boolean | null
          is_done?: boolean | null
          required?: boolean | null
          sort_order?: number | null
          template_item_id?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_items_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_items_done_by_team_member_id_fkey"
            columns: ["done_by_team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_items_template_item_id_fkey"
            columns: ["template_item_id"]
            isOneToOne: false
            referencedRelation: "checklist_definition_items"
            referencedColumns: ["id"]
          },
        ]
      }
      checklists: {
        Row: {
          athlete_id: string | null
          checklist_definition_id: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          internal_notes: string | null
          is_deleted: boolean | null
        }
        Insert: {
          athlete_id?: string | null
          checklist_definition_id?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id: string
          internal_notes?: string | null
          is_deleted?: boolean | null
        }
        Update: {
          athlete_id?: string | null
          checklist_definition_id?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          internal_notes?: string | null
          is_deleted?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "checklists_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklists_checklist_definition_id_fkey"
            columns: ["checklist_definition_id"]
            isOneToOne: false
            referencedRelation: "checklist_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklists_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          billing_status_id: string | null
          client_name: string
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          onboarding_status_id: string | null
          updated_at: string
        }
        Insert: {
          billing_status_id?: string | null
          client_name: string
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          onboarding_status_id?: string | null
          updated_at?: string
        }
        Update: {
          billing_status_id?: string | null
          client_name?: string
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          onboarding_status_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_billing_status_id_fkey"
            columns: ["billing_status_id"]
            isOneToOne: false
            referencedRelation: "billing_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_onboarding_status_id_fkey"
            columns: ["onboarding_status_id"]
            isOneToOne: false
            referencedRelation: "onboarding_status"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_responsibilities: {
        Row: {
          deleted_at: string | null
          deleted_by: string | null
          event_group: Database["public"]["Enums"]["event_group_enum"] | null
          event_id: string | null
          id: string
          internal_notes: string | null
          is_deleted: boolean | null
          university_job_id: string | null
        }
        Insert: {
          deleted_at?: string | null
          deleted_by?: string | null
          event_group?: Database["public"]["Enums"]["event_group_enum"] | null
          event_id?: string | null
          id?: string
          internal_notes?: string | null
          is_deleted?: boolean | null
          university_job_id?: string | null
        }
        Update: {
          deleted_at?: string | null
          deleted_by?: string | null
          event_group?: Database["public"]["Enums"]["event_group_enum"] | null
          event_id?: string | null
          id?: string
          internal_notes?: string | null
          is_deleted?: boolean | null
          university_job_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_responsibilities_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_responsibilities_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_responsibilities_university_job_id_fkey"
            columns: ["university_job_id"]
            isOneToOne: false
            referencedRelation: "university_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      coaches: {
        Row: {
          deleted_at: string | null
          deleted_by: string | null
          email: string | null
          full_name: string | null
          id: string
          instagram_profile: string | null
          internal_notes: string | null
          is_deleted: boolean | null
          linkedin_profile: string | null
          phone: string | null
          primary_specialty:
            | Database["public"]["Enums"]["event_group_enum"]
            | null
          twitter_profile: string | null
        }
        Insert: {
          deleted_at?: string | null
          deleted_by?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          instagram_profile?: string | null
          internal_notes?: string | null
          is_deleted?: boolean | null
          linkedin_profile?: string | null
          phone?: string | null
          primary_specialty?:
            | Database["public"]["Enums"]["event_group_enum"]
            | null
          twitter_profile?: string | null
        }
        Update: {
          deleted_at?: string | null
          deleted_by?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          instagram_profile?: string | null
          internal_notes?: string | null
          is_deleted?: boolean | null
          linkedin_profile?: string | null
          phone?: string | null
          primary_specialty?:
            | Database["public"]["Enums"]["event_group_enum"]
            | null
          twitter_profile?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coaches_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      conferences: {
        Row: {
          governing_body_id: string
          id: string
          is_active: boolean
          name: string
          notes: string | null
        }
        Insert: {
          governing_body_id: string
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
        }
        Update: {
          governing_body_id?: string
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conferences_governing_body_id_fkey"
            columns: ["governing_body_id"]
            isOneToOne: false
            referencedRelation: "governing_bodies"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_athletes: {
        Row: {
          athlete_id: string | null
          contact_id: string | null
          deleted_at: string | null
          deleted_by: string | null
          end_date: string | null
          id: string
          internal_notes: string | null
          is_deleted: boolean | null
          is_primary: boolean | null
          relationship: string | null
          start_date: string | null
        }
        Insert: {
          athlete_id?: string | null
          contact_id?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          end_date?: string | null
          id?: string
          internal_notes?: string | null
          is_deleted?: boolean | null
          is_primary?: boolean | null
          relationship?: string | null
          start_date?: string | null
        }
        Update: {
          athlete_id?: string | null
          contact_id?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          end_date?: string | null
          id?: string
          internal_notes?: string | null
          is_deleted?: boolean | null
          is_primary?: boolean | null
          relationship?: string | null
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_athletes_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_athletes_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_athletes_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          deleted_at: string | null
          deleted_by: string | null
          email: string | null
          full_name: string | null
          id: string
          internal_notes: string | null
          is_deleted: boolean | null
          phone: string | null
          preferred_contact_method: string | null
        }
        Insert: {
          deleted_at?: string | null
          deleted_by?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          internal_notes?: string | null
          is_deleted?: boolean | null
          phone?: string | null
          preferred_contact_method?: string | null
        }
        Update: {
          deleted_at?: string | null
          deleted_by?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          internal_notes?: string | null
          is_deleted?: boolean | null
          phone?: string | null
          preferred_contact_method?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      divisions: {
        Row: {
          governing_body_id: string
          id: string
          is_active: boolean
          level: string
          name: string
          notes: string | null
        }
        Insert: {
          governing_body_id: string
          id?: string
          is_active?: boolean
          level: string
          name: string
          notes?: string | null
        }
        Update: {
          governing_body_id?: string
          id?: string
          is_active?: boolean
          level?: string
          name?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "divisions_governing_body_id_fkey"
            columns: ["governing_body_id"]
            isOneToOne: false
            referencedRelation: "governing_bodies"
            referencedColumns: ["id"]
          },
        ]
      }
      domains: {
        Row: {
          athlete_id: string | null
          deleted_at: string | null
          deleted_by: string | null
          domain_url: string | null
          id: string
          internal_notes: string | null
          is_deleted: boolean | null
          status_option_id: number | null
        }
        Insert: {
          athlete_id?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          domain_url?: string | null
          id: string
          internal_notes?: string | null
          is_deleted?: boolean | null
          status_option_id?: number | null
        }
        Update: {
          athlete_id?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          domain_url?: string | null
          id?: string
          internal_notes?: string | null
          is_deleted?: boolean | null
          status_option_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "domains_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "domains_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "domains_status_option_id_fkey"
            columns: ["status_option_id"]
            isOneToOne: false
            referencedRelation: "status_options"
            referencedColumns: ["id"]
          },
        ]
      }
      email_sending_accounts: {
        Row: {
          deleted_at: string | null
          deleted_by: string | null
          domain_id: string | null
          id: string
          internal_notes: string | null
          is_deleted: boolean | null
          name: string | null
          status_option_id: number | null
          username: string | null
        }
        Insert: {
          deleted_at?: string | null
          deleted_by?: string | null
          domain_id?: string | null
          id?: string
          internal_notes?: string | null
          is_deleted?: boolean | null
          name?: string | null
          status_option_id?: number | null
          username?: string | null
        }
        Update: {
          deleted_at?: string | null
          deleted_by?: string | null
          domain_id?: string | null
          id?: string
          internal_notes?: string | null
          is_deleted?: boolean | null
          name?: string | null
          status_option_id?: number | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_sending_accounts_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_sending_accounts_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_sending_accounts_status_option_id_fkey"
            columns: ["status_option_id"]
            isOneToOne: false
            referencedRelation: "status_options"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_status_values: {
        Row: {
          entity_id: number
          entity_type: string
          id: number
          set_at: string | null
          set_by: number | null
          status_category_id: number | null
          status_option_id: number | null
        }
        Insert: {
          entity_id: number
          entity_type: string
          id?: number
          set_at?: string | null
          set_by?: number | null
          status_category_id?: number | null
          status_option_id?: number | null
        }
        Update: {
          entity_id?: number
          entity_type?: string
          id?: number
          set_at?: string | null
          set_by?: number | null
          status_category_id?: number | null
          status_option_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "entity_status_values_status_category_id_fkey"
            columns: ["status_category_id"]
            isOneToOne: false
            referencedRelation: "status_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entity_status_values_status_option_id_fkey"
            columns: ["status_option_id"]
            isOneToOne: false
            referencedRelation: "status_options"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_types: {
        Row: {
          created_at: string | null
          display_name: string | null
          id: number
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          id?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          id?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          code: string | null
          deleted_at: string | null
          deleted_by: string | null
          event_group: Database["public"]["Enums"]["event_group_enum"] | null
          id: string
          internal_notes: string | null
          is_deleted: boolean | null
          name: string | null
          units: Database["public"]["Enums"]["event_unit_enum"] | null
        }
        Insert: {
          code?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          event_group?: Database["public"]["Enums"]["event_group_enum"] | null
          id?: string
          internal_notes?: string | null
          is_deleted?: boolean | null
          name?: string | null
          units?: Database["public"]["Enums"]["event_unit_enum"] | null
        }
        Update: {
          code?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          event_group?: Database["public"]["Enums"]["event_group_enum"] | null
          id?: string
          internal_notes?: string | null
          is_deleted?: boolean | null
          name?: string | null
          units?: Database["public"]["Enums"]["event_unit_enum"] | null
        }
        Relationships: [
          {
            foreignKeyName: "events_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      governing_bodies: {
        Row: {
          id: string
          name: string
          notes: string | null
        }
        Insert: {
          id?: string
          name: string
          notes?: string | null
        }
        Update: {
          id?: string
          name?: string
          notes?: string | null
        }
        Relationships: []
      }
      onboarding_status: {
        Row: {
          created_at: string
          error_time_hours: number | null
          id: string
          status_name: string
          updated_at: string
          warning_time_hours: number | null
        }
        Insert: {
          created_at?: string
          error_time_hours?: number | null
          id?: string
          status_name: string
          updated_at?: string
          warning_time_hours?: number | null
        }
        Update: {
          created_at?: string
          error_time_hours?: number | null
          id?: string
          status_name?: string
          updated_at?: string
          warning_time_hours?: number | null
        }
        Relationships: []
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
      program_events: {
        Row: {
          deleted_at: string | null
          deleted_by: string | null
          end_date: string | null
          event_id: string | null
          id: string
          internal_notes: string | null
          is_active: boolean | null
          is_deleted: boolean | null
          program_id: string | null
          start_date: string | null
        }
        Insert: {
          deleted_at?: string | null
          deleted_by?: string | null
          end_date?: string | null
          event_id?: string | null
          id?: string
          internal_notes?: string | null
          is_active?: boolean | null
          is_deleted?: boolean | null
          program_id?: string | null
          start_date?: string | null
        }
        Update: {
          deleted_at?: string | null
          deleted_by?: string | null
          end_date?: string | null
          event_id?: string | null
          id?: string
          internal_notes?: string | null
          is_active?: boolean | null
          is_deleted?: boolean | null
          program_id?: string | null
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "program_events_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_events_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          deleted_at: string | null
          deleted_by: string | null
          gender: Database["public"]["Enums"]["program_gender_enum"] | null
          id: string
          internal_notes: string | null
          is_deleted: boolean | null
          team_instagram: string | null
          team_twitter: string | null
          team_url: string | null
          university_id: string | null
        }
        Insert: {
          deleted_at?: string | null
          deleted_by?: string | null
          gender?: Database["public"]["Enums"]["program_gender_enum"] | null
          id?: string
          internal_notes?: string | null
          is_deleted?: boolean | null
          team_instagram?: string | null
          team_twitter?: string | null
          team_url?: string | null
          university_id?: string | null
        }
        Update: {
          deleted_at?: string | null
          deleted_by?: string | null
          gender?: Database["public"]["Enums"]["program_gender_enum"] | null
          id?: string
          internal_notes?: string | null
          is_deleted?: boolean | null
          team_instagram?: string | null
          team_twitter?: string | null
          team_url?: string | null
          university_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "programs_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programs_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      replies: {
        Row: {
          application_id: string | null
          athlete_id: string | null
          campaign_id: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          internal_notes: string | null
          is_deleted: boolean | null
          occurred_at: string | null
          summary: string | null
          type: Database["public"]["Enums"]["reply_type_enum"] | null
          university_job_id: string | null
        }
        Insert: {
          application_id?: string | null
          athlete_id?: string | null
          campaign_id?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          internal_notes?: string | null
          is_deleted?: boolean | null
          occurred_at?: string | null
          summary?: string | null
          type?: Database["public"]["Enums"]["reply_type_enum"] | null
          university_job_id?: string | null
        }
        Update: {
          application_id?: string | null
          athlete_id?: string | null
          campaign_id?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          internal_notes?: string | null
          is_deleted?: boolean | null
          occurred_at?: string | null
          summary?: string | null
          type?: Database["public"]["Enums"]["reply_type_enum"] | null
          university_job_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "replies_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "athlete_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "replies_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "replies_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "replies_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "replies_university_job_id_fkey"
            columns: ["university_job_id"]
            isOneToOne: false
            referencedRelation: "university_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          id: string
          role_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          role_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          role_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      school_lead_list_entries: {
        Row: {
          added_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          internal_notes: string | null
          is_deleted: boolean | null
          priority: string | null
          program_id: string | null
          school_lead_list_id: string | null
          status: string | null
          university_id: string | null
        }
        Insert: {
          added_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          internal_notes?: string | null
          is_deleted?: boolean | null
          priority?: string | null
          program_id?: string | null
          school_lead_list_id?: string | null
          status?: string | null
          university_id?: string | null
        }
        Update: {
          added_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          internal_notes?: string | null
          is_deleted?: boolean | null
          priority?: string | null
          program_id?: string | null
          school_lead_list_id?: string | null
          status?: string | null
          university_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "school_lead_list_entries_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_lead_list_entries_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_lead_list_entries_school_lead_list_id_fkey"
            columns: ["school_lead_list_id"]
            isOneToOne: false
            referencedRelation: "school_lead_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_lead_list_entries_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      school_lead_lists: {
        Row: {
          athlete_id: string | null
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          internal_notes: string | null
          is_deleted: boolean | null
          name: string | null
          priority: number | null
          season_label: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          athlete_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          internal_notes?: string | null
          is_deleted?: boolean | null
          name?: string | null
          priority?: number | null
          season_label?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          athlete_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          internal_notes?: string | null
          is_deleted?: boolean | null
          name?: string | null
          priority?: number | null
          season_label?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "school_lead_lists_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_lead_lists_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      sending_tool_lead_lists: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          file_url: string | null
          format: string | null
          generated_at: string | null
          generated_by: string | null
          id: string
          internal_notes: string | null
          is_deleted: boolean | null
          row_count: number | null
          updated_at: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          file_url?: string | null
          format?: string | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          internal_notes?: string | null
          is_deleted?: boolean | null
          row_count?: number | null
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          file_url?: string | null
          format?: string | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          internal_notes?: string | null
          is_deleted?: boolean | null
          row_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sending_tool_lead_lists_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sending_tool_lead_lists_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
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
          createdAt?: string
          expiresAt: string
          id: string
          impersonatedBy?: string | null
          ipAddress?: string | null
          token: string
          updatedAt?: string
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
      status_categories: {
        Row: {
          created_at: string | null
          display_name: string | null
          entity_type_id: number | null
          id: number
          is_required: boolean | null
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          entity_type_id?: number | null
          id?: number
          is_required?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          entity_type_id?: number | null
          id?: number
          is_required?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "status_categories_entity_type_id_fkey"
            columns: ["entity_type_id"]
            isOneToOne: false
            referencedRelation: "entity_types"
            referencedColumns: ["id"]
          },
        ]
      }
      status_change_log: {
        Row: {
          changed_at: string | null
          changed_by: number | null
          entity_id: number
          entity_type: string
          id: number
          new_status_option_id: number | null
          notes: string | null
          old_status_option_id: number | null
          status_category_id: number | null
        }
        Insert: {
          changed_at?: string | null
          changed_by?: number | null
          entity_id: number
          entity_type: string
          id?: number
          new_status_option_id?: number | null
          notes?: string | null
          old_status_option_id?: number | null
          status_category_id?: number | null
        }
        Update: {
          changed_at?: string | null
          changed_by?: number | null
          entity_id?: number
          entity_type?: string
          id?: number
          new_status_option_id?: number | null
          notes?: string | null
          old_status_option_id?: number | null
          status_category_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "status_change_log_new_status_option_id_fkey"
            columns: ["new_status_option_id"]
            isOneToOne: false
            referencedRelation: "status_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_change_log_old_status_option_id_fkey"
            columns: ["old_status_option_id"]
            isOneToOne: false
            referencedRelation: "status_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_change_log_status_category_id_fkey"
            columns: ["status_category_id"]
            isOneToOne: false
            referencedRelation: "status_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      status_options: {
        Row: {
          color: string | null
          created_at: string | null
          digit: number | null
          display_name: string | null
          id: number
          is_active: boolean | null
          is_default: boolean | null
          name: string
          sort_order: number | null
          status_category_id: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          digit?: number | null
          display_name?: string | null
          id?: number
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          sort_order?: number | null
          status_category_id?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          digit?: number | null
          display_name?: string | null
          id?: number
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          sort_order?: number | null
          status_category_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "status_options_status_category_id_fkey"
            columns: ["status_category_id"]
            isOneToOne: false
            referencedRelation: "status_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          email: string | null
          first_name: string | null
          id: string
          internal_notes: string | null
          is_active: boolean | null
          is_deleted: boolean | null
          job_title: string | null
          last_name: string | null
          timezone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          internal_notes?: string | null
          is_active?: boolean | null
          is_deleted?: boolean | null
          job_title?: string | null
          last_name?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          internal_notes?: string | null
          is_active?: boolean | null
          is_deleted?: boolean | null
          job_title?: string | null
          last_name?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "internal_team_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_team_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      universities: {
        Row: {
          acceptance_rate_pct: number | null
          act_composite_25th: number | null
          act_composite_75th: number | null
          average_gpa: number | null
          city: string | null
          conference_raw: string | null
          deleted_at: string | null
          deleted_by: string | null
          division_raw: string | null
          email_blocked: boolean | null
          id: string
          institution_flags_raw: string | null
          internal_notes: string | null
          ipeds_nces_id: string | null
          is_active: boolean | null
          is_deleted: boolean | null
          majors_offered_url: string | null
          name: string | null
          notes: string | null
          region: string | null
          religious_affiliation: string | null
          sat_ebrw_25th: number | null
          sat_ebrw_75th: number | null
          sat_math_25th: number | null
          sat_math_75th: number | null
          size_of_city: string | null
          state: string | null
          total_yearly_cost: number | null
          type_public_private: string | null
          undergraduate_enrollment: number | null
          us_news_ranking_liberal_arts_2018: number | null
          us_news_ranking_national_2018: number | null
        }
        Insert: {
          acceptance_rate_pct?: number | null
          act_composite_25th?: number | null
          act_composite_75th?: number | null
          average_gpa?: number | null
          city?: string | null
          conference_raw?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          division_raw?: string | null
          email_blocked?: boolean | null
          id?: string
          institution_flags_raw?: string | null
          internal_notes?: string | null
          ipeds_nces_id?: string | null
          is_active?: boolean | null
          is_deleted?: boolean | null
          majors_offered_url?: string | null
          name?: string | null
          notes?: string | null
          region?: string | null
          religious_affiliation?: string | null
          sat_ebrw_25th?: number | null
          sat_ebrw_75th?: number | null
          sat_math_25th?: number | null
          sat_math_75th?: number | null
          size_of_city?: string | null
          state?: string | null
          total_yearly_cost?: number | null
          type_public_private?: string | null
          undergraduate_enrollment?: number | null
          us_news_ranking_liberal_arts_2018?: number | null
          us_news_ranking_national_2018?: number | null
        }
        Update: {
          acceptance_rate_pct?: number | null
          act_composite_25th?: number | null
          act_composite_75th?: number | null
          average_gpa?: number | null
          city?: string | null
          conference_raw?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          division_raw?: string | null
          email_blocked?: boolean | null
          id?: string
          institution_flags_raw?: string | null
          internal_notes?: string | null
          ipeds_nces_id?: string | null
          is_active?: boolean | null
          is_deleted?: boolean | null
          majors_offered_url?: string | null
          name?: string | null
          notes?: string | null
          region?: string | null
          religious_affiliation?: string | null
          sat_ebrw_25th?: number | null
          sat_ebrw_75th?: number | null
          sat_math_25th?: number | null
          sat_math_75th?: number | null
          size_of_city?: string | null
          state?: string | null
          total_yearly_cost?: number | null
          type_public_private?: string | null
          undergraduate_enrollment?: number | null
          us_news_ranking_liberal_arts_2018?: number | null
          us_news_ranking_national_2018?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "universities_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      university_conferences: {
        Row: {
          conference_id: string | null
          end_date: string | null
          id: string
          notes: string | null
          start_date: string
          university_id: string
        }
        Insert: {
          conference_id?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          start_date: string
          university_id: string
        }
        Update: {
          conference_id?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          start_date?: string
          university_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "university_conferences_conference_id_fkey"
            columns: ["conference_id"]
            isOneToOne: false
            referencedRelation: "conferences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "university_conferences_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      university_divisions: {
        Row: {
          division_id: string
          end_date: string | null
          id: string
          notes: string | null
          start_date: string
          university_id: string
        }
        Insert: {
          division_id: string
          end_date?: string | null
          id?: string
          notes?: string | null
          start_date: string
          university_id: string
        }
        Update: {
          division_id?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          start_date?: string
          university_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "university_divisions_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "university_divisions_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      university_jobs: {
        Row: {
          coach_id: string | null
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          end_date: string | null
          id: string
          internal_notes: string | null
          is_deleted: boolean | null
          job_title: string | null
          program_id: string | null
          program_scope:
            | Database["public"]["Enums"]["program_scope_enum"]
            | null
          start_date: string | null
          university_id: string | null
          work_email: string | null
          work_phone: string | null
        }
        Insert: {
          coach_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          end_date?: string | null
          id?: string
          internal_notes?: string | null
          is_deleted?: boolean | null
          job_title?: string | null
          program_id?: string | null
          program_scope?:
            | Database["public"]["Enums"]["program_scope_enum"]
            | null
          start_date?: string | null
          university_id?: string | null
          work_email?: string | null
          work_phone?: string | null
        }
        Update: {
          coach_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          end_date?: string | null
          id?: string
          internal_notes?: string | null
          is_deleted?: boolean | null
          job_title?: string | null
          program_id?: string | null
          program_scope?:
            | Database["public"]["Enums"]["program_scope_enum"]
            | null
          start_date?: string | null
          university_id?: string | null
          work_email?: string | null
          work_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "university_jobs_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "university_jobs_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "university_jobs_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "university_jobs_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      user: {
        Row: {
          banExpires: string | null
          banned: boolean | null
          banReason: string | null
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
          createdAt?: string
          email: string
          emailVerified: boolean
          id: string
          image?: string | null
          name: string
          role?: string | null
          updatedAt?: string
        }
        Update: {
          banExpires?: string | null
          banned?: boolean | null
          banReason?: string | null
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
      verification: {
        Row: {
          createdAt: string
          expiresAt: string
          id: string
          identifier: string
          updatedAt: string
          value: string
        }
        Insert: {
          createdAt?: string
          expiresAt: string
          id: string
          identifier: string
          updatedAt?: string
          value: string
        }
        Update: {
          createdAt?: string
          expiresAt?: string
          id?: string
          identifier?: string
          updatedAt?: string
          value?: string
        }
        Relationships: []
      }
      world_record_logs: {
        Row: {
          created_at: string | null
          id: string
          record_value: number | null
          user_id: string | null
          world_record_type_id: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          record_value?: number | null
          user_id?: string | null
          world_record_type_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          record_value?: number | null
          user_id?: string | null
          world_record_type_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "world_record_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "world_record_logs_world_record_type_id_fkey"
            columns: ["world_record_type_id"]
            isOneToOne: false
            referencedRelation: "world_record_types"
            referencedColumns: ["id"]
          },
        ]
      }
      world_record_types: {
        Row: {
          best_direction: string | null
          id: string
          internal_notes: string | null
          name: string | null
          record_sql: string | null
        }
        Insert: {
          best_direction?: string | null
          id: string
          internal_notes?: string | null
          name?: string | null
          record_sql?: string | null
        }
        Update: {
          best_direction?: string | null
          id?: string
          internal_notes?: string | null
          name?: string | null
          record_sql?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_ball_knowledge_for_coach: {
        Args: {
          p_coach_id: string
          p_page?: number
          p_page_size?: number
          p_search?: string
          p_sort_column?: string
          p_sort_direction?: string
        }
        Returns: {
          about_coach_id: string
          about_coach_name: string
          about_program_gender: string
          about_program_id: string
          about_university_id: string
          about_university_name: string
          created_at: string
          from_athlete_id: string
          id: string
          internal_notes: string
          note: string
          relation_type: string
          review_after: string
          source_type: string
          total_count: number
          updated_at: string
        }[]
      }
      get_ball_knowledge_for_program: {
        Args: {
          p_page?: number
          p_page_size?: number
          p_program_id: string
          p_search?: string
          p_sort_column?: string
          p_sort_direction?: string
        }
        Returns: {
          about_coach_id: string
          about_coach_name: string
          about_program_gender: string
          about_program_id: string
          about_university_id: string
          about_university_name: string
          created_at: string
          from_athlete_id: string
          id: string
          internal_notes: string
          note: string
          relation_type: string
          review_after: string
          source_type: string
          total_count: number
          updated_at: string
        }[]
      }
      get_ball_knowledge_for_university: {
        Args: {
          p_page?: number
          p_page_size?: number
          p_search?: string
          p_sort_column?: string
          p_sort_direction?: string
          p_university_id: string
        }
        Returns: {
          about_coach_id: string
          about_coach_name: string
          about_program_gender: string
          about_program_id: string
          about_university_id: string
          about_university_name: string
          created_at: string
          from_athlete_id: string
          id: string
          internal_notes: string
          note: string
          relation_type: string
          review_after: string
          source_type: string
          total_count: number
          updated_at: string
        }[]
      }
    }
    Enums: {
      application_stage_enum:
        | "intro"
        | "ongoing"
        | "visit"
        | "offer"
        | "committed"
        | "dropped"
      athlete_gender_enum: "male" | "female"
      campaign_lead_status_enum: "pending" | "replied" | "suppressed"
      campaign_status_enum:
        | "draft"
        | "active"
        | "paused"
        | "completed"
        | "exhausted"
      campaign_type_enum: "top" | "second_pass" | "third_pass" | "personal_best"
      event_group_enum:
        | "sprints"
        | "hurdles"
        | "distance"
        | "jumps"
        | "throws"
        | "relays"
        | "combined"
      event_unit_enum: "seconds" | "meters" | "points"
      payment_type_enum: "paid_in_full" | "installments" | "deposit" | "other"
      program_gender_enum: "men" | "women"
      program_scope_enum: "men" | "women" | "both" | "n/a"
      reply_type_enum: "call" | "text" | "email" | "instagram"
      student_type_enum:
        | "high_school"
        | "transfer"
        | "international"
        | "gap_year"
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
  public: {
    Enums: {
      application_stage_enum: [
        "intro",
        "ongoing",
        "visit",
        "offer",
        "committed",
        "dropped",
      ],
      athlete_gender_enum: ["male", "female"],
      campaign_lead_status_enum: ["pending", "replied", "suppressed"],
      campaign_status_enum: [
        "draft",
        "active",
        "paused",
        "completed",
        "exhausted",
      ],
      campaign_type_enum: ["top", "second_pass", "third_pass", "personal_best"],
      event_group_enum: [
        "sprints",
        "hurdles",
        "distance",
        "jumps",
        "throws",
        "relays",
        "combined",
      ],
      event_unit_enum: ["seconds", "meters", "points"],
      payment_type_enum: ["paid_in_full", "installments", "deposit", "other"],
      program_gender_enum: ["men", "women"],
      program_scope_enum: ["men", "women", "both", "n/a"],
      reply_type_enum: ["call", "text", "email", "instagram"],
      student_type_enum: [
        "high_school",
        "transfer",
        "international",
        "gap_year",
        "other",
      ],
    },
  },
} as const
