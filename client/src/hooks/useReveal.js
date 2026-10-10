import { useEffect, useRef } from 'react';

export const useReveal = () => {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
    );

    // Scan for revealable elements
    const scan = () => {
      document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach((el) => {
        if (!el.classList.contains('visible')) {
          observer.observe(el);
        }
      });
    };

    // Initial scan — slight delay to let React finish painting
    // Use requestAnimationFrame to sync with paint cycle
    requestAnimationFrame(() => {
      scan();
      // Second scan after a short delay for lazy-rendered content
      setTimeout(scan, 200);
    });

    // Re-scan when React renders new content (products, orders, etc.)
    const mutationObserver = new MutationObserver(() => {
      requestAnimationFrame(scan);
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return ref;
};

export const useScrollY = () => {
  const scrollY = useRef(0);
  useEffect(() => {
    const handler = () => { scrollY.current = window.scrollY; };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);
  return scrollY;
};
