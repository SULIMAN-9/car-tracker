import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Upload, X, Image } from 'lucide-react'
import { Modal, Btn, Chip } from '../components/UI'
import { CATEGORIES, STATUSES, today } from '../lib/constants'
import { supabase } from '../lib/supabase'

const emptyPart = { part_name: '', part_number: '', brand: '', quantity: 1, unit_price: 0, supplier: '', warranty_months: 0 }
const emptyForm = { title: '', category: 'تغيير الزيت', date: today(), mileage: '', cost: '', shop_name: '', shop_address: '', technician: '', description: '', next_service_date: '', next_service_mileage: '', status: 'مكتملة', notes: '' }

function LabeledInput({ label, name, value, onChange, placeholder, type = 'text', min }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold text-l4 uppercase tracking-wider">{label}</label>
      <input name={name} value={value ?? ''} onChange={onChange} placeholder={placeholder} type={type} min={min}
        className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-l1 placeholder-l4 focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none transition-all" />
    </div>
  )
}

export default function MaintenanceModal({ open, onClose, onSave, record }) {
  const [tab, setTab] = useState('details')
  const [form, setForm] = useState(emptyForm)
  const [parts, setParts] = useState([])
  const [photos, setPhotos] = useState([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  // FIX #1 — reset form every time modal opens with a record
  useEffect(() => {
    if (!open) return
    setTab('details')
    setError('')
    if (record) {
      setForm({
        title:                record.title                || '',
        category:             record.category             || 'تغيير الزيت',
        date:                 record.date                 || today(),
        mileage:              record.mileage              ?? '',
        cost:                 record.cost                 ?? '',
        shop_name:            record.shop_name            || '',
        shop_address:         record.shop_address         || '',
        technician:           record.technician           || '',
        description:          record.description          || '',
        next_service_date:    record.next_service_date    || '',
        next_service_mileage: record.next_service_mileage ?? '',
        status:               record.status               || 'مكتملة',
        notes:                record.notes                || '',
      })
      setParts(record.spare_parts?.map(p => ({ ...p })) || [])
      setPhotos(record.photos?.map(p => ({ url: p.url, path: p.path, caption: p.caption || '' })) || [])
    } else {
      setForm(emptyForm)
      setParts([])
      setPhotos([])
    }
  }, [open, record])

  const handle     = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  const handlePart = (i, e) => setParts(ps => ps.map((p, idx) => idx === i ? { ...p, [e.target.name]: e.target.value } : p))
  const addPart    = () => setParts(ps => [...ps, { ...emptyPart }])
  const removePart = i  => setParts(ps => ps.filter((_, idx) => idx !== i))
  const partsTotal = parts.reduce((s, p) => s + (parseFloat(p.unit_price) || 0) * (parseInt(p.quantity) || 1), 0)

  // Accepts images + PDFs + HEIC (iPhone) + common formats
  const ALLOWED_TYPES = [
    'image/jpeg','image/jpg','image/png','image/gif','image/webp',
    'image/heic','image/heif','image/bmp','image/tiff','image/svg+xml',
    'application/pdf'
  ]

  const getMimeType = (file) => {
    // If browser gave us a type, use it
    if (file.type && file.type !== 'application/octet-stream') return file.type
    // Fallback: guess from extension
    const ext = file.name.split('.').pop().toLowerCase()
    const map = {
      jpg:'image/jpeg', jpeg:'image/jpeg', png:'image/png',
      gif:'image/gif',  webp:'image/webp', heic:'image/heic',
      heif:'image/heif',bmp:'image/bmp',   tiff:'image/tiff',
      tif:'image/tiff', svg:'image/svg+xml',pdf:'application/pdf'
    }
    return map[ext] || 'application/octet-stream'
  }

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setError('')
    setUploading(true)
    let uploadedCount = 0
    try {
      for (const file of files) {
        const mimeType = getMimeType(file)
        // Check size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          setError(`الملف ${file.name} كبير جداً (الحد الأقصى 10 ميغا)`)
          continue
        }
        const ext  = file.name.split('.').pop().toLowerCase() || 'jpg'
        const path = `photos/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
        const { data: upData, error: upErr } = await supabase.storage
          .from('maintenance-photos')
          .upload(path, file, {
            contentType: mimeType,
            cacheControl: '3600',
            upsert: false,
          })
        if (upErr) {
          console.error('Upload error:', upErr)
          setError(`فشل رفع ${file.name}: ${upErr.message}`)
          continue
        }
        const { data: urlData } = supabase.storage
          .from('maintenance-photos')
          .getPublicUrl(path)
        setPhotos(ps => [...ps, { url: urlData.publicUrl, path, caption: '' }])
        uploadedCount++
      }
    } catch (err) {
      console.error('Unexpected upload error:', err)
      setError('حدث خطأ غير متوقع أثناء الرفع')
    } finally {
      setUploading(false)
      // Reset input so same file can be re-selected
      e.target.value = ''
    }
  }

  const removePhoto    = async (idx) => {
    const photo = photos[idx]
    if (photo.path) await supabase.storage.from('maintenance-photos').remove([photo.path])
    setPhotos(ps => ps.filter((_, i) => i !== idx))
  }
  const updateCaption  = (idx, val) => setPhotos(ps => ps.map((p, i) => i === idx ? { ...p, caption: val } : p))

  const submit = async () => {
    if (!form.title.trim()) { setError('عنوان الصيانة مطلوب'); setTab('details'); return }
    setLoading(true); setError('')
    try {
      await onSave({
        ...form,
        mileage:              parseInt(form.mileage)              || 0,
        cost:                 parseFloat(form.cost)               || 0,
        next_service_mileage: parseInt(form.next_service_mileage) || null,
        spare_parts: parts.filter(p => p.part_name.trim()).map(p => ({
          ...p, quantity: parseInt(p.quantity) || 1, unit_price: parseFloat(p.unit_price) || 0, warranty_months: parseInt(p.warranty_months) || 0,
        })),
        photos: photos.map(p => ({ url: p.url, path: p.path, caption: p.caption })),
      })
      onClose()
    } catch (err) { console.error(err); setError('حدث خطأ، يرجى المحاولة مرة أخرى') }
    finally { setLoading(false) }
  }

  const tabs = [
    { key: 'details', label: 'التفاصيل' },
    { key: 'parts',   label: `قطع الغيار (${parts.length})` },
    { key: 'photos',  label: `الصور (${photos.length})` },
  ]

  const inputCls = "w-full bg-bg3 border border-border rounded-xl px-4 py-3 text-base text-l1 placeholder-l4 focus:border-blue focus:ring-2 focus:ring-blue/20 transition-all outline-none"

  return (
    <Modal open={open} onClose={onClose} wide
      title={record ? 'تعديل الصيانة' : 'إضافة صيانة جديدة'}
      footer={<><Btn variant="ghost" onClick={onClose}>إلغاء</Btn>{error && <span className="text-red text-sm flex-1 text-center">{error}</span>}<Btn onClick={submit} loading={loading}>حفظ السجل</Btn></>}
    >
      <div className="flex gap-1 p-4 pb-0 border-b border-border overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t.key ? 'bg-blue text-white' : 'text-l3 hover:text-l1 hover:bg-bg3'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {tab === 'details' && (
          <motion.div key="details" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="p-6 flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-l4 uppercase tracking-wider">عنوان الصيانة *</label>
              <input name="title" value={form.title} onChange={handle} placeholder="مثال: تغيير زيت المحرك 5W-30" className={inputCls} />
            </div>

            <div>
              <label className="text-xs font-bold text-l4 uppercase tracking-wider block mb-3">الفئة</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <Chip key={cat.key} label={`${cat.icon} ${cat.key}`} selected={form.category === cat.key}
                    color={cat.color} bg={cat.bg} onClick={() => setForm(p => ({ ...p, category: cat.key }))} />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[['التاريخ','date','date',''],['العداد (كم)','mileage','number','45000'],['التكلفة (ريال)','cost','number','0.00']].map(([lbl,name,type,ph]) => (
                <div key={name} className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-l4 uppercase tracking-wider">{lbl}</label>
                  <input name={name} value={form[name]} onChange={handle} type={type} placeholder={ph} className={inputCls} />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[['الورشة / الكراج','shop_name','ورشة الفارس'],['اسم الفني','technician','الاسم']].map(([lbl,name,ph]) => (
                <div key={name} className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-l4 uppercase tracking-wider">{lbl}</label>
                  <input name={name} value={form[name]} onChange={handle} placeholder={ph} className={inputCls} />
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-l4 uppercase tracking-wider">عنوان الورشة</label>
              <input name="shop_address" value={form.shop_address} onChange={handle} placeholder="الرياض، طريق الملك فهد" className={inputCls} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[['تاريخ الصيانة القادمة','next_service_date','date',''],['عداد الصيانة القادمة (كم)','next_service_mileage','number','50000']].map(([lbl,name,type,ph]) => (
                <div key={name} className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-l4 uppercase tracking-wider">{lbl}</label>
                  <input name={name} value={form[name]} onChange={handle} type={type} placeholder={ph} className={inputCls} />
                </div>
              ))}
            </div>

            <div>
              <label className="text-xs font-bold text-l4 uppercase tracking-wider block mb-3">الحالة</label>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map(s => (
                  <Chip key={s.key} label={s.key} selected={form.status === s.key}
                    color={s.color} bg={s.bg} onClick={() => setForm(p => ({ ...p, status: s.key }))} />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-l4 uppercase tracking-wider">وصف العمل المنجز</label>
              <textarea name="description" value={form.description} onChange={handle} rows={3}
                placeholder="صف العمل المنجز وقطع الغيار المستبدلة والملاحظات..."
                className="w-full bg-bg3 border border-border rounded-xl px-4 py-3 text-base text-l1 placeholder-l4 focus:border-blue focus:ring-2 focus:ring-blue/20 transition-all outline-none resize-none" />
            </div>
          </motion.div>
        )}

        {tab === 'parts' && (
          <motion.div key="parts" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-l3 text-sm">أضف قطع الغيار المستخدمة في هذه الصيانة</p>
              <Btn variant="tinted" onClick={addPart} className="gap-1.5 text-sm px-4 py-2"><Plus size={15} /> إضافة قطعة</Btn>
            </div>

            {parts.length === 0 && (
              <div className="text-center py-12 text-l4"><div className="text-4xl mb-3">⚙️</div><p>لا توجد قطع غيار بعد</p></div>
            )}

            <AnimatePresence>
              {parts.map((part, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-bg3 rounded-2xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-l2">قطعة {i + 1}</span>
                    <button onClick={() => removePart(i)} className="text-red hover:bg-[rgba(255,69,58,0.1)] p-1.5 rounded-lg transition-all"><Trash2 size={15} /></button>
                  </div>

                  {/* FIX #2 — all 6 fields now have clear Arabic labels */}
                  <LabeledInput label="اسم القطعة *"        name="part_name"       value={part.part_name}       onChange={e => handlePart(i,e)} placeholder="مثال: فلتر الزيت" />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <LabeledInput label="رقم القطعة"         name="part_number"     value={part.part_number}     onChange={e => handlePart(i,e)} placeholder="OEM-12345" />
                    <LabeledInput label="الماركة / الشركة"   name="brand"           value={part.brand}           onChange={e => handlePart(i,e)} placeholder="بوش، NGK..." />
                    <LabeledInput label="المورد / المتجر"    name="supplier"        value={part.supplier}        onChange={e => handlePart(i,e)} placeholder="عبدالعزيز للسيارات" />
                    <LabeledInput label="الكمية"             name="quantity"        value={part.quantity}        onChange={e => handlePart(i,e)} placeholder="1"    type="number" min="1" />
                    <LabeledInput label="سعر الوحدة (ريال)"  name="unit_price"      value={part.unit_price}      onChange={e => handlePart(i,e)} placeholder="0.00" type="number" />
                    <LabeledInput label="الضمان (أشهر)"      name="warranty_months" value={part.warranty_months} onChange={e => handlePart(i,e)} placeholder="0"    type="number" />
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-border">
                    <span className="text-xs text-l4">إجمالي هذه القطعة</span>
                    <span className="text-blue font-bold text-sm">{((parseFloat(part.unit_price)||0)*(parseInt(part.quantity)||1)).toLocaleString('ar-SA')} ر.س</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {parts.length > 0 && (
              <div className="bg-[rgba(10,132,255,0.08)] border border-[rgba(10,132,255,0.2)] rounded-2xl p-4 flex justify-between items-center">
                <span className="text-l2 font-semibold">إجمالي قطع الغيار</span>
                <span className="text-blue text-xl font-bold">{partsTotal.toLocaleString('ar-SA')} ر.س</span>
              </div>
            )}
          </motion.div>
        )}

        {/* FIX #3 — Photos tab with Supabase Storage */}
        {tab === 'photos' && (
          <motion.div key="photos" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="p-6 flex flex-col gap-4">
            {/* Hidden file input — triggered by button click */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,image/heic,image/heif,.heic,.heif,.jpg,.jpeg,.png,.gif,.webp,.bmp,.tiff,.pdf"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
            />

            {/* Upload zone — click triggers the hidden input */}
            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-2xl p-8 transition-all
                ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue hover:bg-[rgba(10,132,255,0.05)]'}`}
            >
              {uploading
                ? <><div className="w-6 h-6 border-2 border-blue border-t-transparent rounded-full animate-spin" /><span className="text-l3 text-sm mt-2">جاري الرفع...</span></>
                : <>
                    <Upload size={28} className="text-blue" />
                    <span className="text-l1 font-bold text-base">اضغط هنا لرفع الصور</span>
                    <span className="text-l4 text-xs text-center">JPG · PNG · HEIC · WebP · PDF · وغيرها<br/>الحد الأقصى 10 ميغا للملف</span>
                  </>
              }
            </div>

            {photos.length === 0 && !uploading && (
              <div className="text-center py-6 text-l4"><Image size={36} className="mx-auto mb-3 opacity-30" /><p className="text-sm">لا توجد صور بعد</p></div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <AnimatePresence>
                {photos.map((photo, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative bg-bg3 rounded-2xl overflow-hidden">
                    <img src={photo.url} alt="" className="w-full h-28 object-cover" />
                    <button onClick={() => removePhoto(idx)} className="absolute top-2 left-2 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-red transition-all"><X size={12} /></button>
                    <div className="p-2">
                      <input value={photo.caption} onChange={e => updateCaption(idx, e.target.value)} placeholder="وصف الصورة..."
                        className="w-full bg-bg border border-border rounded-lg px-2 py-1.5 text-xs text-l1 placeholder-l4 focus:border-blue outline-none transition-all" />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </Modal>
  )
}
