import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft, Phone, MessageCircle, FileText, ImagePlus, Clock,
  Sparkles, ShoppingBag, ChevronRight, Send, Calendar, X,
  Image as ImageIcon
} from 'lucide-react'
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

const sampleCaseImages = [
  {
    url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=medical%20beauty%20nose%20augmentation%20before%20after%20comparison%20front%20view%20clean%20clinical%20photo&image_size=square',
    label: '鼻综合 · 正面对比'
  },
  {
    url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=medical%20beauty%20nose%20augmentation%20before%20after%20comparison%20side%20view%20clinical&image_size=square',
    label: '鼻综合 · 侧面对比'
  },
  {
    url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=medical%20beauty%20double%20eyelid%20before%20after%20comparison%20close%20up%20clinical&image_size=square',
    label: '双眼皮 · 术后30天'
  },
  {
    url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=medical%20beauty%20breast%20augmentation%20before%20after%20comparison%20clinical%20photo&image_size=square',
    label: '隆胸 · 傲诺拉闪耀'
  },
  {
    url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=medical%20beauty%20liposuction%20thigh%20before%20after%20comparison%20clinical&image_size=square',
    label: '大腿环吸 · 术后2月'
  },
  {
    url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=medical%20beauty%20facial%20rejuvenation%20thermage%20before%20after%20comparison&image_size=square',
    label: '热玛吉 · 全脸提升'
  },
]

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('zh-CN', {
    month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const customers = useAppStore((s) => s.customers)
  const followUpRecords = useAppStore((s) => s.followUpRecords)
  const caseImages = useAppStore((s) => s.caseImages)
  const updateCustomerStage = useAppStore((s) => s.updateCustomerStage)
  const addFollowUpRecord = useAppStore((s) => s.addFollowUpRecord)
  const setNextFollowUp = useAppStore((s) => s.setNextFollowUp)
  const addCaseImage = useAppStore((s) => s.addCaseImage)

  const [newRecord, setNewRecord] = useState('')
  const [recordType, setRecordType] = useState<FollowUpType>('note')
  const [showFollowUpPanel, setShowFollowUpPanel] = useState(false)
  const [followUpPurpose, setFollowUpPurpose] = useState('')

  const quickPurposes = [
    '确认面诊时间', '报价回访', '案例发送跟进', '决策期跟进',
    '术前准备告知', '术后回访', '发送优惠活动', '意向确认'
  ]

  const [showNoteAfterCall, setShowNoteAfterCall] = useState(false)
  const [callNote, setCallNote] = useState('')

  const [showChat, setShowChat] = useState(false)
  const [chatInput, setChatInput] = useState('')

  const [showCasePicker, setShowCasePicker] = useState(false)
  const [selectedCase, setSelectedCase] = useState<typeof sampleCaseImages[0] | null>(null)
  const [caseNote, setCaseNote] = useState('')

  const customer = customers.find((c) => c.id === id)
  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        顾客不存在
      </div>
    )
  }

  const records = followUpRecords.filter((r) => r.customerId === id).slice().reverse()
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
    setNextFollowUp(id!, nextTime.toISOString(), followUpPurpose)
    setShowFollowUpPanel(false)
    setFollowUpPurpose('')
  }

  const handlePhoneClick = () => {
    window.location.href = `tel:${customer.phone.replace(/\*/g, '0')}`
    setTimeout(() => setShowNoteAfterCall(true), 500)
  }

  const handleSubmitCallNote = () => {
    if (!callNote.trim()) return
    addFollowUpRecord({
      customerId: id!,
      type: 'phone',
      content: callNote.trim(),
    })
    setCallNote('')
    setShowNoteAfterCall(false)
  }

  const handleSendChat = () => {
    if (!chatInput.trim()) return
    addFollowUpRecord({
      customerId: id!,
      type: 'message',
      content: `已发送私信：「${chatInput.trim()}」`,
    })
    setChatInput('')
    setShowChat(false)
  }

  const handleSelectCase = (item: typeof sampleCaseImages[0]) => {
    setSelectedCase(item)
    setCaseNote(item.label)
  }

  const handleConfirmSendCase = () => {
    if (!selectedCase) return
    addCaseImage({
      customerId: id!,
      url: selectedCase.url,
      note: caseNote.trim() || selectedCase.label,
    })
    setSelectedCase(null)
    setCaseNote('')
    setShowCasePicker(false)
  }

  const currentStageIndex = STAGE_ORDER.indexOf(customer.stage)

  useEffect(() => {
    const action = searchParams.get('action')
    const timer = setTimeout(() => {
      if (action === 'call') handlePhoneClick()
      else if (action === 'chat') setShowChat(true)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchParams])

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

      <div className="px-4 -mt-2 space-y-4 pb-28">
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

          <div className="space-y-3 mb-3 max-h-72 overflow-y-auto">
            {records.length === 0 && (
              <p className="text-sm text-gray-300 text-center py-4">暂无沟通记录，点击底部按钮开始联系</p>
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
                        {formatTime(record.createdAt)}
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
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {images.map((img) => (
                <div key={img.id} className="aspect-square rounded-xl bg-gray-100 overflow-hidden relative group">
                  <img src={img.url} alt={img.note} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 p-2 flex flex-col justify-end">
                    <div className="text-white text-[10px] font-medium leading-tight line-clamp-2">{img.note}</div>
                    <div className="text-white/70 text-[9px] mt-0.5">{formatTime(img.sentAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => setShowCasePicker(true)}
            className={`w-full rounded-xl border-2 border-dashed flex items-center justify-center gap-2 text-sm transition-all ${
              images.length > 0
                ? 'border-gray-200 text-gray-400 py-2 hover:border-primary-300 hover:text-primary-500'
                : 'border-gray-200 text-gray-300 py-8 hover:border-primary-300 hover:text-primary-400 flex-col'
            }`}
          >
            <ImagePlus size={20} />
            <span>{images.length > 0 ? '发送新案例' : '选择案例图发送给顾客'}</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
              二次跟进
              {customer.nextFollowUp && customer.nextFollowUpPurpose && (
                <span className="text-xs text-gray-400 font-normal">· {customer.nextFollowUpPurpose}</span>
              )}
            </h3>
            {customer.nextFollowUp && (
              <span className="text-xs text-primary-500 flex items-center gap-1">
                <Clock size={12} />
                {formatTime(customer.nextFollowUp)}
              </span>
            )}
          </div>
          {!showFollowUpPanel ? (
            <button
              onClick={() => setShowFollowUpPanel(true)}
              className="w-full py-2.5 bg-primary-50 text-primary-600 rounded-xl text-sm font-medium flex items-center justify-center gap-1"
            >
              <Calendar size={14} />
              设置跟进时间 →
            </button>
          ) : (
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-xl p-3 space-y-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">跟进目的</label>
                  <input
                    type="text"
                    value={followUpPurpose}
                    onChange={(e) => setFollowUpPurpose(e.target.value)}
                    placeholder="这次跟进要做什么"
                    className="w-full bg-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-200 border border-gray-100"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {quickPurposes.map((p) => (
                    <button
                      key={p}
                      onClick={() => setFollowUpPurpose(p)}
                      className={`px-2.5 py-1 rounded-full text-[11px] transition-all ${
                        followUpPurpose === p
                          ? 'bg-primary-500 text-white'
                          : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300 hover:text-primary-500'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                {[2, 4, 8, 24, 48].map((h) => (
                  <button
                    key={h}
                    onClick={() => handleSetFollowUp(h)}
                    className="flex-1 py-2 bg-primary-50 text-primary-600 rounded-xl text-xs font-medium hover:bg-primary-100 transition-colors"
                  >
                    {h < 24 ? `${h}小时后` : `${h / 24}天后`}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 safe-bottom z-40">
        <div className="flex gap-3 max-w-lg mx-auto">
          <button
            onClick={handlePhoneClick}
            className="flex-1 py-2.5 bg-blue-500 text-white rounded-2xl text-sm font-medium flex items-center justify-center gap-2 active:bg-blue-600 transition"
          >
            <Phone size={16} />
            电话联系
          </button>
          <button
            onClick={() => setShowChat(true)}
            className="flex-1 py-2.5 bg-success-500 text-white rounded-2xl text-sm font-medium flex items-center justify-center gap-2 active:bg-success-600 transition"
          >
            <MessageCircle size={16} />
            私信联系
          </button>
        </div>
      </div>

      {showNoteAfterCall && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowNoteAfterCall(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-5 safe-bottom">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">补记通话内容</h3>
              <button onClick={() => setShowNoteAfterCall(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <X size={16} className="text-gray-400" />
              </button>
            </div>
            <textarea
              value={callNote}
              onChange={(e) => setCallNote(e.target.value)}
              rows={4}
              placeholder="记录刚才电话沟通的关键信息..."
              className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-200 resize-none"
            />
            <button
              onClick={handleSubmitCallNote}
              className="mt-3 w-full py-3 bg-blue-500 text-white rounded-2xl text-sm font-bold"
            >
              保存通话记录
            </button>
          </div>
        </div>
      )}

      {showChat && (
        <div className="fixed inset-0 z-50 bg-primary-50 flex flex-col">
          <div className="bg-gradient-to-br from-success-500 to-success-600 px-4 pt-12 pb-4 flex items-center gap-3">
            <button onClick={() => setShowChat(false)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <ArrowLeft size={18} className="text-white" />
            </button>
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-white font-medium">{customer.nickname[0]}</span>
            </div>
            <div className="flex-1">
              <div className="text-white font-medium">{customer.nickname}</div>
              <div className="text-white/70 text-xs">来自{config.label}</div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {records.filter(r => r.type === 'message').map((r) => (
              <div key={r.id} className="flex justify-end">
                <div className="max-w-[75%] bg-success-500 text-white text-sm rounded-2xl rounded-br-sm px-3 py-2">
                  {r.content.replace(/^已发送私信：[「"]|[」"]$/g, '')}
                </div>
              </div>
            ))}
            <div className="flex justify-start">
              <div className="max-w-[75%] bg-white text-gray-700 text-sm rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm">
                您好，请问您咨询的{customer.project}还有什么疑问吗？
              </div>
            </div>
          </div>

          <div className="bg-white border-t border-gray-100 p-3 safe-bottom">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                placeholder="输入私信内容..."
                className="flex-1 bg-gray-50 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-success-200"
                autoFocus
              />
              <button
                onClick={handleSendChat}
                className="w-10 h-10 bg-success-500 rounded-xl flex items-center justify-center"
              >
                <Send size={16} className="text-white" />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-2">
              发送后将自动记入沟通时间线
            </p>
          </div>
        </div>
      )}

      {showCasePicker && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          <div className="bg-gradient-to-br from-primary-500 to-primary-700 px-4 pt-12 pb-4 flex items-center gap-3">
            <button onClick={() => { setShowCasePicker(false); setSelectedCase(null); setCaseNote('') }} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <ArrowLeft size={18} className="text-white" />
            </button>
            <h2 className="text-white font-bold text-lg flex-1">选择医生案例</h2>
          </div>

          {!selectedCase ? (
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-sm text-gray-500 mb-3">从图库选择一张案例图发送给顾客</p>
              <div className="grid grid-cols-2 gap-3">
                {sampleCaseImages.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectCase(item)}
                    className="relative rounded-2xl overflow-hidden aspect-square shadow-sm"
                  >
                    <img src={item.url} alt={item.label} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <div className="text-white text-xs font-medium">{item.label}</div>
                    </div>
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full border-2 border-white/80" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4">
              <button
                onClick={() => setSelectedCase(null)}
                className="text-xs text-primary-500 mb-3 flex items-center gap-1"
              >
                <ChevronRight size={12} className="rotate-180" />
                返回图库
              </button>
              <div className="rounded-2xl overflow-hidden aspect-square mb-4">
                <img src={selectedCase.url} alt={selectedCase.label} className="w-full h-full object-cover" />
              </div>
              <label className="text-sm text-gray-500 mb-1 block">备注（顾客可见）</label>
              <textarea
                value={caseNote}
                onChange={(e) => setCaseNote(e.target.value)}
                rows={2}
                placeholder="填写案例说明..."
                className="w-full bg-gray-50 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-200 resize-none"
              />
            </div>
          )}

          <div className="border-t border-gray-100 p-4 safe-bottom">
            <button
              onClick={handleConfirmSendCase}
              disabled={!selectedCase}
              className="w-full py-3 bg-primary-500 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 disabled:bg-gray-200 disabled:text-gray-400"
            >
              <ImageIcon size={16} />
              发送给{customer.nickname}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
