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
      campaign_leads: {
        Row: {
          campaign_id: string
          created_at: string
          current_step: number
          id: string
          last_sent_at: string | null
          lead_id: string
          next_send_at: string | null
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
          created_at: string
          delay_days: number
          id: string
          step_order: number
          subject: string
          variant_bodies: Json | null
          variant_subjects: Json | null
        }
        Insert: {
          body: string
          campaign_id: string
          created_at?: string
          delay_days?: number
          id?: string
          step_order: number
          subject: string
          variant_bodies?: Json | null
          variant_subjects?: Json | null
        }
        Update: {
          body?: string
          campaign_id?: string
          created_at?: string
          delay_days?: number
          id?: string
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
      conversations: {
        Row: {
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
      leads: {
        Row: {
          company: string | null
          created_at: string
          custom_fields: Json | null
          email: string
          first_name: string | null
          icebreaker: string | null
          id: string
          last_name: string | null
          linkedin: string | null
          list_id: string | null
          phone: string | null
          status: string
          title: string | null
          user_id: string
          verification_status: string | null
          website: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          custom_fields?: Json | null
          email: string
          first_name?: string | null
          icebreaker?: string | null
          id?: string
          last_name?: string | null
          linkedin?: string | null
          list_id?: string | null
          phone?: string | null
          status?: string
          title?: string | null
          user_id: string
          verification_status?: string | null
          website?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          custom_fields?: Json | null
          email?: string
          first_name?: string | null
          icebreaker?: string | null
          id?: string
          last_name?: string | null
          linkedin?: string | null
          list_id?: string | null
          phone?: string | null
          status?: string
          title?: string | null
          user_id?: string
          verification_status?: string | null
          website?: string | null
        }
        Relationships: []
      }
      mailboxes: {
        Row: {
          created_at: string
          daily_limit: number
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
          warmup_reply_rate: number | null
          warmup_sent_today: number | null
          warmup_started_at: string | null
        }
        Insert: {
          created_at?: string
          daily_limit?: number
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
          warmup_reply_rate?: number | null
          warmup_sent_today?: number | null
          warmup_started_at?: string | null
        }
        Update: {
          created_at?: string
          daily_limit?: number
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
          warmup_reply_rate?: number | null
          warmup_sent_today?: number | null
          warmup_started_at?: string | null
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
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      send_log: {
        Row: {
          body: string | null
          bounced_at: string | null
          campaign_id: string | null
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
          bounced_at?: string | null
          campaign_id?: string | null
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
          bounced_at?: string | null
          campaign_id?: string | null
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
    Enums: {},
  },
} as const
