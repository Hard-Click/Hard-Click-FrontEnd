import { useState, useRef, useCallback, useEffect } from 'react';

export function useResendCooldown(seconds = 60) {
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCooldown = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCooldown(seconds);

    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [seconds]);

  return {
    cooldown,
    isCoolingDown: cooldown > 0,
    startCooldown,
  };
}
