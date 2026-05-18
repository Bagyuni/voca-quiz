import { useEffect, useState } from 'react';
import { useStore } from './useStore';
import { cn } from './utils';

export function TableMode() {
  const { getFilteredWords, hardWords, toggleHard, currentDay } = useStore();
  const [hardFilterOn, setHardFilterOn] = useState(false);
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

  const showDay = currentDay === 'all' || currentDay === 'range';

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
          <thead>
            <tr>
              <th className="wt-star" aria-label="어려움" />
              {showDay && <th className="wt-day">Day</th>}
              <th className="wt-kanji">한자</th>
              <th className="wt-hira">히라가나</th>
              <th className="wt-mean">뜻</th>
            </tr>
          </thead>
          <tbody>
            {displayWords.map((w, i) => {
              const isHard = hardWords.has(w.id);
              return (
                <tr
                  key={`${w.id}-${i}`}
                  className={cn('wt-row', isHard && 'is-hard')}
                >
                  <td className="wt-star">
                    <button
                      type="button"
                      className="wt-star-btn"
                      onClick={() => toggleHard(w.id)}
                      aria-label={isHard ? '어려움 해제' : '어려움 표시'}
                    >
                      {isHard ? '★' : '☆'}
                    </button>
                  </td>
                  {showDay && <td className="wt-day">{w.day}</td>}
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
    </div>
  );
}
