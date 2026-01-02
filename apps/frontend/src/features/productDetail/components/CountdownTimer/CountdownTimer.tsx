import { useState, useEffect } from 'react';
import './CountdownTimer.css';

interface CountdownTimerProps {
  saleStartAt?: string;
  saleEndAt?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const DAYS_THRESHOLD = 7;

function calculateTimeLeft(endDate: Date): TimeLeft | null {
  const now = new Date();
  const difference = endDate.getTime() - now.getTime();

  if (difference <= 0) {
    return null;
  }

  const totalSeconds = Math.floor(difference / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

function formatTime(value: number): string {
  return value.toString().padStart(2, '0');
}

function isWithinSalePeriod(saleStartAt?: string, saleEndAt?: string): boolean {
  if (!saleEndAt) {
    return false;
  }

  const now = new Date();
  const endDate = new Date(saleEndAt);

  if (endDate <= now) {
    return false;
  }

  if (saleStartAt) {
    const startDate = new Date(saleStartAt);
    if (startDate > now) {
      return false;
    }
  }

  return true;
}

export default function CountdownTimer({ saleStartAt, saleEndAt }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isWithinSalePeriod(saleStartAt, saleEndAt)) {
      setIsActive(false);
      return;
    }

    const endDate = new Date(saleEndAt!);
    setIsActive(true);
    setTimeLeft(calculateTimeLeft(endDate));

    const timer = setInterval(() => {
      if (!isWithinSalePeriod(saleStartAt, saleEndAt)) {
        setIsActive(false);
        clearInterval(timer);
        return;
      }

      const remaining = calculateTimeLeft(endDate);
      if (remaining) {
        setTimeLeft(remaining);
      } else {
        setIsActive(false);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [saleStartAt, saleEndAt]);

  if (!isActive || !timeLeft) {
    return null;
  }

  const showDaysOnly = timeLeft.days >= DAYS_THRESHOLD;
  const totalHours = timeLeft.days * 24 + timeLeft.hours;

  return (
    <div className="countdown-timer">
      <span className="countdown-timer__time">
        {showDaysOnly
          ? `${timeLeft.days}일`
          : `${formatTime(totalHours)}:${formatTime(timeLeft.minutes)}:${formatTime(timeLeft.seconds)}`}
      </span>
      <span className="countdown-timer__label">남음</span>
    </div>
  );
}
