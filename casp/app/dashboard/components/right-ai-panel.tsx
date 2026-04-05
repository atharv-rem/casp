"use client"

import { AnimatePresence, motion } from "motion/react"
import Image from "next/image"
import ai from "@/public/assets/ai search.svg"
import gemini from "@/public/assets/gemini.svg"
import { useAiPanelStore } from "@/zustand-global-storage"

export function RightAiPanel() {
  const isOpen = useAiPanelStore((state) => state.isAiPanelOpen)

  return (
    <>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.aside
            key="ai-panel"
            initial={{ width: 0, opacity: 0, x: 24 }}
            animate={{ width: 450, opacity: 1, x: 0 }}
            exit={{ width: 0, opacity: 0, x: 24 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="h-full overflow-hidden border-l border-[#efefef]"
          >
            <div className="flex h-full w-full flex-col bg-[#fdfdfd]">
              {/* CENTER CONTENT */}
              <div className="flex flex-1 flex-col items-start justify-center text-center gap-1 px-[20px]">
                <h1 className="text-[30px] leading-[32px] font-kal font-semibold text-left">
                  Chat with AI to <br /> get your tasks done
                </h1>

                <div className="flex items-center justify-center gap-1">
                  <p className="text-[15px] font-kal font-semibold">powered by gemini</p>
                  <Image src={gemini} alt="gemini logo" width={12} height={12} />
                </div>
              </div>

              {/*AI chat */}
              <div className="p-4">
                <div className="flex flex-row items-center justify-start gap-2 rounded-[10px] border border-[#efefef] px-[10px] py-[5px] shadow-md hover:shadow-lg bg-white">
                  <Image src={ai} alt="AI icon" width={18} height={18} />
                  <p className="font-rethink text-[15px] font-semibold">
                    what would you like me do?
                  </p>
                </div>
              </div>

            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
