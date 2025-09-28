import { gsap } from 'gsap';

// Box success animation with GSAP
export const animateBoxSuccess = (element: HTMLElement): void => {
  if (!element) return;

  const tl = gsap.timeline();

  tl.to(element, {
    scale: 1.08,
    duration: 0.1,
    ease: "power2.out"
  })
  .to(element, {
    scale: 0.98,
    duration: 0.08,
    ease: "power2.inOut"
  })
  .to(element, {
    scale: 1,
    duration: 0.12,
    ease: "elastic.out(1, 0.5)"
  });

  // Add sparkle effect
  const sparkles = element.querySelectorAll('.box__sparkle');
  sparkles.forEach((sparkle, index) => {
    gsap.fromTo(sparkle, {
      scale: 0,
      rotation: 0,
      opacity: 1
    }, {
      scale: 1.2,
      rotation: 360,
      opacity: 0,
      duration: 0.6,
      delay: index * 0.1,
      ease: "power2.out"
    });
  });
};

// Box error animation with GSAP
export const animateBoxError = (element: HTMLElement): void => {
  if (!element) return;

  gsap.to(element, {
    x: -3,
    duration: 0.1,
    ease: "power2.inOut",
    yoyo: true,
    repeat: 3,
    onComplete: () => {
      gsap.set(element, { x: 0 });
    }
  });

  // Flash border color
  const container = element.querySelector('.box__container');
  if (container) {
    gsap.to(container, {
      borderColor: '#FF6B6B',
      duration: 0.1,
      yoyo: true,
      repeat: 1
    });
  }
};

// Board appear animation
export const animateBoardAppear = (elements: HTMLElement[]): void => {
  if (!elements.length) return;

  gsap.fromTo(elements, {
    scale: 0.8,
    opacity: 0,
    y: 20
  }, {
    scale: 1,
    opacity: 1,
    y: 0,
    duration: 0.5,
    stagger: 0.1,
    ease: "back.out(1.7)"
  });
};

// Progress bar animation
export const animateProgressBar = (element: HTMLElement, progress: number): void => {
  if (!element) return;

  gsap.to(element, {
    width: `${progress}%`,
    duration: 0.5,
    ease: "power2.out"
  });
};

// Button hover animations
export const animateButtonHover = (element: HTMLElement, isHovering: boolean): void => {
  if (!element) return;

  if (isHovering) {
    gsap.to(element, {
      y: -2,
      scale: 1.02,
      duration: 0.2,
      ease: "power2.out"
    });
  } else {
    gsap.to(element, {
      y: 0,
      scale: 1,
      duration: 0.2,
      ease: "power2.out"
    });
  }
};

// Mode toggle animation
export const animateModeChange = (elements: HTMLElement[]): void => {
  if (!elements.length) return;

  gsap.fromTo(elements, {
    rotationY: 90,
    opacity: 0
  }, {
    rotationY: 0,
    opacity: 1,
    duration: 0.4,
    stagger: 0.1,
    ease: "power2.out"
  });
};

// Achievement notification
export const animateAchievement = (element: HTMLElement): void => {
  if (!element) return;

  const tl = gsap.timeline();

  tl.fromTo(element, {
    scale: 0,
    rotation: -180,
    opacity: 0
  }, {
    scale: 1.2,
    rotation: 0,
    opacity: 1,
    duration: 0.6,
    ease: "back.out(2)"
  })
  .to(element, {
    scale: 1,
    duration: 0.2,
    ease: "power2.out"
  });
};

// Utility to check if reduced motion is preferred
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Wrapper function that respects accessibility preferences
export const safeAnimate = (animationFn: () => void): void => {
  if (!prefersReducedMotion()) {
    animationFn();
  }
};