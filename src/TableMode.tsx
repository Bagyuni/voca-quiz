import { useEffect, useState } from 'react';
import { StudyCard } from './StudyCard';
import type { Word } from './types';
import { useStore } from './useStore';
import { cn } from './utils';

export function TableMode() {
  const { getFilteredWords, hardWords, toggleHard } = useStore();
  const [hardFilterOn, setHardFilterOn] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [modalKanjiKey, setModalKanjiKey] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!selectedWord) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedWord(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [selectedWord]);

  const words = getFilteredWords();
  const displayWords = hardFilterOn
    ? words.filter((w) => hardWords.has(w.id))
    : words;

  return (
    <div className="container container-wide">
      <div className="table-toolbar">
        <span className="table-count">총 {displayWords.length}개</span>
        <label className={cn('filter-toggle', hardFilterOn && 'active')}>
          <input
            type="checkbox"
            checked={hardFilterOn}
            onChange={(e) => setHardFilterOn(e.target.checked)}
          />
          <span>★ 어려움만 보기</span>
        </label>
      </div>
      <div className="word-table-wrap">
        <table className="word-table">
          <tbody>
            {displayWords.map((w, i) => {
              const isHard = hardWords.has(w.id);
              return (
                <tr
                  key={`${w.id}-${i}`}
                  className={cn('wt-row', isHard && 'is-hard')}
                  onClick={() => setSelectedWord(w)}
                >
                  <td className="wt-star">
                    <button
                      type="button"
                      className="wt-star-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleHard(w.id);
                      }}
                      aria-label={isHard ? '어려움 해제' : '어려움 표시'}
                    >
                      {isHard ? '★' : '☆'}
                    </button>
                  </td>
                  <td className="wt-kanji">{w.kanji}</td>
                  <td className="wt-hira">{w.hira}</td>
                  <td className="wt-mean">{w.mean}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
      {selectedWord && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: ESC handler covers keyboard close
        // biome-ignore lint/a11y/noStaticElementInteractions: backdrop is decorative; modal has dialog role
        <div
          className="word-modal-backdrop"
          onClick={() => setSelectedWord(null)}
        >
          <div
            className="word-modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <StudyCard
              word={selectedWord}
              isHard={hardWords.has(selectedWord.id)}
              onToggleHard={() => toggleHard(selectedWord.id)}
              openKey={modalKanjiKey}
              setOpenKey={setModalKanjiKey}
            />
          </div>
        </div>
      )}
    </div>
  );
}
