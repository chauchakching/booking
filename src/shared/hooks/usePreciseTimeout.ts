import { useEffect, useRef, useState } from "react";

export const usePreciseTimeout = () => {
  const callbackRef = useRef(null);
  const delayRef = useRef(null);
  const refreshIntervalRef = useRef(60 * 1000); // Default refresh interval
  const start = useRef(performance.now());
  const timeoutRef = useRef(null);
  const rafRef = useRef(null);
  const [isActive, setIsActive] = useState(false);

  const setPreciseTimeout = (params: {
    callback: () => void;
    delay: number;
    refreshInterval: number;
  }) => {
    callbackRef.current = params.callback;
    delayRef.current = params.delay;
    if (params.refreshInterval) {
      refreshIntervalRef.current = params.refreshInterval;
    }
    start.current = performance.now(); // Reset the start time
    setIsActive(true); // Activate the timeout
  };

  useEffect(() => {
    if (!isActive || !callbackRef.current || delayRef.current == null) {
      // If the timeout isn't active or parameters are missing, don't do anything
      return;
    }

    const tick = () => {
      const elapsed = performance.now() - start.current;
      if (elapsed >= delayRef.current) {
        callbackRef.current();
        setIsActive(false); // Deactivate the timeout after it's called
      } else if (delayRef.current - elapsed > refreshIntervalRef.current) {
        // If more than the specified refreshInterval remains
        timeoutRef.current = setTimeout(() => {
          rafRef.current = requestAnimationFrame(tick);
        }, refreshIntervalRef.current); // Check again after refreshInterval
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, [isActive]);

  return setPreciseTimeout;
};
