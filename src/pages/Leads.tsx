import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, ChevronRight, UserPlus, Share2, Sparkles, ShoppingBag, Clock } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import type { Lead } from '@/types'

function SwipeableLeadCard({ lead, onAccept, onTransfer }: { lead: Lead; onAccept: (id: string) => void; onTransfer: (id: string) => void }) {
  const [offsetX, setOffsetX] = useState(0)
  const startX = useRef(0)
  const currentX = useRef(0)
  const isDragging = useRef(false)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    currentX.current = 0
    isDragging.current = true
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return
    const diff = e.touches[0].clientX - startX.current
    currentX.current = diff
    setOffsetX(Math.max(-120, Math.min(120, diff)))
  }, [])

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false
    if (currentX.current < -80) {
      onAccept(lead.id)
    } else if (currentX.current > 80) {
      onTransfer(lead.id)
    }
    setOffsetX(0)
  }, [lead.id, onAccept, onTransfer])

  const sourceConfig = {
    xinYang: { label: '新氧', bg: 'bg-primary-100', text: 'text-primary-600', icon: Sparkles },
    meiTuan: { label: '美团', bg: 'bg-warning-100', text: 'text-warning-700', icon: ShoppingBag },
  }

  const config = sourceConfig[lead.source]
  const SourceIcon = config.icon
  const isAccepted = lead.status === 'accepted'
  const isTransferred = lead.status === 'transferred'

  return (
    <div className="relative overflow-hidden rounded-2xl mb-3">
      <div className="absolute inset-y-0 left-0 w-[120px] bg-success-500 flex items-center justify-center z-0">
        <div className="text-center text-white">
          <UserPlus size={24} className="mx-auto mb-1" />
          <span className="text-sm font-medium">接单</span>
        </div>
      </div>
      <div className="absolute inset-y-0 right-0 w-[120px] bg-blue-500 flex items-center justify-center z-0">
        <div className="text-center text-white">
          <Share2 size={24} className="mx-auto mb-1" />
          <span className="text-sm font-medium">转交</span>
        </div>
      </div>
      <div
        className="relative bg-white p-4 z-10 shadow-sm"
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: isDragging.current ? 'none' : 'transform 0.3s ease',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`${config.bg} ${config.text} text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1`}>
              <SourceIcon size={12} />
              {config.label}
            </span>
            {isAccepted && (
              <span className="bg-success-50 text-success-600 text-xs px-2 py-0.5 rounded-full">已接单</span>
            )}
            {isTransferred && (
              <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">已转交</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <Clock size={12} />
            <span className="text-xs">
              {new Date(lead.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
            <span className="text-primary-600 font-medium text-sm">{lead.customerName[0]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium">{lead.customerName}</span>
              <span className="text-xs text-gray-400">{lead.city}</span>
            </div>
            <div className="text-sm text-primary-500 font-medium mt-0.5">{lead.project}</div>
          </div>
        </div>

        <div className="mt-2 bg-gray-50 rounded-xl p-2.5">
          <div className="text-sm text-gray-600 line-clamp-2">{lead.message}</div>
        </div>

        <div className="mt-2 flex items-center gap-1">
          <ShoppingBag size={12} className="text-gray-300" />
          <span className="text-xs text-gray-400">最近浏览: {lead.packageViewed}</span>
        </div>

        {!isAccepted && !isTransferred && (
          <div className="mt-3 text-xs text-gray-300 text-center">
            ← 左滑接单 · 右滑转交 →
          </div>
        )}
      </div>
    </div>
  )
}

export default function Leads() {
  const navigate = useNavigate()
  const leads = useAppStore((s) => s.leads)
  const acceptLead = useAppStore((s) => s.acceptLead)
  const transferLead = useAppStore((s) => s.transferLead)

  const handleAccept = (id: string) => {
    acceptLead(id)
  }

  const handleTransfer = (id: string) => {
    transferLead(id, 'colleague-1')
  }

  const pendingLeads = leads.filter((l) => l.status === 'pending')
  const processedLeads = leads.filter((l) => l.status !== 'pending')

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-primary-500 to-primary-700 px-5 pt-12 pb-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-white text-xl font-bold">新线索</h1>
          <div className="flex items-center gap-2">
            {pendingLeads.length > 0 && (
              <span className="bg-danger-400 text-white text-xs px-2.5 py-1 rounded-full font-display font-bold">
                {pendingLeads.length} 条待处理
              </span>
            )}
          </div>
        </div>
        <p className="text-primary-100 text-sm">新氧私信 · 美团咨询 实时推送</p>
      </div>

      <div className="px-4 -mt-2 space-y-3 pb-4">
        {pendingLeads.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
              <Bell size={14} className="text-danger-400" />
              待处理线索
            </h2>
            {pendingLeads.map((lead) => (
              <SwipeableLeadCard
                key={lead.id}
                lead={lead}
                onAccept={handleAccept}
                onTransfer={handleTransfer}
              />
            ))}
          </div>
        )}

        {processedLeads.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-2">已处理</h2>
            {processedLeads.map((lead) => (
              <SwipeableLeadCard
                key={lead.id}
                lead={lead}
                onAccept={handleAccept}
                onTransfer={handleTransfer}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
