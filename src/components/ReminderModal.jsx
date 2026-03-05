import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, CheckCircle, Bell, BellOff } from 'lucide-react'
import { Modal, Btn } from './UI'
import { daysUntil, fmtKm, fmtMoney } from '../lib/constants'
import { updateNotificationSettings } from '../lib/supabase'
import emailjs from '@emailjs/browser'

const EMAILJS_SERVICE_ID  = 'service_tj03owl'
const EMAILJS_TEMPLATE_ID = 'template_1dqm62b'
const EMAILJS_PUBLIC_KEY  = 'X72ftp86ZVDpYIETu'

// Called by the app automatically — not by user
export async function sendMaintenanceReminder({ user, car, records }) {
  const latest  = records.find(r => r.next_service_date)
  if (!latest || !user.email) return false

  const du = daysUntil(latest.next_service_date)
  if (du === null || du > 30 || du < -7) return false  // only send if within 30 days or slightly overdue

  // Don't send more than once per month
  if (user.last_notified_at) {
    const lastSent = new Date(user.last_notified_at)
    const daysSince = Math.floor((new Date() - lastSent) / 86400000)
    if (daysSince < 25) return false
  }

  const carName     = `${car.year || ''} ${car.make} ${car.model}`.trim()
  const overdue     = du < 0
  const urgent      = du >= 0 && du <= 7
  const statusEmoji = overdue ? '🔴' : urgent ? '🟡' : '🟢'
  const duLabel     = du < 0 ? `متأخرة منذ ${Math.abs(du)} يوم` : du === 0 ? 'اليوم!' : `خلال ${du} يوم`

  await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
    to_email:      user.email,
    to_name:       user.name,
    car_name:      carName,
    license_plate: car.license_plate || '—',
    service_title: latest.title || 'صيانة دورية',
    next_date:     latest.next_service_date,
    next_km:       latest.next_service_mileage ? fmtKm(latest.next_service_mileage) : '—',
    days_label:    duLabel,
    status_emoji:  statusEmoji,
    total_cost:         fmtMoney(records.reduce((s, r) => s + (r.cost || 0), 0)),
    service_count:      String(records.length),
    last_service_title: records[0]?.title     || '—',
    last_service_date:  records[0]?.date      || '—',
    shop_name:          records[0]?.shop_name || '—',
  }, EMAILJS_PUBLIC_KEY)

  return true
}

// Manual reminder modal — for the bell button
export default function ReminderModal({ open, onClose, car, records, user, onNotificationsChanged }) {
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')

  const latest      = records.find(r => r.next_service_date)
  const du          = daysUntil(latest?.next_service_date)
  const overdue     = du !== null && du < 0
  const urgent      = du !== null && du >= 0 && du <= 7
  const duLabel     = du === null ? 'غير محدد' : du < 0 ? `متأخرة منذ ${Math.abs(du)} يوم` : du === 0 ? 'اليوم!' : `خلال ${du} يوم`
  const statusEmoji = overdue ? '🔴' : urgent ? '🟡' : '🟢'
  const carName     = `${car.year || ''} ${car.make} ${car.model}`.trim()

  const sendNow = async () => {
    if (!user.email) { setError('لا يوجد بريد إلكتروني محفوظ'); return }
    setLoading(true); setError('')
    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        to_email:           user.email,
        to_name:            user.name,
        car_name:           carName,
        license_plate:      car.license_plate || '—',
        service_title:      latest?.title || 'صيانة دورية',
        next_date:          latest?.next_service_date || '—',
        next_km:            latest?.next_service_mileage ? fmtKm(latest.next_service_mileage) : '—',
        days_label:         duLabel,
        status_emoji:       statusEmoji,
        total_cost:         fmtMoney(records.reduce((s, r) => s + (r.cost || 0), 0)),
        service_count:      String(records.length),
        last_service_title: records[0]?.title || '—',
        last_service_date:  records[0]?.date  || '—',
        shop_name:          records[0]?.shop_name || '—',
      }, EMAILJS_PUBLIC_KEY)
      setSent(true)
    } catch (err) {
      console.error(err)
      setError('فشل الإرسال. تحقق من اتصالك بالإنترنت.')
    } finally { setLoading(false) }
  }

  const toggleNotifications = async () => {
    setLoading(true)
    try {
      const updated = await updateNotificationSettings(user.id, !user.notifications_enabled)
      onNotificationsChanged(updated)
      onClose()
    } catch { } finally { setLoading(false) }
  }

  const reset = () => { setSent(false); setError('') }

  return (
    <Modal open={open} onClose={() => { onClose(); reset() }}
      title="🔔 إعدادات التذكير"
      footer={
        sent
          ? <Btn fullWidth onClick={() => { onClose(); reset() }}>إغلاق</Btn>
          : <>
              <button onClick={toggleNotifications} disabled={loading}
                className={`flex items-center gap-2 text-sm font-semibold transition-colors ${user.notifications_enabled ? 'text-red hover:text-red/80' : 'text-green hover:text-green/80'}`}>
                {user.notifications_enabled
                  ? <><BellOff size={15}/> إيقاف التذكيرات</>
                  : <><Bell size={15}/> تفعيل التذكيرات</>}
              </button>
              <Btn onClick={sendNow} loading={loading} className="gap-2">
                <Mail size={16}/> إرسال الآن
              </Btn>
            </>
      }
    >
      <div className="p-6 flex flex-col gap-5">
        {sent ? (
          <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
            className="flex flex-col items-center gap-4 py-10">
            <div className="w-20 h-20 rounded-full bg-[rgba(48,209,88,0.15)] flex items-center justify-center">
              <CheckCircle size={40} className="text-green"/>
            </div>
            <h3 className="text-xl font-bold text-l1">تم الإرسال ✅</h3>
            <p className="text-l3 text-center text-sm">أُرسل التذكير إلى<br/>
              <span className="text-blue font-bold text-base">{user.email}</span>
            </p>
          </motion.div>
        ) : (
          <>
            {/* Notification status */}
            <div className={`rounded-2xl p-4 border flex items-center gap-3 ${user.notifications_enabled ? 'bg-[rgba(48,209,88,0.08)] border-[rgba(48,209,88,0.25)]' : 'bg-bg3 border-border'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${user.notifications_enabled ? 'bg-[rgba(48,209,88,0.15)]' : 'bg-bg'}`}>
                {user.notifications_enabled ? <Bell size={18} className="text-green"/> : <BellOff size={18} className="text-l4"/>}
              </div>
              <div>
                <div className={`font-bold text-sm ${user.notifications_enabled ? 'text-green' : 'text-l3'}`}>
                  {user.notifications_enabled ? 'التذكيرات مفعّلة ✅' : 'التذكيرات متوقفة'}
                </div>
                <div className="text-l4 text-xs mt-0.5">
                  {user.email || 'لا يوجد بريد إلكتروني محفوظ'}
                </div>
              </div>
            </div>

            {/* Next service */}
            {latest && (
              <div className={`rounded-2xl p-4 border ${overdue ? 'bg-[rgba(255,69,58,0.08)] border-[rgba(255,69,58,0.3)]' : urgent ? 'bg-[rgba(255,159,10,0.08)] border-[rgba(255,159,10,0.3)]' : 'bg-[rgba(48,209,88,0.08)] border-[rgba(48,209,88,0.3)]'}`}>
                <div className="text-xs text-l4 font-bold uppercase tracking-wider mb-1">الصيانة القادمة · {carName}</div>
                <div className="text-l1 font-bold">{latest.title}</div>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="text-l3 text-sm">📅 {latest.next_service_date}</span>
                  <span className="font-bold text-sm" style={{ color: overdue ? '#FF453A' : urgent ? '#FF9F0A' : '#30D158' }}>
                    {statusEmoji} {duLabel}
                  </span>
                </div>
              </div>
            )}

            {error && (
              <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} className="text-red text-sm text-center">
                {error}
              </motion.p>
            )}

            <p className="text-l4 text-xs text-center leading-relaxed">
              التذكير التلقائي يُرسل قبل <span className="text-blue font-semibold">30 يوم</span> من موعد الصيانة القادمة
            </p>
          </>
        )}
      </div>
    </Modal>
  )
}
