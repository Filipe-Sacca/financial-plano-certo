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
  public: {
    Tables: {
      clients: {
        Row: {
          address: string | null
          city: string | null
          cnpj: string | null
          created_at: string
          email: string | null
          id: string
          ifood_merchant_id: string | null
          name: string
          phone: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          cnpj?: string | null
          created_at?: string
          email?: string | null
          id?: string
          ifood_merchant_id?: string | null
          name: string
          phone?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          cnpj?: string | null
          created_at?: string
          email?: string | null
          id?: string
          ifood_merchant_id?: string | null
          name?: string
          phone?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      financial_metrics: {
        Row: {
          average_ticket: number | null
          client_id: string
          commission: number | null
          created_at: string
          date: string
          delivery_fee: number | null
          id: string
          net_revenue: number | null
          orders_count: number | null
          revenue: number | null
          source: string | null
          updated_at: string
        }
        Insert: {
          average_ticket?: number | null
          client_id: string
          commission?: number | null
          created_at?: string
          date: string
          delivery_fee?: number | null
          id?: string
          net_revenue?: number | null
          orders_count?: number | null
          revenue?: number | null
          source?: string | null
          updated_at?: string
        }
        Update: {
          average_ticket?: number | null
          client_id?: string
          commission?: number | null
          created_at?: string
          date?: string
          delivery_fee?: number | null
          id?: string
          net_revenue?: number | null
          orders_count?: number | null
          revenue?: number | null
          source?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_metrics_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      ifood_api_configs: {
        Row: {
          access_token: string | null
          client_id: string
          client_id_api: string
          client_secret: string
          created_at: string
          environment: string | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          access_token?: string | null
          client_id: string
          client_id_api: string
          client_secret: string
          created_at?: string
          environment?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          access_token?: string | null
          client_id?: string
          client_id_api?: string
          client_secret?: string
          created_at?: string
          environment?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ifood_api_configs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      ifood_detailed_analytics: {
        Row: {
          billing_type: string | null
          client_id: string
          created_at: string
          date: string
          delivery_fee: number | null
          gross_revenue: number | null
          id: string
          ifood_commission_value: number | null
          ifood_promotions: number | null
          items_value: number | null
          net_value: number | null
          order_date: string | null
          order_number: string
          payment_date: string | null
          payment_origin: string | null
          service_fee: number | null
          source: string | null
          store_promotions: number | null
          transaction_commission: number | null
          updated_at: string
          weekly_plan_fee: number | null
        }
        Insert: {
          billing_type?: string | null
          client_id: string
          created_at?: string
          date: string
          delivery_fee?: number | null
          gross_revenue?: number | null
          id?: string
          ifood_commission_value?: number | null
          ifood_promotions?: number | null
          items_value?: number | null
          net_value?: number | null
          order_date?: string | null
          order_number: string
          payment_date?: string | null
          payment_origin?: string | null
          service_fee?: number | null
          source?: string | null
          store_promotions?: number | null
          transaction_commission?: number | null
          updated_at?: string
          weekly_plan_fee?: number | null
        }
        Update: {
          billing_type?: string | null
          client_id?: string
          created_at?: string
          date?: string
          delivery_fee?: number | null
          gross_revenue?: number | null
          id?: string
          ifood_commission_value?: number | null
          ifood_promotions?: number | null
          items_value?: number | null
          net_value?: number | null
          order_date?: string | null
          order_number?: string
          payment_date?: string | null
          payment_origin?: string | null
          service_fee?: number | null
          source?: string | null
          store_promotions?: number | null
          transaction_commission?: number | null
          updated_at?: string
          weekly_plan_fee?: number | null
        }
        Relationships: []
      }
      import_logs: {
        Row: {
          client_id: string | null
          created_at: string
          error_count: number | null
          errors: Json | null
          file_name: string
          file_type: string
          id: string
          records_count: number | null
          status: string | null
          success_count: number | null
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          error_count?: number | null
          errors?: Json | null
          file_name: string
          file_type: string
          id?: string
          records_count?: number | null
          status?: string | null
          success_count?: number | null
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          error_count?: number | null
          errors?: Json | null
          file_name?: string
          file_type?: string
          id?: string
          records_count?: number | null
          status?: string | null
          success_count?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "import_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_funnel: {
        Row: {
          add_to_cart: number | null
          clicks: number | null
          client_id: string
          conversion_rate: number | null
          conversions: number | null
          created_at: string
          date: string
          id: string
          impressions: number | null
          product_id: string | null
          source: string | null
          updated_at: string
          views: number | null
        }
        Insert: {
          add_to_cart?: number | null
          clicks?: number | null
          client_id: string
          conversion_rate?: number | null
          conversions?: number | null
          created_at?: string
          date: string
          id?: string
          impressions?: number | null
          product_id?: string | null
          source?: string | null
          updated_at?: string
          views?: number | null
        }
        Update: {
          add_to_cart?: number | null
          clicks?: number | null
          client_id?: string
          conversion_rate?: number | null
          conversions?: number | null
          created_at?: string
          date?: string
          id?: string
          impressions?: number | null
          product_id?: string | null
          source?: string | null
          updated_at?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_funnel_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_funnel_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_method_analytics: {
        Row: {
          client_id: string
          created_at: string
          date: string
          id: string
          orders_count: number | null
          payment_method: string
          percentage_orders: number | null
          percentage_revenue: number | null
          source: string | null
          total_revenue: number | null
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          date: string
          id?: string
          orders_count?: number | null
          payment_method: string
          percentage_orders?: number | null
          percentage_revenue?: number | null
          source?: string | null
          total_revenue?: number | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          date?: string
          id?: string
          orders_count?: number | null
          payment_method?: string
          percentage_orders?: number | null
          percentage_revenue?: number | null
          source?: string | null
          total_revenue?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      product_sales: {
        Row: {
          clicks: number | null
          client_id: string
          conversions: number | null
          created_at: string
          date: string
          id: string
          product_id: string | null
          quantity_sold: number | null
          ranking: number | null
          revenue: number | null
          source: string | null
          updated_at: string
          views: number | null
        }
        Insert: {
          clicks?: number | null
          client_id: string
          conversions?: number | null
          created_at?: string
          date: string
          id?: string
          product_id?: string | null
          quantity_sold?: number | null
          ranking?: number | null
          revenue?: number | null
          source?: string | null
          updated_at?: string
          views?: number | null
        }
        Update: {
          clicks?: number | null
          client_id?: string
          conversions?: number | null
          created_at?: string
          date?: string
          id?: string
          product_id?: string | null
          quantity_sold?: number | null
          ranking?: number | null
          revenue?: number | null
          source?: string | null
          updated_at?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_sales_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          client_id: string
          created_at: string
          description: string | null
          id: string
          ifood_product_id: string | null
          is_active: string | null
          name: string
          price: number | null
          updated_at: string
          merchant_id: string | null
          item_id: string | null
          imagePath: string | null
          product_id: string | null
        }
        Insert: {
          category?: string | null
          client_id: string
          created_at?: string
          description?: string | null
          id?: string
          ifood_product_id?: string | null
          is_active?: string | null
          name: string
          price?: number | null
          updated_at?: string
          merchant_id?: string | null
          item_id?: string | null
          imagePath?: string | null
          product_id?: string | null
        }
        Update: {
          category?: string | null
          client_id?: string
          created_at?: string
          description?: string | null
          id?: string
          ifood_product_id?: string | null
          is_active?: string | null
          name?: string
          price?: number | null
          updated_at?: string
          merchant_id?: string | null
          item_id?: string | null
          imagePath?: string | null
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
                  ]
        }
        ifood_tokens: {
        Row: {
          access_token: string
          client_id: string
          client_secret: string
          expires_at: number
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          client_id: string
          client_secret: string
          expires_at: number
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          client_id?: string
          client_secret?: string
          expires_at?: number
          created_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ifood_merchants: {
        Row: {
          id: string
          merchant_id: string
          name: string
          corporate_name: string | null
          description: string | null
          status: boolean | null
          cuisine_types: string[] | null
          phone: string | null
          address_street: string | null
          address_number: string | null
          address_complement: string | null
          address_neighborhood: string | null
          address_city: string | null
          address_state: string | null
          address_zip_code: string | null
          address_country: string | null
          operating_hours: Json | null
          delivery_methods: string[] | null
          payment_methods: string[] | null
          average_delivery_time: number | null
          minimum_order_value: number | null
          delivery_fee: number | null
          user_id: string
          client_id: string | null
          created_at: string
          updated_at: string
          last_sync_at: string
        }
        Insert: {
          id?: string
          merchant_id: string
          name: string
          corporate_name?: string | null
          description?: string | null
          status?: boolean | null
          cuisine_types?: string[] | null
          phone?: string | null
          address_street?: string | null
          address_number?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_city?: string | null
          address_state?: string | null
          address_zip_code?: string | null
          address_country?: string | null
          operating_hours?: Json | null
          delivery_methods?: string[] | null
          payment_methods?: string[] | null
          average_delivery_time?: number | null
          minimum_order_value?: number | null
          delivery_fee?: number | null
          user_id: string
          client_id?: string | null
          created_at?: string
          updated_at?: string
          last_sync_at?: string
        }
        Update: {
          id?: string
          merchant_id?: string
          name?: string
          corporate_name?: string | null
          description?: string | null
          status?: boolean | null
          cuisine_types?: string[] | null
          phone?: string | null
          address_street?: string | null
          address_number?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_city?: string | null
          address_state?: string | null
          address_zip_code?: string | null
          address_country?: string | null
          operating_hours?: Json | null
          delivery_methods?: string[] | null
          payment_methods?: string[] | null
          average_delivery_time?: number | null
          minimum_order_value?: number | null
          delivery_fee?: number | null
          user_id?: string
          client_id?: string | null
          created_at?: string
          updated_at?: string
          last_sync_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ifood_merchants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ifood_merchants_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
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
