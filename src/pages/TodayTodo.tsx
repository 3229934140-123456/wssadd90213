import { useNavigate } from 'react-router-dom'
import { Phone, MessageCircle, Clock, AlertTriangle, CheckCircle2, ChevronRight, Bell, CalendarCheck, Users, ChevronLeft, ChevronRight as ChevronRightIcon, ListTodo } from 'lucide-react'
import { useAppStore, todayStr, addDays, formatDateLabel, mapMockTodos, mapMockAppointments } from '@/store/useAppStore'

export default function TodayTodo() {
  const navigate = useNavigate()
  const leads = useAppStore((s) => s.leads)
  const todos = useAppStore((s) => s.todos)
  const appointments = useAppStore((s) => s.appointments)
  const toggleTodo = useAppStore((s) => s.toggleTodo)
  const selectedDate = useAppStore((s) => s.ui.selectedTodoDate)
  const setSelectedDate = useAppStore((s) => s.setSelectedTodoDate)

  const today = todayStr()
  const mappedTodos = mapMockTodos(todos)
  const mappedAppointments = mapMockAppointments(appointments)

  const pendingLeads = leads.filter((l) => l.status === 'pending')
  const selectedAppointments = mappedAppointments.filter((a) => a.date === selectedDate)
  const selectedArrivals = selectedAppointments.filter((a) => a.status === 'confirmed' || a.status === 'arrived')
  const selectedPendingTodos = mappedTodos.filter(t => !t.completed && t.dueTime.startsWith(selectedDate))
  const isToday = selectedDate === today
  const overdueTodos = isToday
    ? selectedPendingTodos.filter((t) => new Date(t.dueTime) < new Date())
    : []

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

  const handlePrevDay = () => {
    setSelectedDate(addDays(selectedDate, -1))
  }

  const handleNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1))
  }

  const handleGoToday = () => {
    if (!isToday) {
      setSelectedDate(todayStr())
      alert('已回到今天')
    }
  }

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-primary-500 to-primary-700 px-5 pt-12 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-white text-xl font-bold">今日待办</h1>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Bell size={20} className="text-white" />
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mb-5">
          <button
            onClick={handlePrevDay}
            className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center active:bg-white/25"
          >
            <ChevronLeft size={20} className="text-white" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleGoToday}
              className="text-white text-lg font-bold"
            >
              {formatDateLabel(selectedDate)}
            </button>
            {!isToday && (
              <button
                onClick={handleGoToday}
                className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full"
              >
                回到今天
              </button>
            )}
          </div>
          <button
            onClick={handleNextDay}
            className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center active:bg-white/25"
          >
            <ChevronRightIcon size={20} className="text-white" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 text-center">
            <div className={`font-display text-2xl font-bold ${pendingLeads.length === 0 ? 'text-white/40' : 'text-white'}`}>{pendingLeads.length}</div>
            <div className="text-primary-100 text-xs mt-0.5">新线索</div>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 text-center">
            <div className="font-display text-2xl font-bold text-white">{selectedAppointments.length}</div>
            <div className="text-primary-100 text-xs mt-0.5">预约数</div>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 text-center">
            <div className="font-display text-2xl font-bold text-white">{selectedPendingTodos.length}</div>
            <div className="text-primary-100 text-xs mt-0.5">待跟进</div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-2 space-y-4 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-success-500" />
            <h2 className="font-medium text-gray-800">即将到院区</h2>
          </div>
          {selectedArrivals.length > 0 ? (
            selectedArrivals.map((apt) => (
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
            ))
          ) : (
            <p className="text-sm text-gray-400 text-center py-2">今天没有即将到院的顾客</p>
          )}
        </div>

        {isToday ? (
          overdueTodos.length > 0 && (
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
                      {todo.purpose ? (
                        <>
                          <p className="font-medium text-gray-900 mt-1">{todo.purpose}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{todo.content}</p>
                        </>
                      ) : (
                        <p className="text-sm text-gray-500 mt-1">{todo.content}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/customer/${todo.customerId}?action=call`)
                        }}
                      >
                        <Phone size={14} className="text-primary-500" />
                      </button>
                      <button
                        className="w-8 h-8 rounded-full bg-success-50 flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/customer/${todo.customerId}?action=chat`)
                        }}
                      >
                        <MessageCircle size={14} className="text-success-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-gray-400" />
              <h2 className="font-medium text-gray-800">超时预警</h2>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
              <p className="text-sm text-gray-400">未来日期不判定超时</p>
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={16} className="text-primary-500" />
            <h2 className="font-medium text-gray-800">待办事项</h2>
          </div>
          {selectedPendingTodos.length > 0 ? (
            <div className="space-y-2">
              {selectedPendingTodos.map((todo) => {
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
                        {todo.purpose ? (
                          <>
                            <p className="font-medium text-gray-900 mt-1">{todo.purpose}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{todo.content}</p>
                          </>
                        ) : (
                          <p className="text-sm text-gray-500 mt-1">{todo.content}</p>
                        )}
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
          ) : (
            <div className="bg-gradient-to-br from-primary-50 to-white rounded-2xl p-6 text-center border border-primary-100">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary-100 flex items-center justify-center">
                <ListTodo size={24} className="text-primary-500" />
              </div>
              <p className="text-gray-800 font-medium mb-1">今天暂无待跟进事项</p>
              <p className="text-sm text-gray-400 mb-4">可以去顾客列表设置新的跟进计划</p>
              <button
                onClick={() => navigate('/appointments')}
                className="bg-primary-500 text-white px-5 py-2 rounded-xl text-sm font-medium active:bg-primary-600 transition"
              >
                去顾客列表设置跟进 →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
