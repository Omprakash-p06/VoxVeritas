import { useRef, useEffect, useCallback } from 'react';

export function useAutoScroll<T extends HTMLElement>(deps: React.DependencyList) {
  const containerRef = useRef<T>(null);
  const shouldScrollRef = useRef(true);

  const scrollToBottom = useCallback(() => {
    if (containerRef.current && shouldScrollRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [...deps, scrollToBottom]);

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      shouldScrollRef.current = isNearBottom;
    }
  }, []);

  return {
    containerRef,
    handleScroll,
    scrollToBottom
  };
}
