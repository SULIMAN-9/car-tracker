# 🚀 دليل النشر — متتبع صيانة السيارات

## الخطوة 1 — إعداد قاعدة البيانات (Supabase)

1. افتح **supabase.com** وادخل إلى مشروعك
2. من القائمة الجانبية اختر **SQL Editor**
3. اضغط **New Query**
4. افتح ملف `SUPABASE_SETUP.sql` وانسخ كامل المحتوى والصقه
5. اضغط **Run** (أو Ctrl+Enter)
6. يجب أن ترى: `Database setup complete! ✅`

---

## الخطوة 2 — رفع الكود إلى GitHub

1. افتح **github.com** وادخل إلى حسابك
2. اضغط **+** ثم **New repository**
3. سمّه `car-tracker` واضغط **Create repository**
4. افتح **Command Prompt** أو **Terminal** على جهازك
5. انتقل إلى مجلد المشروع:
   ```
   cd path/to/car-tracker
   ```
6. شغّل هذه الأوامر بالترتيب:
   ```
   git init
   git add .
   git commit -m "first commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/car-tracker.git
   git push -u origin main
   ```
   *(استبدل YOUR_USERNAME باسم حسابك في GitHub)*

---

## الخطوة 3 — النشر على Vercel

1. افتح **vercel.com** وادخل بحساب GitHub
2. اضغط **Add New → Project**
3. اختر مستودع `car-tracker`
4. في إعدادات البناء:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. اضغط **Deploy**
6. انتظر دقيقة واحدة ✅

---

## النتيجة

ستحصل على رابط دائم مثل:
```
https://car-tracker-xyz.vercel.app
```

شارك هذا الرابط مع أي شخص — يعمل على الجوال والكمبيوتر.

---

## كيف تصل إلى بيانات المستخدمين؟

1. افتح **supabase.com** → مشروعك → **Table Editor**
2. ستجد جداول: `users`, `cars`, `maintenance`, `spare_parts`
3. كل بيانات المستخدمين موجودة هنا بالكامل
4. يمكنك تصديرها كـ CSV من زر Export

---

## تحديث التطبيق مستقبلاً

أي تعديل على الكود:
```
git add .
git commit -m "تحديث"
git push
```
Vercel سيعيد النشر تلقائياً خلال دقيقة.
