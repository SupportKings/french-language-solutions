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
    PostgrestVersion: "13.0.4"
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
      attendance_records: {
        Row: {
          class_id: string | null
          cohort_id: string
          created_at: string
          homework_completed: boolean | null
          id: string
          marked_at: string | null
          marked_by: string | null
          notes: string | null
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          class_id?: string | null
          cohort_id: string
          created_at?: string
          homework_completed?: boolean | null
          id?: string
          marked_at?: string | null
          marked_by?: string | null
          notes?: string | null
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          class_id?: string | null
          cohort_id?: string
          created_at?: string
          homework_completed?: boolean | null
          id?: string
          marked_at?: string | null
          marked_by?: string | null
          notes?: string | null
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_class_id_classes_id_fk"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_cohort_id_cohorts_id_fk"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_marked_by_teachers_id_fk"
            columns: ["marked_by"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_student_id_students_id_fk"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      automated_follow_ups: {
        Row: {
          airtable_record_id: string | null
          completed_at: string | null
          created_at: string
          current_step: number
          id: string
          last_message_sent_at: string | null
          sequence_id: string
          started_at: string
          status: Database["public"]["Enums"]["automated_follow_up_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          airtable_record_id?: string | null
          completed_at?: string | null
          created_at?: string
          current_step?: number
          id?: string
          last_message_sent_at?: string | null
          sequence_id: string
          started_at?: string
          status?: Database["public"]["Enums"]["automated_follow_up_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          airtable_record_id?: string | null
          completed_at?: string | null
          created_at?: string
          current_step?: number
          id?: string
          last_message_sent_at?: string | null
          sequence_id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["automated_follow_up_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "automated_follow_ups_sequence_id_template_follow_up_sequences_i"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "template_follow_up_sequences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automated_follow_ups_student_id_students_id_fk"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          airtable_record_id: string | null
          cohort_id: string
          created_at: string
          deleted_at: string | null
          end_time: string
          google_calendar_event_id: string | null
          google_drive_folder_id: string | null
          id: string
          meeting_link: string | null
          notes: string | null
          start_time: string
          status: Database["public"]["Enums"]["class_status"]
          teacher_id: string | null
          updated_at: string
        }
        Insert: {
          airtable_record_id?: string | null
          cohort_id: string
          created_at?: string
          deleted_at?: string | null
          end_time: string
          google_calendar_event_id?: string | null
          google_drive_folder_id?: string | null
          id?: string
          meeting_link?: string | null
          notes?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["class_status"]
          teacher_id?: string | null
          updated_at?: string
        }
        Update: {
          airtable_record_id?: string | null
          cohort_id?: string
          created_at?: string
          deleted_at?: string | null
          end_time?: string
          google_calendar_event_id?: string | null
          google_drive_folder_id?: string | null
          id?: string
          meeting_link?: string | null
          notes?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["class_status"]
          teacher_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_cohort_id_cohorts_id_fk"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_teacher_id_teachers_id_fk"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      cohorts: {
        Row: {
          airtable_record_id: string | null
          cohort_status: Database["public"]["Enums"]["cohort_status"]
          created_at: string
          current_level_id: string | null
          google_drive_folder_id: string | null
          id: string
          max_students: number | null
          product_id: string | null
          room_type: Database["public"]["Enums"]["room_type"] | null
          setup_finalized: boolean | null
          start_date: string | null
          starting_level_id: string | null
          updated_at: string
        }
        Insert: {
          airtable_record_id?: string | null
          cohort_status?: Database["public"]["Enums"]["cohort_status"]
          created_at?: string
          current_level_id?: string | null
          google_drive_folder_id?: string | null
          id?: string
          max_students?: number | null
          product_id?: string | null
          room_type?: Database["public"]["Enums"]["room_type"] | null
          setup_finalized?: boolean | null
          start_date?: string | null
          starting_level_id?: string | null
          updated_at?: string
        }
        Update: {
          airtable_record_id?: string | null
          cohort_status?: Database["public"]["Enums"]["cohort_status"]
          created_at?: string
          current_level_id?: string | null
          google_drive_folder_id?: string | null
          id?: string
          max_students?: number | null
          product_id?: string | null
          room_type?: Database["public"]["Enums"]["room_type"] | null
          setup_finalized?: boolean | null
          start_date?: string | null
          starting_level_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cohorts_current_level_id_language_levels_id_fk"
            columns: ["current_level_id"]
            isOneToOne: false
            referencedRelation: "language_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cohorts_product_id_products_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cohorts_starting_level_id_language_levels_id_fk"
            columns: ["starting_level_id"]
            isOneToOne: false
            referencedRelation: "language_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          airtable_created_at: string | null
          airtable_record_id: string | null
          cohort_id: string
          created_at: string
          id: string
          status: Database["public"]["Enums"]["enrollment_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          airtable_created_at?: string | null
          airtable_record_id?: string | null
          cohort_id: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["enrollment_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          airtable_created_at?: string | null
          airtable_record_id?: string | null
          cohort_id?: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["enrollment_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_cohort_id_cohorts_id_fk"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_id_students_id_fk"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      language_levels: {
        Row: {
          airtable_record_id: string | null
          code: string
          created_at: string
          display_name: string
          id: string
          level_group: string
          level_number: number | null
          updated_at: string
        }
        Insert: {
          airtable_record_id?: string | null
          code: string
          created_at?: string
          display_name: string
          id?: string
          level_group: string
          level_number?: number | null
          updated_at?: string
        }
        Update: {
          airtable_record_id?: string | null
          code?: string
          created_at?: string
          display_name?: string
          id?: string
          level_group?: string
          level_number?: number | null
          updated_at?: string
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
      products: {
        Row: {
          airtable_record_id: string | null
          created_at: string
          display_name: string
          format: Database["public"]["Enums"]["product_format"]
          id: string
          location: Database["public"]["Enums"]["product_location"]
          pandadoc_contract_template_id: string | null
          signup_link_for_self_checkout: string | null
          updated_at: string
        }
        Insert: {
          airtable_record_id?: string | null
          created_at?: string
          display_name: string
          format: Database["public"]["Enums"]["product_format"]
          id?: string
          location: Database["public"]["Enums"]["product_location"]
          pandadoc_contract_template_id?: string | null
          signup_link_for_self_checkout?: string | null
          updated_at?: string
        }
        Update: {
          airtable_record_id?: string | null
          created_at?: string
          display_name?: string
          format?: Database["public"]["Enums"]["product_format"]
          id?: string
          location?: Database["public"]["Enums"]["product_location"]
          pandadoc_contract_template_id?: string | null
          signup_link_for_self_checkout?: string | null
          updated_at?: string
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
      student_assessments: {
        Row: {
          airtable_record_id: string | null
          calendar_event_url: string | null
          created_at: string
          id: string
          interview_held_by: string | null
          is_paid: boolean
          level_checked_by: string | null
          level_id: string | null
          meeting_recording_url: string | null
          notes: string | null
          result: Database["public"]["Enums"]["assessment_result"]
          scheduled_for: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          airtable_record_id?: string | null
          calendar_event_url?: string | null
          created_at?: string
          id?: string
          interview_held_by?: string | null
          is_paid?: boolean
          level_checked_by?: string | null
          level_id?: string | null
          meeting_recording_url?: string | null
          notes?: string | null
          result?: Database["public"]["Enums"]["assessment_result"]
          scheduled_for?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          airtable_record_id?: string | null
          calendar_event_url?: string | null
          created_at?: string
          id?: string
          interview_held_by?: string | null
          is_paid?: boolean
          level_checked_by?: string | null
          level_id?: string | null
          meeting_recording_url?: string | null
          notes?: string | null
          result?: Database["public"]["Enums"]["assessment_result"]
          scheduled_for?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_assessments_interview_held_by_teachers_id_fk"
            columns: ["interview_held_by"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_assessments_level_checked_by_teachers_id_fk"
            columns: ["level_checked_by"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_assessments_level_id_language_levels_id_fk"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "language_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_assessments_student_id_students_id_fk"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          added_to_email_newsletter: boolean | null
          airtable_created_at: string | null
          airtable_record_id: string | null
          city: string | null
          communication_channel: Database["public"]["Enums"]["communication_channel"]
          convertkit_id: string | null
          created_at: string
          deleted_at: string | null
          desired_starting_language_level_id: string | null
          email: string | null
          first_name: string | null
          full_name: string
          id: string
          initial_channel: Database["public"]["Enums"]["initial_channel"] | null
          is_full_beginner: boolean | null
          is_under_16: boolean | null
          last_name: string | null
          mobile_phone_number: string | null
          openphone_contact_id: string | null
          purpose_to_learn: string | null
          respondent_id: string | null
          stripe_customer_id: string | null
          subjective_deadline_for_student: string | null
          tally_form_submission_id: string | null
          updated_at: string
          user_id: string | null
          website_quiz_submission_date: string | null
        }
        Insert: {
          added_to_email_newsletter?: boolean | null
          airtable_created_at?: string | null
          airtable_record_id?: string | null
          city?: string | null
          communication_channel?: Database["public"]["Enums"]["communication_channel"]
          convertkit_id?: string | null
          created_at?: string
          deleted_at?: string | null
          desired_starting_language_level_id?: string | null
          email?: string | null
          first_name?: string | null
          full_name: string
          id?: string
          initial_channel?:
            | Database["public"]["Enums"]["initial_channel"]
            | null
          is_full_beginner?: boolean | null
          is_under_16?: boolean | null
          last_name?: string | null
          mobile_phone_number?: string | null
          openphone_contact_id?: string | null
          purpose_to_learn?: string | null
          respondent_id?: string | null
          stripe_customer_id?: string | null
          subjective_deadline_for_student?: string | null
          tally_form_submission_id?: string | null
          updated_at?: string
          user_id?: string | null
          website_quiz_submission_date?: string | null
        }
        Update: {
          added_to_email_newsletter?: boolean | null
          airtable_created_at?: string | null
          airtable_record_id?: string | null
          city?: string | null
          communication_channel?: Database["public"]["Enums"]["communication_channel"]
          convertkit_id?: string | null
          created_at?: string
          deleted_at?: string | null
          desired_starting_language_level_id?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string
          id?: string
          initial_channel?:
            | Database["public"]["Enums"]["initial_channel"]
            | null
          is_full_beginner?: boolean | null
          is_under_16?: boolean | null
          last_name?: string | null
          mobile_phone_number?: string | null
          openphone_contact_id?: string | null
          purpose_to_learn?: string | null
          respondent_id?: string | null
          stripe_customer_id?: string | null
          subjective_deadline_for_student?: string | null
          tally_form_submission_id?: string | null
          updated_at?: string
          user_id?: string | null
          website_quiz_submission_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_desired_starting_language_level_id_language_levels_id_"
            columns: ["desired_starting_language_level_id"]
            isOneToOne: false
            referencedRelation: "language_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          admin_notes: string | null
          airtable_record_id: string | null
          available_for_booking: boolean | null
          available_for_in_person_classes: boolean | null
          available_for_online_classes: boolean | null
          contract_type: Database["public"]["Enums"]["contract_type"] | null
          created_at: string
          days_available_in_person:
            | Database["public"]["Enums"]["day_of_week"][]
            | null
          days_available_online:
            | Database["public"]["Enums"]["day_of_week"][]
            | null
          first_name: string
          google_calendar_id: string | null
          group_class_bonus_terms:
            | Database["public"]["Enums"]["group_class_bonus_terms"]
            | null
          id: string
          last_name: string
          max_students_in_person: number | null
          max_students_online: number | null
          maximum_hours_per_day: number | null
          maximum_hours_per_week: number | null
          mobile_phone_number: string | null
          onboarding_status: Database["public"]["Enums"]["onboarding_status"]
          qualified_for_under_16: boolean | null
          role: Database["public"]["Enums"]["team_roles"][] | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          airtable_record_id?: string | null
          available_for_booking?: boolean | null
          available_for_in_person_classes?: boolean | null
          available_for_online_classes?: boolean | null
          contract_type?: Database["public"]["Enums"]["contract_type"] | null
          created_at?: string
          days_available_in_person?:
            | Database["public"]["Enums"]["day_of_week"][]
            | null
          days_available_online?:
            | Database["public"]["Enums"]["day_of_week"][]
            | null
          first_name: string
          google_calendar_id?: string | null
          group_class_bonus_terms?:
            | Database["public"]["Enums"]["group_class_bonus_terms"]
            | null
          id?: string
          last_name: string
          max_students_in_person?: number | null
          max_students_online?: number | null
          maximum_hours_per_day?: number | null
          maximum_hours_per_week?: number | null
          mobile_phone_number?: string | null
          onboarding_status?: Database["public"]["Enums"]["onboarding_status"]
          qualified_for_under_16?: boolean | null
          role?: Database["public"]["Enums"]["team_roles"][] | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          airtable_record_id?: string | null
          available_for_booking?: boolean | null
          available_for_in_person_classes?: boolean | null
          available_for_online_classes?: boolean | null
          contract_type?: Database["public"]["Enums"]["contract_type"] | null
          created_at?: string
          days_available_in_person?:
            | Database["public"]["Enums"]["day_of_week"][]
            | null
          days_available_online?:
            | Database["public"]["Enums"]["day_of_week"][]
            | null
          first_name?: string
          google_calendar_id?: string | null
          group_class_bonus_terms?:
            | Database["public"]["Enums"]["group_class_bonus_terms"]
            | null
          id?: string
          last_name?: string
          max_students_in_person?: number | null
          max_students_online?: number | null
          maximum_hours_per_day?: number | null
          maximum_hours_per_week?: number | null
          mobile_phone_number?: string | null
          onboarding_status?: Database["public"]["Enums"]["onboarding_status"]
          qualified_for_under_16?: boolean | null
          role?: Database["public"]["Enums"]["team_roles"][] | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      template_follow_up_messages: {
        Row: {
          airtable_record_id: string | null
          created_at: string
          id: string
          message_content: string
          sequence_id: string
          status: Database["public"]["Enums"]["follow_up_message_status"]
          step_index: number
          time_delay_hours: number
          updated_at: string
        }
        Insert: {
          airtable_record_id?: string | null
          created_at?: string
          id?: string
          message_content: string
          sequence_id: string
          status?: Database["public"]["Enums"]["follow_up_message_status"]
          step_index: number
          time_delay_hours: number
          updated_at?: string
        }
        Update: {
          airtable_record_id?: string | null
          created_at?: string
          id?: string
          message_content?: string
          sequence_id?: string
          status?: Database["public"]["Enums"]["follow_up_message_status"]
          step_index?: number
          time_delay_hours?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_follow_up_messages_sequence_id_template_follow_up_sequ"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "template_follow_up_sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      template_follow_up_sequences: {
        Row: {
          airtable_record_id: string | null
          backend_name: string | null
          created_at: string
          display_name: string
          id: string
          subject: string
          updated_at: string
        }
        Insert: {
          airtable_record_id?: string | null
          backend_name?: string | null
          created_at?: string
          display_name: string
          id?: string
          subject: string
          updated_at?: string
        }
        Update: {
          airtable_record_id?: string | null
          backend_name?: string | null
          created_at?: string
          display_name?: string
          id?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      touchpoints: {
        Row: {
          airtable_record_id: string | null
          automated_follow_up_id: string | null
          channel: Database["public"]["Enums"]["touchpoint_channel"]
          created_at: string
          external_id: string | null
          external_metadata: string | null
          id: string
          message: string
          occurred_at: string
          source: Database["public"]["Enums"]["touchpoint_source"]
          student_id: string
          type: Database["public"]["Enums"]["touchpoint_type"]
          updated_at: string
        }
        Insert: {
          airtable_record_id?: string | null
          automated_follow_up_id?: string | null
          channel: Database["public"]["Enums"]["touchpoint_channel"]
          created_at?: string
          external_id?: string | null
          external_metadata?: string | null
          id?: string
          message: string
          occurred_at?: string
          source?: Database["public"]["Enums"]["touchpoint_source"]
          student_id: string
          type: Database["public"]["Enums"]["touchpoint_type"]
          updated_at?: string
        }
        Update: {
          airtable_record_id?: string | null
          automated_follow_up_id?: string | null
          channel?: Database["public"]["Enums"]["touchpoint_channel"]
          created_at?: string
          external_id?: string | null
          external_metadata?: string | null
          id?: string
          message?: string
          occurred_at?: string
          source?: Database["public"]["Enums"]["touchpoint_source"]
          student_id?: string
          type?: Database["public"]["Enums"]["touchpoint_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "touchpoints_automated_follow_up_id_automated_follow_ups_id_fk"
            columns: ["automated_follow_up_id"]
            isOneToOne: false
            referencedRelation: "automated_follow_ups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "touchpoints_student_id_students_id_fk"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      user: {
        Row: {
          banExpires: string | null
          banned: boolean | null
          banReason: string | null
          bio: string
          calendar_link: string
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
          bio: string
          calendar_link: string
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
          bio?: string
          calendar_link?: string
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
      weekly_sessions: {
        Row: {
          airtable_record_id: string | null
          cohort_id: string
          created_at: string
          day_of_week: Database["public"]["Enums"]["day_of_week"]
          end_time: string
          google_calendar_event_id: string | null
          id: string
          start_time: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          airtable_record_id?: string | null
          cohort_id: string
          created_at?: string
          day_of_week: Database["public"]["Enums"]["day_of_week"]
          end_time: string
          google_calendar_event_id?: string | null
          id?: string
          start_time: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          airtable_record_id?: string | null
          cohort_id?: string
          created_at?: string
          day_of_week?: Database["public"]["Enums"]["day_of_week"]
          end_time?: string
          google_calendar_event_id?: string | null
          id?: string
          start_time?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_sessions_cohort_id_cohorts_id_fk"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_sessions_teacher_id_teachers_id_fk"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      assessment_result:
        | "requested"
        | "scheduled"
        | "session_held"
        | "level_determined"
      automated_follow_up_status:
        | "activated"
        | "ongoing"
        | "answer_received"
        | "disabled"
        | "completed"
      class_mode: "online" | "in_person" | "hybrid"
      class_status: "scheduled" | "in_progress" | "completed" | "cancelled"
      cohort_status: "enrollment_open" | "enrollment_closed" | "class_ended"
      communication_channel: "sms_email" | "email" | "sms"
      contract_type: "full_time" | "freelancer"
      day_of_week:
        | "monday"
        | "tuesday"
        | "wednesday"
        | "thursday"
        | "friday"
        | "saturday"
        | "sunday"
      enrollment_status:
        | "declined_contract"
        | "dropped_out"
        | "interested"
        | "beginner_form_filled"
        | "contract_abandoned"
        | "contract_signed"
        | "payment_abandoned"
        | "paid"
        | "welcome_package_sent"
      follow_up_message_status: "active" | "disabled"
      group_class_bonus_terms: "per_student_per_hour" | "per_hour"
      initial_channel:
        | "form"
        | "quiz"
        | "call"
        | "message"
        | "email"
        | "assessment"
      onboarding_status:
        | "new"
        | "training_in_progress"
        | "onboarded"
        | "offboarded"
      product_format: "group" | "private" | "hybrid"
      product_location: "online" | "in_person" | "hybrid"
      room_type: "for_one_to_one" | "medium" | "medium_plus" | "large"
      team_roles: "Teacher" | "Evaluator" | "Marketing/Admin" | "Exec"
      touchpoint_channel: "sms" | "call" | "whatsapp" | "email"
      touchpoint_source:
        | "manual"
        | "automated"
        | "openphone"
        | "gmail"
        | "whatsapp_business"
        | "webhook"
      touchpoint_type: "inbound" | "outbound"
      user_role: "admin" | "support" | "teacher" | "student"
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
      assessment_result: [
        "requested",
        "scheduled",
        "session_held",
        "level_determined",
      ],
      automated_follow_up_status: [
        "activated",
        "ongoing",
        "answer_received",
        "disabled",
        "completed",
      ],
      class_mode: ["online", "in_person", "hybrid"],
      class_status: ["scheduled", "in_progress", "completed", "cancelled"],
      cohort_status: ["enrollment_open", "enrollment_closed", "class_ended"],
      communication_channel: ["sms_email", "email", "sms"],
      contract_type: ["full_time", "freelancer"],
      day_of_week: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ],
      enrollment_status: [
        "declined_contract",
        "dropped_out",
        "interested",
        "beginner_form_filled",
        "contract_abandoned",
        "contract_signed",
        "payment_abandoned",
        "paid",
        "welcome_package_sent",
      ],
      follow_up_message_status: ["active", "disabled"],
      group_class_bonus_terms: ["per_student_per_hour", "per_hour"],
      initial_channel: [
        "form",
        "quiz",
        "call",
        "message",
        "email",
        "assessment",
      ],
      onboarding_status: [
        "new",
        "training_in_progress",
        "onboarded",
        "offboarded",
      ],
      product_format: ["group", "private", "hybrid"],
      product_location: ["online", "in_person", "hybrid"],
      room_type: ["for_one_to_one", "medium", "medium_plus", "large"],
      team_roles: ["Teacher", "Evaluator", "Marketing/Admin", "Exec"],
      touchpoint_channel: ["sms", "call", "whatsapp", "email"],
      touchpoint_source: [
        "manual",
        "automated",
        "openphone",
        "gmail",
        "whatsapp_business",
        "webhook",
      ],
      touchpoint_type: ["inbound", "outbound"],
      user_role: ["admin", "support", "teacher", "student"],
    },
  },
} as const
