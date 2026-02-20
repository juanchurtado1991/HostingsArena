require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE credentials in env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    const sqlPath = path.join(__dirname, 'supabase', 'migrations', '20260220_slack_reminders.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Supabase JS client doesn't natively expose raw SQL execution easily 
    // unless using rpc. Try splitting if needed, but since it's a direct connection
    // we might need to rely on the REST API's ability to run functions or use postgres.js
    console.log("To run this migration, the user should paste the SQL manually in the Supabase SQL Editor,");
    console.log("as executing raw DDL (CREATE TABLE) over the REST API is not supported.");
    console.log("SQL to execute:\n", sql);

  } catch (err) {
    console.error(err);
  }
}

runMigration();
