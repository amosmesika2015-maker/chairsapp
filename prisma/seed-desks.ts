import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  // Create category
  const category = await prisma.category.upsert({
    where: { slug: "desks" },
    update: {},
    create: { name: "שולחנות למשרד", slug: "desks", order: 2 },
  });
  console.log("Category created:", category.name, category.id);

  const products = [
    {
      name: 'מערכת גלאקסי 45 מ"מ',
      sku: "4000",
      imageUrl: "https://otzma-fur.co.il/wp-content/uploads/2025/09/4000_002.jpg",
      description: 'מערכת מנהל גלאקסי עם פלטה עבה במיוחד בעובי 45 מ"מ ואיכות מלמין יצוק מהשורה הראשונה',
      details: "רוחב: 160 ס\"מ\nעומק: 70 ס\"מ\nגובה: 75 ס\"מ\nאורכים זמינים: 160, 180, 200 ס\"מ\nחומר: מלמין יצוק\nכולל: ארגז 4 מגירות עם נעילה במגירה עליונה",
    },
    {
      name: "מערכת חלון מלאה",
      sku: "3000",
      imageUrl: "https://otzma-fur.co.il/wp-content/uploads/2025/09/3000_00000.jpg",
      description: "שולחן מערכת חלון מלאה – פתרון עבודה גמיש ומרווח, אידאלי לעמדות מזכירות",
      details: "רוחב: 160 ס\"מ\nעומק: 70 ס\"מ\nגובה: 75 ס\"מ\nכולל: פלטת שולחן + מסתור צניעות + שלוחה + ארגז 4 מגירות + רגלי חלון מתכת",
    },
    {
      name: "מערכת מטריקס מלאה",
      sku: "3003",
      imageUrl: "https://otzma-fur.co.il/wp-content/uploads/2025/09/3003_00000.jpg",
      description: "מערכת מטריקס מלאה – עמדת עבודה מסודרת ויעילה למשרד",
      details: "רוחב: 160 ס\"מ\nעומק: 70 ס\"מ\nגובה: 75 ס\"מ\nחומר: מלמין יצוק",
    },
    {
      name: "מערכת מיתר רגליים משופעות",
      sku: "3002",
      imageUrl: "https://otzma-fur.co.il/wp-content/uploads/2025/09/3002_002.jpg",
      description: "מערכת מיתר עם רגליים משופעות – עיצוב מודרני ומרשים לחלל משרדי",
      details: "רוחב: 160 ס\"מ\nעומק: 70 ס\"מ\nגובה: 75 ס\"מ\nחומר: מלמין יצוק",
    },
    {
      name: "מערכת מנהל אנפה",
      sku: "300300",
      imageUrl: "https://otzma-fur.co.il/wp-content/uploads/2025/09/300300_00000.jpg",
      description: "מערכת מנהל אנפה – פתרון מנהיגותי לחלל עבודה יוקרתי ומסודר",
      details: "רוחב: 160 ס\"מ\nעומק: 70 ס\"מ\nגובה: 75 ס\"מ\nחומר: מלמין יצוק",
    },
    {
      name: "מערכת מנהל חלון מגירות + דלת",
      sku: "30001",
      imageUrl: "https://otzma-fur.co.il/wp-content/uploads/2025/09/30001_00000.jpg",
      description: "מערכת מנהל חלון עם ארגז מגירות ודלת – שילוב אחסון מושלם לחלל הניהולי",
      details: "רוחב: 160 ס\"מ\nעומק: 70 ס\"מ\nגובה: 75 ס\"מ\nכולל: ארגז מגירות + דלת פתיחה\nחומר: מלמין יצוק",
    },
    {
      name: "מערכת מנהל חלון מגירות + תא לכונן",
      sku: "30003",
      imageUrl: "https://otzma-fur.co.il/wp-content/uploads/2025/09/30003_7019_00000.jpg",
      description: "מערכת מנהל חלון עם מגירות ותא ייעודי לכונן – פונקציונלי ומסודר",
      details: "רוחב: 160 ס\"מ\nעומק: 70 ס\"מ\nגובה: 75 ס\"מ\nכולל: ארגז מגירות + תא לכונן\nחומר: מלמין יצוק",
    },
    {
      name: "מערכת מנהל חן",
      sku: "3009",
      imageUrl: "https://otzma-fur.co.il/wp-content/uploads/2025/09/3009_000.png",
      description: "מערכת מנהל דגם חן – אלגנטיות ופונקציונליות במערכת אחת",
      details: "רוחב: 160 ס\"מ\nעומק: 70 ס\"מ\nגובה: 75 ס\"מ\nחומר: מלמין יצוק\nכולל: פלטת שולחן + רגל חלון + שלוחת מנהל + 4 מגירות + 2 דלתות + תא לכונן",
    },
    {
      name: "מערכת מנהל מעיין",
      sku: "",
      imageUrl: "https://otzma-fur.co.il/wp-content/uploads/2025/09/Generated-Image-August-31-2025-12_44PM-e1779703458278-1024x701.jpeg",
      description: "מערכת מנהל מעיין – מערכת יוקרתית ומרשימה לחלל ניהולי ברמה הגבוהה",
      details: "חומר: מלמין יצוק איכותי",
    },
    {
      name: "מערכת מנהל ניקול",
      sku: "3000",
      imageUrl: "https://otzma-fur.co.il/wp-content/uploads/2025/09/3000_Anafa_00003.jpg",
      description: "מערכת מנהל ניקול – עיצוב נקי ואלגנטי לסביבת עבודה מקצועית",
      details: "רוחב: 160 ס\"מ\nעומק: 70 ס\"מ\nגובה: 75 ס\"מ\nחומר: מלמין יצוק",
    },
    {
      name: "מערכת מנהל רגל X",
      sku: "33033",
      imageUrl: "https://otzma-fur.co.il/wp-content/uploads/2025/09/33033_002.jpg",
      description: "מערכת מנהל עם רגל X – עיצוב בולט ומודרני שמושך את העין",
      details: "רוחב: 160 ס\"מ\nעומק: 70 ס\"מ\nגובה: 75 ס\"מ\nחומר: מלמין יצוק",
    },
    {
      name: "מערכת מנהל רגל חוחית",
      sku: "33036",
      imageUrl: "https://otzma-fur.co.il/wp-content/uploads/2025/09/33036_002.jpg",
      description: "מערכת מנהל עם רגל חוחית – ייחודית ומעוצבת לסביבה ניהולית",
      details: "רוחב: 160 ס\"מ\nעומק: 70 ס\"מ\nגובה: 75 ס\"מ\nחומר: מלמין יצוק",
    },
    {
      name: "מערכת נויה מלאה",
      sku: "",
      imageUrl: "https://otzma-fur.co.il/wp-content/uploads/2025/09/Generated-Image-September-10-2025-11_47AM-585x1024.png",
      description: "מערכת נויה מלאה – עמדת עבודה שלמה בעיצוב עדכני ונוח",
      details: "חומר: מלמין יצוק",
    },
    {
      name: "עמדת טלמרקטינג 2 יח' פלטה בעומק",
      sku: "6252",
      imageUrl: "https://otzma-fur.co.il/wp-content/uploads/2025/09/6252_3.jpg",
      description: "עמדת טלמרקטינג ל-2 עובדים עם פלטה עמוקה – אידאלי למוקד שיחות",
      details: "מספר תחנות: 2\nחומר: מלמין יצוק",
    },
    {
      name: "עמדת טלמרקטינג 2 יח' פלטה ומחיצה באותו עומק",
      sku: "6252",
      imageUrl: "https://otzma-fur.co.il/wp-content/uploads/2025/09/6252_03.jpg",
      description: "עמדת טלמרקטינג ל-2 עובדים עם מחיצה – מאפשרת פרטיות לכל עמדה",
      details: "מספר תחנות: 2\nכולל מחיצה\nחומר: מלמין יצוק",
    },
    {
      name: "עמדת טלמרקטינג 3 יח' פלטה בעומק",
      sku: "6253",
      imageUrl: "https://otzma-fur.co.il/wp-content/uploads/2025/09/6253_3.jpg",
      description: "עמדת טלמרקטינג ל-3 עובדים עם פלטה עמוקה – פתרון יעיל לצוות",
      details: "מספר תחנות: 3\nחומר: מלמין יצוק",
    },
    {
      name: "שולחן ישיבות אובלי 2 חלקים",
      sku: "",
      imageUrl: "https://otzma-fur.co.il/wp-content/uploads/2026/05/%D7%97%D7%93%D7%A8-%D7%91%D7%9E%D7%A9%D7%A8%D7%93-%D7%A2%D7%9D-%D7%A9%D7%95%D7%9C%D7%97%D7%9F-%D7%99%D7%A9%D7%99%D7%91%D7%95%D7%AA-%D7%90%D7%95%D7%91%D7%9C%D7%99-2-%D7%97%D7%9C%D7%A7%D7%99%D7%9D-%D7%9E%D7%91%D7%99%D7%AA-%D7%A8%D7%94%D7%99%D7%98%D7%99-%D7%A2%D7%95%D7%A6%D7%9E%D7%94-e1779703436137.webp",
      description: "שולחן ישיבות אובלי דו-חלקי – מושלם לחדרי ישיבות מרשימים",
      details: "צורה: אובלי\nמספר חלקים: 2\nחומר: מלמין יצוק",
    },
  ];

  let order = 1;
  for (const p of products) {
    await prisma.chair.create({
      data: {
        name: p.name,
        price: "",
        imageUrl: p.imageUrl,
        description: p.description,
        details: p.details,
        sku: p.sku || null,
        order: order++,
        isVisible: false,
        categoryId: category.id,
      },
    });
    console.log("Created:", p.name);
  }

  console.log(`\nDone! Created ${products.length} products in draft mode.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
