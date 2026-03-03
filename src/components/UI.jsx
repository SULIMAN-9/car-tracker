import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import { useEffect, useRef } from 'react'

// ── Button ────────────────────────────────────────────────
export function Btn({ children, onClick, variant = 'primary', className = '', disabled, loading, type = 'button', fullWidth }) {
  const base = `inline-flex items-center justify-center gap-2 rounded-2xl font-semibold text-base transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:pointer-events-none btn-press focus-ring ${fullWidth ? 'w-full' : ''}`
  const variants = {
    primary: 'bg-blue hover:bg-blue-d text-white px-6 py-3',
    ghost:   'bg-bg3 hover:bg-[#48484A] text-l2 px-6 py-3',
    danger:  'bg-[rgba(255,69,58,0.15)] hover:bg-[rgba(255,69,58,0.25)] text-red px-6 py-3',
    tinted:  'bg-[rgba(10,132,255,0.15)] hover:bg-[rgba(10,132,255,0.25)] text-blue px-6 py-3 font-bold',
    icon:    'bg-bg3 hover:bg-[#48484A] text-l2 p-2.5 rounded-xl',
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${className}`}>
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  )
}

// ── Input Field ───────────────────────────────────────────
export function Field({ label, name, value, onChange, placeholder, type = 'text', required, className = '' }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-xs font-bold text-l4 uppercase tracking-wider">{label}</label>}
      <input
        type={type} name={name} value={value ?? ''} onChange={onChange}
        placeholder={placeholder} required={required}
        className="w-full bg-bg3 border border-border rounded-xl px-4 py-3 text-base text-l1 placeholder-l4 focus:border-blue focus:ring-2 focus:ring-blue/20 transition-all duration-200 outline-none"
      />
    </div>
  )
}

// ── Textarea ──────────────────────────────────────────────
export function TextArea({ label, name, value, onChange, placeholder, rows = 3, className = '' }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-xs font-bold text-l4 uppercase tracking-wider">{label}</label>}
      <textarea
        name={name} value={value ?? ''} onChange={onChange}
        placeholder={placeholder} rows={rows}
        className="w-full bg-bg3 border border-border rounded-xl px-4 py-3 text-base text-l1 placeholder-l4 focus:border-blue focus:ring-2 focus:ring-blue/20 transition-all duration-200 outline-none resize-none"
      />
    </div>
  )
}

// ── Select ────────────────────────────────────────────────
export function Select({ label, name, value, onChange, options, className = '' }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-xs font-bold text-l4 uppercase tracking-wider">{label}</label>}
      <select
        name={name} value={value ?? ''} onChange={onChange}
        className="w-full bg-bg3 border border-border rounded-xl px-4 py-3 text-base text-l1 focus:border-blue focus:ring-2 focus:ring-blue/20 transition-all duration-200 outline-none appearance-none"
      >
        {options.map(o => (
          <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
        ))}
      </select>
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────
export function Badge({ text, color, bg }) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
      style={{ color, background: bg }}>
      {text}
    </span>
  )
}

// ── Card ──────────────────────────────────────────────────
export function Card({ children, className = '', onClick, hover = true }) {
  return (
    <div
      onClick={onClick}
      className={`bg-bg2 border border-border rounded-3xl ${hover && onClick ? 'card-hover cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────
export function StatCard({ icon, label, value, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="bg-bg2 border border-border rounded-2xl overflow-hidden"
    >
      <div className="h-0.5 w-full" style={{ background: color }} />
      <div className="p-4">
        <div className="text-2xl mb-2">{icon}</div>
        <div className="text-xs text-l3 mb-1">{label}</div>
        <div className="text-lg font-bold" style={{ color }}>{value}</div>
      </div>
    </motion.div>
  )
}

// ── Modal ─────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, footer, wide = false }) {
  const ref = useRef()
  useEffect(() => {
    if (!open) return
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 modal-backdrop"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          {/* Panel */}
          <motion.div
            ref={ref}
            className={`relative w-full ${wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'} max-h-[92dvh] bg-bg2 sm:rounded-3xl rounded-t-3xl border border-border flex flex-col shadow-2xl`}
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Drag handle (mobile) */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-border rounded-full" />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
              <h2 className="text-xl font-bold text-l1">{title}</h2>
              <button onClick={onClose}
                className="w-8 h-8 rounded-full bg-bg3 flex items-center justify-center text-l3 hover:text-l1 hover:bg-[#48484A] transition-all">
                <X size={16} />
              </button>
            </div>
            {/* Body */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {children}
            </div>
            {/* Footer */}
            {footer && (
              <div className="border-t border-border px-6 py-4 flex gap-3 justify-between flex-shrink-0 pb-safe">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Confirm Dialog ────────────────────────────────────────
export function Confirm({ open, onClose, onConfirm, title, message, danger = true }) {
  return (
    <Modal open={open} onClose={onClose} title={title}
      footer={
        <>
          <Btn variant="ghost" onClick={onClose}>إلغاء</Btn>
          <Btn variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>تأكيد</Btn>
        </>
      }
    >
      <div className="px-6 py-6">
        <p className="text-l2 text-base leading-relaxed">{message}</p>
      </div>
    </Modal>
  )
}

// ── Toast ─────────────────────────────────────────────────
export function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])

  const colors = {
    success: 'bg-[rgba(48,209,88,0.15)] border-[rgba(48,209,88,0.3)] text-green',
    error:   'bg-[rgba(255,69,58,0.15)] border-[rgba(255,69,58,0.3)] text-red',
    info:    'bg-[rgba(10,132,255,0.15)] border-[rgba(10,132,255,0.3)] text-blue',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-2xl border backdrop-blur-xl font-semibold text-sm shadow-2xl ${colors[type]}`}
      style={{ minWidth: 200, textAlign: 'center' }}
    >
      {message}
    </motion.div>
  )
}

// ── Loading Spinner ───────────────────────────────────────
export function Spinner({ size = 24, className = '' }) {
  return <Loader2 size={size} className={`animate-spin text-blue ${className}`} />
}

// ── Empty State ───────────────────────────────────────────
export function Empty({ icon, title, subtitle, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-l1 mb-2">{title}</h3>
      {subtitle && <p className="text-l3 text-base mb-6 max-w-xs">{subtitle}</p>}
      {action}
    </motion.div>
  )
}

// ── Skeleton ──────────────────────────────────────────────
export function SkeletonCard() {
  return (
    <div className="bg-bg2 border border-border rounded-3xl p-5 space-y-3">
      <div className="skeleton h-5 w-2/3 rounded-lg" />
      <div className="skeleton h-4 w-1/2 rounded-lg" />
      <div className="skeleton h-4 w-3/4 rounded-lg" />
    </div>
  )
}

// ── Chip (category/status selector) ──────────────────────
export function Chip({ label, selected, color, bg, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 btn-press ${selected ? '' : 'bg-bg3 text-l3 hover:bg-[#48484A]'}`}
      style={selected ? { background: bg, color } : {}}
    >
      {label}
    </button>
  )
}

// ── Section Header ────────────────────────────────────────
export function SectionHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-l1">{title}</h2>
      {action}
    </div>
  )
}
