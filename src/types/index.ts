export type LeadSource = 'xinYang' | 'meiTuan'

export type LeadStatus = 'pending' | 'accepted' | 'transferred'

export interface Lead {
  id: string
  source: LeadSource
  customerName: string
  city: string
  project: string
  packageViewed: string
  message: string
  createdAt: string
  status: LeadStatus
  assignedTo?: string
}

export type CustomerStage = '初问价' | '看案例' | '约面诊' | '已到院'

export interface Customer {
  id: string
  nickname: string
  avatar: string
  city: string
  project: string
  packagesViewed: string[]
  source: LeadSource
  stage: CustomerStage
  phone: string
  createdAt: string
  nextFollowUp?: string
}

export type FollowUpType = 'phone' | 'message' | 'note'

export interface FollowUpRecord {
  id: string
  customerId: string
  type: FollowUpType
  content: string
  createdAt: string
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'arrived' | 'completed' | 'lost'

export interface AppointmentResult {
  type: 'deal' | 'lost'
  amount?: number
  project?: string
  reason?: string
}

export interface Appointment {
  id: string
  customerId: string
  customerName: string
  project: string
  date: string
  time: string
  status: AppointmentStatus
  reminderSent: boolean
  result?: AppointmentResult
}

export type TodoType = 'followUp' | 'appointment' | 'reminder'
export type TodoPriority = 'high' | 'medium' | 'low'

export interface TodoItem {
  id: string
  type: TodoType
  customerId: string
  customerName: string
  content: string
  dueTime: string
  priority: TodoPriority
  completed: boolean
}

export interface DailyTrend {
  date: string
  receptions: number
  appointments: number
  deals: number
}

export interface Distribution {
  name: string
  value: number
}

export interface Performance {
  weekReceptions: number
  weekAppointments: number
  weekDeals: number
  weekRevenue: number
  dailyTrend: DailyTrend[]
  projectDistribution: Distribution[]
  sourceDistribution: Distribution[]
}

export interface CaseImage {
  id: string
  customerId: string
  url: string
  note: string
  sentAt: string
}

export const STAGE_ORDER: CustomerStage[] = ['初问价', '看案例', '约面诊', '已到院']
