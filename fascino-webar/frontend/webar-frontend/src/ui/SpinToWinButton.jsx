import { useEffect, useState } from 'react'
import "./spin-to-win.css"

export default function SpinToWinButton({ onClick, swipeInstructionFaded }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (swipeInstructionFaded && !show) {
      // Show button EXACTLY 1 second after swipe instruction fades out
      // Total timing: 3s (show) + 4s (visible) + 0.4s (fade) + 1s (delay) = 8.4s
      const timer = setTimeout(() => {
        setShow(true)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [swipeInstructionFaded, show])

  return (
    <button 
      className={`spin-to-win-btn ${show ? 'show' : ''}`}
      onClick={onClick}
    >
      <div className="spin-to-win-btn-content">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#F4D37C" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
          <circle cx="12" cy="12" r="2.5" fill="#F4D37C"/>
          <path d="M12 5v2M12 17v2M5 12H7M17 12h2M7.76 7.76l1.41 1.41M14.83 14.83l1.41 1.41M7.76 16.24l1.41-1.41M14.83 9.17l1.41-1.41" stroke="#F4D37C" strokeWidth="1.4"/>
        </svg>
        <span className="spin-to-win-btn-text">Spin to Win</span>
      </div>
    </button>
  )
}


