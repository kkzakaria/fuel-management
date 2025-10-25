/**
 * Report Queries (Client-side)
 *
 * Client-side queries for report data (simple queries that don't need server context)
 */

import { createClient } from "./client";

// =============================================================================
// Driver List (for filters)
// =============================================================================

export async function fetchDriversList() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("chauffeur")
    .select("id, nom, prenom")
    .eq("statut", "actif")
    .order("nom");

  if (error) {
    console.error("Supabase error fetching drivers:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    throw error;
  }
  return data || [];
}

// =============================================================================
// Vehicle List (for filters)
// =============================================================================

export async function fetchVehiclesList() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("vehicule")
    .select("id, immatriculation, marque, modele")
    .eq("statut", "actif")
    .order("immatriculation");

  if (error) {
    console.error("Supabase error fetching vehicles:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    throw error;
  }
  return data || [];
}

// =============================================================================
// Destination List (for filters)
// =============================================================================

export async function fetchDestinationsList() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("localite")
    .select("id, nom, region")
    .order("nom");

  if (error) {
    console.error("Supabase error fetching destinations:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    throw error;
  }
  return data || [];
}

// =============================================================================
// Driver Details (for driver report)
// =============================================================================

export async function fetchDriverDetails(driverId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("chauffeur")
    .select("id, nom, prenom, telephone, date_embauche, statut")
    .eq("id", driverId)
    .single();

  if (error) throw error;
  return data;
}

// =============================================================================
// Vehicle Details (for vehicle report)
// =============================================================================

export async function fetchVehicleDetails(vehicleId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("vehicule")
    .select(
      "id, immatriculation, marque, modele, annee, type_carburant, kilometrage, statut",
    )
    .eq("id", vehicleId)
    .single();

  if (error) throw error;
  return data;
}

// =============================================================================
// Destination Details (for destination report)
// =============================================================================

export async function fetchDestinationDetails(destinationId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("localite")
    .select("id, nom, region, type_localite")
    .eq("id", destinationId)
    .single();

  if (error) throw error;
  return data;
}
