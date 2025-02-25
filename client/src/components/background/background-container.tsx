import React, { memo, useEffect, useRef } from "react";

interface BackgroundContainerProps {
  children: React.ReactNode;
}

const BackgroundContainer = memo(({ children }: BackgroundContainerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Optimiser les performances de défilement
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          } else {
            entry.target.classList.remove("visible");
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    const container = containerRef.current;
    if (container) {
      // Observer uniquement les éléments avec contenu dynamique
      container
        .querySelectorAll(".dynamic-content")
        .forEach((el) => observer.observe(el));
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="bg-screen">
      <div className="video-background-container" />
      <div className="relative z-1">{children}</div>
    </div>
  );
});

BackgroundContainer.displayName = "BackgroundContainer";

export default BackgroundContainer;
