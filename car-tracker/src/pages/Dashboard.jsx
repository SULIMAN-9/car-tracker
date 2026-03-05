import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, LogOut, ChevronLeft, Car, Filter, Bell } from 'lucide-react'
import { getCars, createCar, updateCar, deleteCar, getMaintenance, createMaintenance, updateMaintenance, deleteMaintenance } from '../lib/supabase'
import { getCat, getStatus, fmtMoney, fmtKm, daysUntil, daysAgo, CATEGORIES } from '../lib/constants'
import { Card, StatCard, Btn, Badge, Empty, SkeletonCard, Confirm, SectionHeader } from '../components/UI'
import { AnimatePresence as AP } from 'framer-motion'
import CarModal from '../components/CarModal'
import MaintenanceModal from '../components/MaintenanceModal'
import ViewModal from '../components/ViewModal'
import Footer from '../components/Footer'
import ReminderModal from '../components/ReminderModal'

// ── Toast hook ───────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState(null)
  const show = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }
  return [toast, show]
}

// ── Maintenance Card ──────────────────────────────────────
function MaintCard({ record, isLatest, onView, onEdit, onDelete }) {
  const cat = getCat(record.category)
  const st  = getStatus(record.status)
  const du  = daysUntil(record.next_service_date)
  const parts = record.spare_parts || []

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="bg-bg2 border border-border rounded-3xl overflow-hidden card-hover"
    >
      {/* Color bar */}
      <div className="h-1" style={{ background: cat.color }} />

      <div className="p-4 sm:p-5">
        {/* Row 1: title + badges */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-bold text-l1 text-base leading-snug flex-1">{record.title}</h3>
          <div className="flex gap-1.5 flex-shrink-0">
            <Badge text={`${cat.icon} ${record.category}`} color={cat.color} bg={cat.bg} />
            <Badge text={record.status} color={st.color} bg={st.bg} />
          </div>
        </div>

        {/* Row 2: meta */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-l3 mb-3">
          {record.date && <span>📅 {record.date}</span>}
          {record.mileage > 0 && <span>🛣 {fmtKm(record.mileage)}</span>}
          {record.cost > 0 && <span>💰 {fmtMoney(record.cost)}</span>}
          {record.shop_name && <span>🏪 {record.shop_name}</span>}
        </div>

        {/* Description preview */}
        {record.description && (
          <p className="text-l3 text-sm leading-relaxed line-clamp-2 mb-3">{record.description}</p>
        )}

        {/* Parts / next service strip */}
        {(parts.length > 0 || (isLatest && record.next_service_date)) && (
          <div className="bg-bg3 rounded-xl px-3 py-2 flex items-center justify-between gap-2 mb-3 text-xs">
            <div className="flex gap-3 text-l4">
              {parts.length > 0 && <span>⚙ {parts.length} قطعة</span>}
            </div>
            {/* Only show next-service reminder on the most recent record */}
            {isLatest && record.next_service_date && (
              <span className="font-semibold" style={{ color: du !== null && du < 0 ? '#FF453A' : '#FF9F0A' }}>
                ⏰ {du !== null && du < 0 ? 'متأخرة' : `خلال ${du} يوم`}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Btn variant="tinted" onClick={onView} className="flex-1 text-sm py-2 px-3">عرض</Btn>
          <Btn variant="ghost"  onClick={onEdit} className="flex-1 text-sm py-2 px-3">تعديل</Btn>
          <Btn variant="danger" onClick={onDelete} className="text-sm py-2 px-3">حذف</Btn>
        </div>
      </div>
    </motion.div>
  )
}

// ── Car Detail View ───────────────────────────────────────
function CarDetail({ car, userId, onBack, onCarUpdated, onCarDeleted, showToast }) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('الكل')
  const [showAdd, setShowAdd] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [viewRecord, setViewRecord] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [showEditCar, setShowEditCar] = useState(false)
  const [showDeleteCar, setShowDeleteCar] = useState(false)
  const [showReminder, setShowReminder] = useState(false)

  const fuel_icons = { بنزين: '⛽', ديزل: '🛢', هجين: '⚡', كهربائي: '🔋' }

  const load = useCallback(async () => {
    setLoading(true)
    try { setRecords(await getMaintenance(car.id)) }
    catch { showToast('خطأ في تحميل البيانات', 'error') }
    finally { setLoading(false) }
  }, [car.id])

  useEffect(() => { load() }, [load])

  const filtered = filter === 'الكل' ? records : records.filter(r => r.category === filter)

  // Stats
  const totalCost = records.reduce((s, r) => s + (r.cost || 0), 0)
  const lastRec   = records[0]
  // Next service = taken from the latest record that has a next_service_date set
  const nextSvc   = records.find(r => r.next_service_date)
  const nextSvcDu = daysUntil(nextSvc?.next_service_date)
  const nextSvcColor = nextSvcDu !== null && nextSvcDu < 0 ? '#FF453A' : nextSvcDu !== null && nextSvcDu <= 7 ? '#FF9F0A' : '#30D158' 
  const catCosts  = {}
  records.forEach(r => { catCosts[r.category] = (catCosts[r.category] || 0) + (r.cost || 0) })
  const topCat = Object.entries(catCosts).sort((a, b) => b[1] - a[1])[0]?.[0]

  const handleSaveMaint = async (data) => {
    if (editRecord) {
      await updateMaintenance(editRecord.id, data)
      showToast('تم تحديث السجل')
    } else {
      await createMaintenance({ ...data, car_id: car.id })
      showToast('تم إضافة السجل')
    }
    setEditRecord(null)
    await load()
  }

  const handleDelete = async () => {
    await deleteMaintenance(deleteId)
    setDeleteId(null)
    showToast('تم حذف السجل')
    await load()
  }

  const handleEditCar = async (data) => {
    const updated = await updateCar(car.id, data)
    onCarUpdated(updated)
    showToast('تم تحديث بيانات السيارة')
  }

  const handleDeleteCar = async () => {
    await deleteCar(car.id)
    showToast('تم حذف السيارة')
    onCarDeleted(car.id)
    onBack()
  }

  const stats = [
    { icon: '💰', label: 'إجمالي المصروف', value: fmtMoney(totalCost),     color: '#0A84FF', delay: 0 },
    { icon: '🔧', label: 'عدد الخدمات',   value: `${records.length}`,       color: '#30D158', delay: 0.05 },
    { icon: '📅', label: 'آخر صيانة',     value: lastRec ? `${daysAgo(lastRec.date)} يوم` : '—', color: '#FF9F0A', delay: 0.10 },
    { icon: '⏰', label: 'الصيانة القادمة',
      value: nextSvc?.next_service_date
        ? (nextSvcDu < 0 ? `متأخرة ${Math.abs(nextSvcDu)} يوم` : nextSvcDu === 0 ? 'اليوم!' : `خلال ${nextSvcDu} يوم`)
        : 'غير محدد',
      color: nextSvc ? nextSvcColor : '#8E8E9A', delay: 0.15 },
    { icon: '🛣', label: 'آخر عداد',      value: lastRec?.mileage ? fmtKm(lastRec.mileage) : '—', color: '#8E8E9A', delay: 0.20 },
    { icon: '🏆', label: 'أكثر فئة',      value: topCat || '—',              color: '#BF5AF2', delay: 0.25 },
  ]

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <div className="sticky top-0 z-20 glass border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={onBack} className="w-9 h-9 rounded-full bg-bg3 flex items-center justify-center text-l2 hover:bg-[#48484A] transition-all">
              <ChevronLeft size={18} />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-l1">
                {fuel_icons[car.fuel_type] || '🚗'} {car.make} {car.model}
              </h1>
              <p className="text-l3 text-sm">
                {[car.year, car.color, car.license_plate].filter(Boolean).join(' · ')}
              </p>
            </div>
            <div className="flex gap-2">
              <Btn variant="ghost" onClick={() => setShowEditCar(true)} className="text-sm py-2 px-3 hidden sm:flex">تعديل</Btn>
              <button onClick={() => setShowReminder(true)}
                className="w-9 h-9 rounded-full bg-bg3 flex items-center justify-center text-l3 hover:text-orange hover:bg-[#3D2600] transition-all"
                title="إرسال تذكير بالإيميل">
                <Bell size={17}/>
              </button>
              <Btn onClick={() => setShowAdd(true)} className="text-sm py-2 px-4 gap-1">
                <Plus size={15} /> إضافة صيانة
              </Btn>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full px-4 py-6 flex-1">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {stats.map(s => <StatCard key={s.label} {...s} />)}
        </div>

        {/* Filter + list */}
        <div className="flex items-center gap-3 mb-4 overflow-x-auto pb-1">
          <Filter size={15} className="text-l4 flex-shrink-0" />
          {['الكل', ...CATEGORIES.map(c => c.key)].map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filter === cat ? 'bg-blue text-white' : 'bg-bg3 text-l3 hover:bg-[#48484A]'}`}>
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
        ) : filtered.length === 0 ? (
          <Empty icon="🔧" title="لا توجد سجلات صيانة" subtitle="اضغط على إضافة صيانة لتسجيل أول خدمة"
            action={<Btn onClick={() => setShowAdd(true)}><Plus size={16} /> إضافة أول صيانة</Btn>} />
        ) : (
          <motion.div layout className="flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((rec) => (
                <MaintCard key={rec.id} record={rec}
                  isLatest={rec.id === records[0]?.id}
                  onView={() => setViewRecord(rec)}
                  onEdit={() => setEditRecord(rec)}
                  onDelete={() => setDeleteId(rec.id)} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Delete car button (mobile) */}
        <div className="mt-8 sm:hidden">
          <Btn variant="danger" fullWidth onClick={() => setShowDeleteCar(true)}>🗑 حذف السيارة</Btn>
        </div>
        <div className="mt-4 hidden sm:block">
          <button onClick={() => setShowDeleteCar(true)} className="text-red/70 hover:text-red text-sm transition-all">
            🗑 حذف هذه السيارة
          </button>
        </div>
      </div>

      {/* Modals */}
      <MaintenanceModal open={showAdd || !!editRecord} onClose={() => { setShowAdd(false); setEditRecord(null) }}
        onSave={handleSaveMaint} record={editRecord} />
      <ViewModal open={!!viewRecord} onClose={() => setViewRecord(null)} record={viewRecord}
        isLatest={viewRecord?.id === records[0]?.id}
        onEdit={() => { setEditRecord(viewRecord); setViewRecord(null) }} />
      <Confirm open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="حذف السجل" message="هل تريد حذف هذا السجل نهائياً؟ لا يمكن التراجع عن هذا الإجراء." />
      <CarModal open={showEditCar} onClose={() => setShowEditCar(false)} onSave={handleEditCar} car={car} />
      <Confirm open={showDeleteCar} onClose={() => setShowDeleteCar(false)} onConfirm={handleDeleteCar}
        title="حذف السيارة"
        message={`هل تريد حذف ${car.make} ${car.model} وجميع سجلات صيانتها؟ لا يمكن التراجع.`} />
      <ReminderModal open={showReminder} onClose={() => setShowReminder(false)}
        car={car} records={records} user={{name:'المستخدم'}} />
    </div>
  )
}

// ── Cars List ─────────────────────────────────────────────
function CarsList({ user, onLogout, showToast }) {
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [selectedCar, setSelectedCar] = useState(null)

  const fuel_icons = { بنزين: '⛽', ديزل: '🛢', هجين: '⚡', كهربائي: '🔋' }

  const load = useCallback(async () => {
    setLoading(true)
    try { setCars(await getCars(user.id)) }
    catch { showToast('خطأ في تحميل البيانات', 'error') }
    finally { setLoading(false) }
  }, [user.id])

  useEffect(() => { load() }, [load])

  const handleAddCar = async (data) => {
    const car = await createCar(user.id, data)
    showToast('تم إضافة السيارة')
    setCars(prev => [car, ...prev])
  }

  if (selectedCar) {
    return (
      <CarDetail
        car={selectedCar} userId={user.id}
        onBack={() => setSelectedCar(null)}
        onCarUpdated={updated => setSelectedCar(updated)}
        onCarDeleted={id => { setCars(p => p.filter(c => c.id !== id)); setSelectedCar(null) }}
        showToast={showToast}
      />
    )
  }

  return (
    <div className="min-h-dvh gradient-bg">
      {/* Header */}
      <div className="sticky top-0 z-20 glass border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue flex items-center justify-center text-xl shadow-lg shadow-blue/20">🚗</div>
            <div>
              <h1 className="text-base font-bold text-l1">متتبع الصيانة</h1>
              <p className="text-xs text-l3">أهلاً، {user.name}</p>
            </div>
          </div>
          <button onClick={onLogout}
            className="w-9 h-9 rounded-full bg-bg3 flex items-center justify-center text-l3 hover:text-l1 hover:bg-[#48484A] transition-all">
            <LogOut size={16} />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <SectionHeader title="سياراتي"
          action={
            <Btn onClick={() => setShowAdd(true)} className="gap-1.5 text-sm py-2 px-4">
              <Plus size={15} /> إضافة سيارة
            </Btn>
          }
        />

        {loading ? (
          <div className="flex flex-col gap-3">{[1,2].map(i => <SkeletonCard key={i} />)}</div>
        ) : cars.length === 0 ? (
          <Empty icon="🚗" title="لا توجد سيارات بعد"
            subtitle="أضف سيارتك الأولى وابدأ في تتبع صيانتها"
            action={<Btn onClick={() => setShowAdd(true)}><Plus size={16} /> إضافة سيارتي الأولى</Btn>} />
        ) : (
          <motion.div layout className="flex flex-col gap-4 stagger">
            {cars.map((car, i) => (
              <motion.div key={car.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <Card onClick={() => setSelectedCar(car)} hover className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                      style={{ background: 'rgba(10,132,255,0.1)' }}>
                      {fuel_icons[car.fuel_type] || '🚗'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-l1 text-lg">{car.make} {car.model}</div>
                      <div className="text-l3 text-sm mt-0.5">
                        {[car.year, car.color, car.license_plate].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                    <ChevronLeft size={18} className="text-l4 flex-shrink-0 rotate-180" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <CarModal open={showAdd} onClose={() => setShowAdd(false)} onSave={handleAddCar} />
      <Footer />
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────
export default function Dashboard({ user, onLogout }) {
  const [toast, showToast] = useToast()

  return (
    <>
      <CarsList user={user} onLogout={onLogout} showToast={showToast} />
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-2xl border backdrop-blur-xl font-semibold text-sm shadow-2xl
              ${toast.type === 'error' ? 'bg-[rgba(255,69,58,0.15)] border-[rgba(255,69,58,0.3)] text-red' : 'bg-[rgba(48,209,88,0.15)] border-[rgba(48,209,88,0.3)] text-green'}`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
