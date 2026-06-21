import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarCheck, Clock, Send, CheckCircle, XCircle, ChevronDown, X, AlertCircle, Sparkles } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import type { Appointment, AppointmentStatus } from '@/types'

function todayStr() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const statusConfig: Record<AppointmentStatus, { label: string; bg: string; text: string }> = {
  pending: { label: '待确认', bg: 'bg-warning-50', text: 'text-warning-600' },
  confirmed: { label: '已确认', bg: 'bg-blue-50', text: 'text-blue-600' },
  arrived: { label: '已到院', bg: 'bg-primary-50', text: 'text-primary-600' },
  completed: { label: '已完成', bg: 'bg-success-50', text: 'text-success-600' },
  lost: { label: '已流失', bg: 'bg-danger-50', text: 'text-danger-500' },
}

function getWeekDays() {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7))

  const days = []
  const weekLabels = ['一', '二', '三', '四', '五', '六', '日']
  const todayStrValue = todayStr()
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const dateStr = `${y}-${m}-${day}`
    days.push({
      date: dateStr,
      day: d.getDate(),
      weekLabel: weekLabels[i],
      isToday: dateStr === todayStrValue,
    })
  }
  return days
}

const lostReasons = [
  '价格超出预算',
  '选择其他机构',
  '暂时不想做',
  '家人反对',
  '身体原因不适合',
  '其他',
]

export default function Appointments() {
  const navigate = useNavigate()
  const appointments = useAppStore((s) => s.appointments)
  const updateAppointmentStatus = useAppStore((s) => s.updateAppointmentStatus)
  const setAppointmentResult = useAppStore((s) => s.setAppointmentResult)
  const sendReminder = useAppStore((s) => s.sendReminder)

  const [selectedDate, setSelectedDate] = useState(todayStr())
  const [showResultSheet, setShowResultSheet] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [resultType, setResultType] = useState<'deal' | 'lost'>('deal')
  const [dealAmount, setDealAmount] = useState('')
  const [dealProject, setDealProject] = useState('')
  const [lostReason, setLostReason] = useState('')

  const weekDays = getWeekDays()

  const today = todayStr()
  const dateMapping: Record<string, string> = {
    '2026-06-21': addDays(today, -1),
    '2026-06-22': today,
    '2026-06-23': addDays(today, 1),
    '2026-06-24': addDays(today, 2),
  }
  const mappedAppointments = appointments.map((a) => ({
    ...a,
    date: dateMapping[a.date] || a.date,
  }))

  const dayAppointments = mappedAppointments.filter((a) => a.date === selectedDate)

  const datesWithAppointments = new Set(mappedAppointments.map((a) => a.date))

  const handleSendReminder = (appointmentId: string) => {
    sendReminder(appointmentId)
  }

  const handleOpenResult = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setResultType('deal')
    setDealAmount('')
    setDealProject('')
    setLostReason('')
    setShowResultSheet(true)
  }

  const handleSubmitResult = () => {
    if (!selectedAppointment) return
    if (resultType === 'deal') {
      setAppointmentResult(selectedAppointment.id, {
        type: 'deal',
        amount: Number(dealAmount) || 0,
        project: dealProject || selectedAppointment.project,
      })
    } else {
      setAppointmentResult(selectedAppointment.id, {
        type: 'lost',
        reason: lostReason,
      })
    }
    setShowResultSheet(false)
  }

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-primary-500 to-primary-700 px-5 pt-12 pb-6 rounded-b-3xl">
        <h1 className="text-white text-xl font-bold mb-1">预约确认</h1>
        <p className="text-primary-100 text-sm">管理到院预约与成交登记</p>
      </div>

      <div className="px-4 -mt-2 space-y-4 pb-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            {weekDays.map((d) => (
              <button
                key={d.date}
                onClick={() => setSelectedDate(d.date)}
                className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-xl transition-all ${
                  d.date === selectedDate
                    ? 'bg-primary-500 text-white'
                    : d.isToday
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-500'
                }`}
              >
                <span className="text-[10px]">{d.weekLabel}</span>
                <span className="font-display font-bold text-sm">{d.day}</span>
                {datesWithAppointments.has(d.date) && (
                  <div className={`w-1 h-1 rounded-full ${
                    d.date === selectedDate ? 'bg-white' : 'bg-primary-400'
                  }`} />
                )}
              </button>
            ))}
          </div>
        </div>

        {dayAppointments.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <CalendarCheck size={32} className="mx-auto text-gray-200 mb-2" />
            <p className="text-gray-400 text-sm">当日暂无预约</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dayAppointments.map((apt) => {
              const sConfig = statusConfig[apt.status]
              return (
                <div
                  key={apt.id}
                  className="bg-white rounded-2xl p-4 shadow-sm"
                  onClick={() => navigate(`/customer/${apt.customerId}`)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{apt.customerName}</span>
                      <span className={`${sConfig.bg} ${sConfig.text} text-xs px-2 py-0.5 rounded-full`}>
                        {sConfig.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      <Clock size={12} />
                      <span className="text-xs font-display">{apt.time}</span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-500 mb-3">{apt.project}</div>

                  {apt.result && (
                    <div className={`mb-3 p-2.5 rounded-xl ${
                      apt.result.type === 'deal' ? 'bg-success-50' : 'bg-danger-50'
                    }`}>
                      {apt.result.type === 'deal' ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle size={16} className="text-success-500" />
                          <span className="text-sm text-success-700">
                            成交 ¥{apt.result.amount?.toLocaleString()} · {apt.result.project}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <XCircle size={16} className="text-danger-400" />
                          <span className="text-sm text-danger-600">流失: {apt.result.reason}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    {(apt.status === 'confirmed' || apt.status === 'pending') && !apt.reminderSent && (
                      <button
                        onClick={() => handleSendReminder(apt.id)}
                        className="flex-1 py-2 bg-warning-50 text-warning-600 rounded-xl text-xs font-medium flex items-center justify-center gap-1"
                      >
                        <Send size={12} />
                        发送提醒
                      </button>
                    )}
                    {apt.reminderSent && (
                      <div className="flex-1 py-2 bg-success-50 text-success-600 rounded-xl text-xs font-medium flex items-center justify-center gap-1">
                        <CheckCircle size={12} />
                        已提醒
                      </div>
                    )}
                    {(apt.status === 'confirmed' || apt.status === 'arrived') && !apt.result && (
                      <button
                        onClick={() => handleOpenResult(apt)}
                        className="flex-1 py-2 bg-primary-50 text-primary-600 rounded-xl text-xs font-medium flex items-center justify-center gap-1"
                      >
                        <Sparkles size={12} />
                        登记结果
                      </button>
                    )}
                    {apt.status === 'pending' && (
                      <button
                        onClick={() => updateAppointmentStatus(apt.id, 'confirmed')}
                        className="flex-1 py-2 bg-success-50 text-success-600 rounded-xl text-xs font-medium flex items-center justify-center gap-1"
                      >
                        确认预约
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={16} className="text-warning-500" />
            <h3 className="text-sm font-medium text-gray-700">到院提醒内容</h3>
          </div>
          <div className="bg-warning-50 rounded-xl p-3 text-sm text-warning-700 space-y-1">
            <p>· 请携带本人身份证原件</p>
            <p>· 面部项目请素颜到院，避免化妆</p>
            <p>· 手术项目请避开经期</p>
            <p>· 请提前15分钟到达前台签到</p>
          </div>
        </div>
      </div>

      {showResultSheet && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowResultSheet(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-5 safe-bottom animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">登记结果</h3>
              <button onClick={() => setShowResultSheet(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <X size={16} className="text-gray-400" />
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setResultType('deal')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1 ${
                  resultType === 'deal' ? 'bg-success-500 text-white' : 'bg-success-50 text-success-600'
                }`}
              >
                <CheckCircle size={16} />
                成交
              </button>
              <button
                onClick={() => setResultType('lost')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1 ${
                  resultType === 'lost' ? 'bg-danger-500 text-white' : 'bg-danger-50 text-danger-500'
                }`}
              >
                <XCircle size={16} />
                流失
              </button>
            </div>

            {resultType === 'deal' ? (
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">成交金额</label>
                  <input
                    type="number"
                    value={dealAmount}
                    onChange={(e) => setDealAmount(e.target.value)}
                    placeholder="请输入成交金额"
                    className="w-full bg-gray-50 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-success-200"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">成交项目</label>
                  <input
                    type="text"
                    value={dealProject}
                    onChange={(e) => setDealProject(e.target.value)}
                    placeholder="请输入成交项目"
                    className="w-full bg-gray-50 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-success-200"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm text-gray-500 mb-1 block">流失原因</label>
                {lostReasons.map((reason) => (
                  <button
                    key={reason}
                    onClick={() => setLostReason(reason)}
                    className={`w-full py-2.5 rounded-xl text-sm text-left px-4 ${
                      lostReason === reason
                        ? 'bg-danger-50 text-danger-600 border border-danger-200'
                        : 'bg-gray-50 text-gray-600'
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={handleSubmitResult}
              className="mt-4 w-full py-3 bg-primary-500 text-white rounded-2xl text-sm font-bold"
            >
              提交
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
