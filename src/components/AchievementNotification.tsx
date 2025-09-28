import React, { useEffect, useState } from 'react';
import './AchievementNotification.css';

interface AchievementNotificationProps {
  achievement: {
    id: string;
    title: string;
    description: string;
    icon: string;
  } | null;
  onComplete: () => void;
}

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievement,
  onComplete
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onComplete, 300); // Wait for fade out
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [achievement, onComplete]);

  if (!achievement) return null;

  return (
    <div className={`achievement-notification ${isVisible ? 'visible' : ''}`}>
      <div className="achievement-notification__content">
        <div className="achievement-notification__icon">
          {achievement.icon}
        </div>
        <div className="achievement-notification__text">
          <h3 className="achievement-notification__title">
            {achievement.title}
          </h3>
          <p className="achievement-notification__description">
            {achievement.description}
          </p>
        </div>
      </div>
      <div className="achievement-notification__progress">
        <div className="achievement-notification__progress-bar"></div>
      </div>
    </div>
  );
};

// Achievement definitions
export const achievements = {
  'round-complete': {
    id: 'round-complete',
    title: 'Round Master!',
    description: 'Completed a typing round',
    icon: '🏆'
  },
  'first-word': {
    id: 'first-word',
    title: 'First Word!',
    description: 'Typed your first word correctly',
    icon: '🌟'
  },
  'speed-demon': {
    id: 'speed-demon',
    title: 'Speed Demon!',
    description: 'Completed a round in under 30 seconds',
    icon: '⚡'
  },
  'perfect-round': {
    id: 'perfect-round',
    title: 'Perfect!',
    description: 'Completed a round without any mistakes',
    icon: '💎'
  },
  'letter-master': {
    id: 'letter-master',
    title: 'Letter Master!',
    description: 'Completed 10 letter rounds',
    icon: '🔤'
  },
  'number-wizard': {
    id: 'number-wizard',
    title: 'Number Wizard!',
    description: 'Completed 10 number rounds',
    icon: '🔢'
  },
  'word-champion': {
    id: 'word-champion',
    title: 'Word Champion!',
    description: 'Completed 10 word rounds',
    icon: '📝'
  }
};