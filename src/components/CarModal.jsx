import { useState } from 'react'
import { Modal, Btn, Field, Select } from './UI'
import { FUEL_TYPES } from '../lib/constants'

const empty = { make: '', model: '', year: '', color: '', license_plate: '', vin: '', mileage_at_purchase: '', fuel_type: 'بنزين', notes: '' }

export default function CarModal({ open, onClose, onSave, car }) {
  const [form, setForm] = useState(car ? {
    make: car.make || '', model: car.model || '', year: car.year || '',
    color: car.color || '', license_plate: car.license_plate || '',
    vin: car.vin || '', mileage_at_purchase: car.mileage_at_purchase || '',
    fuel_type: car.fuel_type || 'بنزين', notes: car.notes || ''
  } : empty)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    if (!form.make.trim() || !form.model.trim()) { setError('الماركة والموديل مطلوبان'); return }
    setLoading(true); setError('')
    try {
      await onSave({ ...form, year: form.year ? parseInt(form.year) : null, mileage_at_purchase: parseInt(form.mileage_at_purchase) || 0 })
      onClose()
    } catch { setError('حدث خطأ، يرجى المحاولة مرة أخرى') }
    finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title={car ? 'تعديل السيارة' : 'إضافة سيارة جديدة'}
      footer={<><Btn variant="ghost" onClick={onClose}>إلغاء</Btn><Btn onClick={submit} loading={loading}>حفظ السيارة</Btn></>}
    >
      <form onSubmit={submit} className="p-6 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="الماركة" name="make" value={form.make} onChange={handle} placeholder="تويوتا" required />
          <Field label="الموديل" name="model" value={form.model} onChange={handle} placeholder="كامري" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="السنة" name="year" value={form.year} onChange={handle} placeholder="2022" type="number" />
          <Field label="اللون" name="color" value={form.color} onChange={handle} placeholder="أبيض" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="رقم اللوحة" name="license_plate" value={form.license_plate} onChange={handle} placeholder="أ ب ج 1234" />
          <Field label="رقم الهيكل (VIN)" name="vin" value={form.vin} onChange={handle} placeholder="اختياري" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="العداد عند الشراء (كم)" name="mileage_at_purchase" value={form.mileage_at_purchase} onChange={handle} placeholder="0" type="number" />
          <Select label="نوع الوقود" name="fuel_type" value={form.fuel_type} onChange={handle}
            options={FUEL_TYPES.map(f => ({ value: f.key, label: `${f.icon} ${f.key}` }))} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-l4 uppercase tracking-wider">ملاحظات</label>
          <textarea name="notes" value={form.notes} onChange={handle} rows={3}
            placeholder="أي ملاحظات عن السيارة..."
            className="w-full bg-bg3 border border-border rounded-xl px-4 py-3 text-base text-l1 placeholder-l4 focus:border-blue focus:ring-2 focus:ring-blue/20 transition-all outline-none resize-none" />
        </div>
        {error && <p className="text-red text-sm bg-[rgba(255,69,58,0.1)] rounded-xl py-2 px-3 text-center">{error}</p>}
      </form>
    </Modal>
  )
}
