
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
            "capital_partners": {
                  Row: {
                    "about": string,"active": boolean,"created_at": string,"focus": (string)[],"kind": string,"offer": string,"offer_label": string,"profile_id": string,"reply_time": string,"track_record": string
                  }
                  ComputedFields: never
                  Insert: {
                    "about"?: string,"active"?: boolean,"created_at"?: string,"focus"?: (string)[],"kind": string,"offer": string,"offer_label"?: string,"profile_id": string,"reply_time"?: string,"track_record"?: string
                  }
                  Update: {
                    "about"?: string,"active"?: boolean,"created_at"?: string,"focus"?: (string)[],"kind"?: string,"offer"?: string,"offer_label"?: string,"profile_id"?: string,"reply_time"?: string,"track_record"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "capital_partners_profile_id_fkey"
      columns: ["profile_id"]
isOneToOne: true
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"categories": {
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
                },"deal_alerts": {
                  Row: {
                    "created_at": string,"deal_type": Database["public"]['Enums']["deal_type"] | null,"id": number,"label": string,"max_amount": number | null,"property_type": Database["public"]['Enums']["property_type"] | null,"region": string | null,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"deal_type"?: Database["public"]['Enums']["deal_type"] | null,"id"?: never,"label": string,"max_amount"?: number | null,"property_type"?: Database["public"]['Enums']["property_type"] | null,"region"?: string | null,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"deal_type"?: Database["public"]['Enums']["deal_type"] | null,"id"?: never,"label"?: string,"max_amount"?: number | null,"property_type"?: Database["public"]['Enums']["property_type"] | null,"region"?: string | null,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "deal_alerts_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"deal_documents": {
                  Row: {
                    "created_at": string,"deal_id": number,"ext": string,"id": number,"meta": string,"name": string,"storage_path": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"deal_id": number,"ext"?: string,"id"?: never,"meta"?: string,"name": string,"storage_path"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"deal_id"?: number,"ext"?: string,"id"?: never,"meta"?: string,"name"?: string,"storage_path"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "deal_documents_deal_id_fkey"
      columns: ["deal_id"]
isOneToOne: false
      referencedRelation: "deals"
      referencedColumns: ["id"]
    }
                  ]
                },"deal_private": {
                  Row: {
                    "address": string,"deal_id": number
                  }
                  ComputedFields: never
                  Insert: {
                    "address"?: string,"deal_id": number
                  }
                  Update: {
                    "address"?: string,"deal_id"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "deal_private_deal_id_fkey"
      columns: ["deal_id"]
isOneToOne: true
      referencedRelation: "deals"
      referencedColumns: ["id"]
    }
                  ]
                },"deal_questions": {
                  Row: {
                    "answer": string | null,"answered_at": string | null,"author_id": string,"body": string,"created_at": string,"deal_id": number,"id": number,"like_count": number
                  }
                  ComputedFields: never
                  Insert: {
                    "answer"?: string | null,"answered_at"?: string | null,"author_id": string,"body": string,"created_at"?: string,"deal_id": number,"id"?: never,"like_count"?: number
                  }
                  Update: {
                    "answer"?: string | null,"answered_at"?: string | null,"author_id"?: string,"body"?: string,"created_at"?: string,"deal_id"?: number,"id"?: never,"like_count"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "deal_questions_author_id_fkey"
      columns: ["author_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "deal_questions_deal_id_fkey"
      columns: ["deal_id"]
isOneToOne: false
      referencedRelation: "deals"
      referencedColumns: ["id"]
    }
                  ]
                },"deal_reports": {
                  Row: {
                    "created_at": string,"deal_id": number,"reason": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"deal_id": number,"reason"?: string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"deal_id"?: number,"reason"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "deal_reports_deal_id_fkey"
      columns: ["deal_id"]
isOneToOne: false
      referencedRelation: "deals"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "deal_reports_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"deal_requests": {
                  Row: {
                    "amount": number | null,"created_at": string,"deal_id": number,"message": string,"status": Database["public"]['Enums']["request_status"],"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "amount"?: number | null,"created_at"?: string,"deal_id": number,"message"?: string,"status"?: Database["public"]['Enums']["request_status"],"user_id": string
                  }
                  Update: {
                    "amount"?: number | null,"created_at"?: string,"deal_id"?: number,"message"?: string,"status"?: Database["public"]['Enums']["request_status"],"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "deal_requests_deal_id_fkey"
      columns: ["deal_id"]
isOneToOne: false
      referencedRelation: "deals"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "deal_requests_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"deal_saves": {
                  Row: {
                    "created_at": string,"deal_id": number,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"deal_id": number,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"deal_id"?: number,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "deal_saves_deal_id_fkey"
      columns: ["deal_id"]
isOneToOne: false
      referencedRelation: "deals"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "deal_saves_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"deals": {
                  Row: {
                    "amount": number,"city": string,"closed_at": string | null,"closes_note": string,"created_at": string,"details": NonNullable<Json>,"features": (string)[],"id": number,"interest_count": number,"metrics": NonNullable<Json>,"needed_by": string,"off_market": boolean,"photos": NonNullable<Json>,"poster_id": string,"property_type": Database["public"]['Enums']["property_type"],"raise_committed": number | null,"raise_goal": number | null,"raise_note": string,"region": string,"seek": string,"seeking": (string)[],"state": string,"status": Database["public"]['Enums']["deal_status"],"story": string,"title": string,"type": Database["public"]['Enums']["deal_type"],"views": number,"visibility": Database["public"]['Enums']["deal_visibility"]
                  }
                  ComputedFields: never
                  Insert: {
                    "amount"?: number,"city": string,"closed_at"?: string | null,"closes_note"?: string,"created_at"?: string,"details"?: NonNullable<Json>,"features"?: (string)[],"id"?: never,"interest_count"?: number,"metrics"?: NonNullable<Json>,"needed_by"?: string,"off_market"?: boolean,"photos"?: NonNullable<Json>,"poster_id": string,"property_type": Database["public"]['Enums']["property_type"],"raise_committed"?: number | null,"raise_goal"?: number | null,"raise_note"?: string,"region"?: string,"seek"?: string,"seeking"?: (string)[],"state": string,"status"?: Database["public"]['Enums']["deal_status"],"story"?: string,"title": string,"type": Database["public"]['Enums']["deal_type"],"views"?: number,"visibility"?: Database["public"]['Enums']["deal_visibility"]
                  }
                  Update: {
                    "amount"?: number,"city"?: string,"closed_at"?: string | null,"closes_note"?: string,"created_at"?: string,"details"?: NonNullable<Json>,"features"?: (string)[],"id"?: never,"interest_count"?: number,"metrics"?: NonNullable<Json>,"needed_by"?: string,"off_market"?: boolean,"photos"?: NonNullable<Json>,"poster_id"?: string,"property_type"?: Database["public"]['Enums']["property_type"],"raise_committed"?: number | null,"raise_goal"?: number | null,"raise_note"?: string,"region"?: string,"seek"?: string,"seeking"?: (string)[],"state"?: string,"status"?: Database["public"]['Enums']["deal_status"],"story"?: string,"title"?: string,"type"?: Database["public"]['Enums']["deal_type"],"views"?: number,"visibility"?: Database["public"]['Enums']["deal_visibility"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "deals_poster_id_fkey"
      columns: ["poster_id"]
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
                },"partner_connections": {
                  Row: {
                    "created_at": string,"partner_id": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"partner_id": string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"partner_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "partner_connections_partner_id_fkey"
      columns: ["partner_id"]
isOneToOne: false
      referencedRelation: "capital_partners"
      referencedColumns: ["profile_id"]
    },{
      foreignKeyName: "partner_connections_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "avatar_color": string,"bio": string,"created_at": string,"full_name": string,"headline": string,"id": string,"is_moderator": boolean,"location": string,"post_count": number,"verified": boolean
                  }
                  ComputedFields: never
                  Insert: {
                    "avatar_color"?: string,"bio"?: string,"created_at"?: string,"full_name"?: string,"headline"?: string,"id": string,"is_moderator"?: boolean,"location"?: string,"post_count"?: number,"verified"?: boolean
                  }
                  Update: {
                    "avatar_color"?: string,"bio"?: string,"created_at"?: string,"full_name"?: string,"headline"?: string,"id"?: string,"is_moderator"?: boolean,"location"?: string,"post_count"?: number,"verified"?: boolean
                  }
                  Relationships: [
                    
                  ]
                },"question_likes": {
                  Row: {
                    "question_id": number,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "question_id": number,"user_id": string
                  }
                  Update: {
                    "question_id"?: number,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "question_likes_question_id_fkey"
      columns: ["question_id"]
isOneToOne: false
      referencedRelation: "deal_questions"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "question_likes_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
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
            "can_see_private":
{ Args: { "p_deal_id": number }; Returns: boolean
                           },
"community_stats":
{ Args: Record<PropertyKey, never>; Returns: Json
                           },
"deal_room_stats":
{ Args: Record<PropertyKey, never>; Returns: Json
                           },
"increment_deal_views":
{ Args: { "p_deal_id": number }; Returns: undefined
                           },
"increment_thread_views":
{ Args: { "p_thread_id": number }; Returns: undefined
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
            "deal_status": "live"|"closed","deal_type": "sale"|"equity"|"jv"|"debt","deal_visibility": "approve"|"verified","property_type": "facility"|"conv"|"land"|"rv"|"portfolio","request_status": "pending"|"approved"|"declined"
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
            "deal_status": ["live", "closed"],"deal_type": ["sale", "equity", "jv", "debt"],"deal_visibility": ["approve", "verified"],"property_type": ["facility", "conv", "land", "rv", "portfolio"],"request_status": ["pending", "approved", "declined"]
          }
        }
} as const
