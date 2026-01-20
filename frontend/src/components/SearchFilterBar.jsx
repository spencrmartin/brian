import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const SearchFilterBar = ({
  searchQuery,
  onSearchChange,
  filters,
  activeFilter,
  onFilterClick,
  className = '',
  ease = 'power3.easeOut',
  baseColor = '#000000',
  pillColor = '#ffffff',
  hoveredPillTextColor = '#000000',
  pillTextColor = '#000000',
}) => {
  const circleRefs = useRef([])
  const tlRefs = useRef([])
  const activeTweenRefs = useRef([])
  const containerRef = useRef(null)

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle, index) => {
        if (!circle?.parentElement) return

        const pill = circle.parentElement
        const rect = pill.getBoundingClientRect()
        const { width: w, height: h } = rect
        const R = ((w * w) / 4 + h * h) / (2 * h)
        const D = Math.ceil(2 * R) + 2
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1
        const originY = D - delta

        circle.style.width = `${D}px`
        circle.style.height = `${D}px`
        circle.style.bottom = `-${delta}px`

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`
        })

        const label = pill.querySelector('.pill-label')
        const white = pill.querySelector('.pill-label-hover')

        if (label) gsap.set(label, { y: 0 })
        if (white) gsap.set(white, { y: h + 12, opacity: 0 })

        tlRefs.current[index]?.kill()
        const tl = gsap.timeline({ paused: true })

        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: 'auto' }, 0)

        if (label) {
          tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: 'auto' }, 0)
        }

        if (white) {
          gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 })
          tl.to(white, { y: 0, opacity: 1, duration: 2, ease, overwrite: 'auto' }, 0)
        }

        tlRefs.current[index] = tl
      })
    }

    layout()

    const onResize = () => layout()
    window.addEventListener('resize', onResize)

    if (document.fonts?.ready) {
      document.fonts.ready.then(layout).catch(() => {})
    }

    // Initial load animation
    const container = containerRef.current
    if (container) {
      gsap.set(container, { scale: 0.95, opacity: 0 })
      gsap.to(container, {
        scale: 1,
        opacity: 1,
        duration: 0.6,
        ease,
        delay: 0.2
      })
    }

    return () => window.removeEventListener('resize', onResize)
  }, [filters, ease])

  const handleEnter = i => {
    const tl = tlRefs.current[i]
    if (!tl) return
    activeTweenRefs.current[i]?.kill()
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease,
      overwrite: 'auto'
    })
  }

  const handleLeave = i => {
    const tl = tlRefs.current[i]
    if (!tl) return
    activeTweenRefs.current[i]?.kill()
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: 'auto'
    })
  }

  const cssVars = {
    '--base': baseColor,
    '--pill-bg': pillColor,
    '--hover-text': hoveredPillTextColor,
    '--pill-text': pillTextColor,
    '--nav-h': '42px',
    '--pill-pad-x': '16px',
    '--pill-gap': '3px'
  }

  return (
    <div 
      ref={containerRef}
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-40 w-full max-w-4xl px-4 ${className}`}
      style={cssVars}
    >
      <div className="flex flex-col gap-3">
        {/* Search Bar */}
        <div 
          className="rounded-full p-2"
          style={{
            background: 'var(--base)'
          }}
        >
          <Input
            type="search"
            placeholder="Search your knowledge..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="border-0 bg-white rounded-full focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        {/* Filter Pills */}
        {filters && filters.length > 0 && (
          <div 
            className="rounded-full p-[3px] flex items-center justify-center gap-[3px] flex-wrap"
            style={{
              background: 'var(--base)'
            }}
          >
            {filters.map((filter, i) => {
              const isActive = activeFilter === filter.id

              const pillStyle = {
                background: 'var(--pill-bg)',
                color: 'var(--pill-text)',
                paddingLeft: 'var(--pill-pad-x)',
                paddingRight: 'var(--pill-pad-x)'
              }

              return (
                <button
                  key={filter.id ?? 'all'}
                  onClick={() => onFilterClick(filter.id)}
                  className="relative overflow-hidden inline-flex items-center justify-center h-[36px] no-underline rounded-full box-border font-semibold text-[14px] leading-[0] tracking-[0.2px] whitespace-nowrap cursor-pointer"
                  style={pillStyle}
                  aria-label={filter.label}
                  onMouseEnter={() => handleEnter(i)}
                  onMouseLeave={() => handleLeave(i)}
                >
                  <span
                    className="hover-circle absolute left-1/2 bottom-0 rounded-full z-[1] block pointer-events-none"
                    style={{
                      background: 'var(--base)',
                      willChange: 'transform'
                    }}
                    aria-hidden="true"
                    ref={el => {
                      circleRefs.current[i] = el
                    }}
                  />
                  <span className="label-stack relative inline-flex items-center gap-1.5 z-[2]">
                    {filter.icon && <span className="text-base">{filter.icon}</span>}
                    <span
                      className="pill-label relative z-[2] inline-block leading-[1]"
                      style={{ willChange: 'transform' }}
                    >
                      <span className="hidden sm:inline">{filter.label}</span>
                    </span>
                    <span
                      className="pill-label-hover absolute left-0 top-0 z-[3] inline-flex items-center gap-1.5"
                      style={{
                        color: 'var(--hover-text)',
                        willChange: 'transform, opacity'
                      }}
                      aria-hidden="true"
                    >
                      {filter.icon && <span className="text-base">{filter.icon}</span>}
                      <span className="hidden sm:inline">{filter.label}</span>
                    </span>
                  </span>
                  {isActive && (
                    <span
                      className="absolute left-1/2 -bottom-[6px] -translate-x-1/2 w-3 h-3 rounded-full z-[4]"
                      style={{ background: 'var(--base)' }}
                      aria-hidden="true"
                    />
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchFilterBar
