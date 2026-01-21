import { useEffect, useRef } from 'react'
import { useVideoStore } from '../store'
import SbmuUrbanBanner from './SbmuUrbanBanner'
import GsrtcBanner from './GsrtcBanner'

const videoConfigs = [
  { id: 1, component: SbmuUrbanBanner, videoSrc: `${import.meta.env.BASE_URL}videos/SBMU.mp4` },
  { id: 2, component: GsrtcBanner, videoSrc: `${import.meta.env.BASE_URL}videos/GSRTC.mp4` },
]

export default function ArVideoFrame({ onVideoPlaying }) {
  const { activeVideoId, setActiveVideo } = useVideoStore()
  const activeIndex = videoConfigs.findIndex(v => v.id === activeVideoId)
  const ActiveComponent = videoConfigs[activeIndex]?.component || videoConfigs[0].component
  const preloadedVideosRef = useRef(new Map())

  // Preload all videos upfront to prevent blank frames during transitions
  useEffect(() => {
    videoConfigs.forEach((config) => {
      if (!preloadedVideosRef.current.has(config.id)) {
        const preloadVideo = document.createElement('video')
        preloadVideo.src = config.videoSrc
        preloadVideo.preload = 'auto'
        preloadVideo.muted = true
        preloadVideo.playsInline = true
        preloadVideo.load()
        preloadedVideosRef.current.set(config.id, preloadVideo)
      }
    })
  }, [])

  // Swipe functionality to switch between videos
  useEffect(() => {
    let touchStartX = 0
    let touchEndX = 0
    let isSwiping = false

    const goToNextVideo = () => {
      const currentActiveIndex = videoConfigs.findIndex(v => v.id === activeVideoId)
      if (currentActiveIndex < videoConfigs.length - 1) {
        const nextVideoId = videoConfigs[currentActiveIndex + 1].id
        setActiveVideo(nextVideoId)
      }
    }

    const goToPrevVideo = () => {
      const currentActiveIndex = videoConfigs.findIndex(v => v.id === activeVideoId)
      if (currentActiveIndex > 0) {
        const prevVideoId = videoConfigs[currentActiveIndex - 1].id
        setActiveVideo(prevVideoId)
      }
    }

    function handleStart(e) {
      isSwiping = true
      touchStartX = e.touches ? e.touches[0].clientX : e.clientX
      touchEndX = touchStartX
    }

    function handleMove(e) {
      if (!isSwiping) return
      touchEndX = e.touches ? e.touches[0].clientX : e.clientX
    }

    function handleEnd() {
      if (!isSwiping) return
      isSwiping = false

      const deltaX = touchEndX - touchStartX
      const threshold = 40

      if (Math.abs(deltaX) < threshold) {
        return
      }

      if (deltaX < 0) {
        goToNextVideo()
      } else {
        goToPrevVideo()
      }
    }

    // Touch events
    window.addEventListener("touchstart", handleStart, { passive: true })
    window.addEventListener("touchmove", handleMove, { passive: true })
    window.addEventListener("touchend", handleEnd, { passive: true })

    // Mouse events for laptop
    let mouseDown = false
    const handleMouseDown = (e) => {
      mouseDown = true
      handleStart(e)
    }

    const handleMouseMove = (e) => {
      if (mouseDown) {
        handleMove(e)
      }
    }

    const handleMouseUp = () => {
      if (mouseDown) {
        mouseDown = false
        handleEnd()
      }
    }

    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener("touchstart", handleStart)
      window.removeEventListener("touchmove", handleMove)
      window.removeEventListener("touchend", handleEnd)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [activeVideoId, setActiveVideo])

  return <ActiveComponent onVideoPlaying={onVideoPlaying} />
}

