import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, CheckCircle, Bell } from 'lucide-react'
import { Modal, Btn } from './UI'
import { daysUntil, fmtKm, fmtMoney } from '../lib/constants'
import emailjs from '@emailjs/browser'

// Fill these after signing up at emailjs.com (see EMAILJS_SETUP.md)
const EMAILJS_SERVICE_ID  = 'service_tj03owl'
const EMAILJS_TEMPLATE_ID = 'template_1dqm62b'
const EMAILJS_PUBLIC_KEY  = 'X72ftp86ZVDpYIETu'

export default function ReminderModal({ open, onClose, car, records, user }) {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')

  const latest  = records.find(r => r.next_service_date)
  const du      = daysUntil(latest?.next_service_date)
  const overdue = du !== null && du < 0
  const urgent  = du !== null && du >= 0 && du <= 7
  const duLabel = du === null ? 'غير محدد' : du < 0 ? `متأخرة منذ ${Math.abs(du)} يوم` : du === 0 ? 'اليوم!' : `خلال ${du} يوم`
  const statusEmoji = overdue ? '🔴' : urgent ? '🟡' : '🟢'
  const carName = `${car.year || ''} ${car.make} ${car.model}`.trim()

  const send = async () => {
    if (!email.trim() || !email.includes('@')) { setError('يرجى إدخال بريد إلكتروني صحيح'); return }
    setLoading(true); setError('')
    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        to_email:      email.trim(),
        to_name:       user.name,
        car_name:      carName,
        license_plate: car.license_plate || '—',
        service_title: latest?.title || 'صيانة دورية',
        next_date:     latest?.next_service_date || '—',
        next_km:       latest?.next_service_mileage ? fmtKm(latest.next_service_mileage) : '—',
        days_label:    duLabel,
        status_emoji:  statusEmoji,
        total_cost:    fmtMoney(records.reduce((s, r) => s + (r.cost || 0), 0)),
        service_count: String(records.length),
      }, EMAILJS_PUBLIC_KEY)
      setSent(true)
    } catch (err) {
      console.error(err)
      setError('فشل الإرسال. تحقق من إعدادات EmailJS.')
    } finally { setLoading(false) }
  }

  const reset = () => { setSent(false); setEmail(''); setError('') }

  return (
    <Modal open={open} onClose={() => { onClose(); reset() }}
      title="📧 تذكير بالبريد الإلكتروني"
      footer={sent
        ? <Btn variant="ghost" onClick={() => { onClose(); reset() }} fullWidth>إغلاق</Btn>
        : <><Btn variant="ghost" onClick={() => { onClose(); reset() }}>إلغاء</Btn><Btn onClick={send} loading={loading} className="gap-2"><Mail size={16}/>إرسال</Btn></>
      }
    >
      <div className="p-6 flex flex-col gap-5">
        {sent ? (
          <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} className="flex flex-col items-center gap-4 py-10">
            <div className="w-20 h-20 rounded-full bg-[rgba(48,209,88,0.15)] flex items-center justify-center">
              <CheckCircle size={40} className="text-green" />
            </div>
            <h3 className="text-xl font-bold text-l1">تم الإرسال ✅</h3>
            <p className="text-l3 text-center text-sm leading-relaxed">تم إرسال التذكير إلى<br/><span className="text-blue font-bold text-base">{email}</span></p>
          </motion.div>
        ) : (
          <>
            {latest ? (
              <div className={`rounded-2xl p-4 border ${overdue ? 'bg-[rgba(255,69,58,0.08)] border-[rgba(255,69,58,0.3)]' : urgent ? 'bg-[rgba(255,159,10,0.08)] border-[rgba(255,159,10,0.3)]' : 'bg-[rgba(48,209,88,0.08)] border-[rgba(48,209,88,0.3)]'}`}>
                <div className="text-xs text-l4 font-bold uppercase tracking-wider mb-2">الصيانة القادمة · {carName}</div>
                <div className="text-l1 font-bold">{latest.title}</div>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="text-l3 text-sm">📅 {latest.next_service_date}</span>
                  <span className="font-bold text-sm" style={{ color: overdue ? '#FF453A' : urgent ? '#FF9F0A' : '#30D158' }}>
                    {statusEmoji} {duLabel}
                  </span>
                </div>
                {latest.next_service_mileage && <div className="text-l4 text-xs mt-1">أو عند: {fmtKm(latest.next_service_mileage)}</div>}
              </div>
            ) : (
              <div className="bg-bg3 rounded-2xl p-4 text-center">
                <Bell size={24} className="text-l4 mx-auto mb-2"/>
                <p className="text-l3 text-sm">لا يوجد موعد صيانة قادم مسجّل</p>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-l4 uppercase tracking-wider">أرسل التذكير إلى</label>
              <div className="relative">
                <Mail size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-l4 pointer-events-none"/>
                <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && send()} placeholder="example@gmail.com"
                  className={`w-full bg-bg3 border rounded-xl pr-10 pl-4 py-3 text-base text-l1 placeholder-l4 focus:ring-2 focus:ring-blue/20 transition-all outline-none ${error ? 'border-red' : 'border-border focus:border-blue'}`}
                />
              </div>
              {error && <motion.p initial={{opacity:0}} animate={{opacity:1}} className="text-red text-sm">{error}</motion.p>}
            </div>
            <p className="text-l4 text-xs text-center leading-relaxed">
              سيصل إيميل يحتوي على تفاصيل السيارة وموعد الصيانة القادمة
            </p>
          </>
        )}
      </div>
    </Modal>
  )
}
