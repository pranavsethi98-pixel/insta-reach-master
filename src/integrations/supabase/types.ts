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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      abuse_flags: {
        Row: {
          campaign_id: string | null
          created_at: string
          detail: string | null
          id: string
          kind: string
          mailbox_id: string | null
          resolved: boolean
          severity: string
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          detail?: string | null
          id?: string
          kind: string
          mailbox_id?: string | null
          resolved?: boolean
          severity?: string
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          detail?: string | null
          id?: string
          kind?: string
          mailbox_id?: string | null
          resolved?: boolean
          severity?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          id: string
          ip: string | null
          metadata: Json | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          id?: string
          ip?: string | null
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          id?: string
          ip?: string | null
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      admin_invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["app_role"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          id?: string
          invited_by: string
          role: Database["public"]["Enums"]["app_role"]
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["app_role"]
          token?: string
        }
        Relationships: []
      }
      admin_notes: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_usage: {
        Row: {
          created_at: string
          credits: number
          id: string
          kind: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          credits?: number
          id?: string
          kind: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          credits?: number
          id?: string
          kind?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          audience: string
          body: string
          created_at: string
          created_by: string
          ends_at: string | null
          id: string
          is_active: boolean
          segment: Json | null
          starts_at: string
          title: string
        }
        Insert: {
          audience?: string
          body: string
          created_at?: string
          created_by: string
          ends_at?: string | null
          id?: string
          is_active?: boolean
          segment?: Json | null
          starts_at?: string
          title: string
        }
        Update: {
          audience?: string
          body?: string
          created_at?: string
          created_by?: string
          ends_at?: string | null
          id?: string
          is_active?: boolean
          segment?: Json | null
          starts_at?: string
          title?: string
        }
        Relationships: []
      }
      campaign_leads: {
        Row: {
          campaign_id: string
          created_at: string
          current_step: number
          id: string
          last_sent_at: string | null
          lead_id: string
          next_send_at: string | null
          ooo_until: string | null
          status: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          current_step?: number
          id?: string
          last_sent_at?: string | null
          lead_id: string
          next_send_at?: string | null
          ooo_until?: string | null
          status?: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          current_step?: number
          id?: string
          last_sent_at?: string | null
          lead_id?: string
          next_send_at?: string | null
          ooo_until?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_leads_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_leads_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_mailboxes: {
        Row: {
          campaign_id: string
          mailbox_id: string
        }
        Insert: {
          campaign_id: string
          mailbox_id: string
        }
        Update: {
          campaign_id?: string
          mailbox_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_mailboxes_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_mailboxes_mailbox_id_fkey"
            columns: ["mailbox_id"]
            isOneToOne: false
            referencedRelation: "mailboxes"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_steps: {
        Row: {
          body: string
          campaign_id: string
          condition: string
          created_at: string
          delay_days: number
          id: string
          skip_if_no_open: boolean
          step_order: number
          subject: string
          variant_bodies: Json | null
          variant_subjects: Json | null
        }
        Insert: {
          body: string
          campaign_id: string
          condition?: string
          created_at?: string
          delay_days?: number
          id?: string
          skip_if_no_open?: boolean
          step_order: number
          subject: string
          variant_bodies?: Json | null
          variant_subjects?: Json | null
        }
        Update: {
          body?: string
          campaign_id?: string
          condition?: string
          created_at?: string
          delay_days?: number
          id?: string
          skip_if_no_open?: boolean
          step_order?: number
          subject?: string
          variant_bodies?: Json | null
          variant_subjects?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_steps_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          created_at: string
          daily_send_limit: number | null
          id: string
          name: string
          send_days: number[] | null
          send_window_end: number | null
          send_window_start: number | null
          status: string
          stop_on_click: boolean | null
          stop_on_reply: boolean | null
          timezone: string | null
          track_clicks: boolean | null
          track_opens: boolean | null
          tracking_domain: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_send_limit?: number | null
          id?: string
          name: string
          send_days?: number[] | null
          send_window_end?: number | null
          send_window_start?: number | null
          status?: string
          stop_on_click?: boolean | null
          stop_on_reply?: boolean | null
          timezone?: string | null
          track_clicks?: boolean | null
          track_opens?: boolean | null
          tracking_domain?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          daily_send_limit?: number | null
          id?: string
          name?: string
          send_days?: number[] | null
          send_window_end?: number | null
          send_window_start?: number | null
          status?: string
          stop_on_click?: boolean | null
          stop_on_reply?: boolean | null
          timezone?: string | null
          track_clicks?: boolean | null
          track_opens?: boolean | null
          tracking_domain?: string | null
          user_id?: string
        }
        Relationships: []
      }
      click_events: {
        Row: {
          campaign_id: string | null
          created_at: string
          id: string
          ip: string | null
          lead_id: string | null
          send_log_id: string | null
          url: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          id?: string
          ip?: string | null
          lead_id?: string | null
          send_log_id?: string | null
          url: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          id?: string
          ip?: string | null
          lead_id?: string | null
          send_log_id?: string | null
          url?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          ai_category: string | null
          ai_confidence: number | null
          ai_summary: string | null
          campaign_id: string | null
          classification: string | null
          created_at: string
          id: string
          last_message_at: string
          lead_id: string | null
          mailbox_id: string
          status: string
          subject: string | null
          unread_count: number | null
          user_id: string
        }
        Insert: {
          ai_category?: string | null
          ai_confidence?: number | null
          ai_summary?: string | null
          campaign_id?: string | null
          classification?: string | null
          created_at?: string
          id?: string
          last_message_at?: string
          lead_id?: string | null
          mailbox_id: string
          status?: string
          subject?: string | null
          unread_count?: number | null
          user_id: string
        }
        Update: {
          ai_category?: string | null
          ai_confidence?: number | null
          ai_summary?: string | null
          campaign_id?: string | null
          classification?: string | null
          created_at?: string
          id?: string
          last_message_at?: string
          lead_id?: string | null
          mailbox_id?: string
          status?: string
          subject?: string | null
          unread_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      copilot_briefs: {
        Row: {
          business_context: string | null
          campaign_id: string | null
          created_at: string
          icp: Json | null
          id: string
          prompt: string
          result: Json | null
          user_id: string
        }
        Insert: {
          business_context?: string | null
          campaign_id?: string | null
          created_at?: string
          icp?: Json | null
          id?: string
          prompt: string
          result?: Json | null
          user_id: string
        }
        Update: {
          business_context?: string | null
          campaign_id?: string | null
          created_at?: string
          icp?: Json | null
          id?: string
          prompt?: string
          result?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          bonus_credits: number | null
          code: string
          created_at: string
          discount_cents: number | null
          discount_pct: number | null
          expires_at: string | null
          id: string
          is_active: boolean
          max_redemptions: number | null
          redemptions: number
        }
        Insert: {
          bonus_credits?: number | null
          code: string
          created_at?: string
          discount_cents?: number | null
          discount_pct?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_redemptions?: number | null
          redemptions?: number
        }
        Update: {
          bonus_credits?: number | null
          code?: string
          created_at?: string
          discount_cents?: number | null
          discount_pct?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_redemptions?: number | null
          redemptions?: number
        }
        Relationships: []
      }
      credit_costs: {
        Row: {
          action: string
          cost: number
          updated_at: string
        }
        Insert: {
          action: string
          cost?: number
          updated_at?: string
        }
        Update: {
          action?: string
          cost?: number
          updated_at?: string
        }
        Relationships: []
      }
      credit_ledger: {
        Row: {
          actor_id: string | null
          created_at: string
          delta: number
          id: string
          metadata: Json | null
          reason: string
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          delta: number
          id?: string
          metadata?: Json | null
          reason: string
          user_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          delta?: number
          id?: string
          metadata?: Json | null
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      credit_topup_skus: {
        Row: {
          credits: number
          label: string
          price_id: string
        }
        Insert: {
          credits: number
          label: string
          price_id: string
        }
        Update: {
          credits?: number
          label?: string
          price_id?: string
        }
        Relationships: []
      }
      email_events: {
        Row: {
          campaign_id: string | null
          created_at: string
          event_type: string
          id: string
          ip: string | null
          lead_id: string | null
          mailbox_id: string | null
          metadata: Json | null
          send_log_id: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          ip?: string | null
          lead_id?: string | null
          mailbox_id?: string | null
          metadata?: Json | null
          send_log_id?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          ip?: string | null
          lead_id?: string | null
          mailbox_id?: string | null
          metadata?: Json | null
          send_log_id?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      email_verifications: {
        Row: {
          checked_at: string
          email: string
          id: string
          is_disposable: boolean | null
          is_role: boolean | null
          mx_found: boolean | null
          reason: string | null
          result: string
          user_id: string
        }
        Insert: {
          checked_at?: string
          email: string
          id?: string
          is_disposable?: boolean | null
          is_role?: boolean | null
          mx_found?: boolean | null
          reason?: string | null
          result: string
          user_id: string
        }
        Update: {
          checked_at?: string
          email?: string
          id?: string
          is_disposable?: boolean | null
          is_role?: boolean | null
          mx_found?: boolean | null
          reason?: string | null
          result?: string
          user_id?: string
        }
        Relationships: []
      }
      ghl_contact_map: {
        Row: {
          created_at: string
          ghl_contact_id: string
          ghl_location_id: string
          id: string
          last_synced_at: string
          lead_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ghl_contact_id: string
          ghl_location_id: string
          id?: string
          last_synced_at?: string
          lead_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          ghl_contact_id?: string
          ghl_location_id?: string
          id?: string
          last_synced_at?: string
          lead_id?: string
          user_id?: string
        }
        Relationships: []
      }
      ghl_sync_log: {
        Row: {
          action: string
          created_at: string
          direction: string
          error: string | null
          ghl_contact_id: string | null
          http_status: number | null
          id: string
          lead_id: string | null
          payload: Json | null
          status: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          direction: string
          error?: string | null
          ghl_contact_id?: string | null
          http_status?: number | null
          id?: string
          lead_id?: string | null
          payload?: Json | null
          status: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          direction?: string
          error?: string | null
          ghl_contact_id?: string | null
          http_status?: number | null
          id?: string
          lead_id?: string | null
          payload?: Json | null
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      ghl_sync_settings: {
        Row: {
          id: boolean
          log_email_activity: boolean
          push_leads: boolean
          push_signups: boolean
          tag_plan_changes: boolean
          tag_replies: boolean
          updated_at: string
        }
        Insert: {
          id?: boolean
          log_email_activity?: boolean
          push_leads?: boolean
          push_signups?: boolean
          tag_plan_changes?: boolean
          tag_replies?: boolean
          updated_at?: string
        }
        Update: {
          id?: boolean
          log_email_activity?: boolean
          push_leads?: boolean
          push_signups?: boolean
          tag_plan_changes?: boolean
          tag_replies?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      ghl_user_map: {
        Row: {
          created_at: string
          ghl_contact_id: string
          ghl_location_id: string
          last_synced_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ghl_contact_id: string
          ghl_location_id: string
          last_synced_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ghl_contact_id?: string
          ghl_location_id?: string
          last_synced_at?: string
          user_id?: string
        }
        Relationships: []
      }
      global_blacklist: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          kind: string
          reason: string | null
          value: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          kind: string
          reason?: string | null
          value: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          reason?: string | null
          value?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          created_at: string
          id: string
          metric: string
          period: string
          starts_at: string
          target: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metric: string
          period?: string
          starts_at?: string
          target: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metric?: string
          period?: string
          starts_at?: string
          target?: number
          user_id?: string
        }
        Relationships: []
      }
      inbound_secrets: {
        Row: {
          created_at: string
          secret: string
          user_id: string
        }
        Insert: {
          created_at?: string
          secret?: string
          user_id: string
        }
        Update: {
          created_at?: string
          secret?: string
          user_id?: string
        }
        Relationships: []
      }
      ip_reputation: {
        Row: {
          blacklists: Json | null
          created_at: string
          id: string
          ip: string
          last_checked_at: string | null
          score: number
        }
        Insert: {
          blacklists?: Json | null
          created_at?: string
          id?: string
          ip: string
          last_checked_at?: string | null
          score?: number
        }
        Update: {
          blacklists?: Json | null
          created_at?: string
          id?: string
          ip?: string
          last_checked_at?: string | null
          score?: number
        }
        Relationships: []
      }
      lead_lists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      lead_magnets: {
        Row: {
          category: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          file_size_kb: number | null
          file_url: string
          id: string
          is_published: boolean
          page_count: number | null
          slug: string
          sort_order: number
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          file_size_kb?: number | null
          file_url: string
          id?: string
          is_published?: boolean
          page_count?: number | null
          slug: string
          sort_order?: number
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          file_size_kb?: number | null
          file_url?: string
          id?: string
          is_published?: boolean
          page_count?: number | null
          slug?: string
          sort_order?: number
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      lead_tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          due_at: string | null
          id: string
          lead_id: string
          title: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          due_at?: string | null
          id?: string
          lead_id: string
          title: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          due_at?: string | null
          id?: string
          lead_id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          closed_at: string | null
          company: string | null
          created_at: string
          custom_fields: Json | null
          deal_currency: string | null
          deal_value: number | null
          email: string
          first_name: string | null
          icebreaker: string | null
          id: string
          last_name: string | null
          linkedin: string | null
          list_id: string | null
          notes: string | null
          phone: string | null
          pipeline_stage: string
          status: string
          title: string | null
          user_id: string
          verification_status: string | null
          website: string | null
        }
        Insert: {
          closed_at?: string | null
          company?: string | null
          created_at?: string
          custom_fields?: Json | null
          deal_currency?: string | null
          deal_value?: number | null
          email: string
          first_name?: string | null
          icebreaker?: string | null
          id?: string
          last_name?: string | null
          linkedin?: string | null
          list_id?: string | null
          notes?: string | null
          phone?: string | null
          pipeline_stage?: string
          status?: string
          title?: string | null
          user_id: string
          verification_status?: string | null
          website?: string | null
        }
        Update: {
          closed_at?: string | null
          company?: string | null
          created_at?: string
          custom_fields?: Json | null
          deal_currency?: string | null
          deal_value?: number | null
          email?: string
          first_name?: string | null
          icebreaker?: string | null
          id?: string
          last_name?: string | null
          linkedin?: string | null
          list_id?: string | null
          notes?: string | null
          phone?: string | null
          pipeline_stage?: string
          status?: string
          title?: string | null
          user_id?: string
          verification_status?: string | null
          website?: string | null
        }
        Relationships: []
      }
      llm_providers: {
        Row: {
          byok_allowed: boolean
          created_at: string
          default_model: string | null
          id: string
          is_enabled: boolean
          monthly_token_cap: number | null
          name: string
        }
        Insert: {
          byok_allowed?: boolean
          created_at?: string
          default_model?: string | null
          id?: string
          is_enabled?: boolean
          monthly_token_cap?: number | null
          name: string
        }
        Update: {
          byok_allowed?: boolean
          created_at?: string
          default_model?: string | null
          id?: string
          is_enabled?: boolean
          monthly_token_cap?: number | null
          name?: string
        }
        Relationships: []
      }
      login_history: {
        Row: {
          created_at: string
          id: string
          ip: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ip?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      mailboxes: {
        Row: {
          admin_suspended: boolean
          created_at: string
          daily_limit: number
          deliverability_checked_at: string | null
          deliverability_inbox_pct: number | null
          deliverability_score: number | null
          deliverability_spam_pct: number | null
          from_email: string
          from_name: string
          health_score: number | null
          hour_reset_at: string | null
          hourly_limit: number | null
          id: string
          imap_host: string | null
          imap_password: string | null
          imap_port: number | null
          imap_secure: boolean | null
          imap_username: string | null
          is_active: boolean
          label: string
          last_imap_sync_at: string | null
          last_imap_uid: number | null
          last_reset_date: string
          last_sent_at: string | null
          max_delay_seconds: number
          min_delay_seconds: number
          ramp_increment: number | null
          ramp_start: number | null
          ramp_started_at: string | null
          ramp_up_enabled: boolean | null
          reply_to: string | null
          sent_this_hour: number | null
          sent_today: number
          signature: string | null
          smtp_host: string
          smtp_password: string
          smtp_port: number
          smtp_secure: boolean
          smtp_username: string
          user_id: string
          warmup_daily_target: number | null
          warmup_enabled: boolean | null
          warmup_increment: number | null
          warmup_open_rate: number | null
          warmup_pool_id: string | null
          warmup_randomize: boolean | null
          warmup_read_emulation: boolean | null
          warmup_reply_rate: number | null
          warmup_sent_today: number | null
          warmup_slow_ramp: boolean | null
          warmup_spam_protection_level: string | null
          warmup_started_at: string | null
        }
        Insert: {
          admin_suspended?: boolean
          created_at?: string
          daily_limit?: number
          deliverability_checked_at?: string | null
          deliverability_inbox_pct?: number | null
          deliverability_score?: number | null
          deliverability_spam_pct?: number | null
          from_email: string
          from_name: string
          health_score?: number | null
          hour_reset_at?: string | null
          hourly_limit?: number | null
          id?: string
          imap_host?: string | null
          imap_password?: string | null
          imap_port?: number | null
          imap_secure?: boolean | null
          imap_username?: string | null
          is_active?: boolean
          label: string
          last_imap_sync_at?: string | null
          last_imap_uid?: number | null
          last_reset_date?: string
          last_sent_at?: string | null
          max_delay_seconds?: number
          min_delay_seconds?: number
          ramp_increment?: number | null
          ramp_start?: number | null
          ramp_started_at?: string | null
          ramp_up_enabled?: boolean | null
          reply_to?: string | null
          sent_this_hour?: number | null
          sent_today?: number
          signature?: string | null
          smtp_host: string
          smtp_password: string
          smtp_port?: number
          smtp_secure?: boolean
          smtp_username: string
          user_id: string
          warmup_daily_target?: number | null
          warmup_enabled?: boolean | null
          warmup_increment?: number | null
          warmup_open_rate?: number | null
          warmup_pool_id?: string | null
          warmup_randomize?: boolean | null
          warmup_read_emulation?: boolean | null
          warmup_reply_rate?: number | null
          warmup_sent_today?: number | null
          warmup_slow_ramp?: boolean | null
          warmup_spam_protection_level?: string | null
          warmup_started_at?: string | null
        }
        Update: {
          admin_suspended?: boolean
          created_at?: string
          daily_limit?: number
          deliverability_checked_at?: string | null
          deliverability_inbox_pct?: number | null
          deliverability_score?: number | null
          deliverability_spam_pct?: number | null
          from_email?: string
          from_name?: string
          health_score?: number | null
          hour_reset_at?: string | null
          hourly_limit?: number | null
          id?: string
          imap_host?: string | null
          imap_password?: string | null
          imap_port?: number | null
          imap_secure?: boolean | null
          imap_username?: string | null
          is_active?: boolean
          label?: string
          last_imap_sync_at?: string | null
          last_imap_uid?: number | null
          last_reset_date?: string
          last_sent_at?: string | null
          max_delay_seconds?: number
          min_delay_seconds?: number
          ramp_increment?: number | null
          ramp_start?: number | null
          ramp_started_at?: string | null
          ramp_up_enabled?: boolean | null
          reply_to?: string | null
          sent_this_hour?: number | null
          sent_today?: number
          signature?: string | null
          smtp_host?: string
          smtp_password?: string
          smtp_port?: number
          smtp_secure?: boolean
          smtp_username?: string
          user_id?: string
          warmup_daily_target?: number | null
          warmup_enabled?: boolean | null
          warmup_increment?: number | null
          warmup_open_rate?: number | null
          warmup_pool_id?: string | null
          warmup_randomize?: boolean | null
          warmup_read_emulation?: boolean | null
          warmup_reply_rate?: number | null
          warmup_sent_today?: number | null
          warmup_slow_ramp?: boolean | null
          warmup_spam_protection_level?: string | null
          warmup_started_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mailboxes_warmup_pool_id_fkey"
            columns: ["warmup_pool_id"]
            isOneToOne: false
            referencedRelation: "warmup_pools"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_leads: {
        Row: {
          created_at: string
          delivered_at: string | null
          email: string
          id: string
          lead_magnet_slug: string | null
          source: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          email: string
          id?: string
          lead_magnet_slug?: string | null
          source?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          email?: string
          id?: string
          lead_magnet_slug?: string | null
          source?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      meetings: {
        Row: {
          calendly_event_uri: string | null
          conversation_id: string | null
          created_at: string
          id: string
          lead_id: string | null
          next_followup_at: string | null
          no_show_followups_sent: number
          scheduled_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          calendly_event_uri?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
          next_followup_at?: string | null
          no_show_followups_sent?: number
          scheduled_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          calendly_event_uri?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
          next_followup_at?: string | null
          no_show_followups_sent?: number
          scheduled_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string | null
          conversation_id: string
          created_at: string
          direction: string
          from_email: string
          id: string
          imap_uid: number | null
          in_reply_to: string | null
          is_warmup: boolean | null
          message_id: string | null
          subject: string | null
          to_email: string
          user_id: string
        }
        Insert: {
          body?: string | null
          conversation_id: string
          created_at?: string
          direction: string
          from_email: string
          id?: string
          imap_uid?: number | null
          in_reply_to?: string | null
          is_warmup?: boolean | null
          message_id?: string | null
          subject?: string | null
          to_email: string
          user_id: string
        }
        Update: {
          body?: string | null
          conversation_id?: string
          created_at?: string
          direction?: string
          from_email?: string
          id?: string
          imap_uid?: number | null
          in_reply_to?: string | null
          is_warmup?: boolean | null
          message_id?: string | null
          subject?: string | null
          to_email?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      payments_history: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          description: string | null
          id: string
          refunded_cents: number | null
          status: string
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          refunded_cents?: number | null
          status: string
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          refunded_cents?: number | null
          status?: string
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pipeline_stages: {
        Row: {
          color: string | null
          created_at: string
          id: string
          is_lost: boolean | null
          is_won: boolean | null
          key: string
          label: string
          sort_order: number
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          is_lost?: boolean | null
          is_won?: boolean | null
          key: string
          label: string
          sort_order?: number
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          is_lost?: boolean | null
          is_won?: boolean | null
          key?: string
          label?: string
          sort_order?: number
          user_id?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          code: string
          created_at: string
          features: Json | null
          id: string
          interval: string
          is_active: boolean
          max_active_campaigns: number | null
          max_mailboxes: number | null
          monthly_credits: number
          name: string
          price_cents: number
          stripe_price_id: string | null
        }
        Insert: {
          code: string
          created_at?: string
          features?: Json | null
          id?: string
          interval?: string
          is_active?: boolean
          max_active_campaigns?: number | null
          max_mailboxes?: number | null
          monthly_credits?: number
          name: string
          price_cents?: number
          stripe_price_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          features?: Json | null
          id?: string
          interval?: string
          is_active?: boolean
          max_active_campaigns?: number | null
          max_mailboxes?: number | null
          monthly_credits?: number
          name?: string
          price_cents?: number
          stripe_price_id?: string | null
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      processed_checkout_sessions: {
        Row: {
          credits_granted: number | null
          price_id: string
          processed_at: string | null
          session_id: string
          user_id: string
        }
        Insert: {
          credits_granted?: number | null
          price_id: string
          processed_at?: string | null
          session_id: string
          user_id: string
        }
        Update: {
          credits_granted?: number | null
          price_id?: string
          processed_at?: string | null
          session_id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ai_reply_enabled: boolean
          ai_reply_mode: string
          ai_reply_monthly_cap: number | null
          ai_reply_skip_labels: string[] | null
          ai_reply_tone: string | null
          ai_reply_trigger_labels: string[] | null
          ai_reply_used_this_month: number | null
          business_context: string | null
          business_name: string | null
          business_type: string | null
          calendar_link: string | null
          calendly_event_uri: string | null
          calendly_token: string | null
          calendly_user_uri: string | null
          company_name: string | null
          created_at: string
          email: string | null
          full_name: string | null
          ghl_sync_excluded: boolean
          id: string
          phone: string | null
          slack_webhook_url: string | null
          website_url: string | null
        }
        Insert: {
          ai_reply_enabled?: boolean
          ai_reply_mode?: string
          ai_reply_monthly_cap?: number | null
          ai_reply_skip_labels?: string[] | null
          ai_reply_tone?: string | null
          ai_reply_trigger_labels?: string[] | null
          ai_reply_used_this_month?: number | null
          business_context?: string | null
          business_name?: string | null
          business_type?: string | null
          calendar_link?: string | null
          calendly_event_uri?: string | null
          calendly_token?: string | null
          calendly_user_uri?: string | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          ghl_sync_excluded?: boolean
          id: string
          phone?: string | null
          slack_webhook_url?: string | null
          website_url?: string | null
        }
        Update: {
          ai_reply_enabled?: boolean
          ai_reply_mode?: string
          ai_reply_monthly_cap?: number | null
          ai_reply_skip_labels?: string[] | null
          ai_reply_tone?: string | null
          ai_reply_trigger_labels?: string[] | null
          ai_reply_used_this_month?: number | null
          business_context?: string | null
          business_name?: string | null
          business_type?: string | null
          calendar_link?: string | null
          calendly_event_uri?: string | null
          calendly_token?: string | null
          calendly_user_uri?: string | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          ghl_sync_excluded?: boolean
          id?: string
          phone?: string | null
          slack_webhook_url?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      reply_queue: {
        Row: {
          classification: string | null
          confidence: number | null
          context_summary: string | null
          conversation_id: string
          created_at: string
          draft_body: string | null
          draft_subject: string | null
          id: string
          lead_id: string | null
          mailbox_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          sent_at: string | null
          source: string
          status: string
          user_id: string
        }
        Insert: {
          classification?: string | null
          confidence?: number | null
          context_summary?: string | null
          conversation_id: string
          created_at?: string
          draft_body?: string | null
          draft_subject?: string | null
          id?: string
          lead_id?: string | null
          mailbox_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sent_at?: string | null
          source?: string
          status?: string
          user_id: string
        }
        Update: {
          classification?: string | null
          confidence?: number | null
          context_summary?: string | null
          conversation_id?: string
          created_at?: string
          draft_body?: string | null
          draft_subject?: string | null
          id?: string
          lead_id?: string | null
          mailbox_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sent_at?: string | null
          source?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      resource_library: {
        Row: {
          body: string
          category: string | null
          created_at: string
          id: string
          is_favorite: boolean
          kind: string
          subject: string | null
          title: string
          user_id: string
        }
        Insert: {
          body: string
          category?: string | null
          created_at?: string
          id?: string
          is_favorite?: boolean
          kind: string
          subject?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string
          category?: string | null
          created_at?: string
          id?: string
          is_favorite?: boolean
          kind?: string
          subject?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      salesflow_matches: {
        Row: {
          id: string
          lead_id: string
          matched_at: string
          salesflow_id: string
          user_id: string
        }
        Insert: {
          id?: string
          lead_id: string
          matched_at?: string
          salesflow_id: string
          user_id: string
        }
        Update: {
          id?: string
          lead_id?: string
          matched_at?: string
          salesflow_id?: string
          user_id?: string
        }
        Relationships: []
      }
      salesflows: {
        Row: {
          actions: Json
          conditions: Json
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          user_id: string
        }
        Insert: {
          actions?: Json
          conditions?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          user_id: string
        }
        Update: {
          actions?: Json
          conditions?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      send_log: {
        Row: {
          body: string | null
          bounce_reason: string | null
          bounce_type: string | null
          bounced_at: string | null
          campaign_id: string | null
          click_count: number
          clicked_at: string | null
          error: string | null
          id: string
          in_reply_to: string | null
          lead_id: string | null
          mailbox_id: string | null
          message_id: string | null
          opened_at: string | null
          replied_at: string | null
          sent_at: string
          status: string
          step_order: number | null
          subject: string | null
          to_email: string
          tracking_id: string | null
          user_id: string
          variant_index: number | null
        }
        Insert: {
          body?: string | null
          bounce_reason?: string | null
          bounce_type?: string | null
          bounced_at?: string | null
          campaign_id?: string | null
          click_count?: number
          clicked_at?: string | null
          error?: string | null
          id?: string
          in_reply_to?: string | null
          lead_id?: string | null
          mailbox_id?: string | null
          message_id?: string | null
          opened_at?: string | null
          replied_at?: string | null
          sent_at?: string
          status: string
          step_order?: number | null
          subject?: string | null
          to_email: string
          tracking_id?: string | null
          user_id: string
          variant_index?: number | null
        }
        Update: {
          body?: string | null
          bounce_reason?: string | null
          bounce_type?: string | null
          bounced_at?: string | null
          campaign_id?: string | null
          click_count?: number
          clicked_at?: string | null
          error?: string | null
          id?: string
          in_reply_to?: string | null
          lead_id?: string | null
          mailbox_id?: string | null
          message_id?: string | null
          opened_at?: string | null
          replied_at?: string | null
          sent_at?: string
          status?: string
          step_order?: number | null
          subject?: string | null
          to_email?: string
          tracking_id?: string | null
          user_id?: string
          variant_index?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "send_log_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "send_log_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "send_log_mailbox_id_fkey"
            columns: ["mailbox_id"]
            isOneToOne: false
            referencedRelation: "mailboxes"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          id: string
          plan_id: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      subsequence_enrollments: {
        Row: {
          created_at: string
          current_step: number
          id: string
          lead_id: string
          next_send_at: string | null
          status: string
          subsequence_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_step?: number
          id?: string
          lead_id: string
          next_send_at?: string | null
          status?: string
          subsequence_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_step?: number
          id?: string
          lead_id?: string
          next_send_at?: string | null
          status?: string
          subsequence_id?: string
          user_id?: string
        }
        Relationships: []
      }
      subsequence_steps: {
        Row: {
          body: string
          created_at: string
          delay_days: number
          id: string
          step_order: number
          subject: string
          subsequence_id: string
        }
        Insert: {
          body: string
          created_at?: string
          delay_days?: number
          id?: string
          step_order: number
          subject: string
          subsequence_id: string
        }
        Update: {
          body?: string
          created_at?: string
          delay_days?: number
          id?: string
          step_order?: number
          subject?: string
          subsequence_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subsequence_steps_subsequence_id_fkey"
            columns: ["subsequence_id"]
            isOneToOne: false
            referencedRelation: "subsequences"
            referencedColumns: ["id"]
          },
        ]
      }
      subsequences: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          parent_campaign_id: string
          trigger_after_days: number
          trigger_event: string
          trigger_step: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          parent_campaign_id: string
          trigger_after_days?: number
          trigger_event: string
          trigger_step?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          parent_campaign_id?: string
          trigger_after_days?: number
          trigger_event?: string
          trigger_step?: number | null
          user_id?: string
        }
        Relationships: []
      }
      support_ticket_replies: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          is_admin_reply: boolean
          ticket_id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          is_admin_reply?: boolean
          ticket_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          is_admin_reply?: boolean
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_replies_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          body: string
          created_at: string
          id: string
          priority: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          body: string
          created_at?: string
          id?: string
          priority?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          body?: string
          created_at?: string
          id?: string
          priority?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      suppressions: {
        Row: {
          created_at: string
          domain: string | null
          email: string | null
          id: string
          reason: string
          user_id: string
        }
        Insert: {
          created_at?: string
          domain?: string | null
          email?: string | null
          id?: string
          reason?: string
          user_id: string
        }
        Update: {
          created_at?: string
          domain?: string | null
          email?: string | null
          id?: string
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      template_pushes: {
        Row: {
          body: string
          category: string | null
          created_at: string
          id: string
          pushed_by: string
          subject: string | null
          target_plan_codes: string[] | null
          title: string
        }
        Insert: {
          body: string
          category?: string | null
          created_at?: string
          id?: string
          pushed_by: string
          subject?: string | null
          target_plan_codes?: string[] | null
          title: string
        }
        Update: {
          body?: string
          category?: string | null
          created_at?: string
          id?: string
          pushed_by?: string
          subject?: string | null
          target_plan_codes?: string[] | null
          title?: string
        }
        Relationships: []
      }
      tracking_domains: {
        Row: {
          cname_target: string
          created_at: string
          domain: string
          id: string
          last_checked_at: string | null
          user_id: string
          verified: boolean | null
        }
        Insert: {
          cname_target?: string
          created_at?: string
          domain: string
          id?: string
          last_checked_at?: string | null
          user_id: string
          verified?: boolean | null
        }
        Update: {
          cname_target?: string
          created_at?: string
          domain?: string
          id?: string
          last_checked_at?: string | null
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      user_flags: {
        Row: {
          flagged_by: string | null
          is_banned: boolean
          is_suspended: boolean
          reason: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          flagged_by?: string | null
          is_banned?: boolean
          is_suspended?: boolean
          reason?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          flagged_by?: string | null
          is_banned?: boolean
          is_suspended?: boolean
          reason?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_tags: {
        Row: {
          created_at: string
          id: string
          tag: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          tag: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          tag?: string
          user_id?: string
        }
        Relationships: []
      }
      visitor_events: {
        Row: {
          created_at: string
          id: string
          ip: string | null
          pixel_id: string
          referrer: string | null
          url: string | null
          user_agent: string | null
          user_id: string
          visitor_company: string | null
          visitor_country: string | null
          visitor_email: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip?: string | null
          pixel_id: string
          referrer?: string | null
          url?: string | null
          user_agent?: string | null
          user_id: string
          visitor_company?: string | null
          visitor_country?: string | null
          visitor_email?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip?: string | null
          pixel_id?: string
          referrer?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string
          visitor_company?: string | null
          visitor_country?: string | null
          visitor_email?: string | null
        }
        Relationships: []
      }
      visitor_pixels: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          label: string
          pixel_key: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          pixel_key?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          pixel_key?: string
          user_id?: string
        }
        Relationships: []
      }
      warmup_log: {
        Row: {
          action: string
          created_at: string
          from_mailbox_id: string
          id: string
          message_id: string | null
          to_mailbox_id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          from_mailbox_id: string
          id?: string
          message_id?: string | null
          to_mailbox_id: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          from_mailbox_id?: string
          id?: string
          message_id?: string | null
          to_mailbox_id?: string
          user_id?: string
        }
        Relationships: []
      }
      warmup_pools: {
        Row: {
          created_at: string
          engagement_rate: number | null
          id: string
          name: string
          size: number
          tier: string
        }
        Insert: {
          created_at?: string
          engagement_rate?: number | null
          id?: string
          name: string
          size?: number
          tier: string
        }
        Update: {
          created_at?: string
          engagement_rate?: number | null
          id?: string
          name?: string
          size?: number
          tier?: string
        }
        Relationships: []
      }
      webhook_deliveries: {
        Row: {
          created_at: string
          event: string
          id: string
          payload: Json | null
          response: string | null
          status: number | null
          user_id: string
          webhook_id: string
        }
        Insert: {
          created_at?: string
          event: string
          id?: string
          payload?: Json | null
          response?: string | null
          status?: number | null
          user_id: string
          webhook_id: string
        }
        Update: {
          created_at?: string
          event?: string
          id?: string
          payload?: Json | null
          response?: string | null
          status?: number | null
          user_id?: string
          webhook_id?: string
        }
        Relationships: []
      }
      webhooks: {
        Row: {
          created_at: string
          events: string[]
          id: string
          is_active: boolean
          last_delivery_at: string | null
          last_status: number | null
          secret: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          events?: string[]
          id?: string
          is_active?: boolean
          last_delivery_at?: string | null
          last_status?: number | null
          secret?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          events?: string[]
          id?: string
          is_active?: boolean
          last_delivery_at?: string | null
          last_status?: number | null
          secret?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      workspace_invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["workspace_role"]
          token: string
          workspace_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          id?: string
          invited_by: string
          role?: Database["public"]["Enums"]["workspace_role"]
          token?: string
          workspace_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          token?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_invites_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          invited_email: string | null
          joined_at: string
          role: Database["public"]["Enums"]["workspace_role"]
          user_id: string
          workspace_id: string
        }
        Insert: {
          invited_email?: string | null
          joined_at?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          user_id: string
          workspace_id: string
        }
        Update: {
          invited_email?: string | null
          joined_at?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_workspace_member: {
        Args: { _user: string; _ws: string }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      workspace_role_for: {
        Args: { _user: string; _ws: string }
        Returns: Database["public"]["Enums"]["workspace_role"]
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "billing_admin"
        | "support_admin"
        | "read_only_admin"
      workspace_role: "owner" | "admin" | "member"
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
      app_role: [
        "super_admin",
        "billing_admin",
        "support_admin",
        "read_only_admin",
      ],
      workspace_role: ["owner", "admin", "member"],
    },
  },
} as const
