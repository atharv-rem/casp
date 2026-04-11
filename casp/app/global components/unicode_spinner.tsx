"use client"

import { useEffect, useState } from "react"
import spinners from "unicode-animations"

type UnicodeSpinnerProps = {
  name?: keyof typeof spinners
  className?: string
}

export default function UnicodeSpinner({
  name = "orbit",
  className = "font-mono text-[18px] leading-none text-[rgb(150,150,150)]",
}: UnicodeSpinnerProps) {
  const spinner = spinners[name] ?? spinners.orbit
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame((value) => (value + 1) % spinner.frames.length)
    }, spinner.interval)

    return () => clearInterval(timer)
  }, [spinner])

  return <span className={className}>{spinner.frames[frame]}</span>
}
