import { useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import onboarding1 from '../../assets/onboarding-1.png';
import onboarding2 from '../../assets/onboarding-2.png';
import onboarding3 from '../../assets/onboarding-3.png';
import './OnboardingScreen.css';

const ONBOARDING_COMPLETED_KEY = 'bongkru_onboarding_completed';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const slides = [
  { id: 1, image: onboarding3, isLast: false },
  { id: 2, image: onboarding2, isLast: false },
  { id: 3, image: onboarding1, isLast: true },
];

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleStart = () => {
    handleComplete();
  };

  const handleSlideChange = (swiper: SwiperType) => {
    setActiveIndex(swiper.activeIndex);
  };

  const handleDotClick = (index: number) => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(index);
    }
  };

  const isLastSlide = activeIndex === slides.length - 1;

  return (
    <div className="onboarding-screen">
      <Swiper
        onSwiper={(swiper) => { swiperRef.current = swiper; }}
        onSlideChange={handleSlideChange}
        slidesPerView={1}
        className="onboarding-screen__swiper"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id} className="onboarding-screen__slide">
            <img
              src={slide.image}
              alt={`가이드 ${slide.id}`}
              className="onboarding-screen__image"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="onboarding-screen__controls">
        <div className="onboarding-screen__pagination">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`onboarding-screen__dot ${activeIndex === index ? 'onboarding-screen__dot--active' : ''}`}
              onClick={() => handleDotClick(index)}
              aria-label={`슬라이드 ${index + 1}로 이동`}
            />
          ))}
        </div>

        {isLastSlide ? (
          <button
            type="button"
            className="onboarding-screen__start-button"
            onClick={handleStart}
          >
            봉선장 시작하기
          </button>
        ) : (
          <button
            type="button"
            className="onboarding-screen__skip-button"
            onClick={handleSkip}
          >
            건너뛰기
          </button>
        )}
      </div>
    </div>
  );
}

export function isOnboardingCompleted(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(ONBOARDING_COMPLETED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function resetOnboarding(): void {
  localStorage.removeItem(ONBOARDING_COMPLETED_KEY);
}
