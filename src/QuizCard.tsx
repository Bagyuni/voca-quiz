import type { Word } from './types';
import { cn } from './utils';

interface Props {
  word: Word;
  revealed: boolean;
  isHard: boolean;
  onReveal: () => void;
  onToggleHard: () => void;
}

export function QuizCard({
  word,
  revealed,
  isHard,
  onReveal,
  onToggleHard,
}: Props) {
  return (
    <div className="card-container">
      <button
        type="button"
        className={cn('quiz-star-btn', isHard && 'is-hard')}
        onClick={onToggleHard}
        aria-label={isHard ? '어려움 해제' : '어려움 표시'}
      >
        {isHard ? '★' : '☆'}
      </button>
      <button
        type="button"
        className={cn('card', revealed && 'revealed')}
        onClick={onReveal}
      >
        <div className="kanji">{word.kanji}</div>
        <div className="answer">
          <div className="hiragana">{word.hira}</div>
          <div className="meaning">{word.mean}</div>
          {word.ex && (
            <div className="example">
              <span className="jp">{word.ex}</span>
              <br />
              {word.exKr}
            </div>
          )}
        </div>
        <div className="card-hint">클릭하여 정답 확인</div>
      </button>
    </div>
  );
}
