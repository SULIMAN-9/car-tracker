# إعداد خدمة الإيميل المجانية (EmailJS)

## ما هو EmailJS؟
خدمة مجانية تتيح إرسال إيميلات مباشرة من موقعك بدون سيرفر.
- مجاني تماماً: 200 إيميل / شهر
- لا يحتاج بطاقة بنكية
- يصل للإيميل خلال ثوانٍ

---

## الخطوات (10 دقائق فقط)

### 1 — إنشاء حساب
1. افتح **emailjs.com**
2. اضغط **Sign Up Free**
3. سجّل بأي إيميل

### 2 — ربط إيميلك (Gmail مثلاً)
1. من القائمة اضغط **Email Services**
2. اضغط **Add New Service**
3. اختر **Gmail**
4. اضغط **Connect Account** وسجّل بحساب Gmail
5. اضغط **Create Service**
6. **انسخ الـ Service ID** — يبدو هكذا: `service_xxxxxxx`

### 3 — إنشاء قالب الإيميل
1. من القائمة اضغط **Email Templates**
2. اضغط **Create New Template**
3. في حقل **To Email** اكتب: `{{to_email}}`
4. في حقل **Subject** اكتب:
   ```
   {{status_emoji}} تذكير صيانة: {{car_name}}
   ```
5. في **Content** (HTML) الصق هذا:

```html
<div dir="rtl" style="font-family:Arial,sans-serif;max-width:500px;margin:auto;background:#1C1C1E;color:#fff;border-radius:16px;overflow:hidden;">
  <div style="background:#0A84FF;padding:24px;text-align:center;">
    <h1 style="margin:0;font-size:24px;">🚗 تذكير صيانة السيارة</h1>
  </div>
  <div style="padding:24px;">
    <p style="font-size:16px;">مرحباً {{to_name}}،</p>
    <div style="background:#2C2C2E;border-radius:12px;padding:16px;margin:16px 0;">
      <b>السيارة:</b> {{car_name}}<br/>
      <b>اللوحة:</b> {{license_plate}}
    </div>
    <div style="background:#2C2C2E;border-radius:12px;padding:16px;margin:16px 0;">
      <b>الصيانة:</b> {{service_title}}<br/>
      <b>الموعد:</b> {{next_date}}<br/>
      <b>الحالة:</b> {{status_emoji}} {{days_label}}
    </div>
    <div style="background:#2C2C2E;border-radius:12px;padding:16px;margin:16px 0;">
      <b>إجمالي المصروف:</b> {{total_cost}}<br/>
      <b>عدد الخدمات:</b> {{service_count}}
    </div>
    <p style="color:#888;font-size:12px;text-align:center;margin-top:24px;">
      🇸🇦 صُنع في المملكة العربية السعودية · SYS
    </p>
  </div>
</div>
```

6. اضغط **Save**
7. **انسخ الـ Template ID** — يبدو هكذا: `template_xxxxxxx`

### 4 — الحصول على Public Key
1. من القائمة اضغط **Account**
2. انظر قسم **API Keys**
3. **انسخ الـ Public Key** — يبدو هكذا: `xxxxxxxxxxxxxxx`

---

## إضافة المفاتيح للكود

افتح هذا الملف:
```
car-tracker/src/components/ReminderModal.jsx
```

في أول السطور ابحث عن هذا:
```js
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID'
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID'
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY'
```

واستبدل بمفاتيحك:
```js
const EMAILJS_SERVICE_ID  = 'service_xxxxxxx'
const EMAILJS_TEMPLATE_ID = 'template_xxxxxxx'
const EMAILJS_PUBLIC_KEY  = 'xxxxxxxxxxxxxxx'
```

---

## رفع التحديث

```
cd C:\Users\sloom\Desktop\car-tracker
git add .
git commit -m "add email reminders"
git push
```

---

## بعدها

في الموقع، افتح أي سيارة ← ستجد زر 🔔 في الأعلى ← اضغطه ← أدخل إيميل ← إرسال ✅
