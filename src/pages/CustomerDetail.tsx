import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Phone, MessageCircle, FileText, ImagePlus, Clock, Plus, Sparkles, ShoppingBag, ChevronRight, Send, Calendar } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { STAGE_ORDER } from '@/types'
import type { FollowUpType, CustomerStage } from '@/types'

const stageIcons: Record<CustomerStage, string> = {
  '初问价': '💰',
  '看案例': '📋',
  '约面诊': '📅',
  '已到院': '🏥',
}

const followUpIcons: Record<FollowUpType, typeof Phone> = {
  phone: Phone,
  message: MessageCircle,
  note: FileText,
}

const followUpLabels: Record<FollowUpType, string> = {
  phone: '电话',
  message: '私信',
  note: '备注',
}

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const customers = useAppStore((s) => s.customers)
  const followUpRecords = useAppStore((s) => s.followUpRecords)
  const caseImages = useAppStore((s) => s.caseImages)
  const updateCustomerStage = useAppStore((s) => s.updateCustomerStage)
  const addFollowUpRecord = useAppStore((s) => s.addFollowUpRecord)
  const setNextFollowUp = useAppStore((s) => s.setNextFollowUp)
  const addCaseImage = useAppStore((s) => s.addCaseImage)

  const [newRecord, setNewRecord] = useState('')
  const [recordType, setRecordType] = useState<FollowUpType>('note')
  const [showFollowUpPicker, setShowFollowUpPicker] = useState(false)

  const customer = customers.find((c) => c.id === id)
  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        顾客不存在
      </div>
    )
  }

  const records = followUpRecords.filter((r) => r.customerId === id)
  const images = caseImages.filter((i) => i.customerId === id)

  const sourceConfig = {
    xinYang: { label: '新氧', bg: 'bg-primary-100', text: 'text-primary-600', icon: Sparkles },
    meiTuan: { label: '美团', bg: 'bg-warning-100', text: 'text-warning-700', icon: ShoppingBag },
  }

  const config = sourceConfig[customer.source]
  const SourceIcon = config.icon

  const handleAddRecord = () => {
    if (!newRecord.trim()) return
    addFollowUpRecord({
      customerId: id!,
      type: recordType,
      content: newRecord.trim(),
    })
    setNewRecord('')
  }

  const handleStageClick = (stage: CustomerStage) => {
    updateCustomerStage(id!, stage)
  }

  const handleSetFollowUp = (hours: number) => {
    const nextTime = new Date()
    nextTime.setHours(nextTime.getHours() + hours)
    setNextFollowUp(id!, nextTime.toISOString())
    setShowFollowUpPicker(false)
  }

  const currentStageIndex = STAGE_ORDER.indexOf(customer.stage)

  return (
    <div className="min-h-screen bg-primary-50">
      <div className="bg-gradient-to-br from-primary-500 to-primary-700 px-4 pt-12 pb-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <h1 className="text-white font-bold text-lg flex-1">{customer.nickname}</h1>
          <span className={`${config.bg} ${config.text} text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1`}>
            <SourceIcon size={12} />
            {config.label}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-white text-xl font-bold">{customer.nickname[0]}</span>
          </div>
          <div>
            <div className="text-white font-medium">{customer.city} · {customer.project}</div>
            <div className="text-primary-100 text-sm">{customer.phone}</div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-2 space-y-4 pb-24">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-3">最近浏览套餐</h3>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {customer.packagesViewed.map((pkg, i) => (
              <span key={i} className="flex-shrink-0 bg-primary-50 text-primary-600 text-xs px-3 py-1.5 rounded-full">
                {pkg}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-3">当前阶段</h3>
          <div className="flex items-center justify-between">
            {STAGE_ORDER.map((stage, i) => (
              <button
                key={stage}
                onClick={() => handleStageClick(stage)}
                className="flex flex-col items-center gap-1.5 flex-1"
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all ${
                    i < currentStageIndex
                      ? 'bg-success-400 text-white'
                      : i === currentStageIndex
                      ? 'bg-primary-500 text-white ring-4 ring-primary-100'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {i < currentStageIndex ? '✓' : stageIcons[stage]}
                </div>
                <span
                  className={`text-[11px] ${
                    i <= currentStageIndex ? 'text-gray-800 font-medium' : 'text-gray-400'
                  }`}
                >
                  {stage}
                </span>
              </button>
            ))}
          </div>
          {currentStageIndex < STAGE_ORDER.length - 1 && (
            <button
              onClick={() => handleStageClick(STAGE_ORDER[currentStageIndex + 1])}
              className="mt-3 w-full py-2 bg-primary-50 text-primary-600 rounded-xl text-sm font-medium flex items-center justify-center gap-1"
            >
              <ChevronRight size={14} />
              推进到「{STAGE_ORDER[currentStageIndex + 1]}」
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500">沟通记录</h3>
            <div className="flex gap-1">
              {(['note', 'phone', 'message'] as FollowUpType[]).map((type) => {
                const Icon = followUpIcons[type]
                return (
                  <button
                    key={type}
                    onClick={() => setRecordType(type)}
                    className={`px-2 py-1 rounded-lg text-xs flex items-center gap-1 ${
                      recordType === type
                        ? 'bg-primary-100 text-primary-600'
                        : 'bg-gray-50 text-gray-400'
                    }`}
                  >
                    <Icon size={12} />
                    {followUpLabels[type]}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-3 mb-3">
            {records.length === 0 && (
              <p className="text-sm text-gray-300 text-center py-4">暂无沟通记录</p>
            )}
            {records.map((record, i) => {
              const Icon = followUpIcons[record.type]
              return (
                <div key={record.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      record.type === 'phone' ? 'bg-blue-50 text-blue-500' :
                      record.type === 'message' ? 'bg-success-50 text-success-500' :
                      'bg-gray-50 text-gray-400'
                    }`}>
                      <Icon size={13} />
                    </div>
                    {i < records.length - 1 && <div className="w-px flex-1 bg-gray-100 mt-1" />}
                  </div>
                  <div className="flex-1 pb-3">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs text-gray-400">
                        {followUpLabels[record.type]}
                      </span>
                      <span className="text-xs text-gray-300">
                        {new Date(record.createdAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{record.content}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newRecord}
              onChange={(e) => setNewRecord(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddRecord()}
              placeholder="补记沟通结果..."
              className="flex-1 bg-gray-50 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-200"
            />
            <button
              onClick={handleAddRecord}
              className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center"
            >
              <Send size={16} className="text-white" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-3">案例发送</h3>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {images.map((img) => (
              <div key={img.id} className="aspect-square rounded-xl bg-gray-100 overflow-hidden relative">
                <img src={img.url} alt={img.note} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[10px] p-1 truncate">
                  {img.note}
                </div>
              </div>
            ))}
            <button
              onClick={() => {
                addCaseImage({
                  customerId: id!,
                  url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=medical%20beauty%20before%20after%20comparison%20photo%20clean%20clinical&image_size=square',
                  note: '新发送案例',
                })
              }}
              className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-300 hover:border-primary-300 hover:text-primary-400"
            >
              <ImagePlus size={20} />
              <span className="text-[10px]">上传</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500">二次跟进</h3>
            {customer.nextFollowUp && (
              <span className="text-xs text-primary-500 flex items-center gap-1">
                <Clock size={12} />
                {new Date(customer.nextFollowUp).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          {!showFollowUpPicker ? (
            <button
              onClick={() => setShowFollowUpPicker(true)}
              className="w-full py-2.5 bg-primary-50 text-primary-600 rounded-xl text-sm font-medium flex items-center justify-center gap-1"
            >
              <Calendar size={14} />
              设置跟进时间
            </button>
          ) : (
            <div className="flex gap-2">
              {[2, 4, 8, 24, 48].map((h) => (
                <button
                  key={h}
                  onClick={() => handleSetFollowUp(h)}
                  className="flex-1 py-2 bg-primary-50 text-primary-600 rounded-xl text-xs font-medium"
                >
                  {h < 24 ? `${h}小时后` : `${h / 24}天后`}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 safe-bottom z-50">
        <div className="flex gap-3 max-w-lg mx-auto">
          <button className="flex-1 py-2.5 bg-blue-500 text-white rounded-2xl text-sm font-medium flex items-center justify-center gap-2">
            <Phone size={16} />
            电话联系
          </button>
          <button className="flex-1 py-2.5 bg-success-500 text-white rounded-2xl text-sm font-medium flex items-center justify-center gap-2">
            <MessageCircle size={16} />
            私信联系
          </button>
        </div>
      </div>
    </div>
  )
}
