import { useNavigate } from 'react-router-dom'
import { Phone, MessageCircle, Clock, AlertTriangle, CheckCircle2, ChevronRight, Bell, CalendarCheck, Users } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

export default function TodayTodo() {
  const navigate = useNavigate()
  const leads = useAppStore((s) => s.leads)
  const todos = useAppStore((s) => s.todos)
  const appointments = useAppStore((s) => s.appointments)
  const toggleTodo = useAppStore((s) => s.toggleTodo)

  const pendingLeads = leads.filter((l) => l.status === 'pending')
  const todayAppointments = appointments.filter((a) => a.date === '2026-06-22')
  const todayArrivals = todayAppointments.filter((a) => a.status === 'confirmed' || a.status === 'arrived')
  const pendingTodos = todos.filter((t) => !t.completed)
  const overdueTodos = pendingTodos.filter((t) => new Date(t.dueTime) < new Date())

  const priorityConfig = {
    high: { color: 'bg-danger-400', label: '紧急', textColor: 'text-danger-500' },
    medium: { color: 'bg-warning-400', label: '一般', textColor: 'text-warning-600' },
    low: { color: 'bg-success-400', label: '低', textColor: 'text-success-600' },
  }

  const typeConfig = {
    followUp: { icon: MessageCircle, label: '跟进' },
    appointment: { icon: CalendarCheck, label: '预约' },
    reminder: { icon: Bell, label: '提醒' },
  }

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-primary-500 to-primary-700 px-5 pt-12 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-white text-xl font-bold">今日待办</h1>
            <p className="text-primary-100 text-sm mt-0.5">6月22日 周一</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Bell size={20} className="text-white" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 text-center">
            <div className="font-display text-2xl font-bold text-white">{pendingLeads.length}</div>
            <div className="text-primary-100 text-xs mt-0.5">新线索</div>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 text-center">
            <div className="font-display text-2xl font-bold text-white">{todayAppointments.length}</div>
            <div className="text-primary-100 text-xs mt-0.5">今日预约</div>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 text-center">
            <div className="font-display text-2xl font-bold text-white">{pendingTodos.length}</div>
            <div className="text-primary-100 text-xs mt-0.5">待跟进</div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-2 space-y-4 pb-4">
        {todayArrivals.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-success-500" />
              <h2 className="font-medium text-gray-800">即将到院</h2>
            </div>
            {todayArrivals.map((apt) => (
              <div
                key={apt.id}
                className="bg-white rounded-2xl p-4 border-l-4 border-success-400 mb-2 shadow-sm"
                onClick={() => navigate(`/customer/${apt.customerId}`)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{apt.customerName}</span>
                      <span className="text-xs bg-success-50 text-success-600 px-2 py-0.5 rounded-full">
                        {apt.time} 到院
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{apt.project}</div>
                  </div>
                  <ChevronRight size={16} className="text-gray-300" />
                </div>
              </div>
            ))}
          </div>
        )}

        {overdueTodos.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-danger-400" />
              <h2 className="font-medium text-gray-800">超时预警</h2>
              <span className="text-xs bg-danger-50 text-danger-500 px-2 py-0.5 rounded-full">
                {overdueTodos.length}
              </span>
            </div>
            {overdueTodos.map((todo) => (
              <div
                key={todo.id}
                className="bg-white rounded-2xl p-4 border-l-4 border-danger-400 mb-2 shadow-sm"
                onClick={() => navigate(`/customer/${todo.customerId}`)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{todo.customerName}</span>
                      <span className="text-xs bg-danger-50 text-danger-500 px-2 py-0.5 rounded-full">
                        已超时
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{todo.content}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center"
                      onClick={(e) => { e.stopPropagation(); }}
                    >
                      <Phone size={14} className="text-primary-500" />
                    </button>
                    <button
                      className="w-8 h-8 rounded-full bg-success-50 flex items-center justify-center"
                      onClick={(e) => { e.stopPropagation(); }}
                    >
                      <MessageCircle size={14} className="text-success-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={16} className="text-primary-500" />
            <h2 className="font-medium text-gray-800">待办事项</h2>
          </div>
          <div className="space-y-2">
            {pendingTodos.map((todo) => {
              const pConfig = priorityConfig[todo.priority]
              const tConfig = typeConfig[todo.type]
              const TypeIcon = tConfig.icon
              return (
                <div
                  key={todo.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm"
                  onClick={() => navigate(`/customer/${todo.customerId}`)}
                >
                  <div className="flex items-stretch">
                    <div className={`w-1 ${pConfig.color}`} />
                    <div className="flex-1 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TypeIcon size={14} className="text-gray-400" />
                          <span className="font-medium text-sm">{todo.customerName}</span>
                          <span className={`text-[10px] ${pConfig.textColor}`}>
                            {pConfig.label}
                          </span>
                        </div>
                        <button
                          className="w-6 h-6 rounded-full border-2 border-gray-200 flex items-center justify-center"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleTodo(todo.id)
                          }}
                        >
                          <div className="w-3 h-3 rounded-full bg-transparent" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{todo.content}</p>
                      <div className="flex items-center gap-1 mt-1.5">
                        <Clock size={12} className="text-gray-300" />
                        <span className="text-xs text-gray-400">
                          {new Date(todo.dueTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
