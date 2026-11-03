import { useState, useEffect } from "react";

/**
 * Custom hook to debounce a rapidly changing value (e.g. search input).
 *
 * @param value The value to debounce
 * @param delay The delay in milliseconds (default: 350ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 350): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
