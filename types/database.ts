export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          organization: string | null;
          role: "admin" | "client";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          organization?: string | null;
          role?: "admin" | "client";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          organization?: string | null;
          role?: "admin" | "client";
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          inventory_total: number;
          notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          inventory_total: number;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          inventory_total?: number;
          notes?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      districts: {
        Row: {
          id: string;
          name: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          sort_order?: number;
          is_active?: boolean;
        };
        Relationships: [];
      };
      requests: {
        Row: {
          id: string;
          reference_code: string;
          product_id: string;
          quantity: number;
          district_id: string;
          location: string;
          requested_by_name: string;
          requested_by_email: string;
          requested_by_phone: string | null;
          organization: string | null;
          preferred_date: string;
          end_date: string;
          status: RequestStatus;
          notes: string | null;
          internal_notes: string | null;
          created_by_user_id: string;
          assigned_to_user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reference_code?: string;
          product_id: string;
          quantity: number;
          district_id: string;
          location: string;
          requested_by_name: string;
          requested_by_email: string;
          requested_by_phone?: string | null;
          organization?: string | null;
          preferred_date: string;
          end_date: string;
          status?: RequestStatus;
          notes?: string | null;
          internal_notes?: string | null;
          created_by_user_id: string;
          assigned_to_user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          reference_code?: string;
          product_id?: string;
          quantity?: number;
          district_id?: string;
          location?: string;
          requested_by_name?: string;
          requested_by_email?: string;
          requested_by_phone?: string | null;
          organization?: string | null;
          preferred_date?: string;
          end_date?: string;
          status?: RequestStatus;
          notes?: string | null;
          internal_notes?: string | null;
          created_by_user_id?: string;
          assigned_to_user_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "requests_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "requests_district_id_fkey";
            columns: ["district_id"];
            isOneToOne: false;
            referencedRelation: "districts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "requests_created_by_user_id_fkey";
            columns: ["created_by_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "requests_assigned_to_user_id_fkey";
            columns: ["assigned_to_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type RequestStatus =
  | "pending"
  | "approved"
  | "scheduled"
  | "completed"
  | "cancelled";
