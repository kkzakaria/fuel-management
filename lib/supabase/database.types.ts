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
    PostgrestVersion: "13.0.5"
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
      chauffeur: {
        Row: {
          created_at: string | null
          date_embauche: string | null
          id: string
          nom: string
          numero_permis: string | null
          prenom: string
          statut: string | null
          telephone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date_embauche?: string | null
          id?: string
          nom: string
          numero_permis?: string | null
          prenom: string
          statut?: string | null
          telephone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date_embauche?: string | null
          id?: string
          nom?: string
          numero_permis?: string | null
          prenom?: string
          statut?: string | null
          telephone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      conteneur_trajet: {
        Row: {
          created_at: string | null
          id: string
          numero_conteneur: string | null
          quantite: number | null
          statut_livraison: string | null
          trajet_id: string
          type_conteneur_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          numero_conteneur?: string | null
          quantite?: number | null
          statut_livraison?: string | null
          trajet_id: string
          type_conteneur_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          numero_conteneur?: string | null
          quantite?: number | null
          statut_livraison?: string | null
          trajet_id?: string
          type_conteneur_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conteneur_trajet_trajet_id_fkey"
            columns: ["trajet_id"]
            isOneToOne: false
            referencedRelation: "trajet"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conteneur_trajet_type_conteneur_id_fkey"
            columns: ["type_conteneur_id"]
            isOneToOne: false
            referencedRelation: "type_conteneur"
            referencedColumns: ["id"]
          },
        ]
      }
      frais_trajet: {
        Row: {
          created_at: string | null
          id: string
          libelle: string
          montant: number
          trajet_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          libelle: string
          montant?: number
          trajet_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          libelle?: string
          montant?: number
          trajet_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "frais_trajet_trajet_id_fkey"
            columns: ["trajet_id"]
            isOneToOne: false
            referencedRelation: "trajet"
            referencedColumns: ["id"]
          },
        ]
      }
      localite: {
        Row: {
          created_at: string | null
          id: string
          nom: string
          region: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          nom: string
          region?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          nom?: string
          region?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      mission_sous_traitance: {
        Row: {
          avance_payee: boolean | null
          created_at: string | null
          date_mission: string
          date_paiement_avance: string | null
          date_paiement_solde: string | null
          id: string
          localite_arrivee_id: string
          localite_depart_id: string
          montant_90_pourcent: number | null
          montant_total: number
          numero_conteneur: string | null
          observations: string | null
          quantite: number | null
          reste_10_pourcent: number | null
          solde_paye: boolean | null
          sous_traitant_id: string
          statut: string | null
          type_conteneur_id: string
          updated_at: string | null
        }
        Insert: {
          avance_payee?: boolean | null
          created_at?: string | null
          date_mission?: string
          date_paiement_avance?: string | null
          date_paiement_solde?: string | null
          id?: string
          localite_arrivee_id: string
          localite_depart_id: string
          montant_90_pourcent?: number | null
          montant_total: number
          numero_conteneur?: string | null
          observations?: string | null
          quantite?: number | null
          reste_10_pourcent?: number | null
          solde_paye?: boolean | null
          sous_traitant_id: string
          statut?: string | null
          type_conteneur_id: string
          updated_at?: string | null
        }
        Update: {
          avance_payee?: boolean | null
          created_at?: string | null
          date_mission?: string
          date_paiement_avance?: string | null
          date_paiement_solde?: string | null
          id?: string
          localite_arrivee_id?: string
          localite_depart_id?: string
          montant_90_pourcent?: number | null
          montant_total?: number
          numero_conteneur?: string | null
          observations?: string | null
          quantite?: number | null
          reste_10_pourcent?: number | null
          solde_paye?: boolean | null
          sous_traitant_id?: string
          statut?: string | null
          type_conteneur_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mission_sous_traitance_localite_arrivee_id_fkey"
            columns: ["localite_arrivee_id"]
            isOneToOne: false
            referencedRelation: "localite"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mission_sous_traitance_localite_depart_id_fkey"
            columns: ["localite_depart_id"]
            isOneToOne: false
            referencedRelation: "localite"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mission_sous_traitance_sous_traitant_id_fkey"
            columns: ["sous_traitant_id"]
            isOneToOne: false
            referencedRelation: "sous_traitant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mission_sous_traitance_type_conteneur_id_fkey"
            columns: ["type_conteneur_id"]
            isOneToOne: false
            referencedRelation: "type_conteneur"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          chauffeur_id: string | null
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          last_login: string | null
          nom: string | null
          prenom: string | null
          role: Database["public"]["Enums"]["user_role"]
          telephone: string | null
          updated_at: string | null
        }
        Insert: {
          chauffeur_id?: string | null
          created_at?: string | null
          email: string
          id: string
          is_active?: boolean | null
          last_login?: string | null
          nom?: string | null
          prenom?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          telephone?: string | null
          updated_at?: string | null
        }
        Update: {
          chauffeur_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          nom?: string | null
          prenom?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          telephone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_chauffeur_id_fkey"
            columns: ["chauffeur_id"]
            isOneToOne: false
            referencedRelation: "chauffeur"
            referencedColumns: ["id"]
          },
        ]
      }
      sous_traitant: {
        Row: {
          adresse: string | null
          contact_principal: string | null
          created_at: string | null
          email: string | null
          id: string
          nom_entreprise: string
          statut: string | null
          telephone: string | null
          updated_at: string | null
        }
        Insert: {
          adresse?: string | null
          contact_principal?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nom_entreprise: string
          statut?: string | null
          telephone?: string | null
          updated_at?: string | null
        }
        Update: {
          adresse?: string | null
          contact_principal?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nom_entreprise?: string
          statut?: string | null
          telephone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      trajet: {
        Row: {
          autres_frais: number | null
          chauffeur_id: string
          consommation_au_100: number | null
          created_at: string | null
          date_trajet: string
          ecart_litrage: number | null
          frais_peage: number | null
          id: string
          km_debut: number
          km_fin: number | null
          litrage_prevu: number | null
          litrage_station: number | null
          localite_arrivee_id: string
          localite_depart_id: string
          numero_trajet: string
          observations: string | null
          parcours_total: number | null
          prix_litre: number | null
          prix_litre_calcule: number | null
          statut: string | null
          updated_at: string | null
          vehicule_id: string
        }
        Insert: {
          autres_frais?: number | null
          chauffeur_id: string
          consommation_au_100?: number | null
          created_at?: string | null
          date_trajet?: string
          ecart_litrage?: number | null
          frais_peage?: number | null
          id?: string
          km_debut: number
          km_fin?: number | null
          litrage_prevu?: number | null
          litrage_station?: number | null
          localite_arrivee_id: string
          localite_depart_id: string
          numero_trajet: string
          observations?: string | null
          parcours_total?: number | null
          prix_litre?: number | null
          prix_litre_calcule?: number | null
          statut?: string | null
          updated_at?: string | null
          vehicule_id: string
        }
        Update: {
          autres_frais?: number | null
          chauffeur_id?: string
          consommation_au_100?: number | null
          created_at?: string | null
          date_trajet?: string
          ecart_litrage?: number | null
          frais_peage?: number | null
          id?: string
          km_debut?: number
          km_fin?: number | null
          litrage_prevu?: number | null
          litrage_station?: number | null
          localite_arrivee_id?: string
          localite_depart_id?: string
          numero_trajet?: string
          observations?: string | null
          parcours_total?: number | null
          prix_litre?: number | null
          prix_litre_calcule?: number | null
          statut?: string | null
          updated_at?: string | null
          vehicule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trajet_chauffeur_id_fkey"
            columns: ["chauffeur_id"]
            isOneToOne: false
            referencedRelation: "chauffeur"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trajet_localite_arrivee_id_fkey"
            columns: ["localite_arrivee_id"]
            isOneToOne: false
            referencedRelation: "localite"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trajet_localite_depart_id_fkey"
            columns: ["localite_depart_id"]
            isOneToOne: false
            referencedRelation: "localite"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trajet_vehicule_id_fkey"
            columns: ["vehicule_id"]
            isOneToOne: false
            referencedRelation: "vehicule"
            referencedColumns: ["id"]
          },
        ]
      }
      type_conteneur: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          nom: string
          taille_pieds: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          nom: string
          taille_pieds: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          nom?: string
          taille_pieds?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      vehicule: {
        Row: {
          annee: number | null
          created_at: string | null
          id: string
          immatriculation: string
          kilometrage_actuel: number | null
          marque: string | null
          modele: string | null
          statut: string | null
          type_carburant: string | null
          updated_at: string | null
        }
        Insert: {
          annee?: number | null
          created_at?: string | null
          id?: string
          immatriculation: string
          kilometrage_actuel?: number | null
          marque?: string | null
          modele?: string | null
          statut?: string | null
          type_carburant?: string | null
          updated_at?: string | null
        }
        Update: {
          annee?: number | null
          created_at?: string | null
          id?: string
          immatriculation?: string
          kilometrage_actuel?: number | null
          marque?: string | null
          modele?: string | null
          statut?: string | null
          type_carburant?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      chauffeur_status_stats: {
        Row: {
          count: number | null
          percentage: number | null
          statut: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_test_profiles: { Args: never; Returns: undefined }
      get_current_chauffeur_id: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      is_chauffeur: { Args: never; Returns: boolean }
      is_gestionnaire_or_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      user_role:
        | "admin"
        | "gestionnaire"
        | "chauffeur"
        | "personnel"
        | "visiteur"
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
      user_role: [
        "admin",
        "gestionnaire",
        "chauffeur",
        "personnel",
        "visiteur",
      ],
    },
  },
} as const
