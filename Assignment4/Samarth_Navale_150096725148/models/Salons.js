const supabase = require("../config/db");
const handleDbResult = require("./unwrap");

async function fetchSalons() {
  return handleDbResult(await supabase.from("salons").select("*"));
}

async function fetchSalonById(salonId) {
  return handleDbResult(
    await supabase.from("salons").select("*").eq("id", salonId).maybeSingle()
  );
}

async function fetchSalonsByCity(cityName) {
  return handleDbResult(
    await supabase.from("salons").select("*").ilike("city", cityName)
  );
}

async function fetchTopRatedSalons(maxCount = 5) {
  return handleDbResult(
    await supabase
      .from("salons")
      .select("*")
      .order("rating", { ascending: false })
      .limit(maxCount)
  );
}

async function createSalonRecord({ name, city, address, rating }) {
  return handleDbResult(
    await supabase
      .from("salons")
      .insert({ name, city, address, rating })
      .select()
      .maybeSingle()
  );
}

async function updateSalonRecord(salonId, updatePayload) {
  return handleDbResult(
    await supabase
      .from("salons")
      .update(updatePayload)
      .eq("id", salonId)
      .select()
      .maybeSingle()
  );
}

async function deleteSalonRecord(salonId) {
  return handleDbResult(
    await supabase
      .from("salons")
      .delete()
      .eq("id", salonId)
      .select()
      .maybeSingle()
  );
}

module.exports = {
  fetchSalons,
  fetchSalonById,
  fetchSalonsByCity,
  fetchTopRatedSalons,
  createSalonRecord,
  updateSalonRecord,
  deleteSalonRecord,
};
