import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { contentItems } from '../data/mockData'
import { supabase } from '../lib/supabaseClient'
import ContentCard from './ContentCard'
import CreativesModal from './CreativesModal'
import BookInsightVariantModal from './BookInsightVariantModal'
import ShareFlow from './ShareFlow'
import RenewalShareFlow from './RenewalShareFlow'
import BonusAnnouncementShareFlow from './BonusAnnouncementShareFlow'
import RenewalPreviewModal from './RenewalPreviewModal'

const CATEGORIES = ['All', 'Quiz', 'Calculator', 'Game', 'Mood', 'Festive', 'Occasion', 'Interactive Game', 'Read', 'Reminder']
const LANGUAGES = ['EN', 'HI', 'MR', 'TE', 'TA', 'ML']

export default function ContentView() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeLanguage, setActiveLanguage] = useState(null)
  const [creativeItem, setCreativeItem] = useState(null)
  const [shareItem, setShareItem] = useState(null)
  const [renewalShareItem, setRenewalShareItem] = useState(null)
  const [bonusShareItem, setBonusShareItem] = useState(null)
  const [renewalPreviewOpen, setRenewalPreviewOpen] = useState(false)
  const [bookInsightVariantOpen, setBookInsightVariantOpen] = useState(false)
  const [activeCustomer, setActiveCustomer] = useState(null)
  const [firstCustomer, setFirstCustomer] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()

  const customerId = searchParams.get('customerId')

  // Fetch the context customer from Supabase whenever the URL param changes
  useEffect(() => {
    if (!customerId) { setActiveCustomer(null); return }
    supabase
      .from('customers')
      .select('id, name, policy_number, policy_type, persona, product_name')
      .eq('id', customerId)
      .single()
      .then(({ data }) => setActiveCustomer(data ?? null))
  }, [customerId])

  // Preload first available customer for the Renewal Reminder "Try it" preview
  useEffect(() => {
    supabase
      .from('customers')
      .select('id, name, policy_number, issue_date, due_date')
      .limit(1)
      .single()
      .then(({ data }) => setFirstCustomer(data ?? null))
  }, [])

  function clearCustomerContext() { setSearchParams({}) }

  function handleTryIt(item) {
    if (item.demoType === 'creative') {
      setCreativeItem(item)
    } else if (item.demoType === 'renewal-card') {
      setRenewalPreviewOpen(true)
    } else if (item.trialOnly) {
      window.open(`/preview/${item.id}`, '_blank')
    } else if (item.previewSrc) {
      window.open(item.previewSrc, '_blank')
    } else {
      window.open(`/preview/${item.id}`, '_blank')
    }
  }

  function handleShare(item) {
    if (item.id === 'bonus-announcement') {
      setBonusShareItem(item)
      return
    }
    if (item.id === 'book-insight') {
      setBookInsightVariantOpen(true)
      return
    }
    setShareItem(item)
  }

  const filtered = contentItems.filter(item => {
    const catOk = activeCategory === 'All' || item.category === activeCategory
    const langOk = !activeLanguage || item.languages.includes(activeLanguage)
    const visible = !item.hiddenFromGallery
    return catOk && langOk && visible
  })

  return (
    <>
      {/* Customer context banner */}
      {activeCustomer && (
        <div className="sticky top-[60px] z-40 bg-[#e8a020] px-4 md:px-6 py-2 flex items-center gap-1.5">
          <span className="text-[#0f1f3d]/70 text-xs font-medium">Sharing with</span>
          <span className="text-[#0f1f3d] font-bold text-xs">{activeCustomer.name}</span>
          <button
            onClick={clearCustomerContext}
            className="ml-auto text-[#0f1f3d]/60 hover:text-[#0f1f3d] transition-colors text-sm font-bold leading-none"
            aria-label="Clear customer context"
          >
            ✕
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">

        <div className="mb-5">
          <h2 className="text-2xl font-bold text-[#0f1f3d]">Content View</h2>
          <p className="text-gray-500 text-sm mt-0.5">Try it out or share with a customer</p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-3" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                activeCategory === cat
                  ? 'bg-[#0f1f3d] text-white border-[#0f1f3d]'
                  : 'bg-white text-gray-600 border-[#e4e7f0] hover:border-[#0f1f3d]/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {LANGUAGES.map(lang => (
            <button
              key={lang}
              onClick={() => setActiveLanguage(activeLanguage === lang ? null : lang)}
              className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                activeLanguage === lang
                  ? 'bg-[#e8a020] text-white border-[#e8a020]'
                  : 'bg-white text-gray-500 border-[#e4e7f0] hover:border-[#e8a020]/50'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-400 mb-4">
          {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
          {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
          {activeLanguage ? ` · ${activeLanguage}` : ''}
        </p>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(item => (
              <ContentCard
                key={item.id}
                item={item}
                onTryIt={handleTryIt}
                onShare={item.demoType === 'renewal-card' ? setRenewalShareItem : handleShare}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <span className="text-5xl mb-3">🔍</span>
            <p className="text-sm">No content matches these filters.</p>
            <button
              onClick={() => { setActiveCategory('All'); setActiveLanguage(null) }}
              className="mt-3 text-[#0f1f3d] text-sm font-medium underline underline-offset-2"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {creativeItem && (
        <CreativesModal
          item={creativeItem}
          onClose={() => setCreativeItem(null)}
        />
      )}

      {shareItem && (
        <ShareFlow
          item={shareItem}
          onClose={() => setShareItem(null)}
          preselectedCustomer={activeCustomer}
        />
      )}

      {renewalShareItem && (
        <RenewalShareFlow
          item={renewalShareItem}
          onClose={() => setRenewalShareItem(null)}
        />
      )}

      {bonusShareItem && (
        <BonusAnnouncementShareFlow
          item={bonusShareItem}
          onClose={() => setBonusShareItem(null)}
          preselectedCustomer={activeCustomer}
        />
      )}

      {renewalPreviewOpen && (
        <RenewalPreviewModal
          customer={firstCustomer}
          onClose={() => setRenewalPreviewOpen(false)}
        />
      )}

      {bookInsightVariantOpen && (
        <BookInsightVariantModal
          items={contentItems.filter(item => item.id === 'book-insight' || item.id === 'book-insight-2')}
          onSelect={(item) => {
            setShareItem(item)
            setBookInsightVariantOpen(false)
          }}
          onClose={() => setBookInsightVariantOpen(false)}
        />
      )}
    </>
  )
}
