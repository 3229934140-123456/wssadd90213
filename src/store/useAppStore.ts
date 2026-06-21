import { create } from 'zustand'
import type { Lead, Customer, FollowUpRecord, Appointment, TodoItem, Performance, CaseImage, CustomerStage, AppointmentStatus } from '@/types'
import { mockLeads, mockCustomers, mockFollowUpRecords, mockAppointments, mockTodos, mockPerformance, mockCaseImages } from '@/data/mock'

const STORAGE_KEY = 'cosmetic-reception-desk-v1'
const PERSIST_FIELDS = ['leads', 'customers', 'followUpRecords', 'appointments', 'todos', 'caseImages'] as const

type PersistState = Pick<AppState, typeof PERSIST_FIELDS[number]>

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

function saveToStorage(state: AppState) {
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

interface AppState {
  leads: Lead[]
  customers: Customer[]
  followUpRecords: FollowUpRecord[]
  appointments: Appointment[]
  todos: TodoItem[]
  performance: Performance
  caseImages: CaseImage[]

  acceptLead: (leadId: string) => void
  transferLead: (leadId: string, to: string) => void
  updateCustomerStage: (customerId: string, stage: CustomerStage) => void
  addFollowUpRecord: (record: Omit<FollowUpRecord, 'id' | 'createdAt'>) => void
  setNextFollowUp: (customerId: string, time: string) => void
  updateAppointmentStatus: (appointmentId: string, status: AppointmentStatus) => void
  setAppointmentResult: (appointmentId: string, result: { type: 'deal' | 'lost'; amount?: number; project?: string; reason?: string }) => void
  sendReminder: (appointmentId: string) => void
  toggleTodo: (todoId: string) => void
  addCaseImage: (image: Omit<CaseImage, 'id' | 'sentAt'>) => void
}

export const useAppStore = create<AppState>((set, get) => {
  const originalSet = set
  const setWithPersist = (state: AppState | Partial<AppState> | ((state: AppState) => AppState | Partial<AppState>)) => {
    originalSet(state as any)
    saveToStorage(get())
  }

  const stored = loadFromStorage()

  const initialState: AppState = {
    leads: stored?.leads ?? mockLeads,
    customers: stored?.customers ?? mockCustomers,
    followUpRecords: stored?.followUpRecords ?? mockFollowUpRecords,
    appointments: stored?.appointments ?? mockAppointments,
    todos: stored?.todos ?? mockTodos,
    performance: mockPerformance,
    caseImages: stored?.caseImages ?? mockCaseImages,

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

    setNextFollowUp: (customerId, time) =>
      setWithPersist((state) => ({
        customers: state.customers.map((c) =>
          c.id === customerId ? { ...c, nextFollowUp: time } : c
        ),
      })),

    updateAppointmentStatus: (appointmentId, status) =>
      setWithPersist((state) => ({
        appointments: state.appointments.map((a) =>
          a.id === appointmentId ? { ...a, status } : a
        ),
      })),

    setAppointmentResult: (appointmentId, result) =>
      setWithPersist((state) => ({
        appointments: state.appointments.map((a) =>
          a.id === appointmentId ? { ...a, result, status: result.type === 'deal' ? 'completed' : 'lost' } : a
        ),
      })),

    sendReminder: (appointmentId) =>
      setWithPersist((state) => ({
        appointments: state.appointments.map((a) =>
          a.id === appointmentId ? { ...a, reminderSent: true } : a
        ),
      })),

    toggleTodo: (todoId) =>
      setWithPersist((state) => ({
        todos: state.todos.map((t) =>
          t.id === todoId ? { ...t, completed: !t.completed } : t
        ),
      })),

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

  saveToStorage(initialState)

  return initialState
})
