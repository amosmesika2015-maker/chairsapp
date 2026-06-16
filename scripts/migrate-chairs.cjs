const Database = require("better-sqlite3");
const { Client } = require("pg");
const path = require("path");

const DB_PATH = path.resolve(__dirname, "../dev.db");
const PG_URL = "postgresql://neondb_owner:npg_u6kNPIFrZ1yh@ep-purple-tree-ad3stpml.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function main() {
  // Read chairs from SQLite
  const sqlite = new Database(DB_PATH);
  const chairs = sqlite.prepare('SELECT * FROM "Chair" ORDER BY "order" ASC').all();
  sqlite.close();
  console.log(`נמצאו ${chairs.length} כיסאות ב-SQLite`);

  // Connect to Neon PostgreSQL
  const pg = new Client({ connectionString: PG_URL });
  await pg.connect();

  for (const chair of chairs) {
    await pg.query(
      `INSERT INTO "Chair" (id, name, price, "imageUrl", description, details, "order", "isVisible", status, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         price = EXCLUDED.price,
         "imageUrl" = EXCLUDED."imageUrl",
         description = EXCLUDED.description,
         details = EXCLUDED.details,
         "order" = EXCLUDED."order",
         "isVisible" = EXCLUDED."isVisible",
         status = EXCLUDED.status,
         "updatedAt" = EXCLUDED."updatedAt"`,
      [
        chair.id,
        chair.name,
        chair.price,
        chair.imageUrl,
        chair.description,
        chair.details,
        chair.order,
        chair.isVisible === 1,
        chair.status ?? "",
        new Date(chair.createdAt),
        new Date(chair.updatedAt),
      ]
    );
    console.log(`✓ ${chair.name}`);
  }

  await pg.end();
  console.log("\nהכל הועבר בהצלחה! רענן את האתר.");
}

main().catch(console.error);
