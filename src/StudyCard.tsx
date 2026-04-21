import { lookupHanja } from './hanja';
import type { Word } from './types';
import { cn } from './utils';

interface Props {
  word: Word;
  isHard: boolean;
  onToggleHard: () => void;
  openKey: string | null;
  setOpenKey: (key: string | null) => void;
}

export function StudyCard({
  word,
  isHard,
  onToggleHard,
  openKey,
  setOpenKey,
}: Props) {
  return (
    <div className={cn('study-card', isHard && 'is-hard')}>
      <button type="button" className="star-btn" onClick={onToggleHard}>
        {isHard ? '★' : '☆'}
      </button>
      <div className="sc-kanji">
        {[...word.kanji].map((ch, i) => {
          const key = `${word.id}:${i}`;
          const readings = lookupHanja(ch);
          if (!readings) return <span key={key}>{ch}</span>;
          const isOpen = openKey === key;
          return (
            <button
              type="button"
              key={key}
              className={cn('kanji-char', isOpen && 'is-open')}
              onClick={() => setOpenKey(isOpen ? null : key)}
            >
              {ch}
              {isOpen && (
                <span className="kanji-hint">
                  {readings.map((r, ri) => (
                    <span key={`${r.hun}-${r.eum}`}>
                      {ri > 0 && <span className="kh-sep"> / </span>}
                      <span className="kh-hun">{r.hun}</span>{' '}
                      <span className="kh-eum">{r.eum}</span>
                    </span>
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>
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
