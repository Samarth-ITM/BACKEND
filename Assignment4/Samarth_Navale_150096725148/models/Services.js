const supabase = require("../config/db");
const handleDbResult = require("./unwrap");

async function fetchServicesBySalon(targetSalonId) {
  return handleDbResult(
    await supabase.from("services").select("*").eq("salon_id", targetSalonId)
  );
}

async function fetchAvailableServices() {
  return handleDbResult(
    await supabase.from("services").select("*").eq("is_available", true)
  );
}

async function createServiceRecord(
  targetSalonId,
  { serviceName, price, duration, isAvailable }
) {
  return handleDbResult(
    await supabase
      .from("services")
      .insert({
        salon_id: targetSalonId,
        service_name: serviceName,
        price,
        duration,
        is_available: isAvailable,
      })
      .select()
      .maybeSingle()
  );
}

async function updateServiceRecord(serviceId, updatePayload) {
  return handleDbResult(
    await supabase
      .from("services")
      .update(updatePayload)
      .eq("id", serviceId)
      .select()
      .maybeSingle()
  );
}

async function deleteServiceRecord(serviceId) {
  return handleDbResult(
    await supabase
      .from("services")
      .delete()
      .eq("id", serviceId)
      .select()
      .maybeSingle()
  );
}

module.exports = {
  fetchServicesBySalon,
  fetchAvailableServices,
  createServiceRecord,
  updateServiceRecord,
  deleteServiceRecord,
};
