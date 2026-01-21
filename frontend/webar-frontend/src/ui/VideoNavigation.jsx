import { useMemo } from 'react'
import { useVideoStore } from '../store'
import './video-navigation.css'

// Video configs - must match ArVideoFrame.jsx
const videoConfigs = [
  { id: 1, videoSrc: '/videos/SBMU.mp4' },
  { id: 2, videoSrc: '/videos/GSRTC.mp4' },
]

export default function VideoNavigation() {
  const { activeVideoId, setActiveVideo } = useVideoStore()
  
  // Get current video index
  const currentIndex = useMemo(() => {
    return videoConfigs.findIndex(v => v.id === activeVideoId)
  }, [activeVideoId])

  // Navigation functions
  const goToNextVideo = () => {
    if (currentIndex < videoConfigs.length - 1) {
      const nextVideoId = videoConfigs[currentIndex + 1].id
      setActiveVideo(nextVideoId)
    }
  }

  const goToPrevVideo = () => {
    if (currentIndex > 0) {
      const prevVideoId = videoConfigs[currentIndex - 1].id
      setActiveVideo(prevVideoId)
    }
  }

  const goToVideo = (index) => {
    if (index >= 0 && index < videoConfigs.length) {
      setActiveVideo(videoConfigs[index].id)
    }
  }

  const canGoPrev = currentIndex > 0
  const canGoNext = currentIndex < videoConfigs.length - 1

  return (
    <div className="video-navigation">
      {/* Left Arrow */}
      <button
        className={`video-nav-arrow video-nav-arrow-left ${!canGoPrev ? 'disabled' : ''}`}
        onClick={goToPrevVideo}
        disabled={!canGoPrev}
        aria-label="Previous video"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Pagination Dots */}
      <div className="video-nav-dots">
        {videoConfigs.map((_, index) => (
          <button
            key={index}
            className={`video-nav-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToVideo(index)}
            aria-label={`Go to video ${index + 1}`}
          />
        ))}
      </div>

      {/* Right Arrow */}
      <button
        className={`video-nav-arrow video-nav-arrow-right ${!canGoNext ? 'disabled' : ''}`}
        onClick={goToNextVideo}
        disabled={!canGoNext}
        aria-label="Next video"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  )
}
