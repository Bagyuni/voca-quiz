import { useState } from 'react';
import { StudyCard } from './StudyCard';
import { useStore } from './useStore';
import { cn } from './utils';

export function StudyMode() {
  const { getFilteredWords, hardWords, toggleHard } = useStore();
  const [hardFilterOn, setHardFilterOn] = useState(false);

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
        {displayWords.map((w) => (
          <StudyCard
            key={w.id}
            word={w}
            isHard={hardWords.has(w.id)}
            onToggleHard={() => toggleHard(w.id)}
          />
        ))}
      </div>
    </div>
  );
}
