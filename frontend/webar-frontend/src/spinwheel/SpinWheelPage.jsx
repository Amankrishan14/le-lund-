import { useState, useEffect } from 'react'
import CustomWheel from './CustomWheel'
import RewardPopup from './RewardPopup'
import './SpinWheelPage.css'

export default function SpinWheelPage({ onBackToAR, userId }) {
  const [showRewardPopup, setShowRewardPopup] = useState(false)
  const [winner, setWinner] = useState('')
  const [spinning, setSpinning] = useState(false)

  // Listen for spin completion from CustomWheel
  useEffect(() => {
    const handleSpinComplete = (event) => {
      if (event.detail && event.detail.winner) {
        setWinner(event.detail.winner)
        setShowRewardPopup(true)
      }
    }

    const handleSpinStart = () => {
      setSpinning(true)
    }

    const handleSpinEnd = () => {
      setSpinning(false)
    }

    window.addEventListener('spin-complete', handleSpinComplete)
    window.addEventListener('spin-start', handleSpinStart)
    window.addEventListener('spin-end', handleSpinEnd)

    return () => {
      window.removeEventListener('spin-complete', handleSpinComplete)
      window.removeEventListener('spin-start', handleSpinStart)
      window.removeEventListener('spin-end', handleSpinEnd)
    }
  }, [])

  const handleBackToAR = () => {
    setShowRewardPopup(false)
    setWinner('')
    onBackToAR()
  }

  return (
    <div className="spinwheel-page-container">
      <CustomWheel userId={userId} />
      
      {showRewardPopup && (
        <RewardPopup winner={winner} onBackToAR={handleBackToAR} />
      )}
    </div>
  )
}


