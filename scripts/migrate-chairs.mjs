import Database from "better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, "../dev.db");

// Read from local SQLite
const sqlite = new Database(dbPath);
const chairs = sqlite.prepare("SELECT * FROM Chair ORDER BY `order` ASC").all();
sqlite.close();

console.log(`Found ${chairs.length} chairs in SQLite`);

// Write to Neon PostgreSQL
const adapter = new PrismaPg({
  connectionString: "postgresql://neondb_owner:npg_u6kNPIFrZ1yh@ep-purple-tree-ad3stpml.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
});
const prisma = new PrismaClient({ adapter });

for (const chair of chairs) {
  await prisma.chair.upsert({
    where: { id: chair.id },
    update: {
      name: chair.name,
      price: chair.price,
      imageUrl: chair.imageUrl,
      description: chair.description,
      details: chair.details,
      order: chair.order,
      isVisible: chair.isVisible === 1,
      status: chair.status ?? "",
    },
    create: {
      id: chair.id,
      name: chair.name,
      price: chair.price,
      imageUrl: chair.imageUrl,
      description: chair.description,
      details: chair.details,
      order: chair.order,
      isVisible: chair.isVisible === 1,
      status: chair.status ?? "",
    },
  });
  console.log(`✓ ${chair.name}`);
}

await prisma.$disconnect();
console.log("\nהכל הועבר בהצלחה!");
