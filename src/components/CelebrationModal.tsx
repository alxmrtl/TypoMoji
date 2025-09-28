import React, { useEffect } from 'react';
import Lottie from 'lottie-react';
import celebrationAnimation from '../../public/assets/animations/round_complete.json';
import './CelebrationModal.css';

interface CelebrationModalProps {
  isVisible: boolean;
  onComplete: () => void;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isVisible,
  onComplete
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onComplete();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="celebration-modal" onClick={onComplete}>
      <div className="celebration-modal__content">
        <div className="celebration-modal__animation">
          <Lottie
            animationData={celebrationAnimation}
            loop={false}
            autoplay={true}
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        <div className="celebration-modal__badge">
          <div className="celebration-modal__badge-icon">🏆</div>
          <h2 className="celebration-modal__title">Round Complete!</h2>
          <p className="celebration-modal__subtitle">Amazing work! 🎉</p>
        </div>

        <div className="celebration-modal__tap-hint">
          <p>Tap anywhere to continue</p>
        </div>
      </div>
    </div>
  );
};