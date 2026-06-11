# POS ร้านค้า (Vercel + PostgreSQL)

ระบบ Point-of-Sale สำหรับ deploy บน **Vercel** พร้อม **PostgreSQL Database**

> 💡 **Version นี้**: ใช้ PostgreSQL เพื่อ deploy บน Vercel (ฟรี)  
> 📁 **Version localhost**: ดูโฟลเดอร์ `POS` (SQLite)

## ฟีเจอร์

- หน้าขาย Mobile-first
- PromptPay QR Code
- รายงานรายได้ 30 วัน
- แจ้งเตือนสต๊อกใกล้หมด + Checklist
- PWA

## 🚀 Deploy บน Vercel (6 ขั้นตอน)

### 1. Push โค้ดขึ้น GitHub

```bash
cd D:\AI_PROJECT\POS-Vercel
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/pos-vercel.git
git push -u origin main
```

### 2. สร้าง Vercel Project

- https://vercel.com → Sign up
- **Add New** → **Project** → เลือก repo `pos-vercel`

### 3. เพิ่ม PostgreSQL Database

- **Storage** tab → **Create Database** → **Postgres**
- ตั้งชื่อ `pos-db` → **Create**

### 4. ตั้งค่า Environment Variables

ใน **Settings** → **Environment Variables**:

| Key | Value |
|-----|-------|
| `ADMIN_PASSWORD` | รหัสผ่านของคุณ |
| `PROMPTPAY_ID` | เบอร์มือถือ 10 หลัก |
| `SESSION_SECRET` | random-32-chars |

### 5. Deploy

- คลิก **Deploy** → รอ 2-3 นาที
- ได้ URL: `https://pos-vercel.vercel.app`

### 6. Seed ข้อมูลตัวอย่าง (ทางเลือก)

```bash
# Copy POSTGRES_PRISMA_URL จาก Vercel → ใส่ใน .env
npm install
npx prisma db seed
```

---

## 📱 ใช้งาน

- เปิด URL → **Add to Home Screen** บนมือถือ
- Admin: `/admin` (login ด้วย ADMIN_PASSWORD)

---

## ⚠️ หมายเหตุ

**รูปสินค้าจะหายหลัง redeploy** (Vercel file system เป็น ephemeral)

→ แก้: ใช้ [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) หรือ Cloudinary

---

**Docs**: [Vercel](https://vercel.com/docs) | [Prisma](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
