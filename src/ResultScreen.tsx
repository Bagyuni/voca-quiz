import type { Word, WordId } from './types';

interface Props {
  correct: number;
  wrong: number;
  total: number;
  wrongWords: Word[];
  hardWords: Set<WordId>;
  toggleHard: (id: WordId) => void;
  onRetryAll: () => void;
  onRetryWrong: () => void;
}

export function ResultScreen({
  correct,
  wrong,
  total,
  wrongWords,
  hardWords,
  toggleHard,
  onRetryAll,
  onRetryWrong,
}: Props) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const scoreColor =
    pct >= 80 ? 'var(--correct)' : pct >= 50 ? 'var(--reveal)' : 'var(--wrong)';
  const label =
    pct === 100
      ? '완벽해요! 🎉'
      : pct >= 80
        ? '잘했어요! 👏'
        : pct >= 50
          ? '조금만 더! 💪'
          : '복습이 필요해요 📖';

  return (
    <div className="container">
      <div className="quiz-layout">
        <div className="result-screen">
          <h2>테스트 완료!</h2>
          <div className="result-score" style={{ color: scoreColor }}>
            {pct}%
          </div>
          <div className="result-label">{label}</div>
          <div className="result-detail">
            <div>
              <div className="big" style={{ color: 'var(--correct)' }}>
                {correct}
              </div>
              맞음
            </div>
            <div>
              <div className="big" style={{ color: 'var(--wrong)' }}>
                {wrong}
              </div>
              틀림
            </div>
            <div>
              <div className="big">{total}</div>전체
            </div>
          </div>
          {wrongWords.length > 0 && (
            <div className="wrong-list">
              <h3>✗ 틀린 단어 복습</h3>
              <div>
                {wrongWords.map((w) => (
                  <div key={w.id} className="wrong-item">
                    <button
                      type="button"
                      className="wi-star-btn"
                      onClick={() => toggleHard(w.id)}
                      style={
                        hardWords.has(w.id)
                          ? { color: 'var(--star)' }
                          : undefined
                      }
                    >
                      {hardWords.has(w.id) ? '★' : '☆'}
                    </button>
                    <span className="wi-kanji">{w.kanji}</span>
                    <span className="wi-reading">{w.hira}</span>
                    <span className="wi-meaning">{w.mean}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="controls">
            <button type="button" className="ctrl-btn" onClick={onRetryAll}>
              🔄 전체 다시
            </button>
            <button type="button" className="ctrl-btn" onClick={onRetryWrong}>
              🔁 틀린 것만 다시
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
