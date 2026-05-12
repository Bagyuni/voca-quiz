import { useEffect, useState } from 'react';
import { StudyCard } from './StudyCard';
import { useStore } from './useStore';
import { cn } from './utils';

export function StudyMode() {
  const { getFilteredWords, hardWords, toggleHard } = useStore();
  const [hardFilterOn, setHardFilterOn] = useState(false);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const words = getFilteredWords();
  const displayWords = hardFilterOn
    ? words.filter((w) => hardWords.has(w.id))
    : words;

  return (
    <div className="container container-wide">
      <div className="filter-bar">
        <label className={cn('filter-toggle', hardFilterOn && 'active')}>
          <input
            type="checkbox"
            checked={hardFilterOn}
            onChange={(e) => setHardFilterOn(e.target.checked)}
          />
          <span>★ 어려움만 보기</span>
        </label>
      </div>
      <div className="study-grid">
        {displayWords.map((w, i) => (
          <StudyCard
            key={`${w.id}-${i}`}
            word={w}
            isHard={hardWords.has(w.id)}
            onToggleHard={() => toggleHard(w.id)}
            openKey={openKey}
            setOpenKey={setOpenKey}
          />
        ))}
      </div>
      {showTop && (
        <button
          type="button"
          className="scroll-top-btn"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="맨 위로"
        >
          ↑
        </button>
      )}
    </div>
  );
}
