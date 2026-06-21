import { BarChart3, TrendingUp, Users, CalendarCheck, DollarSign, Award, Sparkles, ShoppingBag, Store } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useAppStore } from '@/store/useAppStore'

const COLORS = ['#6C5CE7', '#00B894', '#FDCB6E', '#FF6B6B', '#74B9FF']

const sourceIcons: Record<string, typeof Sparkles> = {
  '新氧': Sparkles,
  '美团': ShoppingBag,
  '自然到店': Store,
}

export default function Profile() {
  const performance = useAppStore((s) => s.performance)

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
      </div>
    </div>
  )
}
