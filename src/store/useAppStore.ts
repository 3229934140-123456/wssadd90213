import { create } from 'zustand'
import type { Lead, Customer, FollowUpRecord, Appointment, TodoItem, Performance, CaseImage, CustomerStage, AppointmentStatus, Distribution, DailyTrend } from '@/types'
import { mockLeads, mockCustomers, mockFollowUpRecords, mockAppointments, mockTodos, mockPerformance, mockCaseImages } from '@/data/mock'

const STORAGE_KEY = 'cosmetic-reception-desk-v1'
const PERSIST_FIELDS = ['leads', 'customers', 'followUpRecords', 'appointments', 'todos', 'caseImages'] as const

type PersistState = Pick<AppState, typeof PERSIST_FIELDS[number]>

interface PersistableState {
  leads: Lead[]
  customers: Customer[]
  followUpRecords: FollowUpRecord[]
  appointments: Appointment[]
  todos: TodoItem[]
  caseImages: CaseImage[]
}

function loadFromStorage(): Partial<PersistState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PersistState>
    const valid = PERSIST_FIELDS.every((field) => Array.isArray(parsed[field]))
    return valid ? parsed : null
  } catch {
    return null
  }
}

function saveToStorage(state: PersistableState) {
  try {
    const toSave: PersistState = {
      leads: state.leads,
      customers: state.customers,
      followUpRecords: state.followUpRecords,
      appointments: state.appointments,
      todos: state.todos,
      caseImages: state.caseImages,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  } catch {}
}

function getDateStr(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export function todayStr(): string {
  return getDateStr(new Date())
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return getDateStr(d)
}

export function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr)
  const weekMap = ['日', '一', '二', '三', '四', '五', '六']
  return `${d.getMonth() + 1}月${d.getDate()}日 周${weekMap[d.getDay()]}`
}

export function getWeekDays(baseDate: string) {
  const base = new Date(baseDate)
  const dayOfWeek = base.getDay()
  const monday = new Date(base)
  monday.setDate(base.getDate() - ((dayOfWeek + 6) % 7))
  const days: { date: string; day: number; weekLabel: string; isToday: boolean }[] = []
  const weekLabels = ['一', '二', '三', '四', '五', '六', '日']
  const today = todayStr()
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const dateStr = getDateStr(d)
    days.push({ date: dateStr, day: d.getDate(), weekLabel: weekLabels[i], isToday: dateStr === today })
  }
  return days
}

function getShortDateStr(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function isDateInThisWeek(dateStr: string): boolean {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - 6)
  const d = new Date(dateStr)
  const dDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  return dDate >= weekStart && dDate <= today
}

function normalizePercent(list: { name: string; value: number }[]): Distribution[] {
  const total = list.reduce((s, i) => s + i.value, 0)
  if (total === 0) return list.map((i) => ({ ...i, value: Math.floor(100 / list.length) }))
  const normalized = list.map((i) => ({ name: i.name, value: Math.round((i.value / total) * 100) }))
  let sum = normalized.reduce((s, i) => s + i.value, 0)
  let idx = 0
  while (sum !== 100 && normalized.length > 0) {
    const diff = 100 - sum
    normalized[idx].value += diff > 0 ? 1 : -1
    sum = normalized.reduce((s, i) => s + i.value, 0)
    idx = (idx + 1) % normalized.length
  }
  return normalized
}

export function mapMockAppointments(appointments: Appointment[]): Appointment[] {
  const today = todayStr()
  const mapping: Record<string, string> = {
    '2026-06-21': addDays(today, -1),
    '2026-06-22': today,
    '2026-06-23': addDays(today, 1),
    '2026-06-24': addDays(today, 2),
    '2026-06-20': addDays(today, -2),
    '2026-06-25': addDays(today, 3),
    '2026-06-26': addDays(today, 4),
  }
  return appointments.map((a) => ({ ...a, date: mapping[a.date] || a.date }))
}

export function mapMockTodos(todos: TodoItem[]): TodoItem[] {
  const today = todayStr()
  const mapping: Record<string, string> = {
    '2026-06-21': addDays(today, -1),
    '2026-06-22': today,
    '2026-06-23': addDays(today, 1),
    '2026-06-24': addDays(today, 2),
    '2026-06-20': addDays(today, -2),
  }
  return todos.map((t) => {
    const datePart = t.dueTime.split('T')[0]
    const mappedDate = mapping[datePart]
    if (!mappedDate) return t
    const timePart = t.dueTime.split('T')[1] || '09:00:00.000Z'
    return { ...t, dueTime: `${mappedDate}T${timePart}` }
  })
}

export function getDaySummary(dateStr: string, state: PersistableState) {
  const mappedApts = mapMockAppointments(state.appointments)
  const mappedTodos = mapMockTodos(state.todos)

  const dayAppointments = mappedApts.filter((a) => a.date === dateStr)
  const pendingFollowUp = mappedTodos.filter((t) => !t.completed && t.dueTime.startsWith(dateStr))
  const arrivals = dayAppointments.filter((a) => a.status === 'confirmed' || a.status === 'arrived')
  const pendingConfirm = dayAppointments.filter((a) => a.status === 'pending')

  return {
    appointmentCount: dayAppointments.length,
    followUpCount: pendingFollowUp.length,
    arrivalCount: arrivals.length,
    pendingConfirmCount: pendingConfirm.length,
    dayAppointments,
    pendingFollowUp,
    arrivals,
    pendingConfirm,
  }
}

export function getPerformance(state: PersistableState): Performance {
  const { leads, customers, appointments, todos } = state

  const acceptedLeadsThisWeek = leads.filter(
    (l) => l.status === 'accepted' && isDateInThisWeek(l.createdAt)
  ).length
  const completedTodosThisWeek = todos.filter(
    (t) => t.completed && isDateInThisWeek(t.dueTime)
  ).length

  const mockWeekReceptions = mockPerformance.weekReceptions
  let weekReceptions = acceptedLeadsThisWeek + completedTodosThisWeek + customers.length
  weekReceptions = Math.max(weekReceptions, customers.length * 2, mockWeekReceptions)

  const weekAppointments = appointments.filter((a) => isDateInThisWeek(a.date)).length
  const weekDealsAppointments = appointments.filter(
    (a) => a.result?.type === 'deal' && isDateInThisWeek(a.date)
  )
  const weekDeals = weekDealsAppointments.length
  const weekRevenue = appointments
    .filter((a) => a.result?.type === 'deal')
    .reduce((s, a) => s + (a.result?.amount || 0), 0)

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dailyTrend: DailyTrend[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const dateStr = getDateStr(d)
    const dayAppointments = appointments.filter((a) => a.date === dateStr).length
    const dayDeals = appointments.filter(
      (a) => a.date === dateStr && a.result?.type === 'deal'
    ).length
    const baseReceptions = Math.floor(weekReceptions / 7)
    const variance = (i % 3) - 1
    const dayReceptions = Math.max(1, baseReceptions + variance)
    dailyTrend.push({
      date: getShortDateStr(d),
      receptions: dayReceptions,
      appointments: dayAppointments,
      deals: dayDeals,
    })
  }

  const projectMap = new Map<string, number>()
  appointments
    .filter((a) => a.result?.type === 'deal' && a.result?.project)
    .forEach((a) => {
      const p = a.result!.project!
      let matched = false
      if (p.includes('鼻')) { projectMap.set('鼻综合', (projectMap.get('鼻综合') || 0) + 1); matched = true }
      else if (p.includes('眼') || p.includes('双眼皮')) { projectMap.set('双眼皮', (projectMap.get('双眼皮') || 0) + 1); matched = true }
      else if (p.includes('胸') || p.includes('隆胸')) { projectMap.set('隆胸', (projectMap.get('隆胸') || 0) + 1); matched = true }
      else if (p.includes('脂')) { projectMap.set('吸脂', (projectMap.get('吸脂') || 0) + 1); matched = true }
      else if (p.includes('玻') || p.includes('注射') || p.includes('瘦脸') || p.includes('皱')) { projectMap.set('注射类', (projectMap.get('注射类') || 0) + 1); matched = true }
      else if (p.includes('热玛吉')) { projectMap.set('热玛吉', (projectMap.get('热玛吉') || 0) + 1); matched = true }
      if (!matched) { projectMap.set('其他', (projectMap.get('其他') || 0) + 1) }
    })

  const defaultProjects: [string, number][] = [
    ['鼻综合', 35], ['双眼皮', 25], ['隆胸', 20], ['吸脂', 12], ['注射类', 8], ['热玛吉', 5], ['其他', 3]
  ]
  defaultProjects.forEach(([name, val]) => {
    if (!projectMap.has(name)) {
      projectMap.set(name, val)
    }
  })
  const projectDist: Distribution[] = Array.from(projectMap.entries())
    .map(([name, value]) => ({ name, value }))
    .slice(0, 6)
  const projectDistribution = normalizePercent(projectDist)

  let xinYangCount = customers.filter((c) => c.source === 'xinYang').length
  let meiTuanCount = customers.filter((c) => c.source === 'meiTuan').length
  let naturalCount = Math.max(1, Math.floor((xinYangCount + meiTuanCount) * 0.1))

  if (xinYangCount === 0 && meiTuanCount === 0) {
    xinYangCount = 55
    meiTuanCount = 35
    naturalCount = 10
  }

  const sourceDistribution = normalizePercent([
    { name: '新氧', value: xinYangCount },
    { name: '美团', value: meiTuanCount },
    { name: '自然到店', value: naturalCount },
  ])

  return {
    weekReceptions,
    weekAppointments: Math.max(weekAppointments, mockPerformance.weekAppointments),
    weekDeals: Math.max(weekDeals, mockPerformance.weekDeals),
    weekRevenue: Math.max(weekRevenue, mockPerformance.weekRevenue),
    dailyTrend,
    projectDistribution,
    sourceDistribution,
  }
}

interface AppState extends PersistableState {
  performance: Performance

  acceptLead: (leadId: string) => void
  transferLead: (leadId: string, to: string) => void
  updateCustomerStage: (customerId: string, stage: CustomerStage) => void
  addFollowUpRecord: (record: Omit<FollowUpRecord, 'id' | 'createdAt'>) => void
  setNextFollowUp: (customerId: string, time: string, purpose?: string) => void
  updateAppointmentStatus: (appointmentId: string, status: AppointmentStatus) => void
  setAppointmentResult: (appointmentId: string, result: { type: 'deal' | 'lost'; amount?: number; project?: string; reason?: string }) => void
  sendReminder: (appointmentId: string) => void
  toggleTodo: (todoId: string) => void
  addCaseImage: (image: Omit<CaseImage, 'id' | 'sentAt'>) => void
}

export const useAppStore = create<AppState>((set, get) => {
  const originalSet = set
  const setWithPersist = (state: Partial<PersistableState> | ((state: AppState) => Partial<PersistableState>)) => {
    originalSet((prev) => {
      const partial = typeof state === 'function' ? state(prev) : state
      const nextData: PersistableState = {
        leads: partial.leads ?? prev.leads,
        customers: partial.customers ?? prev.customers,
        followUpRecords: partial.followUpRecords ?? prev.followUpRecords,
        appointments: partial.appointments ?? prev.appointments,
        todos: partial.todos ?? prev.todos,
        caseImages: partial.caseImages ?? prev.caseImages,
      }
      const nextPerformance = getPerformance(nextData)
      const next = {
        ...prev,
        ...nextData,
        performance: nextPerformance,
      } as AppState
      saveToStorage(nextData)
      return next
    })
  }

  const stored = loadFromStorage()

  const baseState: PersistableState = {
    leads: stored?.leads ?? mockLeads,
    customers: stored?.customers ?? mockCustomers,
    followUpRecords: stored?.followUpRecords ?? mockFollowUpRecords,
    appointments: stored?.appointments ?? mockAppointments,
    todos: stored?.todos ?? mockTodos,
    caseImages: stored?.caseImages ?? mockCaseImages,
  }

  const initialState: AppState = {
    ...baseState,
    performance: getPerformance(baseState),

    acceptLead: (leadId) =>
      setWithPersist((state) => ({
        leads: state.leads.map((l) =>
          l.id === leadId ? { ...l, status: 'accepted' as const, assignedTo: 'me' } : l
        ),
      })),

    transferLead: (leadId, to) =>
      setWithPersist((state) => ({
        leads: state.leads.map((l) =>
          l.id === leadId ? { ...l, status: 'transferred' as const, assignedTo: to } : l
        ),
      })),

    updateCustomerStage: (customerId, stage) =>
      setWithPersist((state) => ({
        customers: state.customers.map((c) =>
          c.id === customerId ? { ...c, stage } : c
        ),
      })),

    addFollowUpRecord: (record) =>
      setWithPersist((state) => ({
        followUpRecords: [
          ...state.followUpRecords,
          {
            ...record,
            id: `f${Date.now()}`,
            createdAt: new Date().toISOString(),
          },
        ],
      })),

    setNextFollowUp: (customerId, time, purpose) =>
      setWithPersist((state) => {
        const customer = state.customers.find((c) => c.id === customerId)
        const customerName = customer?.nickname || ''
        const newTodo: TodoItem = {
          id: `t${Date.now()}`,
          type: 'followUp',
          customerId,
          customerName,
          content: `二次跟进：${purpose || '联系客户'}`,
          dueTime: time,
          priority: 'medium',
          completed: false,
          purpose: purpose || '',
        }
        return {
          customers: state.customers.map((c) =>
            c.id === customerId ? { ...c, nextFollowUp: time, nextFollowUpPurpose: purpose || '' } : c
          ),
          todos: [...state.todos, newTodo],
        }
      }),

    updateAppointmentStatus: (appointmentId, status) =>
      setWithPersist((state) => ({
        appointments: state.appointments.map((a) =>
          a.id === appointmentId ? { ...a, status } : a
        ),
      })),

    setAppointmentResult: (appointmentId, result) =>
      setWithPersist((state) => {
        const appointment = state.appointments.find((a) => a.id === appointmentId)
        let updatedCustomers = state.customers
        if (result.type === 'deal' && appointment) {
          const cid = appointment.customerId
          updatedCustomers = state.customers.map((c) =>
            c.id === cid ? { ...c, stage: '已到院' as const } : c
          )
        }
        return {
          appointments: state.appointments.map((a) =>
            a.id === appointmentId ? { ...a, result, status: result.type === 'deal' ? 'completed' : 'lost' } : a
          ),
          customers: updatedCustomers,
        }
      }),

    sendReminder: (appointmentId) =>
      setWithPersist((state) => ({
        appointments: state.appointments.map((a) =>
          a.id === appointmentId ? { ...a, reminderSent: true } : a
        ),
      })),

    toggleTodo: (todoId) =>
      setWithPersist((state) => {
        const todo = state.todos.find((t) => t.id === todoId)
        const wasCompleted = todo?.completed
        const updatedTodos = state.todos.map((t) =>
          t.id === todoId ? { ...t, completed: !t.completed } : t
        )
        let updatedRecords = state.followUpRecords
        if (todo && wasCompleted === false) {
          const newRecord: FollowUpRecord = {
            id: `f${Date.now()}`,
            customerId: todo.customerId,
            type: 'note',
            content: `[跟进完成] ${todo.purpose || todo.content}`,
            createdAt: new Date().toISOString(),
          }
          updatedRecords = [...state.followUpRecords, newRecord]
        }
        return {
          todos: updatedTodos,
          followUpRecords: updatedRecords,
        }
      }),

    addCaseImage: (image) =>
      setWithPersist((state) => ({
        caseImages: [
          ...state.caseImages,
          {
            ...image,
            id: `ci${Date.now()}`,
            sentAt: new Date().toISOString(),
          },
        ],
      })),
  }

  saveToStorage(baseState)

  return initialState
})
