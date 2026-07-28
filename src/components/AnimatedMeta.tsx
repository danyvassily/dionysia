import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Clock, Calendar, Tag } from 'lucide-react';

interface AnimatedMetaProps {
  date: string;
  readTime: string;
  tag?: string;
}

function AnimatedNumber({ value, suffix = '' }: { value: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    const num = parseInt(value.replace(/\D/g, ''), 10);
    if (isNaN(num)) {
      setDisplayValue(value);
      return;
    }

    const obj = { val: 0 };
    gsap.to(obj, {
      val: num,
      duration: 1.2,
      ease: 'power2.out',
      delay: 0.3,
      onUpdate: () => {
        setDisplayValue(String(Math.round(obj.val)));
      },
    });
  }, [value]);

  return (
    <span ref={ref}>
      {displayValue}
      {suffix}
    </span>
  );
}

export default function AnimatedMeta({ date, readTime, tag }: AnimatedMetaProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    gsap.fromTo(
      containerRef.current.children,
      { opacity: 0, y: 10 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 0.4,
      }
    );
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex flex-wrap items-center gap-4 py-4 mb-10 text-sm font-sans text-[var(--ink-faint)]"
      style={{ borderTop: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)' }}
    >
      <span className="inline-flex items-center gap-1.5 opacity-0">
        <Calendar className="w-3.5 h-3.5" />
        {date}
      </span>
      <span className="inline-flex items-center gap-1.5 opacity-0">
        <Clock className="w-3.5 h-3.5" />
        <AnimatedNumber value={readTime.replace(/\D/g, '')} suffix=" min" />
      </span>
      {tag && (
        <span className="inline-flex items-center gap-1.5 opacity-0">
          <Tag className="w-3.5 h-3.5" />
          {tag}
        </span>
      )}
    </div>
  );
}
