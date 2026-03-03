export const CATEGORIES = [
  { key: 'تغيير الزيت',      icon: '🛢', color: '#FF9F0A', bg: 'rgba(255,159,10,0.12)' },
  { key: 'خدمة الإطارات',    icon: '◎',  color: '#0A84FF', bg: 'rgba(10,132,255,0.12)' },
  { key: 'خدمة الفرامل',     icon: '⬡',  color: '#FF453A', bg: 'rgba(255,69,58,0.12)' },
  { key: 'المحرك',            icon: '⚙',  color: '#BF5AF2', bg: 'rgba(191,90,242,0.12)' },
  { key: 'ناقل الحركة',       icon: '⟳',  color: '#5E5CE6', bg: 'rgba(94,92,230,0.12)' },
  { key: 'البطارية',           icon: '⚡', color: '#30D158', bg: 'rgba(48,209,88,0.12)' },
  { key: 'خدمة التكييف',      icon: '❄',  color: '#40CBE0', bg: 'rgba(64,203,224,0.12)' },
  { key: 'الكهرباء',           icon: '⌁',  color: '#FFD60A', bg: 'rgba(255,214,10,0.12)' },
  { key: 'التعليق',            icon: '⤢',  color: '#FF9F0A', bg: 'rgba(255,159,10,0.12)' },
  { key: 'الهيكل الخارجي',    icon: '✦',  color: '#40CBE0', bg: 'rgba(64,203,224,0.12)' },
  { key: 'الفحص',              icon: '✓',  color: '#8E8E9A', bg: 'rgba(142,142,154,0.12)' },
  { key: 'أخرى',               icon: '•',  color: '#8E8E9A', bg: 'rgba(142,142,154,0.12)' },
]

export const STATUSES = [
  { key: 'مكتملة',   color: '#30D158', bg: 'rgba(48,209,88,0.12)' },
  { key: 'جارية',    color: '#FF9F0A', bg: 'rgba(255,159,10,0.12)' },
  { key: 'مجدولة',   color: '#0A84FF', bg: 'rgba(10,132,255,0.12)' },
  { key: 'ملغاة',    color: '#8E8E9A', bg: 'rgba(142,142,154,0.12)' },
]

export const FUEL_TYPES = [
  { key: 'بنزين',    icon: '⛽' },
  { key: 'ديزل',     icon: '🛢' },
  { key: 'هجين',     icon: '⚡' },
  { key: 'كهربائي', icon: '🔋' },
]

export function getCat(key) {
  return CATEGORIES.find(c => c.key === key) || CATEGORIES[CATEGORIES.length - 1]
}

export function getStatus(key) {
  return STATUSES.find(s => s.key === key) || STATUSES[0]
}

export function fmtMoney(v) {
  const n = parseFloat(v) || 0
  return n.toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ر.س'
}

export function fmtKm(v) {
  const n = parseInt(v) || 0
  return n.toLocaleString('ar-SA') + ' كم'
}

export function daysUntil(ds) {
  if (!ds) return null
  const diff = new Date(ds) - new Date()
  return Math.ceil(diff / 86400000)
}

export function daysAgo(ds) {
  if (!ds) return null
  const diff = new Date() - new Date(ds)
  return Math.floor(diff / 86400000)
}

export function today() {
  return new Date().toISOString().split('T')[0]
}
