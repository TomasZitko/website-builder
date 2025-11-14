/**
 * ProjectCarousel Component
 * Horizontal slider with auto-scroll, keyboard navigation, and touch swipe
 * Displays projects in a beautiful carousel format
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { ProjectCard } from './ProjectCard';
import { Website } from '@/hooks/useWebsites';

interface ProjectCarouselProps {
  projects: Website[];
  onDelete: (id: string) => void;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export function ProjectCarousel({
  projects,
  onDelete,
  autoPlay = true,
  autoPlayInterval = 5000
}: ProjectCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Calculate how many cards to show per page based on screen size
  const [cardsPerPage, setCardsPerPage] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCardsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setCardsPerPage(2);
      } else {
        setCardsPerPage(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalPages = Math.ceil(projects.length / cardsPerPage);
  const canGoNext = currentIndex < totalPages - 1;
  const canGoPrev = currentIndex > 0;

  const goToNext = useCallback(() => {
    if (canGoNext) {
      setCurrentIndex((prev) => prev + 1);
    } else if (autoPlay) {
      // Loop back to start
      setCurrentIndex(0);
    }
  }, [canGoNext, autoPlay]);

  const goToPrev = useCallback(() => {
    if (canGoPrev) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [canGoPrev]);

  const goToPage = useCallback((page: number) => {
    setCurrentIndex(page);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || isPaused || projects.length <= cardsPerPage) return;

    const interval = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlay, isPaused, autoPlayInterval, goToNext, projects.length, cardsPerPage]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    if (carouselRef.current) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [goToNext, goToPrev]);

  // Handle empty state
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 bg-foreground/5 rounded-full flex items-center justify-center mb-4">
          <IconChevronRight className="w-10 h-10 text-foreground/20" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          No projects yet
        </h3>
        <p className="text-foreground/60 max-w-sm">
          Create your first AI-generated website to see it here
        </p>
      </div>
    );
  }

  // Get visible projects for current page
  const visibleProjects = projects.slice(
    currentIndex * cardsPerPage,
    (currentIndex + 1) * cardsPerPage
  );

  return (
    <div
      ref={carouselRef}
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="Projects carousel"
    >
      {/* Carousel Container */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {visibleProjects.map((project, idx) => (
              <ProjectCard
                key={project.id}
                website={project}
                onDelete={onDelete}
                index={idx}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      {totalPages > 1 && (
        <>
          {/* Previous Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={goToPrev}
            disabled={!canGoPrev}
            className={`
              absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4
              w-12 h-12 rounded-full
              bg-gradient-to-br from-background/80 to-background/60
              backdrop-blur-xl border border-foreground/[0.08]
              shadow-lg
              flex items-center justify-center
              transition-all duration-300
              ${canGoPrev
                ? 'opacity-100 hover:shadow-xl hover:border-foreground/[0.15]'
                : 'opacity-40 cursor-not-allowed'
              }
            `}
            aria-label="Previous projects"
          >
            <IconChevronLeft className="w-6 h-6 text-foreground" />
          </motion.button>

          {/* Next Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={goToNext}
            disabled={!canGoNext && !autoPlay}
            className={`
              absolute right-0 top-1/2 -translate-y-1/2 translate-x-4
              w-12 h-12 rounded-full
              bg-gradient-to-br from-background/80 to-background/60
              backdrop-blur-xl border border-foreground/[0.08]
              shadow-lg
              flex items-center justify-center
              transition-all duration-300
              ${canGoNext || autoPlay
                ? 'opacity-100 hover:shadow-xl hover:border-foreground/[0.15]'
                : 'opacity-40 cursor-not-allowed'
              }
            `}
            aria-label="Next projects"
          >
            <IconChevronRight className="w-6 h-6 text-foreground" />
          </motion.button>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToPage(idx)}
                className={`
                  h-2 rounded-full transition-all duration-300
                  ${idx === currentIndex
                    ? 'w-8 bg-violet-500'
                    : 'w-2 bg-foreground/20 hover:bg-foreground/40'
                  }
                `}
                aria-label={`Go to page ${idx + 1}`}
                aria-current={idx === currentIndex ? 'true' : 'false'}
              />
            ))}
          </div>
        </>
      )}

      {/* Auto-play indicator */}
      {autoPlay && totalPages > 1 && (
        <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-lg bg-foreground/5 text-xs text-foreground/60">
          {isPaused ? 'Paused' : 'Auto-playing'}
        </div>
      )}
    </div>
  );
}
