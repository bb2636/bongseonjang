import { useRef, useState, useEffect, type ReactNode } from 'react';
import './LazySection.css';

interface LazySectionProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  threshold?: number;
  minHeight?: number;
}

export default function LazySection({
  children,
  fallback,
  rootMargin = '200px',
  threshold = 0,
  minHeight = 200,
}: LazySectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  if (!isVisible) {
    return (
      <div
        ref={sectionRef}
        className="lazy-section lazy-section--placeholder"
        style={{ minHeight }}
      >
        {fallback}
      </div>
    );
  }

  return <div className="lazy-section">{children}</div>;
}
