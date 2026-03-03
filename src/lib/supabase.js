import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://kxwdjdarxdtbcxfkjije.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4d2RqZGFyeGR0YmN4ZmtqaWplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NjAzNDEsImV4cCI6MjA4ODEzNjM0MX0.vf5KSkoyYZOesbhtwKEugxPf5KK8sxf2YQpVqFriZX0'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

// ── Database helpers ─────────────────────────────────────

export async function getOrCreateUser(name, phone) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('phone', phone)
    .single()
  if (data) {
    // update name if changed
    await supabase.from('users').update({ name }).eq('id', data.id)
    return { ...data, name }
  }
  const { data: newUser, error: err } = await supabase
    .from('users')
    .insert({ name, phone })
    .select()
    .single()
  if (err) throw err
  return newUser
}

export async function getCars(userId) {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function createCar(userId, car) {
  const { data, error } = await supabase
    .from('cars')
    .insert({ ...car, user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateCar(id, car) {
  const { data, error } = await supabase
    .from('cars')
    .update(car)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteCar(id) {
  // cascade handled by DB
  const { error } = await supabase.from('cars').delete().eq('id', id)
  if (error) throw error
}

export async function getMaintenance(carId) {
  const { data, error } = await supabase
    .from('maintenance')
    .select('*, spare_parts(*)')
    .eq('car_id', carId)
    .order('date', { ascending: false })
  if (error) throw error
  return data || []
}

export async function createMaintenance(record) {
  const { spare_parts, ...rec } = record
  const { data, error } = await supabase
    .from('maintenance')
    .insert(rec)
    .select()
    .single()
  if (error) throw error
  if (spare_parts?.length) {
    await supabase.from('spare_parts').insert(
      spare_parts.map(p => ({ ...p, maintenance_id: data.id }))
    )
  }
  return data
}

export async function updateMaintenance(id, record) {
  const { spare_parts, ...rec } = record
  const { data, error } = await supabase
    .from('maintenance')
    .update(rec)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  // replace parts
  await supabase.from('spare_parts').delete().eq('maintenance_id', id)
  if (spare_parts?.length) {
    await supabase.from('spare_parts').insert(
      spare_parts.map(p => ({ ...p, maintenance_id: id }))
    )
  }
  return data
}

export async function deleteMaintenance(id) {
  await supabase.from('spare_parts').delete().eq('maintenance_id', id)
  const { error } = await supabase.from('maintenance').delete().eq('id', id)
  if (error) throw error
}

export async function getAllDataForAdmin() {
  const { data: users } = await supabase.from('users').select('*').order('created_at')
  const { data: cars }  = await supabase.from('cars').select('*').order('created_at')
  const { data: maint } = await supabase.from('maintenance').select('*, spare_parts(*)').order('date')
  return { users, cars, maintenance: maint }
}
