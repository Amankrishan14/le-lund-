import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import './styles.css'

export default function SwipeInstruction({ videoPlaying }) {
  const [show, setShow] = useState(false)
  const popupRef = useRef(null)
  const showTimerRef = useRef(null)
  const hideTimerRef = useRef(null)
  const hasStartedFade = useRef(false)
  const previousVideoPlayingRef = useRef(false)

  // Handle manual close
  const handleClose = () => {
    if (popupRef.current) {
      hasStartedFade.current = true
      // Clear any pending timers
      if (showTimerRef.current) {
        clearTimeout(showTimerRef.current)
        showTimerRef.current = null
      }
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
        hideTimerRef.current = null
      }
      gsap.to(popupRef.current, {
        opacity: 0,
        y: -10,
        scale: 0.95,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          setShow(false)
        }
      })
    }
  }

  // Handle video playing state changes
  useEffect(() => {
    // Reset when video starts playing (new video)
    if (videoPlaying && !previousVideoPlayingRef.current) {
      // New video started - reset everything
      hasStartedFade.current = false
      setShow(false)
      
      // Clear any existing timers
      if (showTimerRef.current) {
        clearTimeout(showTimerRef.current)
        showTimerRef.current = null
      }
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
        hideTimerRef.current = null
      }

      // Show after 3 seconds
      showTimerRef.current = setTimeout(() => {
        if (!hasStartedFade.current) {
          setShow(true)
        }
      }, 3000) // 3 seconds after video starts
    }

    previousVideoPlayingRef.current = videoPlaying

    return () => {
      if (showTimerRef.current) {
        clearTimeout(showTimerRef.current)
      }
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
      }
    }
  }, [videoPlaying])

  // Handle showing the instruction
  useEffect(() => {
    if (!popupRef.current || !show) return

    // Reset fade state when showing
    hasStartedFade.current = false

    // Fade in with bounce
    gsap.fromTo(popupRef.current,
      {
        opacity: 0,
        y: 20,
        scale: 0.9,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        ease: 'back.out(1.7)',
      }
    )

    // Auto-hide after 4 seconds of being visible
    hideTimerRef.current = setTimeout(() => {
      if (!hasStartedFade.current && popupRef.current) {
        hasStartedFade.current = true
        gsap.to(popupRef.current, {
          opacity: 0,
          y: -10,
          scale: 0.95,
          duration: 0.5,
          ease: 'power2.in',
          onComplete: () => {
            setShow(false)
          }
        })
      }
    }, 4000) // 4 seconds visible

    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
      }
    }
  }, [show])

  if (!show) return null

  return (
    <div ref={popupRef} className="swipe-instruction">
      <div className="swipe-instruction-content">
        <span className="swipe-instruction-text">Swipe → to see the next video</span>
      </div>
    </div>
  )
}


