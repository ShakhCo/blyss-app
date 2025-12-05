import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { cn } from "~/lib/utils"

interface Tab {
  id: string
  label: string
}

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  tabs: Tab[]
  activeTab?: string
  onTabChange?: (tabId: string) => void
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, tabs, activeTab, onTabChange, ...props }, ref) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
    const [activeIndex, setActiveIndex] = useState(0)
    const [hoverStyle, setHoverStyle] = useState({})
    const tabRefs = useRef<(HTMLDivElement | null)[]>([])
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (hoveredIndex !== null) {
        const hoveredElement = tabRefs.current[hoveredIndex]
        if (hoveredElement) {
          const { offsetLeft, offsetWidth } = hoveredElement
          setHoverStyle({
            left: `${offsetLeft}px`,
            width: `${offsetWidth}px`,
          })
        }
      }
    }, [hoveredIndex])

    useEffect(() => {
      const activeElement = tabRefs.current[activeIndex]
      if (activeElement) {
        // Scroll the active tab to the left
        scrollContainerRef.current?.scrollTo({
          left: activeElement.offsetLeft - 16,
          behavior: "smooth",
        })
      }
    }, [activeIndex])

    return (
      <div
        ref={ref}
        className={cn("relative w-full", className)}
        {...props}
      >
        <div
          ref={scrollContainerRef}
          className="relative overflow-x-auto scrollbar-hide"
        >
          {/* Hover Highlight */}
          <div
            className="absolute h-full transition-all duration-300 ease-out bg-[#0e0f1114] dark:bg-[#ffffff1a] rounded-[6px] flex items-center"
            style={{
              ...hoverStyle,
              opacity: hoveredIndex !== null ? 1 : 0,
            }}
          />

          {/* Tabs */}
          <div className="relative flex items-center justify-between">
            {tabs.map((tab, index) => (
              <div
                key={tab.id}
                ref={(el) => { tabRefs.current[index] = el }}
                className={cn(
                  "min-w-[100px] flex-shrink-0 px-3 py-2 cursor-pointer transition-all duration-300 border-b-2",
                  index === activeIndex
                    ? "text-[#0e0e10] dark:text-white border-[#0e0f11] dark:border-white"
                    : "text-[#0e0f1199] dark:text-[#ffffff99] border-transparent"
                )}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => {
                  setActiveIndex(index)
                  onTabChange?.(tab.id)
                }}
              >
                <div className="text-sm font-medium whitespace-nowrap flex items-center justify-center h-full">
                  {tab.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
)
Tabs.displayName = "Tabs"

export { Tabs }