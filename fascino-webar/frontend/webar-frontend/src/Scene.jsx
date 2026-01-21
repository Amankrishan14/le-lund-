import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import ArVideoFrame from './ui/ArVideoFrame'
import FloatingCTA from './ui/FloatingCTA'
import SpinToWinButton from './ui/SpinToWinButton'
import VideoNavigation from './ui/VideoNavigation'
import SpinWheelPage from './spinwheel/SpinWheelPage'
import { useVideoStore } from './store'
import { getOrCreateUserId } from './utils/userId'
import './ui/styles.css'
import './ui/frame-wrapper.css'
import './ui/spin-to-win.css'

// Video-specific URLs for Learn More button
const VIDEO_URLS = {
  1: 'https://sbm-urban.gujarat.gov.in', // SBMU Video
  2: 'https://gsrtc.in/site/', // GSRTC Video
}

export default function Scene() {
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoPlaying, setVideoPlaying] = useState(false)
  const [showSpinWheel, setShowSpinWheel] = useState(false)
  const [swipeInstructionFaded, setSwipeInstructionFaded] = useState(false)
  const [hideUIElements, setHideUIElements] = useState(false)
  const pausedVideosRef = useRef([])
  const userId = getOrCreateUserId()

  // Get active video ID from store to determine the Learn More URL
  const { activeVideoId } = useVideoStore()

  // Determine the Learn More URL based on active video
  const learnMoreUrl = useMemo(() => {
    return VIDEO_URLS[activeVideoId] || VIDEO_URLS[1]
  }, [activeVideoId])

  // Memoize the onVideoPlaying callback to prevent video restart
  const handleVideoPlaying = useCallback(() => {
    setVideoPlaying(true)
  }, [])

  // Track when video is loaded
  useEffect(() => {
    const timer = setTimeout(() => {
      setVideoLoaded(true)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  // Note: Button positioning uses same logic as SwipeInstruction (top: 10px relative to frame-wrapper)
  // No CSS variable needed - button is positioned exactly like SwipeInstruction

  // Track when swipe instruction fades out (3s show delay + 4s visible + 0.4s fade = 7.4s total)
  useEffect(() => {
    if (videoPlaying && !swipeInstructionFaded) {
      const timer = setTimeout(() => {
        setSwipeInstructionFaded(true)
      }, 7400) // 3s + 4s + 0.4s = 7.4s
      return () => clearTimeout(timer)
    }
  }, [videoPlaying, swipeInstructionFaded])

  // Pause all WebAR videos when transitioning to SpinWheel (exclude camera background)
  const pauseAllVideos = () => {
    const videos = document.querySelectorAll('video:not(.camera-background)')
    pausedVideosRef.current = []
    videos.forEach(video => {
      if (!video.paused) {
        video.pause()
        pausedVideosRef.current.push(video)
      }
    })
  }

  // Resume all WebAR videos when returning from SpinWheel
  const resumeAllVideos = () => {
    pausedVideosRef.current.forEach(video => {
      video.play().catch(err => {
        console.error('Error resuming video:', err)
      })
    })
    pausedVideosRef.current = []
  }

  const handleSpinClick = () => {
    // Pause all videos
    pauseAllVideos()
    // Hide UI elements
    setHideUIElements(true)
    // Show SpinWheel
    setShowSpinWheel(true)
  }

  const handleBackToAR = () => {
    // Hide SpinWheel
    setShowSpinWheel(false)
    // Resume all videos
    resumeAllVideos()
    // Show UI elements
    setHideUIElements(false)
    // Reset swipe instruction state to allow it to show again
    setSwipeInstructionFaded(false)
    setVideoPlaying(false)
    // Trigger video playing again after a short delay
    setTimeout(() => {
      setVideoPlaying(true)
    }, 100)
  }

  // Render SpinWheelPage via Portal outside AR scene
  const spinwheelPortal = showSpinWheel ? createPortal(
    <SpinWheelPage onBackToAR={handleBackToAR} userId={userId} />,
    document.getElementById('spinwheel-root')
  ) : null

  return (
    <>
      {/* DOM-based UI Overlay */}
      <div 
        className="ar-ui-layer"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 3,
          pointerEvents: "none",
          overflow: "visible",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        {/* Frame Wrapper - contains swipe box, canvas, learn button, and spin-to-win button */}
        <div className="frame-wrapper">
          {/* Spin to Win Button */}
          {!hideUIElements && (
            <SpinToWinButton 
              onClick={handleSpinClick}
              swipeInstructionFaded={swipeInstructionFaded}
            />
          )}
          
          {/* Video Content Container - Video, Navigation, and Learn More as ONE unit */}
          <div className="video-content-container">
            {/* Canvas Holder - contains the video card (banner + video) */}
            <div className="canvas-holder">
              <ArVideoFrame onVideoPlaying={handleVideoPlaying} />
            </div>

            {/* Video Navigation Controls */}
            {!hideUIElements && (
              <VideoNavigation />
            )}

            {/* Learn More Button */}
            {!hideUIElements && (
              <FloatingCTA 
                url={learnMoreUrl}
                text="Learn More"
                videoLoaded={videoLoaded}
              />
            )}
          </div>
        </div>
      </div>

      {/* SpinWheelPage rendered via Portal - outside AR scene */}
      {spinwheelPortal}
    </>
  )
}

