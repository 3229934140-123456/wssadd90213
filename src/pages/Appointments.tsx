import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarPlus,
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
  Plus,
} from 'lucide-react'
import { useAppStore, todayStr, addDays, formatDateLabel, getWeekDays, mapMockAppointments, mapMockTodos } from '@/store/useAppStore'
import type { Appointment, AppointmentStatus } from '@/types'

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
  const customers = useAppStore((s) => s.customers)
  const selectedDate = useAppStore((s) => s.ui.selectedAppointmentDate)
  const setSelectedDate = useAppStore((s) => s.setSelectedAppointmentDate)
  const updateAppointmentStatus = useAppStore((s) => s.updateAppointmentStatus)
  const setAppointmentResult = useAppStore((s) => s.setAppointmentResult)
  const sendReminder = useAppStore((s) => s.sendReminder)
  const addAppointment = useAppStore((s) => s.addAppointment)

  const [weekBase, setWeekBase] = useState(todayStr())
  const [showResultSheet, setShowResultSheet] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [resultType, setResultType] = useState<'deal' | 'lost'>('deal')
  const [dealAmount, setDealAmount] = useState('')
  const [dealProject, setDealProject] = useState('')
  const [lostReason, setLostReason] = useState('')
  const [showNewSheet, setShowNewSheet] = useState(false)
  const [newCustomerId, setNewCustomerId] = useState('')
  const [newProject, setNewProject] = useState('')
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('09:00')
  const [newStatus, setNewStatus] = useState<AppointmentStatus>('pending')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'wechat' | 'alipay' | 'card' | 'medical_insurance' | 'other'>('wechat')
  const [paymentType, setPaymentType] = useState<'deposit' | 'full'>('full')
  const [note, setNote] = useState('')

  const weekDays = getWeekDays(weekBase)

  const mappedAppointments = mapMockAppointments(appointments)
  const mappedTodos = mapMockTodos(todos)

  const dayAppointments = mappedAppointments.filter((a) => a.date === selectedDate)
  const datesWithAppointments = new Set(mappedAppointments.map((a) => a.date))

  const pendingFollowUpCount = mappedTodos.filter(
    (t) => t.dueTime.startsWith(selectedDate) && !t.completed
  ).length
  const upcomingArrivalCount = mappedAppointments.filter(
    (a) => a.date === selectedDate && (a.status === 'confirmed' || a.status === 'arrived')
  ).length
  const pendingConfirmCount = mappedAppointments.filter(
    (a) => a.date === selectedDate && a.status === 'pending'
  ).length

  const weekStats = weekDays.map((day) => {
    const dayPendingTodos = mappedTodos.filter(
      (t) => t.dueTime.startsWith(day.date) && !t.completed
    ).length
    const dayArrivals = mappedAppointments.filter(
      (a) => a.date === day.date && (a.status === 'confirmed' || a.status === 'arrived')
    ).length
    const dayPending = mappedAppointments.filter(
      (a) => a.date === day.date && a.status === 'pending'
    ).length
    return {
      ...day,
      pendingTodos: dayPendingTodos,
      arrivals: dayArrivals,
      pendingConfirm: dayPending,
    }
  })

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

  const handleOpenNewSheet = () => {
    const selectedCustomer = customers.find((c) => c.id === newCustomerId)
    setNewCustomerId(customers[0]?.id || '')
    setNewProject(selectedCustomer?.project || customers[0]?.project || '')
    setNewDate(selectedDate)
    setNewTime('09:00')
    setNewStatus('pending')
    setShowNewSheet(true)
  }

  const handleCustomerChange = (customerId: string) => {
    setNewCustomerId(customerId)
    const customer = customers.find((c) => c.id === customerId)
    if (customer) {
      setNewProject(customer.project)
    }
  }

  const handleSubmitNewAppointment = () => {
    if (!newCustomerId || !newProject || !newDate || !newTime) return

    const customer = customers.find((c) => c.id === newCustomerId)
    if (!customer) return

    addAppointment({
      customerId: newCustomerId,
      customerName: customer.nickname,
      project: newProject,
      date: newDate,
      time: newTime,
      status: newStatus,
    })

    setShowNewSheet(false)
    setSelectedDate(newDate)
    setWeekBase(newDate)
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
    setPaymentMethod('wechat')
    setPaymentType('full')
    setNote('')
    setShowResultSheet(true)
  }

  const handleSubmitResult = () => {
    if (!selectedAppointment) return
    if (resultType === 'deal') {
      setAppointmentResult(selectedAppointment.id, {
        type: 'deal',
        amount: Number(dealAmount) || 0,
        project: dealProject || selectedAppointment.project,
        paymentMethod,
        paymentType,
        note,
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
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-white text-2xl font-bold">预约工作台</h1>
            <button
              onClick={handleOpenNewSheet}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/60 text-white text-sm font-medium hover:bg-white/15 transition-all active:scale-95 backdrop-blur-sm"
            >
              <Plus size={16} />
              新预约
            </button>
          </div>
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

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-800">本周日程总览</h2>
            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              周一至周日
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {weekStats.map((day) => (
              <button
                key={day.date}
                onClick={() => setSelectedDate(day.date)}
                className={`flex-shrink-0 flex flex-col items-center py-3 px-3 rounded-2xl shadow-sm transition-all relative min-w-[72px] flex-1 ${
                  day.date === selectedDate
                    ? 'bg-primary-50 border-2 border-primary-500 shadow-primary-500/20'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                {day.isToday && (
                  <div className="absolute top-1.5 left-1.5">
                    <span className="text-[9px] bg-primary-500 text-white px-1.5 py-0.5 rounded-full font-medium">
                      今
                    </span>
                  </div>
                )}
                <span
                  className={`text-xs font-medium mb-1 ${
                    day.isToday ? 'text-primary-600 font-bold' : 'text-gray-500'
                  }`}
                >
                  周{day.weekLabel}
                </span>
                <div className="font-display font-bold text-2xl text-gray-800 mb-1">
                  {day.pendingTodos}
                </div>
                <div className="text-[10px] text-gray-400">到院 {day.arrivals} 人</div>
                <div className="text-[10px] text-gray-400">待确认 {day.pendingConfirm} 个</div>
              </button>
            ))}
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
            <div className="w-16 h-16 rounded-2xl bg-primary-50 mx-auto flex items-center justify-center mb-3">
              <CalendarPlus size={28} className="text-primary-500" />
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">当天暂无预约</p>
            <p className="text-gray-400 text-xs mb-4">点击下方按钮新建一个预约</p>
            <button
              onClick={handleOpenNewSheet}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl text-sm font-medium shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all active:scale-95"
            >
              <Plus size={16} />
              新建一个
            </button>
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
                <div>
                  <label className="text-sm text-gray-500 mb-1.5 block">付款方式</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: '现金', value: 'cash' },
                      { label: '微信', value: 'wechat' },
                      { label: '支付宝', value: 'alipay' },
                      { label: '刷卡', value: 'card' },
                      { label: '医保', value: 'medical_insurance' },
                      { label: '其他', value: 'other' },
                    ].map((item) => (
                      <button
                        key={item.value}
                        onClick={() => setPaymentMethod(item.value as 'cash' | 'wechat' | 'alipay' | 'card' | 'medical_insurance' | 'other')}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
                          paymentMethod === item.value
                            ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/30'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1.5 block">付款类型</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPaymentType('deposit')}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-98 ${
                        paymentType === 'deposit'
                          ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/30'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      定金
                    </button>
                    <button
                      onClick={() => setPaymentType('full')}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-98 ${
                        paymentType === 'full'
                          ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/30'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      全款
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1.5 block">备注</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="填写备注信息（可选）"
                    rows={3}
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-success-200 focus:bg-white transition-all border border-transparent focus:border-success-200 resize-none"
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

      {showNewSheet && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowNewSheet(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-5 safe-bottom animate-slide-up shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-800">新建预约</h3>
              <button
                onClick={() => setShowNewSheet(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="text-sm text-gray-500 mb-1.5 block">选择顾客</label>
                <select
                  value={newCustomerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-200 focus:bg-white transition-all border border-transparent focus:border-primary-200 appearance-none"
                >
                  <option value="">请选择顾客</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.nickname} · {customer.project}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-500 mb-1.5 block">项目</label>
                <input
                  type="text"
                  value={newProject}
                  onChange={(e) => setNewProject(e.target.value)}
                  placeholder="请输入项目名称"
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-200 focus:bg-white transition-all border border-transparent focus:border-primary-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-500 mb-1.5 block">日期</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-200 focus:bg-white transition-all border border-transparent focus:border-primary-200"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1.5 block">时间</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-200 focus:bg-white transition-all border border-transparent focus:border-primary-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-500 mb-1.5 block">确认状态</label>
                <div className="flex gap-2">
                  {[
                    { value: 'pending', label: '待确认', bgActive: 'bg-warning-500', bgInactive: 'bg-warning-50', textActive: 'text-white', textInactive: 'text-warning-600' },
                    { value: 'confirmed', label: '已确认', bgActive: 'bg-blue-500', bgInactive: 'bg-blue-50', textActive: 'text-white', textInactive: 'text-blue-600' },
                    { value: 'arrived', label: '已到院', bgActive: 'bg-primary-500', bgInactive: 'bg-primary-50', textActive: 'text-white', textInactive: 'text-primary-600' },
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() => setNewStatus(item.value as AppointmentStatus)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 ${
                        newStatus === item.value
                          ? `${item.bgActive} ${item.textActive} shadow-sm`
                          : `${item.bgInactive} ${item.textInactive} hover:opacity-80`
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmitNewAppointment}
              disabled={!newCustomerId || !newProject || !newDate || !newTime}
              className="mt-5 w-full py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              保存预约
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
