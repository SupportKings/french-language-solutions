// Minimal Database type for Supabase client
// This should be generated using `supabase gen types typescript` in production
export interface Database {
  public: {
    Tables: {
      [key: string]: {
        Row: any;
        Insert: any;
        Update: any;
        Relationships: any[];
      };
    };
    Views: {
      [key: string]: {
        Row: any;
        Relationships: any[];
      };
    };
    Functions: {
      [key: string]: any;
    };
    Enums: {
      [key: string]: string;
    };
    CompositeTypes: {
      [key: string]: any;
    };
  };
}