# LearnSpace New (v2)

แพลตฟอร์มการเรียนรู้และชุมชนการศึกษาออนไลน์ภาษาไทย (Learning Management & Educational Community Platform) เวอร์ชันใหม่

> ⚠️ **ข้อกำหนดสำคัญด้านความปลอดภัยและการแยกโปรเจกต์:**
> - โปรเจกต์นี้จัดทำเป็น Repository ใหม่ชื่อ **`learnspace-new`** โดยแยกขาดจาก Repository เดิม (`Bank4481/learnspace`) และเว็บไซต์เดิมบน GitHub Pages อย่างสมบูรณ์ 100%
> - ห้ามนำโค้ดหรือการเปลี่ยนแปลงไปทับเว็บไซต์เดิม
> - ไม่มีการเปิดเผย Secrets, Service Account Keys หรือ Private Keys ใน Repository นี้

---

## จุดเด่นของเวอร์ชันใหม่ (Features)

1. **สถาปัตยกรรมและเทคโนโลยีระดับโปรดักชัน**:
   - พัฒนาด้วย **React 19 + TypeScript + Tailwind CSS**
   - รองรับ Responsive เต็มรูปแบบทั้ง Desktop, Tablet และ Mobile
2. **ระบบการเรียนครบวงจร (LMS Suite)**:
   - รายการคอร์สและบทเรียน พร้อมวิดีโอบรรยายและเนื้อหาเชิงลึก
   - ระบบแบบทดสอบ (Quiz Engine) พร้อมจับเวลาและตรวจคะแนนอัตโนมัติ
   - ระบบการบ้านและโครงงาน (Assignments & Submissions) สำหรับส่งงานและให้คะแนน
   - ระบบติดตามความก้าวหน้าของผู้เรียน (Progress Tracking)
3. **ระบบกระดานถาม-ตอบและสนทนาใหม่ (Standalone Realtime Q&A)**:
   - พัฒนาเป็นระบบเรียลไทม์แยกอิสระ **ไม่ผ่าน Google Apps Script หรือ Google Sheets เดิม**
   - รองรับทั้งกระทู้คำถาม-คำตอบตามรายวิชา (Course Q&A) และห้องสนทนาแลกเปลี่ยนทั่วไป
4. **ระบบสิทธิ์ผู้ใช้งาน (RBAC - Role-Based Access Control)**:
   - แยกสิทธิ์ชัดเจนระหว่าง **นักเรียน (Student)**, **ครูอาจารย์ (Teacher)** และ **ผู้ดูแลระบบ (Admin)**
   - แผงควบคุมผู้ดูแลระบบ (Admin CMS Suite) สำหรับจัดการคอร์ส สถิติ และการตั้งค่าระบบ

---

## การติดตั้งและการเริ่มพัฒนา (Getting Started)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. รันโหมด Development
```bash
npm run dev
```
เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`

### 3. ตรวจสอบ Type และ Linter
```bash
npm run lint
```

### 4. Build สำหรับ Production
```bash
npm run build
```
ไฟล์ผลลัพธ์พร้อม Deploy จะถูกสร้างไว้ในโฟลเดอร์ `dist/`

---

## การเชื่อมต่อ Firebase (`learnspace-51454`)

เพื่อเชื่อมต่อกับโปรเจกต์ Firebase เดิมสำหรับการระบุตัวตนสมาชิกและข้อมูล:
- ข้อมูลการเชื่อมต่อระบุอยู่ใน `firebase-applet-config.json` หรือผ่าน Environment Variables
- ใช้ Firebase Authentication เพื่อให้สมาชิกเดิมล็อกอินเข้าใช้งานได้ทันที
- ข้อมูลความปลอดภัยถูกควบคุมผ่าน Security Rules โดยไม่เขียนทับโครงสร้างของระบบเก่า

---

## การเปิดใช้งาน GitHub Pages สำหรับ `learnspace-new`

โปรเจกต์นี้มีไฟล์ GitHub Actions Workflow (`.github/workflows/deploy.yml`) เตรียมไว้ให้แล้ว:

1. สร้าง Repository ใหม่บน GitHub ในชื่อ **`learnspace-new`** (ตั้งเป็น Public หรือ Private ตามต้องการ)
2. Push โค้ดทั้งหมดขึ้นที่ Branch `main`
3. ไปที่แท็บ **Settings** ของ Repository `learnspace-new`
4. เลือกเมนู **Pages** ทางซ้ายมือ
5. ในหัวข้อ **Build and deployment > Source** ให้เลือกเป็น **GitHub Actions**
6. ระบบจะ Build และ Deploy อัตโนมัติ โดยเว็บไซต์ใหม่จะออนไลน์ที่:
   ```
   https://Bank4481.github.io/learnspace-new/
   ```
   *(เว็บไซต์เดิม `https://Bank4481.github.io/learnspace/` จะยังคงทำงานได้ตามปกติ ไม่ได้รับผลกระทบใดๆ)*
