import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarCheck,
  Clock,
  Send,
  CheckCircle,
  XCircle,
  X,
  AlertCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Users,
  BellRing,
  ClipboardList,
} from 'lucide-react'
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
function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr)
  const weekMap = ['日', '一', '二', '三', '四', '五', '六']
  return `${d.getMonth() + 1}月${d.getDate()}日 周${weekMap[d.getDay()]}`
}
function getWeekDays(baseDate: string) {
  const base = new Date(baseDate)
  const dayOfWeek = base.getDay()
  const monday = new Date(base)
  monday.setDate(base.getDate() - ((dayOfWeek + 6) % 7))
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

const statusConfig: Record<AppointmentStatus, { label: string; bg: string; text: string }> = {
  pending: { label: '待确认', bg: 'bg-warning-50', text: 'text-warning-600' },
  confirmed: { label: '已确认', bg: 'bg-blue-50', text: 'text-blue-600' },
  arrived: { label: '已到院', bg: 'bg-primary-50', text: 'text-primary-600' },
  completed: { label: '已完成', bg: 'bg-success-50', text: 'text-success-600' },
  lost: { label: '已流失', bg: 'bg-danger-50', text: 'text-danger-500' },
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
  const todos = useAppStore((s) => s.todos)
  const updateAppointmentStatus = useAppStore((s) => s.updateAppointmentStatus)
  const setAppointmentResult = useAppStore((s) => s.setAppointmentResult)
  const sendReminder = useAppStore((s) => s.sendReminder)

  const [selectedDate, setSelectedDate] = useState(todayStr())
  const [weekBase, setWeekBase] = useState(todayStr())
  const [showResultSheet, setShowResultSheet] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [resultType, setResultType] = useState<'deal' | 'lost'>('deal')
  const [dealAmount, setDealAmount] = useState('')
  const [dealProject, setDealProject] = useState('')
  const [lostReason, setLostReason] = useState('')

  const weekDays = getWeekDays(weekBase)

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

  const pendingFollowUpCount = todos.filter(
    (t) => t.dueTime.startsWith(selectedDate) && !t.completed
  ).length
  const upcomingArrivalCount = mappedAppointments.filter(
    (a) => a.date === selectedDate && (a.status === 'confirmed' || a.status === 'arrived')
  ).length
  const pendingConfirmCount = mappedAppointments.filter(
    (a) => a.date === selectedDate && a.status === 'pending'
  ).length

  const handlePrevDay = () => setSelectedDate(addDays(selectedDate, -1))
  const handleNextDay = () => setSelectedDate(addDays(selectedDate, 1))
  const handlePrevWeek = () => {
    const newBase = addDays(weekBase, -7)
    setWeekBase(newBase)
    setSelectedDate(addDays(selectedDate, -7))
  }
  const handleNextWeek = () => {
    const newBase = addDays(weekBase, 7)
    setWeekBase(newBase)
    setSelectedDate(addDays(selectedDate, 7))
  }
  const handleBackToToday = () => {
    setSelectedDate(todayStr())
    setWeekBase(todayStr())
  }

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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 px-5 pt-12 pb-20 rounded-b-3xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-60 h-60 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -left-10 bottom-0 w-40 h-40 bg-white/5 rounded-full blur-2xl" />

        <div className="relative">
          <h1 className="text-white text-2xl font-bold mb-1">预约工作台</h1>
          <p className="text-primary-100 text-sm mb-6">管理到院预约与成交登记</p>

          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevDay}
              className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/25 transition-all active:scale-95"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex flex-col items-center">
              <span className="text-white/80 text-xs mb-0.5">选中日期</span>
              <span className="text-white font-display font-bold text-lg">
                {formatDateLabel(selectedDate)}
              </span>
            </div>

            <button
              onClick={handleNextDay}
              className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/25 transition-all active:scale-95"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-14 space-y-4 pb-6 relative z-10">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-lg shadow-primary-500/10 border border-white/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-warning-50 flex items-center justify-center">
                <ClipboardList size={16} className="text-warning-500" />
              </div>
              <span className="text-[11px] text-gray-500">待跟进</span>
            </div>
            <div className="font-display font-bold text-2xl text-gray-800">
              {pendingFollowUpCount}
              <span className="text-xs font-normal text-gray-400 ml-1">项</span>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-lg shadow-primary-500/10 border border-white/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center">
                <Users size={16} className="text-primary-500" />
              </div>
              <span className="text-[11px] text-gray-500">即将到院</span>
            </div>
            <div className="font-display font-bold text-2xl text-gray-800">
              {upcomingArrivalCount}
              <span className="text-xs font-normal text-gray-400 ml-1">人</span>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-lg shadow-primary-500/10 border border-white/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                <BellRing size={16} className="text-blue-500" />
              </div>
              <span className="text-[11px] text-gray-500">待确认</span>
            </div>
            <div className="font-display font-bold text-2xl text-gray-800">
              {pendingConfirmCount}
              <span className="text-xs font-normal text-gray-400 ml-1">个</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={handlePrevWeek}
              className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-all active:scale-95"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 font-display">
                {formatDateLabel(selectedDate)}
              </span>
              <button
                onClick={handleBackToToday}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all active:scale-95 ${
                  selectedDate === todayStr()
                    ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/30'
                    : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                }`}
              >
                回到今天
              </button>
            </div>

            <button
              onClick={handleNextWeek}
              className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-all active:scale-95"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            {weekDays.map((d) => (
              <button
                key={d.date}
                onClick={() => setSelectedDate(d.date)}
                className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-xl transition-all relative ${
                  d.date === selectedDate
                    ? 'bg-gradient-to-b from-primary-500 to-primary-600 text-white shadow-md shadow-primary-500/30'
                    : d.isToday
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span
                  className={`text-[10px] ${
                    d.date === selectedDate ? 'text-white/80' : ''
                  }`}
                >
                  {d.weekLabel}
                </span>
                <span
                  className={`font-display font-bold text-sm ${
                    d.isToday && d.date !== selectedDate ? 'text-primary-600' : ''
                  }`}
                >
                  {d.day}
                </span>
                {datesWithAppointments.has(d.date) && (
                  <div
                    className={`w-1.5 h-1.5 rounded-full absolute bottom-1.5 ${
                      d.date === selectedDate ? 'bg-white' : 'bg-primary-400'
                    }`}
                  />
                )}
                {d.isToday && d.date !== selectedDate && (
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary-400" />
                )}
              </button>
            ))}
          </div>
        </div>

        {dayAppointments.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 shadow-sm text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 mx-auto flex items-center justify-center mb-3">
              <CalendarCheck size={28} className="text-gray-300" />
            </div>
            <p className="text-gray-400 text-sm">当日暂无预约</p>
            <p className="text-gray-300 text-xs mt-1">可以添加新的预约安排</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dayAppointments.map((apt) => {
              const sConfig = statusConfig[apt.status]
              return (
                <div
                  key={apt.id}
                  className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/customer/${apt.customerId}`)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">{apt.customerName}</span>
                      <span
                        className={`${sConfig.bg} ${sConfig.text} text-xs px-2 py-0.5 rounded-full font-medium`}
                      >
                        {sConfig.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      <Clock size={12} />
                      <span className="text-xs font-display font-medium">{apt.time}</span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-500 mb-3">{apt.project}</div>

                  {apt.result && (
                    <div
                      className={`mb-3 p-2.5 rounded-xl ${
                        apt.result.type === 'deal' ? 'bg-success-50' : 'bg-danger-50'
                      }`}
                    >
                      {apt.result.type === 'deal' ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle size={16} className="text-success-500" />
                          <span className="text-sm text-success-700 font-medium">
                            成交 ¥{apt.result.amount?.toLocaleString()} · {apt.result.project}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <XCircle size={16} className="text-danger-400" />
                          <span className="text-sm text-danger-600 font-medium">
                            流失: {apt.result.reason}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    {(apt.status === 'confirmed' || apt.status === 'pending') &&
                      !apt.reminderSent && (
                        <button
                          onClick={() => handleSendReminder(apt.id)}
                          className="flex-1 py-2 bg-warning-50 text-warning-600 rounded-xl text-xs font-medium flex items-center justify-center gap-1 hover:bg-warning-100 transition-colors active:scale-[0.98]"
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
                        className="flex-1 py-2 bg-primary-50 text-primary-600 rounded-xl text-xs font-medium flex items-center justify-center gap-1 hover:bg-primary-100 transition-colors active:scale-[0.98]"
                      >
                        <Sparkles size={12} />
                        登记结果
                      </button>
                    )}
                    {apt.status === 'pending' && (
                      <button
                        onClick={() => updateAppointmentStatus(apt.id, 'confirmed')}
                        className="flex-1 py-2 bg-success-50 text-success-600 rounded-xl text-xs font-medium flex items-center justify-center gap-1 hover:bg-success-100 transition-colors active:scale-[0.98]"
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
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-warning-50 flex items-center justify-center">
              <AlertCircle size={16} className="text-warning-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-700">到院提醒内容</h3>
          </div>
          <div className="bg-gradient-to-br from-warning-50 to-warning-100/50 rounded-xl p-3 text-sm text-warning-700 space-y-1.5 border border-warning-100">
            <p className="flex items-start gap-2">
              <span className="text-warning-400 mt-0.5">·</span>
              <span>请携带本人身份证原件</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-warning-400 mt-0.5">·</span>
              <span>面部项目请素颜到院，避免化妆</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-warning-400 mt-0.5">·</span>
              <span>手术项目请避开经期</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-warning-400 mt-0.5">·</span>
              <span>请提前15分钟到达前台签到</span>
            </p>
          </div>
        </div>
      </div>

      {showResultSheet && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowResultSheet(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-5 safe-bottom animate-slide-up shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-800">登记结果</h3>
              <button
                onClick={() => setShowResultSheet(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setResultType('deal')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1 transition-all active:scale-[0.98] ${
                  resultType === 'deal'
                    ? 'bg-success-500 text-white shadow-md shadow-success-500/30'
                    : 'bg-success-50 text-success-600 hover:bg-success-100'
                }`}
              >
                <CheckCircle size={16} />
                成交
              </button>
              <button
                onClick={() => setResultType('lost')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1 transition-all active:scale-[0.98] ${
                  resultType === 'lost'
                    ? 'bg-danger-500 text-white shadow-md shadow-danger-500/30'
                    : 'bg-danger-50 text-danger-500 hover:bg-danger-100'
                }`}
              >
                <XCircle size={16} />
                流失
              </button>
            </div>

            {resultType === 'deal' ? (
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-500 mb-1.5 block">成交金额</label>
                  <input
                    type="number"
                    value={dealAmount}
                    onChange={(e) => setDealAmount(e.target.value)}
                    placeholder="请输入成交金额"
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-success-200 focus:bg-white transition-all border border-transparent focus:border-success-200"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1.5 block">成交项目</label>
                  <input
                    type="text"
                    value={dealProject}
                    onChange={(e) => setDealProject(e.target.value)}
                    placeholder="请输入成交项目"
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-success-200 focus:bg-white transition-all border border-transparent focus:border-success-200"
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
                    className={`w-full py-2.5 rounded-xl text-sm text-left px-4 transition-all active:scale-[0.99] ${
                      lostReason === reason
                        ? 'bg-danger-50 text-danger-600 border border-danger-200 font-medium'
                        : 'bg-gray-50 text-gray-600 border border-transparent hover:bg-gray-100'
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={handleSubmitResult}
              className="mt-5 w-full py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all active:scale-[0.98]"
            >
              提交
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
