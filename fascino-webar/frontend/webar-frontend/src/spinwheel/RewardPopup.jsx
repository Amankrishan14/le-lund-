import './reward-popup.css'

export default function RewardPopup({ winner, onBackToAR }) {
  return (
    <div className="reward-popup-overlay">
      <div className="reward-popup">
        <div className="reward-popup-header">
          <h2>🎉 Congratulations!</h2>
        </div>
        <div className="reward-popup-content">
          <p className="reward-text">You won:</p>
          <p className="reward-winner">{winner}</p>
        </div>
        <button 
          className="reward-popup-button"
          onClick={onBackToAR}
        >
          Back to AR Experience
        </button>
      </div>
    </div>
  )
}

