import type { Word } from './types';
import { cn } from './utils';

interface Props {
  word: Word;
  revealed: boolean;
  onReveal: () => void;
}

export function QuizCard({ word, revealed, onReveal }: Props) {
  return (
    <div className="card-container">
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
