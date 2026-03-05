import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Bell, BellOff, CheckCircle } from 'lucide-react'
import { Modal, Btn } from './UI'
import { saveUserEmail, updateNotificationSettings } from '../lib/supabase'

export default function EmailSubscribeModal({ open, onClose, user, onSaved }) {
  const [email,   setEmail]   = useState(user.email || '')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [done,    setDone]    = useState(false)

  const save = async () => {
    if (!email.trim() || !email.includes('@')) {
      setError('يرجى إدخال بريد إلكتروني صحيح')
      return
    }
    setLoading(true); setError('')
    try {
      const updated = await saveUserEmail(user.id, email.trim())
      onSaved(updated)
      setDone(true)
    } catch (err) {
      console.error(err)
      setError('حدث خطأ، يرجى المحاولة مرة أخرى')
    } finally { setLoading(false) }
  }

  const disable = async () => {
    setLoading(true)
    try {
      const updated = await updateNotificationSettings(user.id, false)
      onSaved(updated)
      onClose()
    } catch { } finally { setLoading(false) }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="🔔 تفعيل تذكير الصيانة"
      footer={
        done ? (
          <Btn fullWidth onClick={onClose}>رائع، شكراً!</Btn>
        ) : (
          <>
            <button onClick={disable} className="text-l4 text-sm hover:text-l3 transition-colors">
              لا أريد التذكيرات
            </button>
            <Btn onClick={save} loading={loading} className="gap-2">
              <Bell size={16} /> تفعيل التذكير
            </Btn>
          </>
        )
      }
    >
      <div className="p-6 flex flex-col gap-5">
        {done ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 py-8"
          >
            <div className="w-20 h-20 rounded-full bg-[rgba(48,209,88,0.15)] flex items-center justify-center">
              <CheckCircle size={40} className="text-green" />
            </div>
            <h3 className="text-xl font-bold text-l1">تم التفعيل ✅</h3>
            <p className="text-l3 text-center text-sm leading-relaxed">
              سيصلك إيميل تلقائياً قبل <span className="text-blue font-bold">30 يوم</span> من موعد كل صيانة
            </p>
          </motion.div>
        ) : (
          <>
            {/* Explanation card */}
            <div className="bg-[rgba(10,132,255,0.08)] border border-[rgba(10,132,255,0.2)] rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl mt-0.5">📧</div>
                <div>
                  <div className="text-l1 font-bold text-base mb-1">تذكير تلقائي مجاني</div>
                  <div className="text-l3 text-sm leading-relaxed">
                    سيصلك إيميل تلقائياً قبل <span className="text-blue font-bold">30 يوم</span> من موعد الصيانة القادمة لكل سيارة.
                    يمكنك إلغاؤه في أي وقت.
                  </div>
                </div>
              </div>
            </div>

            {/* Email input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-l4 uppercase tracking-wider">
                بريدك الإلكتروني
              </label>
              <div className="relative">
                <Mail size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-l4 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && save()}
                  placeholder="example@gmail.com"
                  className={`w-full bg-bg3 border rounded-xl pr-10 pl-4 py-3 text-base text-l1 placeholder-l4 focus:ring-2 focus:ring-blue/20 transition-all outline-none
                    ${error ? 'border-red' : 'border-border focus:border-blue'}`}
                />
              </div>
              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red text-sm">
                  {error}
                </motion.p>
              )}
            </div>

            <p className="text-l4 text-xs text-center">
              بريدك يُحفظ بأمان ولا يُشارك مع أحد
            </p>
          </>
        )}
      </div>
    </Modal>
  )
}
