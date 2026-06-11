import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

const sample = [
  { name: 'น้ำเปล่า 600ml', price: 10, stock: 100, category: 'เครื่องดื่ม' },
  { name: 'โค้ก 325ml', price: 15, stock: 80, category: 'เครื่องดื่ม' },
  { name: 'มาม่าต้มยำ', price: 8, stock: 200, category: 'อาหารแห้ง' },
  { name: 'ขนมปังแซนวิช', price: 25, stock: 30, category: 'เบเกอรี่' },
  { name: 'กาแฟ 3in1', price: 7, stock: 150, category: 'เครื่องดื่ม' },
  { name: 'ไข่ไก่ แผง', price: 120, stock: 20, category: 'ของสด' },
];

async function main() {
  for (const p of sample) {
    const exists = await db.product.findFirst({ where: { name: p.name } });
    if (!exists) await db.product.create({ data: p });
  }
  console.log('Seeded', sample.length, 'products.');
}
main().finally(() => db.$disconnect());
