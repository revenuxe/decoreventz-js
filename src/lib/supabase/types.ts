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
    PostgrestVersion: "14.15"
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
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
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
      addons: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          price: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          price: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      addresses: {
        Row: {
          city: string
          created_at: string
          id: string
          is_default: boolean
          label: string | null
          line1: string
          line2: string | null
          phone: string
          pincode: string
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          city: string
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string | null
          line1: string
          line2?: string | null
          phone: string
          pincode: string
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string | null
          line1?: string
          line2?: string | null
          phone?: string
          pincode?: string
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      booking_items: {
        Row: {
          addons: Json
          booking_id: string
          category_slug: string
          customizations: Json
          created_at: string
          id: string
          image: string | null
          original_price: number | null
          product_id: string | null
          quantity: number
          service_name: string
          service_slug: string
          unit_price: number
        }
        Insert: {
          addons?: Json
          booking_id: string
          category_slug: string
          customizations?: Json
          created_at?: string
          id?: string
          image?: string | null
          original_price?: number | null
          product_id?: string | null
          quantity?: number
          service_name: string
          service_slug: string
          unit_price: number
        }
        Update: {
          addons?: Json
          booking_id?: string
          category_slug?: string
          customizations?: Json
          created_at?: string
          id?: string
          image?: string | null
          original_price?: number | null
          product_id?: string | null
          quantity?: number
          service_name?: string
          service_slug?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "booking_items_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_status_events: {
        Row: {
          booking_id: string
          created_at: string
          id: string
          status: Database["public"]["Enums"]["booking_status"]
        }
        Insert: {
          booking_id: string
          created_at?: string
          id?: string
          status: Database["public"]["Enums"]["booking_status"]
        }
        Update: {
          booking_id?: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["booking_status"]
        }
        Relationships: [
          {
            foreignKeyName: "booking_status_events_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          assigned_vendor_id: string | null
          created_at: string
          decoration_image_url: string | null
          event_date: string
          event_time: string
          id: string
          notes: string | null
          order_code: string
          status: Database["public"]["Enums"]["booking_status"]
          team_image_url: string | null
          total: number
          updated_at: string
          user_id: string
          vendor_accepted_at: string | null
          vendor_bill_amount: number | null
          vendor_paid_amount: number
          vendor_paid_at: string | null
          vendor_payment_status: Database["public"]["Enums"]["vendor_payment_status"]
          vendor_quote_amount: number | null
          vendor_quote_items: Json
          venue_city: string
          venue_line1: string
          venue_line2: string | null
          venue_name: string | null
          venue_phone: string
          venue_pincode: string
        }
        Insert: {
          assigned_vendor_id?: string | null
          created_at?: string
          decoration_image_url?: string | null
          event_date: string
          event_time: string
          id?: string
          notes?: string | null
          order_code?: string
          status?: Database["public"]["Enums"]["booking_status"]
          team_image_url?: string | null
          total: number
          updated_at?: string
          user_id: string
          vendor_accepted_at?: string | null
          vendor_bill_amount?: number | null
          vendor_paid_amount?: number
          vendor_paid_at?: string | null
          vendor_payment_status?: Database["public"]["Enums"]["vendor_payment_status"]
          vendor_quote_amount?: number | null
          vendor_quote_items?: Json
          venue_city: string
          venue_line1: string
          venue_line2?: string | null
          venue_name?: string | null
          venue_phone: string
          venue_pincode: string
        }
        Update: {
          assigned_vendor_id?: string | null
          created_at?: string
          decoration_image_url?: string | null
          event_date?: string
          event_time?: string
          id?: string
          notes?: string | null
          order_code?: string
          status?: Database["public"]["Enums"]["booking_status"]
          team_image_url?: string | null
          total?: number
          updated_at?: string
          user_id?: string
          vendor_accepted_at?: string | null
          vendor_bill_amount?: number | null
          vendor_paid_amount?: number
          vendor_paid_at?: string | null
          vendor_payment_status?: Database["public"]["Enums"]["vendor_payment_status"]
          vendor_quote_amount?: number | null
          vendor_quote_items?: Json
          venue_city?: string
          venue_line1?: string
          venue_line2?: string | null
          venue_name?: string | null
          venue_phone?: string
          venue_pincode?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_assigned_vendor_id_fkey"
            columns: ["assigned_vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          accent: string | null
          created_at: string
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          tagline: string | null
          updated_at: string
        }
        Insert: {
          accent?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          accent?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          tagline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      decoration_content_items: {
        Row: {
          content: Json
          created_at: string
          id: string
          is_active: boolean
          kind: "balloon_palette" | "included_set" | "faq_set" | "delivery_note" | "care_note"
          name: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          kind: "balloon_palette" | "included_set" | "faq_set" | "delivery_note" | "care_note"
          name: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          kind?: "balloon_palette" | "included_set" | "faq_set" | "delivery_note" | "care_note"
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      homepage_hero_slides: {
        Row: { action_label: string; action_url: string; created_at: string; desktop_image_url: string; id: string; is_active: boolean; kicker: string; mobile_image_url: string | null; sort_order: number; subtitle: string; title: string; updated_at: string }
        Insert: { action_label?: string; action_url?: string; created_at?: string; desktop_image_url: string; id?: string; is_active?: boolean; kicker?: string; mobile_image_url?: string | null; sort_order?: number; subtitle?: string; title: string; updated_at?: string }
        Update: { action_label?: string; action_url?: string; created_at?: string; desktop_image_url?: string; id?: string; is_active?: boolean; kicker?: string; mobile_image_url?: string | null; sort_order?: number; subtitle?: string; title?: string; updated_at?: string }
        Relationships: []
      }
      product_addon_links: {
        Row: {
          addon_id: string
          created_at: string
          id: string
          product_id: string
        }
        Insert: {
          addon_id: string
          created_at?: string
          id?: string
          product_id: string
        }
        Update: {
          addon_id?: string
          created_at?: string
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_addon_links_addon_id_fkey"
            columns: ["addon_id"]
            isOneToOne: false
            referencedRelation: "addons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_addon_links_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string
          balloon_palette_id: string | null
          included_group_id: string | null
          faq_group_id: string | null
          delivery_group_id: string | null
          care_group_id: string | null
          balloon_options: Json
          created_at: string
          description: string | null
          delivery_info: string | null
          id: string
          images: string[]
          included: string[]
          care_info: string | null
          faqs: Json
          is_active: boolean
          is_featured: boolean
          is_trending: boolean
          meta_description: string | null
          meta_title: string | null
          name: string
          not_included: string[]
          og_image_url: string | null
          price: number
          rating: number
          review_count: number
          sale_price: number | null
          slug: string
          sort_order: number
          subcategory_id: string | null
          tagline: string | null
          tags: string[]
          updated_at: string
        }
        Insert: {
          category_id: string
          balloon_palette_id?: string | null
          included_group_id?: string | null
          faq_group_id?: string | null
          delivery_group_id?: string | null
          care_group_id?: string | null
          balloon_options?: Json
          created_at?: string
          description?: string | null
          delivery_info?: string | null
          id?: string
          images?: string[]
          included?: string[]
          care_info?: string | null
          faqs?: Json
          is_active?: boolean
          is_featured?: boolean
          is_trending?: boolean
          meta_description?: string | null
          meta_title?: string | null
          name: string
          not_included?: string[]
          og_image_url?: string | null
          price: number
          rating?: number
          review_count?: number
          sale_price?: number | null
          slug: string
          sort_order?: number
          subcategory_id?: string | null
          tagline?: string | null
          tags?: string[]
          updated_at?: string
        }
        Update: {
          category_id?: string
          balloon_palette_id?: string | null
          included_group_id?: string | null
          faq_group_id?: string | null
          delivery_group_id?: string | null
          care_group_id?: string | null
          balloon_options?: Json
          created_at?: string
          description?: string | null
          delivery_info?: string | null
          id?: string
          images?: string[]
          included?: string[]
          care_info?: string | null
          faqs?: Json
          is_active?: boolean
          is_featured?: boolean
          is_trending?: boolean
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          not_included?: string[]
          og_image_url?: string | null
          price?: number
          rating?: number
          review_count?: number
          sale_price?: number | null
          slug?: string
          sort_order?: number
          subcategory_id?: string | null
          tagline?: string | null
          tags?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_balloon_palette_id_fkey"
            columns: ["balloon_palette_id"]
            isOneToOne: false
            referencedRelation: "decoration_content_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      subcategories: {
        Row: {
          category_id: string
          created_at: string
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          tagline: string | null
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          tagline?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendor_payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          id: string
          note: string | null
          paid_at: string
          recorded_by: string | null
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          id?: string
          note?: string | null
          paid_at?: string
          recorded_by?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          id?: string
          note?: string | null
          paid_at?: string
          recorded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          address_line1: string
          address_line2: string | null
          business_name: string
          city: string
          contact_name: string
          created_at: string
          id: string
          phone: string
          pincode: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["vendor_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          business_name: string
          city: string
          contact_name: string
          created_at?: string
          id?: string
          phone: string
          pincode: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["vendor_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          business_name?: string
          city?: string
          contact_name?: string
          created_at?: string
          id?: string
          phone?: string
          pincode?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["vendor_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cancel_booking: { Args: { _booking_id: string }; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      vendor_accept_assignment: {
        Args: { _booking_id: string }
        Returns: undefined
      }
      vendor_decline_assignment: {
        Args: { _booking_id: string }
        Returns: undefined
      }
      vendor_finalize_payment: {
        Args: { _booking_id: string; _final_amount: number }
        Returns: undefined
      }
      vendor_save_quote: {
        Args: { _booking_id: string; _items: Json; _total: number }
        Returns: undefined
      }
      vendor_submit_quote: {
        Args: { _amount: number; _booking_id: string }
        Returns: undefined
      }
      vendor_update_booking_status: {
        Args: {
          _booking_id: string
          _decoration_image_url?: string
          _new_status: Database["public"]["Enums"]["booking_status"]
          _team_image_url?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "customer" | "vendor"
      booking_status:
        | "pending"
        | "confirmed"
        | "preparing"
        | "completed"
        | "cancelled"
      vendor_payment_status: "unpaid" | "paid"
      vendor_status: "pending" | "approved" | "rejected"
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
      app_role: ["admin", "customer", "vendor"],
      booking_status: [
        "pending",
        "confirmed",
        "preparing",
        "completed",
        "cancelled",
      ],
      vendor_payment_status: ["unpaid", "paid"],
      vendor_status: ["pending", "approved", "rejected"],
    },
  },
} as const
