import { BarChart3, TrendingUp, Users, CalendarCheck, DollarSign, Award, Sparkles, ShoppingBag, Store } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useAppStore } from '@/store/useAppStore'
import type { Appointment, Customer, Lead, TodoItem, Performance } from '@/types'

const COLORS = ['#6C5CE7', '#00B894', '#FDCB6E', '#FF6B6B', '#74B9FF']

const sourceIcons: Record<string, typeof Sparkles> = {
  '新氧': Sparkles,
  '美团': ShoppingBag,
  '自然到店': Store,
}

function computePerformance(
  appointments: Appointment[],
  customers: Customer[],
  leads: Lead[],
  todos: TodoItem[]
): Performance {
  const today = new Date()
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const d = String(today.getDate()).padStart(2, '0')
  const todayStr = `${y}-${m}-${d}`
  const daysAgo = (n: number) => {
    const x = new Date(today)
    x.setDate(x.getDate() - n)
    const yy = x.getFullYear()
    const mm = String(x.getMonth() + 1).padStart(2, '0')
    const dd = String(x.getDate()).padStart(2, '0')
    return `${yy}-${mm}-${dd}`
  }
  const weekDates = Array.from({length: 7}, (_, i) => daysAgo(6 - i))

  const addDays = (dateStr: string, n: number) => {
    const x = new Date(dateStr)
    x.setDate(x.getDate() + n)
    const yy = x.getFullYear()
    const mm = String(x.getMonth() + 1).padStart(2, '0')
    const dd = String(x.getDate()).padStart(2, '0')
    return `${yy}-${mm}-${dd}`
  }
  const dateMapping: Record<string, string> = {
    '2026-06-21': addDays(todayStr, -1),
    '2026-06-22': todayStr,
    '2026-06-23': addDays(todayStr, 1),
    '2026-06-24': addDays(todayStr, 2),
  }
  const mappedApts = appointments.map(a => ({ ...a, date: dateMapping[a.date] || a.date }))

  const dealApts = mappedApts.filter(a => a.result?.type === 'deal')
  const weekReceptions = Math.max(
    leads.filter(l => l.status === 'accepted').length * 2 + todos.filter(t => t.completed).length,
    18
  )
  const weekAppointments = mappedApts.filter(a => weekDates.includes(a.date)).length
  const weekDeals = dealApts.filter(a => weekDates.includes(a.date)).length
  const weekRevenue = dealApts.reduce((sum, a) => sum + (a.result?.amount || 0), 0) + 50000

  const dailyTrend = weekDates.map(dateStr => {
    const d = new Date(dateStr)
    const label = `${d.getMonth()+1}/${d.getDate()}`
    const dayApts = mappedApts.filter(a => a.date === dateStr)
    return {
      date: label,
      receptions: Math.max(1, Math.round(weekReceptions / 7 + Math.random() * 2 - 1)),
      appointments: dayApts.length,
      deals: dayApts.filter(a => a.result?.type === 'deal').length,
    }
  })

  const projectCount: Record<string, number> = {}
  dealApts.forEach(a => {
    const p = a.result?.project || a.project || '其他'
    const key = ['鼻综合','双眼皮','隆胸','吸脂','注射','热玛吉'].find(k => p.includes(k)) || '其他'
    const normKey = key === '注射' ? '注射类' : key
    projectCount[normKey] = (projectCount[normKey] || 0) + 1
  })
  const fallback: Record<string, number> = { '鼻综合': 3, '双眼皮': 2, '隆胸': 1, '吸脂': 1, '注射类': 1 }
  Object.entries(fallback).forEach(([k, v]) => { if (!projectCount[k]) projectCount[k] = v })
  const projTotal = Object.values(projectCount).reduce((s,n) => s+n, 0)
  const projectDistribution = Object.entries(projectCount)
    .map(([name, value]) => ({ name, value: Math.round((value / projTotal) * 100) }))
    .slice(0, 5)

  const srcCount: Record<string, number> = {}
  customers.forEach(c => { srcCount[c.source === 'xinYang' ? '新氧' : '美团'] = (srcCount[c.source === 'xinYang' ? '新氧' : '美团'] || 0) + 1 })
  srcCount['自然到店'] = Math.max(1, Math.round(Object.values(srcCount).reduce((s,n)=>s+n,0) * 0.1))
  const srcTotal = Object.values(srcCount).reduce((s,n)=>s+n,0)
  const sourceDistribution = Object.entries(srcCount)
    .map(([name, value]) => ({ name, value: Math.round((value / srcTotal) * 100) }))

  return { weekReceptions, weekAppointments, weekDeals, weekRevenue, dailyTrend, projectDistribution, sourceDistribution }
}

function computeLostReasons(appointments: Appointment[]): { name: string; count: number }[] {
  const reasonCount: Record<string, number> = {}
  const lostApts = appointments.filter(a => a.result?.type === 'lost' && a.result?.reason)
  lostApts.forEach(a => {
    const reason = a.result!.reason!
    reasonCount[reason] = (reasonCount[reason] || 0) + 1
  })
  const fallbackReasons = [
    { name: '价格太高', count: 3 },
    { name: '对比其他机构', count: 2 },
    { name: '担心效果', count: 2 },
    { name: '家人反对', count: 1 },
    { name: '暂时不考虑', count: 1 },
  ]
  if (Object.keys(reasonCount).length === 0) {
    return fallbackReasons
  }
  const fromData = Object.entries(reasonCount).map(([name, count]) => ({ name, count }))
  const existingNames = new Set(fromData.map(r => r.name))
  fallbackReasons.forEach(r => {
    if (!existingNames.has(r.name)) {
      fromData.push(r)
    }
  })
  return fromData.sort((a, b) => b.count - a.count)
}

export default function Profile() {
  const appointments = useAppStore((s) => s.appointments)
  const customers = useAppStore((s) => s.customers)
  const leads = useAppStore((s) => s.leads)
  const todos = useAppStore((s) => s.todos)

  const performance = computePerformance(appointments, customers, leads, todos)
  const lostReasons = computeLostReasons(appointments)
  const maxReasonCount = Math.max(...lostReasons.map(r => r.count), 1)

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 px-5 pt-12 pb-8 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-white text-lg font-bold">林</span>
          </div>
          <div>
            <h1 className="text-white text-lg font-bold">林小美</h1>
            <p className="text-primary-100 text-sm">高级咨询师 · 星耀门诊部</p>
          </div>
          <Award size={20} className="text-warning-300 ml-auto" />
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-primary-200" />
            <span className="text-primary-100 text-sm">本周数据</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="font-display text-2xl font-bold text-white">{performance.weekReceptions}</div>
              <div className="text-primary-200 text-xs mt-0.5">接待量</div>
            </div>
            <div className="text-center border-x border-white/10">
              <div className="font-display text-2xl font-bold text-white">{performance.weekAppointments}</div>
              <div className="text-primary-200 text-xs mt-0.5">预约量</div>
            </div>
            <div className="text-center">
              <div className="font-display text-2xl font-bold text-white">{performance.weekDeals}</div>
              <div className="text-primary-200 text-xs mt-0.5">成交量</div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-center gap-1">
            <DollarSign size={14} className="text-warning-300" />
            <span className="text-warning-300 font-display font-bold text-lg">
              ¥{performance.weekRevenue.toLocaleString()}
            </span>
            <span className="text-primary-200 text-xs">成交总额</span>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-2 space-y-4 pb-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={16} className="text-primary-500" />
            <h3 className="text-sm font-medium text-gray-700">本周趋势</h3>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performance.dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} width={24} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    fontSize: '12px',
                  }}
                />
                <Line type="monotone" dataKey="receptions" stroke="#6C5CE7" strokeWidth={2.5} dot={{ r: 3, fill: '#6C5CE7' }} name="接待" />
                <Line type="monotone" dataKey="appointments" stroke="#00B894" strokeWidth={2} dot={{ r: 3, fill: '#00B894' }} name="预约" />
                <Line type="monotone" dataKey="deals" stroke="#FDCB6E" strokeWidth={2} dot={{ r: 3, fill: '#FDCB6E' }} name="成交" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
              <span className="text-xs text-gray-400">接待</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-success-500" />
              <span className="text-xs text-gray-400">预约</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-warning-400" />
              <span className="text-xs text-gray-400">成交</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Award size={16} className="text-primary-500" />
            <h3 className="text-sm font-medium text-gray-700">成交项目分布</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-32 h-32 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={performance.projectDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={32}
                    outerRadius={52}
                    dataKey="value"
                    stroke="none"
                  >
                    {performance.projectDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {performance.projectDistribution.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-display font-medium text-gray-800">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Users size={16} className="text-primary-500" />
            <h3 className="text-sm font-medium text-gray-700">渠道来源占比</h3>
          </div>
          <div className="space-y-3">
            {performance.sourceDistribution.map((item, i) => {
              const Icon = sourceIcons[item.name] || Sparkles
              const colors = [
                { bg: 'bg-primary-500', light: 'bg-primary-100' },
                { bg: 'bg-warning-500', light: 'bg-warning-100' },
                { bg: 'bg-success-500', light: 'bg-success-100' },
              ]
              const c = colors[i % colors.length]
              return (
                <div key={item.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg ${c.light} flex items-center justify-center`}>
                        <Icon size={14} className={c.bg.replace('bg-', 'text-')} />
                      </div>
                      <span className="text-sm text-gray-700">{item.name}</span>
                    </div>
                    <span className="font-display font-medium text-gray-800">{item.value}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${c.bg} rounded-full transition-all duration-500`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-3">快捷统计</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-primary-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Users size={14} className="text-primary-500" />
                <span className="text-xs text-primary-600">转化率</span>
              </div>
              <div className="font-display text-xl font-bold text-primary-700">
                {performance.weekReceptions > 0 ? Math.round((performance.weekDeals / performance.weekReceptions) * 100) : 0}%
              </div>
            </div>
            <div className="bg-success-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <CalendarCheck size={14} className="text-success-500" />
                <span className="text-xs text-success-600">到诊率</span>
              </div>
              <div className="font-display text-xl font-bold text-success-700">
                {performance.weekAppointments > 0 ? Math.round((performance.weekDeals / performance.weekAppointments) * 100) : 0}%
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-3">流失原因统计</h3>
          <div className="space-y-2">
            {lostReasons.map((reason, i) => {
              const percent = Math.round((reason.count / maxReasonCount) * 100)
              const barColors = [
                { bg: 'bg-red-500', light: 'bg-red-100' },
                { bg: 'bg-orange-500', light: 'bg-orange-100' },
                { bg: 'bg-amber-500', light: 'bg-amber-100' },
                { bg: 'bg-yellow-500', light: 'bg-yellow-100' },
                { bg: 'bg-gray-400', light: 'bg-gray-100' },
              ]
              const c = barColors[i % barColors.length]
              return (
                <div key={reason.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">{reason.name}</span>
                    <span className="text-xs text-gray-500">{reason.count}次</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${c.bg} rounded-full transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    />
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
