import { useState, useEffect, useRef, useCallback } from 'react'
import Scene from './Scene'
import './App.css'

function App() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cameraStream, setCameraStream] = useState(null)
  const [userInteracted, setUserInteracted] = useState(false)
  const videoRef = useRef(null)

  // Debug: Log when component mounts
  useEffect(() => {
    console.log('App component mounted')
  }, [])

  const initializeCamera = useCallback(async () => {
    try {
      // Check for secure context
      if (!window.isSecureContext && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        setError('This app requires HTTPS to access the camera.')
        setLoading(false)
        return
      }

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Rear camera
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      })

      setCameraStream(stream)

      // Set video source
      if (videoRef.current) {
        console.log('Connecting stream to video element')
        videoRef.current.srcObject = stream
        videoRef.current.playsInline = true
        videoRef.current.muted = true
        videoRef.current.style.display = 'block'
        videoRef.current.style.visibility = 'visible'
        videoRef.current.style.opacity = '1'
        
        try {
          await videoRef.current.play()
          console.log('Camera video playing successfully')
        } catch (playErr) {
          console.error('Error playing camera video:', playErr)
        }
      } else {
        console.error('Video ref is null!')
      }

      setLoading(false)
      console.log('Camera initialization complete, loading set to false')
    } catch (err) {
      console.error('Camera initialization error:', err)
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera access denied. Please allow camera access and refresh the page.')
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Please connect a camera and refresh.')
      } else {
        setError(`Camera access failed: ${err.message}. Please refresh and try again.`)
      }
      setLoading(false)
    }
  }, [])

  // Logo click handler is now in handleLogoClick function
  // Removed global click listeners - only logo click will start WebAR

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [cameraStream])

  // Ensure video element is visible and connected to stream
  useEffect(() => {
    if (videoRef.current) {
      if (cameraStream) {
        console.log('Setting camera stream to video element')
        videoRef.current.srcObject = cameraStream
        videoRef.current.play().catch(err => {
          console.error('Video play error:', err)
        })
      } else {
        console.log('No camera stream yet, video element ready')
      }
    }
  }, [cameraStream])

  // Force scene container to stay small - override any SDK sizing
  useEffect(() => {
    const enforceSceneSize = () => {
      // Target the scene container div (the one wrapping Scene component)
      const sceneContainer = document.querySelector('.scene-container')
      const canvasOverlay = document.querySelector('.canvas-overlay')
      const canvasElements = document.querySelectorAll('canvas')
      
      // Calculate size based on viewport
      const vw = window.innerWidth
      const vh = window.innerHeight
      const isPortrait = vh > vw
      const isSmall = vw < 480
      
      let targetWidth = '70%'
      let targetHeight = '70%'
      let maxW = '500px'
      let maxH = '750px'
      
      if (!isPortrait) {
        targetWidth = '65%'
        targetHeight = '65%'
        maxW = '700px'
        maxH = '450px'
      } else if (isSmall) {
        targetWidth = '75%'
        targetHeight = '75%'
      }
      
      // Force the scene container size with adjusted vertical centering
      if (sceneContainer) {
        sceneContainer.style.setProperty('width', targetWidth, 'important')
        sceneContainer.style.setProperty('height', targetHeight, 'important')
        sceneContainer.style.setProperty('max-width', maxW, 'important')
        sceneContainer.style.setProperty('max-height', maxH, 'important')
        sceneContainer.style.setProperty('position', 'absolute', 'important')
        sceneContainer.style.setProperty('top', '45%', 'important')
        sceneContainer.style.setProperty('left', '50%', 'important')
        sceneContainer.style.setProperty('transform', 'translate(-50%, -50%)', 'important')
        sceneContainer.style.setProperty('margin', '0', 'important')
        sceneContainer.style.setProperty('padding', '0', 'important')
        sceneContainer.style.setProperty('box-sizing', 'border-box', 'important')
      }
      
      // Also enforce canvas-overlay if it exists
      if (canvasOverlay) {
        canvasOverlay.style.setProperty('width', targetWidth, 'important')
        canvasOverlay.style.setProperty('height', targetHeight, 'important')
        canvasOverlay.style.setProperty('max-width', maxW, 'important')
        canvasOverlay.style.setProperty('max-height', maxH, 'important')
        canvasOverlay.style.setProperty('position', 'absolute', 'important')
        canvasOverlay.style.setProperty('top', '50%', 'important')
        canvasOverlay.style.setProperty('left', '50%', 'important')
        canvasOverlay.style.setProperty('transform', 'translate(-50%, -50%)', 'important')
      }
      
      // Ensure canvas elements don't exceed container
      canvasElements.forEach(canvas => {
        if (canvas.style.width === '100vw' || canvas.style.height === '100vh' || 
            canvas.width === window.innerWidth || canvas.height === window.innerHeight) {
          canvas.style.setProperty('width', '100%', 'important')
          canvas.style.setProperty('height', '100%', 'important')
          canvas.style.setProperty('max-width', '100%', 'important')
          canvas.style.setProperty('max-height', '100%', 'important')
        }
      })
    }

    // Run immediately and on resize
    enforceSceneSize()
    window.addEventListener('resize', enforceSceneSize)
    
    // Use MutationObserver to catch any dynamic changes
    const observer = new MutationObserver(() => {
      enforceSceneSize()
    })
    
    // Observe the document for scene container changes
    const checkAndObserve = () => {
      const sceneContainer = document.querySelector('.scene-container')
      if (sceneContainer) {
        observer.observe(sceneContainer, {
          attributes: true,
          attributeFilter: ['style', 'width', 'height', 'class']
        })
        observer.observe(document.body, {
          childList: true,
          subtree: true
        })
      } else {
        // Retry if container not found yet
        setTimeout(checkAndObserve, 100)
      }
    }
    
    checkAndObserve()
    
    // Also enforce periodically as backup
    const interval = setInterval(enforceSceneSize, 500)
    
    return () => {
      window.removeEventListener('resize', enforceSceneSize)
      observer.disconnect()
      clearInterval(interval)
    }
  }, [])

  // Handle logo click to start WebAR
  const handleLogoClick = () => {
    if (!userInteracted) {
      setUserInteracted(true)
      initializeCamera()
    }
  }

  // Show loading screen immediately
  if (loading) {
    return (
      <>
        <style>{`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-20px) scale(1.02); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.1; transform: scale(1); }
            50% { opacity: 0.2; transform: scale(1.1); }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
          }
          .loading-screen-bg {
            background: linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #4facfe, #667eea);
            background-size: 400% 400%;
            animation: gradientShift 15s ease infinite;
          }
          .logo-container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-radius: 30px;
            padding: clamp(30px, 8vw, 50px);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15),
                        0 0 0 1px rgba(255, 255, 255, 0.5),
                        inset 0 1px 0 rgba(255, 255, 255, 0.9);
            animation: float 6s ease-in-out infinite;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .logo-container:hover {
            transform: translateY(-10px) scale(1.05);
            box-shadow: 0 30px 80px rgba(0, 0, 0, 0.2),
                        0 0 0 1px rgba(255, 255, 255, 0.6),
                        inset 0 1px 0 rgba(255, 255, 255, 0.9);
          }
          .logo-img {
            filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.2));
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .logo-img:hover {
            filter: drop-shadow(0 15px 40px rgba(0, 0, 0, 0.3));
          }
          .instruction-text {
            background: linear-gradient(90deg, #ffffff, rgba(255, 255, 255, 0.9), #ffffff);
            background-size: 200% 100%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: shimmer 3s linear infinite;
            font-weight: 600;
            letter-spacing: 1px;
            text-transform: uppercase;
            font-size: clamp(11px, 2.2vw, 13px);
            text-shadow: 0 2px 10px rgba(255, 255, 255, 0.5);
          }
          .floating-shapes {
            position: absolute;
            width: 100%;
            height: 100%;
            overflow: hidden;
            pointer-events: none;
          }
          .shape {
            position: absolute;
            border-radius: 50%;
            opacity: 0.15;
            animation: pulse 4s ease-in-out infinite;
          }
          .shape-1 {
            width: 300px;
            height: 300px;
            background: radial-gradient(circle, #667eea, transparent);
            top: -100px;
            left: -100px;
            animation-delay: 0s;
          }
          .shape-2 {
            width: 200px;
            height: 200px;
            background: radial-gradient(circle, #764ba2, transparent);
            bottom: -50px;
            right: -50px;
            animation-delay: 1s;
          }
          .shape-3 {
            width: 150px;
            height: 150px;
            background: radial-gradient(circle, #f093fb, transparent);
            top: 50%;
            right: 10%;
            animation-delay: 2s;
          }
        `}</style>
        <div 
          className="loading-screen-bg"
          style={{ 
            width: '100vw',
            height: '100vh',
            position: 'fixed',
            top: 0,
            left: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            overflow: 'hidden'
          }}
        >
          {/* Animated Background Shapes */}
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>

          {!userInteracted ? (
            <>
              {/* Company Logo - Direct Display */}
              <img 
                src={`${import.meta.env.BASE_URL}logo.png`}
                alt="Company Logo" 
                className="logo-img"
                onClick={(e) => {
                  e.stopPropagation()
                  handleLogoClick()
                }}
                style={{
                  width: 'clamp(120px, 30vw, 200px)',
                  height: 'auto',
                  maxWidth: '200px',
                  maxHeight: '200px',
                  cursor: 'pointer',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  touchAction: 'manipulation',
                  objectFit: 'contain',
                  pointerEvents: 'auto',
                  display: 'block',
                  filter: 'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.2))',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  animation: 'float 6s ease-in-out infinite'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)'
                  e.currentTarget.style.filter = 'drop-shadow(0 15px 40px rgba(0, 0, 0, 0.3))'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.filter = 'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.2))'
                }}
                onTouchStart={(e) => {
                  e.stopPropagation()
                  e.currentTarget.style.transform = 'scale(0.95)'
                  handleLogoClick()
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              />
              
              {/* Animated Instruction Text */}
              <div 
                className="instruction-text"
                style={{
                  textAlign: 'center',
                  maxWidth: '300px',
                  marginTop: 'clamp(25px, 6vw, 35px)',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                }}
              >
                Tap logo to start
              </div>
            </>
          ) : (
            <>
              {/* Loading State with Modern Spinner */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '30px',
                padding: 'clamp(40px, 10vw, 60px)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                maxWidth: '90%'
              }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  border: '4px solid rgba(102, 126, 234, 0.2)',
                  borderTop: '4px solid #667eea',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginBottom: '20px'
                }}></div>
                <div style={{
                  background: 'linear-gradient(90deg, #667eea, #764ba2)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontSize: 'clamp(16px, 4vw, 20px)',
                  fontWeight: 700,
                  textAlign: 'center',
                  marginBottom: '10px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                }}>
                  Initializing Camera...
                </div>
                <div style={{
                  color: '#666666',
                  fontSize: 'clamp(12px, 3vw, 14px)',
                  textAlign: 'center',
                  maxWidth: '300px',
                  lineHeight: '1.5',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                }}>
                  Please allow camera access to continue
                </div>
              </div>
            </>
          )}
        </div>
      </>
    )
  }

  console.log('App render - loading:', loading, 'error:', error, 'hasStream:', !!cameraStream)
  console.log('Scene container should render:', !loading && !error)

  return (
    <div className="app-container" style={{ 
      background: '#000',
      width: '100dvw',
      height: '100dvh',
      minHeight: '-webkit-fill-available',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden',
      zIndex: 0
    }}>
      {/* Camera background - always render, even if no stream yet */}
      <video
        ref={videoRef}
        className="camera-background"
        autoPlay
        playsInline
        muted
        style={{ 
          display: 'block',
          visibility: 'visible',
          opacity: 1,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 0,
          backgroundColor: '#000',
          minWidth: '100%',
          minHeight: '100%'
        }}
        onLoadedMetadata={() => {
          console.log('Camera video metadata loaded')
        }}
        onPlay={() => {
          console.log('Camera video started playing')
        }}
        onError={(e) => {
          console.error('Camera video error:', e)
        }}
      />
      
      {/* Fallback background if camera not ready */}
      {!cameraStream && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: '#000',
          zIndex: -1
        }}></div>
      )}

      {/* Error message */}
      {error && (
        <div className="error-overlay">
          <div className="error-content">
            <h2>⚠️ Error</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>
              Reload Page
            </button>
          </div>
        </div>
      )}

      {/* 3D Scene - render even if camera not ready */}
      {!loading && !error && (
        <div 
          className="scene-container"
          style={{ 
            position: 'absolute',
            top: '45%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '70%',
            height: '70%',
            maxWidth: '500px',
            maxHeight: '750px',
            zIndex: 10,
            pointerEvents: 'auto',
            overflow: 'visible',
            minWidth: '250px',
            minHeight: '400px',
            margin: '0',
            padding: '0'
          }}>
          <Scene />
        </div>
      )}
      
      {/* Debug overlay - hidden for premium look */}
      {false && process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          top: '10px',
          left: '10px',
          background: 'rgba(255,255,255,0.9)',
          color: 'black',
          padding: '10px',
          zIndex: 10000,
          fontSize: '12px',
          fontFamily: 'monospace',
          borderRadius: '5px',
          border: '2px solid #000'
        }}>
          <div>Loading: {loading.toString()}</div>
          <div>Error: {error ? 'Yes' : 'No'}</div>
          <div>Stream: {cameraStream ? 'Yes' : 'No'}</div>
          <div>User Interacted: {userInteracted.toString()}</div>
          {videoRef.current && (
            <div>Video Ready: {videoRef.current.readyState}</div>
          )}
        </div>
      )}
    </div>
  )
}

export default App

