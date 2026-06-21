import { create } from 'zustand'
import type { Lead, Customer, FollowUpRecord, Appointment, TodoItem, Performance, CaseImage, CustomerStage, AppointmentStatus } from '@/types'
import { mockLeads, mockCustomers, mockFollowUpRecords, mockAppointments, mockTodos, mockPerformance, mockCaseImages } from '@/data/mock'

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

export const useAppStore = create<AppState>((set) => ({
  leads: mockLeads,
  customers: mockCustomers,
  followUpRecords: mockFollowUpRecords,
  appointments: mockAppointments,
  todos: mockTodos,
  performance: mockPerformance,
  caseImages: mockCaseImages,

  acceptLead: (leadId) =>
    set((state) => ({
      leads: state.leads.map((l) =>
        l.id === leadId ? { ...l, status: 'accepted' as const, assignedTo: 'me' } : l
      ),
    })),

  transferLead: (leadId, to) =>
    set((state) => ({
      leads: state.leads.map((l) =>
        l.id === leadId ? { ...l, status: 'transferred' as const, assignedTo: to } : l
      ),
    })),

  updateCustomerStage: (customerId, stage) =>
    set((state) => ({
      customers: state.customers.map((c) =>
        c.id === customerId ? { ...c, stage } : c
      ),
    })),

  addFollowUpRecord: (record) =>
    set((state) => ({
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
    set((state) => ({
      customers: state.customers.map((c) =>
        c.id === customerId ? { ...c, nextFollowUp: time } : c
      ),
    })),

  updateAppointmentStatus: (appointmentId, status) =>
    set((state) => ({
      appointments: state.appointments.map((a) =>
        a.id === appointmentId ? { ...a, status } : a
      ),
    })),

  setAppointmentResult: (appointmentId, result) =>
    set((state) => ({
      appointments: state.appointments.map((a) =>
        a.id === appointmentId ? { ...a, result, status: result.type === 'deal' ? 'completed' : 'lost' } : a
      ),
    })),

  sendReminder: (appointmentId) =>
    set((state) => ({
      appointments: state.appointments.map((a) =>
        a.id === appointmentId ? { ...a, reminderSent: true } : a
      ),
    })),

  toggleTodo: (todoId) =>
    set((state) => ({
      todos: state.todos.map((t) =>
        t.id === todoId ? { ...t, completed: !t.completed } : t
      ),
    })),

  addCaseImage: (image) =>
    set((state) => ({
      caseImages: [
        ...state.caseImages,
        {
          ...image,
          id: `ci${Date.now()}`,
          sentAt: new Date().toISOString(),
        },
      ],
    })),
}))
