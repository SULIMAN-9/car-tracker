import { useState } from 'react'
import { motion } from 'framer-motion'
import { Car, Phone, User } from 'lucide-react'
import { getOrCreateUser } from '../lib/supabase'
import { Btn, Field } from '../components/UI'

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ name: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) { setError('يرجى إدخال الاسم ورقم الجوال'); return }
    if (form.phone.replace(/\D/g, '').length < 9) { setError('رقم الجوال غير صحيح'); return }
    setLoading(true); setError('')
    try {
      const user = await getOrCreateUser(form.name.trim(), form.phone.trim())
      localStorage.setItem('ct_user', JSON.stringify(user))
      onLogin(user)
    } catch (err) {
      setError('حدث خطأ، يرجى المحاولة مرة أخرى')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-dvh gradient-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">

      {/* Ambient glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #0A84FF 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #BF5AF2 0%, transparent 70%)', filter: 'blur(80px)' }} />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm relative"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="w-20 h-20 rounded-3xl bg-blue flex items-center justify-center text-4xl mb-4 shadow-lg shadow-blue/30">
            🚗
          </div>
          <h1 className="text-3xl font-bold text-l1">متتبع الصيانة</h1>
          <p className="text-l3 text-base mt-1">سجّل كل صيانة لسيارتك بسهولة</p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="glass rounded-3xl p-6 shadow-2xl"
        >
          <form onSubmit={submit} className="flex flex-col gap-4">

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-l4 uppercase tracking-wider">الاسم</label>
              <div className="relative">
                <User size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-l4" />
                <input
                  name="name" value={form.name} onChange={handle}
                  placeholder="مثال: محمد الأحمدي"
                  className="w-full bg-bg3 border border-border rounded-xl pr-10 pl-4 py-3 text-base text-l1 placeholder-l4 focus:border-blue focus:ring-2 focus:ring-blue/20 transition-all outline-none"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-l4 uppercase tracking-wider">رقم الجوال</label>
              <div className="relative">
                <Phone size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-l4" />
                <input
                  name="phone" value={form.phone} onChange={handle}
                  placeholder="05xxxxxxxx" type="tel" inputMode="numeric"
                  className="w-full bg-bg3 border border-border rounded-xl pr-10 pl-4 py-3 text-base text-l1 placeholder-l4 focus:border-blue focus:ring-2 focus:ring-blue/20 transition-all outline-none"
                />
              </div>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-red text-sm text-center bg-[rgba(255,69,58,0.1)] rounded-xl py-2 px-3">
                {error}
              </motion.p>
            )}

            <Btn type="submit" loading={loading} fullWidth className="mt-2 h-12 text-lg">
              دخول
            </Btn>
          </form>

          <p className="text-l4 text-xs text-center mt-4 leading-relaxed">
            بتسجيل الدخول، سيتم حفظ بياناتك تلقائياً
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
