# Easy Quiz Bot Backend

Ushbu repository Easy Quiz Bot loyihasining backend (Node.js) qismi bo‘lib, Telegram-botni ishga tushirish, ma’lumotlar bazasi (PostgreSQL) bilan ishlash, mavzular (topics), testlar, savollar va variantlar (CRUD) hamda foydalanuvchilarni autentifikatsiya qilish jarayonlarini boshqaradi.

## Xususiyatlar

- **Telegram-bot:** Telegraf kutubxonasi yordamida bot logikasi (start, action, hears, scene) amalga oshiriladi.
- **Sequelize (PostgreSQL):**
    - ORM sifatida ma’lumotlar bazasida mavzular, testlar, savollar, variantlar va foydalanuvchilar haqidagi ma’lumotlarni boshqaradi.
- **Express:**
    - RESTful API endpoint’larini tashkil etish, shu jumladan mavzu, test, savol, variantlarni boshqarish uchun admin paneliga xizmat qiladi.
- **JWT yoki oddiy token orqali autentifikatsiya:** Loyihada `chat_id` token ko‘rinishida ishlashi mumkin.
- **Modulli arxitektura:** Har bir funksiya (auth, tests, userTest, bot) alohida papka va fayllarda yozilgan, bu kodni tushunish va rivojlantirishni osonlashtiradi.

### Bot funksiyalari

- **Ro‘yxatdan o‘tish:** Telefon raqami va ism-familiya orqali.
- **Testlarni yechish:** Savollar, javob variantlari, to‘g‘ri/xato javoblarni aniqlash, umumiy ballni hisoblash.
- **Yakuniy natijalarni ko‘rsatish:** Ball, to‘g‘ri/xato javoblar, yechish vaqti.
- **Admin huquqiga ega bo‘lish:** Maxfiy parol kiritish orqali.
- **Foydalanuvchi holatini boshqarish:** `UserStatesEnum` (REGISTER, UPDATE, USER va boshqalar).

## Texnologiyalar

- **Node.js & Express:** HTTP serveri hamda REST API.
- **Telegraf:** Telegram-bot logikasi.
- **TypeScript:** Katta loyihada xatoliklarni oldini olish va qulay refactoring uchun.
- **Sequelize (PostgreSQL):** Ma’lumotlar bazasi bilan ishlash uchun ORM.

## Loyihani ishga tushirish (Installation va Setup)

### Repository ni klonlang:

```bash
git clone https://github.com/username/easy-quiz-bot-backend.git
cd easy-quiz-bot-backend
```

### Bog‘lamalarni o‘rnatish:

```bash
npm install
```

### Environment sozlash:

`.env` fayl yoki boshqa usul orqali quyidagi o‘zgaruvchilarni belgilang:

```plaintext
BOT_TOKEN=123456789:ABCD_Your_Telegram_Bot_Token
SERVER_URL=https://example.com       # Webhook uchun
PORT=4040                            # Server porti
DATABASE_URL=postgres://user:pass@host:5432/dbname
GET_ADMIN_PASS=secret123             # Admin bo'lib olish uchun parol
DASHBOARD_URL=https://example.com    # Admin panel (frontend) manzili
```

### Ma’lumotlar bazasini migatsiya qilish yoki ishga tushirish:

```bash
npm run dev
```

### Botni ishga tushirish:

```bash
npm run dev
```

Standart holatda API `localhost:4040` da ishlaydi.
Agar `SERVER_URL` berilgan bo‘lsa, `initBotWebhook()` funksiyasi orqali Telegram-bot webhook‘ga ulanadi, aks holda `initBotPolling()` bilan polling rejimda ishga tushirish mumkin.

## Loyihaning Tuzilishi (Structure)

```plaintext
easy-quiz-bot-backend/
 ┣ src/
 ┃ ┣ bot/
 ┃ ┃ ┣ bot.controller.ts   # Bot asosiy logikasi (Telegraf, start, actions, scenes)
 ┃ ┃ ┣ bot.service.ts      # Kengaytirilgan yordamchi funksiya (markup, text shakllantirish)
 ┃ ┃ ┗ scenes/             # Telegraf Wizard Scenes (register, update_profile, test_flow, ...)
 ┃ ┣ auth/
 ┃ ┃ ┣ auth.service.ts     # Foydalanuvchi qidirish, yaratish, admin huquqini belgilash
 ┃ ┃ ┗ auth.route.ts       # Kirish (login), ro‘yxatdan o‘tish endpointlari
 ┃ ┣ test/
 ┃ ┃ ┣ test.service.ts     # Mavzular (topic), test, savol, variantlar bo'yicha CRUD
 ┃ ┃ ┣ user-test.service.ts# Foydalanuvchining test yechish jarayoni (startTest, finishTest)
 ┃ ┃ ┗ test.route.ts       # /api/tests route (mavzu, test, savol, variant)
 ┃ ┣ database/
 ┃ ┃ ┗ sequelize.ts        # Sequelize init, DB connection
 ┃ ┣ interfaces/           # TypeScript interfeyslar (IUser, ITest, ITopic, IQuestion, ...)
 ┃ ┣ middleware/           # Xatoliklar, admin-check, boshqalar
 ┃ ┣ errors/               # Xususiy error sinflar
 ┃ ┣ app.ts                # Express app init
 ┃ ┣ server.ts             # App ni ishga tushirish
 ┃ ┗ ...
 ┣ .env.example
 ┣ package.json
 ┣ tsconfig.json
 ┗ ...
```

## API Endpoint’lar

### Auth:
- **POST /api/auth/login:** (Agar kerak bo‘lsa) chat_id yoki boshqa credential bilan login.

### Tests:
- **GET /api/tests/topic:** Barcha mavzular ro‘yxati (admin).
- **POST /api/tests/topic:** Mavzu yaratish.
- **PUT /api/tests/topic/:id:** Mavzuni yangilash.
- **DELETE /api/tests/topic/:id:** Mavzuni o‘chirish.
- **GET /api/tests/topic/:topic_id:** Muayyan mavzu va uning testlari.
- Shu kabi test (/api/tests/test/...), savol (/api/tests/question/...), option (/api/tests/option/...) CRUD endpointlari mavjud.

### Bot webhook:
- **POST /telegram-webhook:** Telegraf webhook callback.

### Bot polling:
Agar webhook o‘rnatilmagan bo‘lsa, `launchPolling()` orqali bot polling rejimda ishlaydi.

## Bot Logikasi (qisqacha)

1. **Ro‘yxatdan o‘tish:**
    - `/start` bosilganda foydalanuvchining `chat_id` ma’lumotlari bazada yo‘q bo‘lsa, yaratiladi.
    - Foydalanuvchi `register.scene` ga kirib, telefon raqami va ism-familiya kiritadi.
2. **Test tanlash:**
    - Topics ro‘yxati inline keyboard bilan sahifalab ko‘rsatiladi.
    - Mavzu tanlangandan so‘ng, tegishli testlar ko‘rsatiladi va test_flow.scene boshlanadi.
3. **Test yechish (test_flow.scene):**
    - Savollar navbatma-navbat ko‘rsatiladi, foydalanuvchi javob tanlagach, bazaga yoziladi.
    - Yakunda ball va natijalar ko‘rsatiladi.
4. **Natijalar:**
    - Foydalanuvchi “Мои результаты” tugmasi orqali tugallangan testlari ro‘yxatini ko‘radi.

## Qanday hissa qo‘shish mumkin (Contributing)

1. Issues oching yoki mavjudlarida muammoni muhokama qiling.
2. **Fork qiling, yangi branchda (feature/XYZ) o‘zgartirish kiriting va pull request qilib yuboring.**

## Litsenziya

Loyihadan foydalanganda mualliflik huquqini inobatga oling.

## Aloqa (Contact)

- **Muallif:** Mansurov Akbar
- **Email:** akbarxon2005@gmail.com
- **Telegram:** https://t.me/mansurov_akbar

Agar savol yoki takliflaringiz bo‘lsa, Issues orqali yoki yuqoridagi manzilga murojaat qiling.

**Rahmat!**
