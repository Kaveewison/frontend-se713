# โครงสร้างโปรเจค Frontend (Frontend Architecture)

โปรเจคนี้ถูกสร้างด้วย **Vue 3** + **Vite** และใช้ **TypeScript** โดยมีการแบ่งโฟลเดอร์ตามหลักการของ Clean Architecture / Layered Architecture อย่างเป็นสัดส่วน ดังนี้

## โครงสร้างโฟลเดอร์หลัก (`src/`)

```text
src/
├── assets/                 # ไฟล์ทรัพยากรต่างๆ เช่น CSS, รูปภาพ
│   └── index.css           # ไฟล์ CSS หลักที่เก็บตัวแปรแบบ Global (Design Tokens) และ Utility classes
├── domain/                 # Business Logic ของแอปพลิเคชัน (ตาม Clean Architecture)
│   ├── entities/           # ส่วนนี้เก็บ Model / Type Definitions หรือ Entity ย่อยๆ
│   └── usecases/           # เก็บ Business Rules ย่อยต่างๆ หรือฟังก์ชันที่เรียกใช้ Services อีกที
├── presentation/           # ส่วนของ UI/UX ที่ผู้ใช้งานมองเห็น
│   ├── components/         # ส่วนประกอบ UI ย่อย (Vue Components)
│   │   ├── layout/ 
│   │   │   └── DashboardLayout.vue     # Layout หลักสำหรับหน้าต่างระบบงานหลังบ้าน
│   │   ├── LoginForm.vue              # ฟอร์มการเข้าสู่ระบบ
│   │   ├── LoginHero.vue              # ภาพ Graphic และคำอธิบายหน้าเข้าสู่ระบบ
│   │   ├── RegistrationForm.vue       # ฟอร์มการลงทะเบียนผู้ใช้งาน
│   │   └── RegistrationHero.vue       # ภาพ Graphic หน้าการลงทะเบียน
│   └── views/              # ระดับหน้าจอ หรือ Screen
│       ├── LoginView.vue              # หน้าจอ Login
│       ├── RegistrationView.vue       # หน้าจอสำหรับลงทะเบียนผู้ใช้งานใหม่
│       └── dashboard/                 # จัดเก็บหน้าเพจต่างๆ ภายใน Dashboard
│           ├── ManageConstituenciesView.vue   # หน้าจัดการจังหวัด และเขตเลือกตั้ง 
│           ├── ManageUsersView.vue            # หน้ารายชื่อจัดการผู้ใช้งานระบบ (แสดงแบบตาราง)
│           ├── PoliticalPartiesView.vue       # หน้ารายชื่อและการจัดการพรรคการเมือง
│           ├── SetupCandidatesView.vue        # หน้าเปิดสิทธิ์การเลือกตั้ง และตั้งค่าผู้ลงสมัคร
│           └── UserProfileView.vue            # หน้าแสดงและแก้ไขข้อมูลผู้ใช้งาน
├── router/                 # การจัดการ Routing ของแอปพลิเคชัน
│   └── index.ts            # ระบุ Path หรือเส้นทางต่างๆ ว่าจะถูก Component ใดมา Render
├── App.vue                 # Root Component จุดเชื่อมแรกของแอปพลิเคชัน
├── main.ts                 # จุด Entry point ของแอปเพื่อสร้าง Vue Application
├── style.css               # Reset Style / Base Style
└── vite-env.d.ts           # Type Definition สำหรับใช้กับ Vite
```

---

## องค์ประกอบหลักที่สำคัญ (Key Components)

1. **Presentation Layer (`src/presentation/`)**
   - ถือเป็น Layer หลักที่จัดการกับ Vue Component ทั้งหมด
   - มีการแยก `components/` เพื่อทำหน้าที่เป็น "Dumb Component" บางส่วนที่รับ Properties หรือ Emit ต่อจากนั้น
   - ส่วน `views/` ทำหน้าที่เป็น "Smart Component" หรือหน้า Page หลัก ที่เชื่อมโยงเข้าดึงข้อมูลผ่าน Usecases มาส่งเข้าให้ Components ย่อย

2. **Domain Layer (`src/domain/`)**
   - ควบคุมเกี่ยวกับ Model การ Validate Form ต่างๆ เช่น `LoginEntity`, `RegistrationEntity` 
   - ช่วยเก็บ Business Logic ที่ไม่ยึดติดกับ UI ทำให้โปรเจครักษาความสะอาดของโค้ดได้

3. **Routing (`src/router/`)**
   - มีการวางระบบ Nested Routes ภายใต้ Path หลัก `/dashboard` เพื่อใช้ร่วมกับ `DashboardLayout.vue` 
   - ทำให้ทุกเพจที่เป็นหน้า Administration ย่อยสามารถแสดง Menu Bar / Top NavBar ให้เหมือนกัน

4. **Styling & Theming (`src/assets/index.css`)**
   - มีการกำหนด CSS Variables ในรูปแบบของ `var(--primary)`, `var(--bg-page)` ซึ่งทำให้การเปลี่ยนแปลงโทนสีหรือการปรับปรุงธีมสีทีหลังในลักษณะของ Design Token ทำได้ง่ายและสอดคล้องกันทั่วโลกหน้าแอปพลิเคชัน
