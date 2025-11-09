import { RefObject, useEffect } from "react";

export default function useIntersect(
  container: RefObject<HTMLElement>,
  callback: (isIntersecting: boolean) => void,
) {
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      callback(entry.isIntersecting);
    });
    if (container.current) {
      observer.observe(container.current);
    }
    return () => observer.disconnect();
  }, [container, callback]);
}
