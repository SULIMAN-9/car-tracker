import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2 } from 'lucide-react'
import { Modal, Btn, Field, Select, Chip } from '../components/UI'
import { CATEGORIES, STATUSES, today } from '../lib/constants'

const emptyPart = { part_name: '', part_number: '', brand: '', quantity: 1, unit_price: 0, supplier: '', warranty_months: 0 }
const emptyForm = {
  title: '', category: 'تغيير الزيت', date: today(), mileage: '', cost: '',
  shop_name: '', shop_address: '', technician: '', description: '',
  next_service_date: '', next_service_mileage: '', status: 'مكتملة', notes: ''
}

export default function MaintenanceModal({ open, onClose, onSave, record }) {
  const [tab, setTab] = useState('details')
  const [form, setForm] = useState(record ? {
    title: record.title || '', category: record.category || 'تغيير الزيت',
    date: record.date || today(), mileage: record.mileage || '',
    cost: record.cost || '', shop_name: record.shop_name || '',
    shop_address: record.shop_address || '', technician: record.technician || '',
    description: record.description || '', next_service_date: record.next_service_date || '',
    next_service_mileage: record.next_service_mileage || '',
    status: record.status || 'مكتملة', notes: record.notes || ''
  } : emptyForm)
  const [parts, setParts] = useState(record?.spare_parts || [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  const handlePart = (i, e) => setParts(ps => ps.map((p, idx) => idx === i ? { ...p, [e.target.name]: e.target.value } : p))
  const addPart = () => setParts(ps => [...ps, { ...emptyPart }])
  const removePart = i => setParts(ps => ps.filter((_, idx) => idx !== i))

  const partsTotal = parts.reduce((s, p) => s + (parseFloat(p.unit_price) || 0) * (parseInt(p.quantity) || 1), 0)

  const submit = async () => {
    if (!form.title.trim()) { setError('عنوان الصيانة مطلوب'); setTab('details'); return }
    setLoading(true); setError('')
    try {
      await onSave({
        ...form,
        mileage: parseInt(form.mileage) || 0,
        cost: parseFloat(form.cost) || 0,
        next_service_mileage: parseInt(form.next_service_mileage) || null,
        spare_parts: parts.filter(p => p.part_name.trim()).map(p => ({
          ...p, quantity: parseInt(p.quantity) || 1, unit_price: parseFloat(p.unit_price) || 0,
          warranty_months: parseInt(p.warranty_months) || 0
        }))
      })
      onClose()
    } catch { setError('حدث خطأ، يرجى المحاولة مرة أخرى') }
    finally { setLoading(false) }
  }

  const tabs = [{ key: 'details', label: 'التفاصيل' }, { key: 'parts', label: `قطع الغيار (${parts.length})` }]

  return (
    <Modal open={open} onClose={onClose} wide
      title={record ? 'تعديل الصيانة' : 'إضافة صيانة جديدة'}
      footer={
        <>
          <Btn variant="ghost" onClick={onClose}>إلغاء</Btn>
          {error && <span className="text-red text-sm">{error}</span>}
          <Btn onClick={submit} loading={loading}>حفظ السجل</Btn>
        </>
      }
    >
      {/* Tab bar */}
      <div className="flex gap-1 p-4 pb-0 border-b border-border">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t.key ? 'bg-blue text-white' : 'text-l3 hover:text-l1 hover:bg-bg3'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'details' && (
          <motion.div key="details"
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="p-6 flex flex-col gap-5"
          >
            <Field label="عنوان الصيانة" name="title" value={form.title} onChange={handle}
              placeholder="مثال: تغيير زيت المحرك 5W-30" required />

            {/* Category */}
            <div>
              <label className="text-xs font-bold text-l4 uppercase tracking-wider block mb-3">الفئة</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <Chip key={cat.key} label={`${cat.icon} ${cat.key}`}
                    selected={form.category === cat.key}
                    color={cat.color} bg={cat.bg}
                    onClick={() => setForm(p => ({ ...p, category: cat.key }))} />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="التاريخ" name="date" value={form.date} onChange={handle} type="date" />
              <Field label="العداد (كم)" name="mileage" value={form.mileage} onChange={handle} placeholder="45000" type="number" />
              <Field label="التكلفة (ريال)" name="cost" value={form.cost} onChange={handle} placeholder="0.00" type="number" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="الورشة / الكراج" name="shop_name" value={form.shop_name} onChange={handle} placeholder="ورشة الفارس" />
              <Field label="الفني" name="technician" value={form.technician} onChange={handle} placeholder="الاسم" />
            </div>

            <Field label="عنوان الورشة" name="shop_address" value={form.shop_address} onChange={handle} placeholder="الرياض، طريق الملك فهد" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="تاريخ الصيانة القادمة" name="next_service_date" value={form.next_service_date} onChange={handle} type="date" />
              <Field label="عداد الصيانة القادمة (كم)" name="next_service_mileage" value={form.next_service_mileage} onChange={handle} placeholder="50000" type="number" />
            </div>

            {/* Status */}
            <div>
              <label className="text-xs font-bold text-l4 uppercase tracking-wider block mb-3">الحالة</label>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map(s => (
                  <Chip key={s.key} label={s.key}
                    selected={form.status === s.key}
                    color={s.color} bg={s.bg}
                    onClick={() => setForm(p => ({ ...p, status: s.key }))} />
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
          <motion.div key="parts"
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="p-6 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-l3 text-sm">أضف قطع الغيار المستخدمة في هذه الصيانة</p>
              <Btn variant="tinted" onClick={addPart} className="gap-1.5 text-sm px-4 py-2">
                <Plus size={15} /> إضافة قطعة
              </Btn>
            </div>

            {parts.length === 0 && (
              <div className="text-center py-12 text-l4">
                <div className="text-4xl mb-3">⚙️</div>
                <p>لا توجد قطع غيار بعد</p>
              </div>
            )}

            <AnimatePresence>
              {parts.map((part, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="bg-bg3 rounded-2xl p-4 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-l2">قطعة {i + 1}</span>
                    <button onClick={() => removePart(i)} className="text-red hover:bg-[rgba(255,69,58,0.1)] p-1.5 rounded-lg transition-all">
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div className="col-span-2 sm:col-span-3">
                      <input name="part_name" value={part.part_name} onChange={e => handlePart(i, e)}
                        placeholder="اسم القطعة"
                        className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-l1 placeholder-l4 focus:border-blue outline-none transition-all" />
                    </div>
                    {[
                      { name: 'part_number', placeholder: 'رقم القطعة' },
                      { name: 'brand',       placeholder: 'الماركة' },
                      { name: 'supplier',    placeholder: 'المورد' },
                    ].map(f => (
                      <input key={f.name} name={f.name} value={part[f.name]} onChange={e => handlePart(i, e)}
                        placeholder={f.placeholder}
                        className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-l1 placeholder-l4 focus:border-blue outline-none transition-all" />
                    ))}
                    <input name="quantity" value={part.quantity} onChange={e => handlePart(i, e)}
                      placeholder="الكمية" type="number" min="1"
                      className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-l1 placeholder-l4 focus:border-blue outline-none transition-all" />
                    <input name="unit_price" value={part.unit_price} onChange={e => handlePart(i, e)}
                      placeholder="السعر (ريال)" type="number"
                      className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-l1 placeholder-l4 focus:border-blue outline-none transition-all" />
                    <input name="warranty_months" value={part.warranty_months} onChange={e => handlePart(i, e)}
                      placeholder="ضمان (أشهر)" type="number"
                      className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-l1 placeholder-l4 focus:border-blue outline-none transition-all" />
                  </div>
                  <div className="text-left text-sm text-l3">
                    الإجمالي: <span className="text-blue font-bold">
                      {((parseFloat(part.unit_price) || 0) * (parseInt(part.quantity) || 1)).toLocaleString('ar-SA')} ر.س
                    </span>
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
      </AnimatePresence>
    </Modal>
  )
}
