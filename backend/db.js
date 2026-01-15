const { Pool } = require("pg");
const { newDb } = require("pg-mem");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

let pool;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
  });
} else {
  console.log("⚠️  No DATABASE_URL found. Using in-memory database (pg-mem) for testing.");
  
  const db = newDb();
  
  // Register simple logger for debug
  // db.on('query', q => console.log('SQL:', q));

  // Prepare Schema for pg-mem (Remove unsupported ENUMs)
  const schemaPath = path.join(__dirname, "schema.sql");
  let schema = fs.readFileSync(schemaPath, "utf8");

  // Replace ENUM types with TEXT for compatibility
  schema = schema.replace(/CREATE TYPE .*? AS ENUM .*?;/g, "");
  schema = schema.replace(/origin nc_origin/g, "origin TEXT");
  schema = schema.replace(/status nc_status/g, "status TEXT");
  schema = schema.replace(/from_status nc_status/g, "from_status TEXT");
  schema = schema.replace(/to_status nc_status/g, "to_status TEXT");
  
  // Execute schema
  db.public.none(schema);

  // Seed Data
  db.public.none(`
    INSERT INTO users (email, full_name, department_id, is_active) 
    VALUES ('kalite@cvsair.com', 'Kalite Sorumlusu', 1, true);
    INSERT INTO users (email, full_name, department_id, is_active) 
    VALUES ('uretim@cvsair.com', 'Üretim Sorumlusu', 2, true);
    
    INSERT INTO assignment_rules (department_id, default_assignee_id)
    VALUES (1, 1), (2, 2);
  `);

  const { Pool: MockPool } = db.adapters.createPg();
  pool = new MockPool();
}

module.exports = { pool };
