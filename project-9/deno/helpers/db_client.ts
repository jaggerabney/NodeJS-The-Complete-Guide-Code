import {
  MongoClient,
  Database
} from "https://deno.land/x/mongo@v0.31.2/mod.ts";
import "https://deno.land/std@0.183.0/dotenv/load.ts";

let db: Database;

export function connect() {
  const client = new MongoClient();
  client.connect(Deno.env.get("DB_CONNECTION_STRING")!);

  db = client.database("deno");
}

export function getDb() {
  return db;
}
