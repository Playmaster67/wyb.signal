type Rel = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

export interface Database {
  public: {
    Tables: {
      clients: {
        Row:           { id: string; name: string; ingest_secret: string; created_at: string };
        Insert:        { id?: string; name: string; ingest_secret: string; created_at?: string };
        Update:        { name?: string; ingest_secret?: string };
        Relationships: Rel[];
      };
      profiles: {
        Row:           { id: string; client_id: string; created_at: string };
        Insert:        { id: string; client_id: string; created_at?: string };
        Update:        { client_id?: string };
        Relationships: Rel[];
      };
      influencers: {
        Row: {
          id: string; client_id: string; name: string; country: string | null;
          utm_id: string; status: "active" | "inactive"; created_at: string;
        };
        Insert: {
          id?: string; client_id: string; name: string; country?: string | null;
          utm_id: string; status?: "active" | "inactive"; created_at?: string;
        };
        Update:        { name?: string; country?: string | null; status?: "active" | "inactive" };
        Relationships: Rel[];
      };
      affiliate_links: {
        Row: {
          id: string; client_id: string; influencer_id: string;
          utm_inf: string; base_url: string; full_url: string;
          label: string | null; active: boolean; created_at: string;
        };
        Insert: {
          id?: string; client_id: string; influencer_id: string;
          utm_inf: string; base_url: string; full_url: string;
          label?: string | null; active?: boolean; created_at?: string;
        };
        Update:        { active?: boolean; label?: string | null };
        Relationships: Rel[];
      };
      events: {
        Row: {
          id: string; client_id: string;
          event_type: "lead" | "ftd" | "redeposit";
          user_id: string; utm_inf: string | null; influencer_id: string | null;
          value_brl: number; value_original: number | null; currency_original: string | null;
          deposit_number: number | null; event_ts: string; received_at: string;
        };
        Insert: {
          id?: string; client_id: string;
          event_type: "lead" | "ftd" | "redeposit";
          user_id: string; utm_inf?: string | null; influencer_id?: string | null;
          value_brl?: number; value_original?: number | null; currency_original?: string | null;
          deposit_number?: number | null; event_ts: string; received_at?: string;
        };
        Update:        Record<string, never>; // imutável
        Relationships: Rel[];
      };
      export_logs: {
        Row: {
          id: string; client_id: string; exported_at: string;
          filters: Record<string, unknown>; row_count: number; format: "csv" | "xlsx";
        };
        Insert: {
          id?: string; client_id: string; exported_at?: string;
          filters?: Record<string, unknown>; row_count: number; format: "csv" | "xlsx";
        };
        Update:        Record<string, never>;
        Relationships: Rel[];
      };
    };
    Views:          Record<string, never>;
    Functions: {
      get_my_client_id: { Args: Record<string, never>; Returns: string };
    };
    Enums:          Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
