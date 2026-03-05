import { Modal, Btn, Badge } from './UI'
import { getCat, getStatus, fmtMoney, fmtKm, daysUntil } from '../lib/constants'
import { motion } from 'framer-motion'

export default function ViewModal({ open, onClose, record, onEdit, isLatest }) {
  if (!record) return null
  const cat = getCat(record.category)
  const st  = getStatus(record.status)
  const du  = daysUntil(record.next_service_date)
  const parts  = record.spare_parts || []
  // Supabase returns JSONB as already-parsed object — never JSON.parse it
  const photos = Array.isArray(record.photos) ? record.photos : []
  const partsTotal = parts.reduce((s, p) => s + (p.unit_price || 0) * (p.quantity || 1), 0)

  const rows = [
    { icon: '📅', label: 'التاريخ',             val: record.date },
    { icon: '🛣',  label: 'العداد',              val: record.mileage ? fmtKm(record.mileage) : null },
    { icon: '💰', label: 'التكلفة',              val: record.cost ? fmtMoney(record.cost) : null },
    { icon: '🏪', label: 'الورشة',               val: record.shop_name },
    { icon: '📍', label: 'العنوان',               val: record.shop_address },
    { icon: '👨‍🔧', label: 'الفني',              val: record.technician },
  ].filter(r => r.val)

  return (
    <Modal open={open} onClose={onClose} wide title={record.title}
      footer={
        <>
          <Btn variant="ghost" onClick={onClose}>إغلاق</Btn>
          {onEdit && <Btn variant="tinted" onClick={() => { onClose(); onEdit() }}>✏ تعديل</Btn>}
        </>
      }
    >
      <div className="p-6 flex flex-col gap-5">
        {/* Badges */}
        <div className="flex gap-2 flex-wrap">
          <Badge text={`${cat.icon} ${record.category}`} color={cat.color} bg={cat.bg} />
          <Badge text={record.status} color={st.color} bg={st.bg} />
        </div>

        {/* Info grid */}
        <div className="bg-bg3 rounded-2xl divide-y divide-border">
          {rows.map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 px-4 py-3">
              <span className="text-xl mt-0.5">{r.icon}</span>
              <div>
                <div className="text-xs text-l4 font-semibold">{r.label}</div>
                <div className="text-l1 text-sm mt-0.5">{r.val}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Next service — only show overdue/urgent on the latest record */}
        {record.next_service_date && (
          <div className={`rounded-2xl p-4 border ${
            isLatest && du !== null && du < 0
              ? 'bg-[rgba(255,69,58,0.1)] border-[rgba(255,69,58,0.3)]'
              : 'bg-[rgba(255,159,10,0.08)] border-[rgba(255,159,10,0.2)]'
          }`}>
            <div className="text-xs font-bold mb-1" style={{
              color: isLatest && du !== null && du < 0 ? '#FF453A' : '#FF9F0A'
            }}>
              ⏰ الصيانة القادمة لهذا السجل
            </div>
            <div className="text-l1 font-semibold">{record.next_service_date}</div>
            {isLatest && du !== null && (
              <div className="text-sm mt-1 font-semibold" style={{ color: du < 0 ? '#FF453A' : '#30D158' }}>
                {du < 0
                  ? `⚠️ متأخرة منذ ${Math.abs(du)} يوم`
                  : du === 0
                  ? '✅ اليوم!'
                  : `✅ خلال ${du} يوم`}
              </div>
            )}
            {!isLatest && (
              <div className="text-xs text-l4 mt-1">
                (هذا سجل قديم — راجع أحدث سجل للحالة الفعلية)
              </div>
            )}
            {record.next_service_mileage && (
              <div className="text-l3 text-sm mt-1">أو عند: {fmtKm(record.next_service_mileage)}</div>
            )}
          </div>
        )}

        {/* Description */}
        {record.description && (
          <div>
            <div className="text-xs font-bold text-l4 uppercase tracking-wider mb-2">العمل المنجز</div>
            <div className="bg-bg3 rounded-2xl p-4 text-l2 text-sm leading-relaxed whitespace-pre-wrap">{record.description}</div>
          </div>
        )}

        {/* Spare parts */}
        {parts.length > 0 && (
          <div>
            <div className="text-xs font-bold text-l4 uppercase tracking-wider mb-3">
              قطع الغيار ({parts.length})
            </div>
            <div className="rounded-2xl overflow-hidden border border-border">
              <div className="grid grid-cols-4 bg-bg3 px-4 py-2 text-xs font-bold text-l4">
                <span className="col-span-2">القطعة</span>
                <span className="text-center">الكمية</span>
                <span className="text-left">الإجمالي</span>
              </div>
              {parts.map((p, i) => (
                <div key={i} className={`grid grid-cols-4 px-4 py-3 text-sm border-t border-border ${i % 2 === 0 ? 'bg-bg2' : 'bg-bg3'}`}>
                  <div className="col-span-2">
                    <div className="text-l1 font-medium">{p.part_name}</div>
                    {p.brand && <div className="text-l4 text-xs">{p.brand}</div>}
                  </div>
                  <div className="text-center text-l2">{p.quantity}</div>
                  <div className="text-left text-blue font-semibold">
                    {((p.unit_price || 0) * (p.quantity || 1)).toLocaleString('ar-SA')} ر.س
                  </div>
                </div>
              ))}
              <div className="flex justify-between px-4 py-3 bg-[rgba(10,132,255,0.08)] border-t border-border">
                <span className="text-l2 font-bold">الإجمالي</span>
                <span className="text-blue font-bold">{partsTotal.toLocaleString('ar-SA')} ر.س</span>
              </div>
            </div>
          </div>
        )}
        {/* Photos */}
        {photos.length > 0 && (
          <div>
            <div className="text-xs font-bold text-l4 uppercase tracking-wider mb-3">
              الصور ({photos.length})
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photos.map((photo, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.06 }}
                  className="bg-bg3 rounded-2xl overflow-hidden"
                >
                  <a href={photo.url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={photo.url}
                      alt={photo.caption || `صورة ${idx + 1}`}
                      className="w-full h-32 object-cover hover:opacity-90 transition-opacity"
                    />
                  </a>
                  {photo.caption && (
                    <div className="px-3 py-2 text-xs text-l3">{photo.caption}</div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

      </div>
    </Modal>
  )
}
