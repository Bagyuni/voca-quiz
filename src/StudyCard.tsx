import type { Word } from './types';
import { cn } from './utils';

interface Props {
  word: Word;
  isHard: boolean;
  onToggleHard: () => void;
}

export function StudyCard({ word, isHard, onToggleHard }: Props) {
  return (
    <div className={cn('study-card', isHard && 'is-hard')}>
      <button type="button" className="star-btn" onClick={onToggleHard}>
        {isHard ? '★' : '☆'}
      </button>
      <div className="sc-kanji">{word.kanji}</div>
      <div className="sc-hira">{word.hira}</div>
      <div className="sc-mean">{word.mean}</div>
      {word.ex && (
        <div className="sc-ex">
          <span>{word.ex}</span>
          {word.exKr}
        </div>
      )}
    </div>
  );
}
