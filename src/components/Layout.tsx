import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { ClipboardList, Bell, User, CalendarCheck, BarChart3 } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

const tabs = [
  { to: '/', icon: ClipboardList, label: '待办' },
  { to: '/leads', icon: Bell, label: '线索' },
  { to: '/appointments', icon: CalendarCheck, label: '预约' },
  { to: '/profile', icon: BarChart3, label: '业绩' },
  { to: '/profile', icon: User, label: '我的' },
]

export default function Layout() {
  const location = useLocation()
  const leads = useAppStore((s) => s.leads)
  const pendingCount = leads.filter((l) => l.status === 'pending').length
  const isCustomerPage = location.pathname.startsWith('/customer')

  return (
    <div className="flex flex-col min-h-screen min-h-[100dvh] bg-primary-50">
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>
      {!isCustomerPage && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 safe-bottom z-50">
          <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
            {tabs.map((tab) => {
              const isActive = tab.to === '/' 
                ? location.pathname === '/' 
                : location.pathname.startsWith(tab.to) && tab.to !== '/'
              return (
                <NavLink
                  key={tab.label + tab.to}
                  to={tab.to}
                  className="flex flex-col items-center justify-center gap-0.5 min-w-[56px] relative"
                >
                  <div className="relative">
                    <tab.icon
                      size={22}
                      className={isActive ? 'text-primary-500' : 'text-gray-400'}
                      strokeWidth={isActive ? 2.2 : 1.8}
                    />
                    {tab.label === '线索' && pendingCount > 0 && (
                      <span className="absolute -top-1.5 -right-2.5 bg-danger-400 text-white text-[10px] font-display font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                        {pendingCount}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] ${
                      isActive ? 'text-primary-500 font-medium' : 'text-gray-400'
                    }`}
                  >
                    {tab.label}
                  </span>
                </NavLink>
              )
            })}
          </div>
        </nav>
      )}
    </div>
  )
}
