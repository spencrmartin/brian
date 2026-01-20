import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Button } from '@/components/ui/button'

const PillNav = ({
  logo,
  items,
  activeItem,
  onItemClick,
  secondaryItems = [],
  activeSecondaryItem,
  onSecondaryItemClick,
  rightContent,
  className = '',
  ease = 'power3.easeOut',
  baseColor = '#000000',
  pillColor = '#ffffff',
  hoveredPillTextColor = '#000000',
  pillTextColor = '#ffffff',
  secondaryBaseColor,
  secondaryPillColor,
  secondaryHoveredPillTextColor,
  secondaryPillTextColor,
}) => {
  // Use secondary colors if provided, otherwise fall back to primary colors
  const resolvedSecondaryBaseColor = secondaryBaseColor || baseColor
  const resolvedSecondaryPillColor = secondaryPillColor || pillColor
  const resolvedSecondaryHoveredPillTextColor = secondaryHoveredPillTextColor || hoveredPillTextColor
  const resolvedSecondaryPillTextColor = secondaryPillTextColor || pillTextColor
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const circleRefs = useRef([])
  const tlRefs = useRef([])
  const activeTweenRefs = useRef([])
  const logoRef = useRef(null)
  const hamburgerRef = useRef(null)
  const mobileMenuRef = useRef(null)
  const navItemsRef = useRef(null)
  
  const allItems = [...items, ...secondaryItems]

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

    const menu = mobileMenuRef.current
    if (menu) {
      gsap.set(menu, { visibility: 'hidden', opacity: 0, scaleY: 1, y: 0 })
    }

    // Initial load animation
    const logo = logoRef.current
    const navItems = navItemsRef.current

    if (logo) {
      gsap.set(logo, { scale: 0 })
      gsap.to(logo, {
        scale: 1,
        duration: 0.6,
        ease
      })
    }

    if (navItems) {
      gsap.set(navItems, { width: 0, overflow: 'hidden' })
      gsap.to(navItems, {
        width: 'auto',
        duration: 0.6,
        ease
      })
    }

    return () => window.removeEventListener('resize', onResize)
  }, [allItems, ease])

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

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen
    setIsMobileMenuOpen(newState)

    const hamburger = hamburgerRef.current
    const menu = mobileMenuRef.current

    if (hamburger) {
      const lines = hamburger.querySelectorAll('.hamburger-line')
      if (newState) {
        gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease })
        gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease })
      } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease })
        gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease })
      }
    }

    if (menu) {
      if (newState) {
        gsap.set(menu, { visibility: 'visible' })
        gsap.fromTo(
          menu,
          { opacity: 0, y: 10, scaleY: 1 },
          {
            opacity: 1,
            y: 0,
            scaleY: 1,
            duration: 0.3,
            ease,
            transformOrigin: 'top center'
          }
        )
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: 10,
          scaleY: 1,
          duration: 0.2,
          ease,
          transformOrigin: 'top center',
          onComplete: () => {
            gsap.set(menu, { visibility: 'hidden' })
          }
        })
      }
    }
  }

  const cssVars = {
    '--base': baseColor,
    '--pill-bg': pillColor,
    '--hover-text': hoveredPillTextColor,
    '--pill-text': pillTextColor,
    '--nav-h': '42px',
    '--logo': '36px',
    '--pill-pad-x': '18px',
    '--pill-gap': '3px'
  }

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 ${className}`}>
      <nav
        className="flex items-center justify-between gap-2"
        aria-label="Primary"
        style={cssVars}
      >
        {/* Logo */}
        <div
          ref={logoRef}
          className="rounded-full p-2 inline-flex items-center justify-center overflow-hidden cursor-pointer"
          style={{
            width: 'var(--nav-h)',
            height: 'var(--nav-h)',
            background: 'var(--base)'
          }}
        >
          {logo}
        </div>

        {/* Desktop Nav Items */}
        <div
          ref={navItemsRef}
          className="relative items-center rounded-full hidden md:flex gap-2"
        >
          {/* Main Nav Pills */}
          <div
            className="relative items-center rounded-full flex"
            style={{
              height: 'var(--nav-h)',
              background: 'var(--base)'
            }}
          >
            <ul
              role="menubar"
              className="list-none flex items-stretch m-0 p-[3px] h-full"
              style={{ gap: 'var(--pill-gap)' }}
            >
              {items.map((item, i) => {
              const isActive = activeItem === item.id

              const pillStyle = {
                background: 'var(--pill-bg)',
                color: 'var(--pill-text)',
                paddingLeft: 'var(--pill-pad-x)',
                paddingRight: 'var(--pill-pad-x)'
              }

              return (
                <li key={item.id} role="none" className="flex h-full">
                  <button
                    role="menuitem"
                    onClick={() => onItemClick(item.id)}
                    className="relative overflow-hidden inline-flex items-center justify-center h-full no-underline rounded-full box-border font-light text-[14px] leading-[0] tracking-[0.2px] whitespace-nowrap cursor-pointer"
                    style={pillStyle}
                    aria-label={item.label}
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
                      {item.icon && <span className="text-base">{item.icon}</span>}
                      <span
                        className="pill-label relative z-[2] inline-block leading-[1]"
                        style={{ willChange: 'transform' }}
                      >
                        {item.label}
                      </span>
                      <span
                        className="pill-label-hover absolute left-0 top-0 z-[3] inline-flex items-center gap-1.5"
                        style={{
                          color: 'var(--hover-text)',
                          willChange: 'transform, opacity'
                        }}
                        aria-hidden="true"
                      >
                        {item.icon && <span className="text-base">{item.icon}</span>}
                        {item.label}
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
                </li>
              )
            })}
          </ul>
        </div>

        {/* Secondary Nav Pills (Filters) */}
        {secondaryItems && secondaryItems.length > 0 && (
          <div
            className="relative items-center rounded-full flex"
            style={{
              height: 'var(--nav-h)',
              background: resolvedSecondaryBaseColor
            }}
          >
            <ul
              role="menubar"
              className="list-none flex items-stretch m-0 p-[3px] h-full"
              style={{ gap: 'var(--pill-gap)' }}
            >
              {secondaryItems.map((item, i) => {
                const globalIndex = items.length + i
                const isActive = activeSecondaryItem === item.id

                const pillStyle = {
                  background: resolvedSecondaryPillColor,
                  color: resolvedSecondaryPillTextColor,
                  paddingLeft: 'var(--pill-pad-x)',
                  paddingRight: 'var(--pill-pad-x)'
                }

                return (
                  <li key={item.id ?? 'all'} role="none" className="flex h-full">
                    <button
                      role="menuitem"
                      onClick={() => onSecondaryItemClick && onSecondaryItemClick(item.id)}
                      className="relative overflow-hidden inline-flex items-center justify-center h-full no-underline rounded-full box-border font-light text-[14px] leading-[0] tracking-[0.2px] whitespace-nowrap cursor-pointer"
                      style={pillStyle}
                      aria-label={item.label}
                      onMouseEnter={() => handleEnter(globalIndex)}
                      onMouseLeave={() => handleLeave(globalIndex)}
                    >
                      <span
                        className="hover-circle absolute left-1/2 bottom-0 rounded-full z-[1] block pointer-events-none"
                        style={{
                          background: resolvedSecondaryBaseColor,
                          willChange: 'transform'
                        }}
                        aria-hidden="true"
                        ref={el => {
                          circleRefs.current[globalIndex] = el
                        }}
                      />
                      <span className="label-stack relative inline-flex items-center gap-1.5 z-[2]">
                        {item.icon && <span className="text-base">{item.icon}</span>}
                        <span
                          className="pill-label relative z-[2] inline-block leading-[1]"
                          style={{ willChange: 'transform' }}
                        >
                          <span className="hidden sm:inline">{item.label}</span>
                        </span>
                        <span
                          className="pill-label-hover absolute left-0 top-0 z-[3] inline-flex items-center gap-1.5"
                          style={{
                            color: resolvedSecondaryHoveredPillTextColor,
                            willChange: 'transform, opacity'
                          }}
                          aria-hidden="true"
                        >
                          {item.icon && <span className="text-base">{item.icon}</span>}
                          <span className="hidden sm:inline">{item.label}</span>
                        </span>
                      </span>
                      {isActive && (
                        <span
                          className="absolute left-1/2 -bottom-[6px] -translate-x-1/2 w-3 h-3 rounded-full z-[4]"
                          style={{ background: resolvedSecondaryBaseColor }}
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>

        {/* Right Content (Actions) */}
        {rightContent && (
          <div
            className="rounded-full p-1 hidden md:flex items-center gap-1"
            style={{
              height: 'var(--nav-h)',
              background: 'var(--base)'
            }}
          >
            {rightContent}
          </div>
        )}

        {/* Mobile Hamburger */}
        <button
          ref={hamburgerRef}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
          className="md:hidden rounded-full border-0 flex flex-col items-center justify-center gap-1 cursor-pointer p-0 relative"
          style={{
            width: 'var(--nav-h)',
            height: 'var(--nav-h)',
            background: 'var(--base)'
          }}
        >
          <span
            className="hamburger-line w-4 h-0.5 rounded origin-center"
            style={{ background: 'var(--pill-bg)' }}
          />
          <span
            className="hamburger-line w-4 h-0.5 rounded origin-center"
            style={{ background: 'var(--pill-bg)' }}
          />
        </button>
      </nav>

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        className="md:hidden absolute top-[3em] left-0 right-0 rounded-[27px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] z-[998] origin-top"
        style={{
          background: 'var(--base)'
        }}
      >
        <ul className="list-none m-0 p-[3px] flex flex-col gap-[3px]">
          {items.map(item => (
            <li key={item.id}>
              <button
                onClick={() => {
                  onItemClick(item.id)
                  setIsMobileMenuOpen(false)
                }}
                className="w-full text-left flex items-center gap-2 py-3 px-4 text-[16px] font-medium rounded-[50px] transition-all duration-200"
                style={{
                  background: 'var(--pill-bg)',
                  color: 'var(--pill-text)'
                }}
              >
                {item.icon && <span>{item.icon}</span>}
                {item.label}
              </button>
            </li>
          ))}
          {rightContent && (
            <li className="p-2 flex flex-col gap-2">
              {rightContent}
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}

export default PillNav
