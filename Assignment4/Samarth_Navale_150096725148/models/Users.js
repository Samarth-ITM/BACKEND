const supabase = require("../config/db");
const handleDbResult = require("./unwrap");

const USER_PUBLIC_COLUMNS = "id, username, email";

async function findUserByEmail(targetEmail) {
  return handleDbResult(
    await supabase
      .from("users")
      .select("*")
      .eq("email", targetEmail)
      .maybeSingle()
  );
}

async function createUserRecord({ username, email, password }) {
  return handleDbResult(
    await supabase
      .from("users")
      .insert({ username, email, password })
      .select(USER_PUBLIC_COLUMNS)
      .maybeSingle()
  );
}

module.exports = { findUserByEmail, createUserRecord };
