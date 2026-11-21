
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "categories": {
                  Row: {
                    "color": string,"description": string,"group_name": string,"icon": string,"id": string,"ink": string,"name": string,"sort": number,"tint": string
                  }
                  ComputedFields: never
                  Insert: {
                    "color": string,"description"?: string,"group_name": string,"icon": string,"id": string,"ink": string,"name": string,"sort"?: number,"tint": string
                  }
                  Update: {
                    "color"?: string,"description"?: string,"group_name"?: string,"icon"?: string,"id"?: string,"ink"?: string,"name"?: string,"sort"?: number,"tint"?: string
                  }
                  Relationships: [
                    
                  ]
                },"category_follows": {
                  Row: {
                    "category_id": string,"created_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "category_id": string,"created_at"?: string,"user_id": string
                  }
                  Update: {
                    "category_id"?: string,"created_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "category_follows_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "categories"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "category_follows_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "category_counts"
      referencedColumns: ["category_id"]
    },{
      foreignKeyName: "category_follows_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"event_reminders": {
                  Row: {
                    "event_id": number,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "event_id": number,"user_id": string
                  }
                  Update: {
                    "event_id"?: number,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "event_reminders_event_id_fkey"
      columns: ["event_id"]
isOneToOne: false
      referencedRelation: "events"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "event_reminders_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"events": {
                  Row: {
                    "created_at": string,"host_id": string | null,"id": number,"starts_at": string,"title": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"host_id"?: string | null,"id"?: never,"starts_at": string,"title": string
                  }
                  Update: {
                    "created_at"?: string,"host_id"?: string | null,"id"?: never,"starts_at"?: string,"title"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "events_host_id_fkey"
      columns: ["host_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"follows": {
                  Row: {
                    "created_at": string,"followee_id": string,"follower_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"followee_id": string,"follower_id": string
                  }
                  Update: {
                    "created_at"?: string,"followee_id"?: string,"follower_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "follows_followee_id_fkey"
      columns: ["followee_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "follows_follower_id_fkey"
      columns: ["follower_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"notifications": {
                  Row: {
                    "actor_id": string,"count": number,"created_at": string,"id": number,"kind": string,"read_at": string | null,"reply_id": number | null,"thread_id": number | null,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "actor_id": string,"count"?: number,"created_at"?: string,"id"?: never,"kind": string,"read_at"?: string | null,"reply_id"?: number | null,"thread_id"?: number | null,"user_id": string
                  }
                  Update: {
                    "actor_id"?: string,"count"?: number,"created_at"?: string,"id"?: never,"kind"?: string,"read_at"?: string | null,"reply_id"?: number | null,"thread_id"?: number | null,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "notifications_actor_id_fkey"
      columns: ["actor_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "notifications_reply_id_fkey"
      columns: ["reply_id"]
isOneToOne: false
      referencedRelation: "replies"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "notifications_thread_id_fkey"
      columns: ["thread_id"]
isOneToOne: false
      referencedRelation: "threads"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "notifications_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "avatar_color": string,"bio": string,"created_at": string,"full_name": string,"headline": string,"id": string,"is_admin": boolean,"is_moderator": boolean,"location": string,"post_count": number,"verified": boolean
                  }
                  ComputedFields: never
                  Insert: {
                    "avatar_color"?: string,"bio"?: string,"created_at"?: string,"full_name"?: string,"headline"?: string,"id": string,"is_admin"?: boolean,"is_moderator"?: boolean,"location"?: string,"post_count"?: number,"verified"?: boolean
                  }
                  Update: {
                    "avatar_color"?: string,"bio"?: string,"created_at"?: string,"full_name"?: string,"headline"?: string,"id"?: string,"is_admin"?: boolean,"is_moderator"?: boolean,"location"?: string,"post_count"?: number,"verified"?: boolean
                  }
                  Relationships: [
                    
                  ]
                },"replies": {
                  Row: {
                    "author_id": string,"body": string,"created_at": string,"id": number,"is_answer": boolean,"thread_id": number
                  }
                  ComputedFields: never
                  Insert: {
                    "author_id": string,"body": string,"created_at"?: string,"id"?: never,"is_answer"?: boolean,"thread_id": number
                  }
                  Update: {
                    "author_id"?: string,"body"?: string,"created_at"?: string,"id"?: never,"is_answer"?: boolean,"thread_id"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "replies_author_id_fkey"
      columns: ["author_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "replies_thread_id_fkey"
      columns: ["thread_id"]
isOneToOne: false
      referencedRelation: "threads"
      referencedColumns: ["id"]
    }
                  ]
                },"thread_likes": {
                  Row: {
                    "created_at": string,"thread_id": number,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"thread_id": number,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"thread_id"?: number,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "thread_likes_thread_id_fkey"
      columns: ["thread_id"]
isOneToOne: false
      referencedRelation: "threads"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "thread_likes_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"thread_saves": {
                  Row: {
                    "created_at": string,"thread_id": number,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"thread_id": number,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"thread_id"?: number,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "thread_saves_thread_id_fkey"
      columns: ["thread_id"]
isOneToOne: false
      referencedRelation: "threads"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "thread_saves_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"threads": {
                  Row: {
                    "author_id": string,"body": string,"category_id": string,"created_at": string,"id": number,"last_activity_at": string,"like_count": number,"pinned": boolean,"reply_count": number,"solved": boolean,"stats": NonNullable<Json>,"tags": (string)[],"title": string,"views": number
                  }
                  ComputedFields: never
                  Insert: {
                    "author_id": string,"body": string,"category_id": string,"created_at"?: string,"id"?: never,"last_activity_at"?: string,"like_count"?: number,"pinned"?: boolean,"reply_count"?: number,"solved"?: boolean,"stats"?: NonNullable<Json>,"tags"?: (string)[],"title": string,"views"?: number
                  }
                  Update: {
                    "author_id"?: string,"body"?: string,"category_id"?: string,"created_at"?: string,"id"?: never,"last_activity_at"?: string,"like_count"?: number,"pinned"?: boolean,"reply_count"?: number,"solved"?: boolean,"stats"?: NonNullable<Json>,"tags"?: (string)[],"title"?: string,"views"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "threads_author_id_fkey"
      columns: ["author_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "threads_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "categories"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "threads_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "category_counts"
      referencedColumns: ["category_id"]
    }
                  ]
                }
          }
          Views: {
            "category_counts": {
                  Row: {
                    "category_id": string | null,"topics": number | null
                  }
                  ComputedFields: never
                  Relationships: [
                    
                  ]
                }
          }
          Functions: {
            "admin_delete_category":
{ Args: { "p_id": string,"p_move_to"?: string }; Returns: undefined
                           },
"admin_delete_member":
{ Args: { "p_user_id": string }; Returns: undefined
                           },
"admin_members":
{ Args: { "p_filter"?: string,"p_limit"?: number,"p_offset"?: number,"p_query"?: string }; Returns: {
              "avatar_color": string,"created_at": string,"email": string,"full_name": string,"headline": string,"id": string,"is_admin": boolean,"is_moderator": boolean,"last_sign_in_at": string,"post_count": number,"suspended": boolean,"total": number,"verified": boolean
            }[]
                           },
"admin_set_suspended":
{ Args: { "p_suspended": boolean,"p_user_id": string }; Returns: undefined
                           },
"admin_update_member":
{ Args: { "p_is_admin"?: boolean,"p_is_moderator"?: boolean,"p_user_id": string,"p_verified"?: boolean }; Returns: undefined
                           },
"assert_admin":
{ Args: Record<PropertyKey, never>; Returns: undefined
                           },
"community_stats":
{ Args: Record<PropertyKey, never>; Returns: Json
                           },
"increment_thread_views":
{ Args: { "p_thread_id": number }; Returns: undefined
                           },
"is_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"mark_answer":
{ Args: { "p_is_answer": boolean,"p_reply_id": number }; Returns: undefined
                           },
"show_limit":
{ Args: Record<PropertyKey, never>; Returns: number
                           },
"show_trgm":
{ Args: { "": string }; Returns: (string)[]
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            
          }
        }
} as const
