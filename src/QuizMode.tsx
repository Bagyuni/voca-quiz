import { useCallback, useEffect, useState } from 'react';
import { QuizCard } from './QuizCard';
import { ResultScreen } from './ResultScreen';
import type { Word } from './types';
import { useStore } from './useStore';
import { cn, shuffle } from './utils';

export function QuizMode() {
  const { getFilteredWords, hardWords, toggleHard, setMode } = useStore();

  const [words, setWords] = useState<Word[]>([]);
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [wrongWords, setWrongWords] = useState<Word[]>([]);
  const [phase, setPhase] = useState<'active' | 'result'>('active');

  const initQuiz = useCallback(
    (subset?: Word[]) => {
      const base = subset || getFilteredWords();
      if (base.length === 0) {
        alert('해당 조건의 단어가 없습니다.');
        setMode('study');
        return;
      }
      setWords(shuffle(base));
      setIdx(0);
      setCorrect(0);
      setWrong(0);
      setRevealed(false);
      setWrongWords([]);
      setPhase('active');
    },
    [getFilteredWords, setMode],
  );

  const startHardQuiz = useCallback(() => {
    const hards = getFilteredWords().filter((w) => hardWords.has(w.id));
    if (hards.length === 0) {
      alert(
        '별표(★)로 체크한 단어가 없습니다. 해당 Day의 공부 모드에서 단어를 먼저 체크해주세요.',
      );
      return;
    }
    initQuiz(hards);
  }, [getFilteredWords, hardWords, initQuiz]);

  const revealCard = useCallback(() => {
    if (!revealed) setRevealed(true);
  }, [revealed]);

  const markAnswer = useCallback(
    (isCorrect: boolean) => {
      if (!revealed) return;

      const currentWord = words[idx];

      if (isCorrect) {
        setCorrect((prev) => prev + 1);
      } else {
        setWrong((prev) => prev + 1);
        setWrongWords((prev) => [...prev, currentWord]);
        if (!hardWords.has(currentWord.id)) {
          toggleHard(currentWord.id);
        }
      }

      setRevealed(false);

      const nextIdx = idx + 1;
      setTimeout(() => {
        if (nextIdx >= words.length) {
          setIdx(nextIdx);
          setPhase('result');
        } else {
          setIdx(nextIdx);
        }
      }, 300);
    },
    [revealed, words, idx, hardWords, toggleHard],
  );

  const retryWrong = useCallback(() => {
    if (wrongWords.length === 0) {
      initQuiz();
      return;
    }
    initQuiz(wrongWords);
  }, [wrongWords, initQuiz]);

  // Auto-start on mount (intentionally run once — day changes remount via key)
  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only effect
  useEffect(() => {
    initQuiz();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        revealCard();
      }
      if (e.code === 'ArrowRight' && revealed) markAnswer(true);
      if (e.code === 'ArrowLeft' && revealed) markAnswer(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [revealCard, markAnswer, revealed]);

  if (phase === 'result') {
    return (
      <ResultScreen
        correct={correct}
        wrong={wrong}
        total={words.length}
        wrongWords={wrongWords}
        onRetryAll={() => initQuiz()}
        onRetryWrong={retryWrong}
      />
    );
  }

  if (words.length === 0) return null;

  const currentWord = words[idx];
  if (!currentWord) return null;
  const progress = words.length > 0 ? (idx / words.length) * 100 : 0;

  return (
    <div className="container">
      <div className="quiz-layout">
        <div className="stats">
          <div>
            진행: <span className="num">{idx + 1}</span> /{' '}
            <span className="num">{words.length}</span>
          </div>
          <div className="correct-count">
            ✓ <span className="num">{correct}</span>
          </div>
          <div className="wrong-count">
            ✗ <span className="num">{wrong}</span>
          </div>
        </div>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <QuizCard
          word={currentWord}
          revealed={revealed}
          onReveal={revealCard}
        />

        <div className={cn('buttons', revealed && 'visible')}>
          <button
            type="button"
            className="btn btn-wrong"
            onClick={() => markAnswer(false)}
          >
            몰랐어 ✗
          </button>
          <button
            type="button"
            className="btn btn-correct"
            onClick={() => markAnswer(true)}
          >
            알았어 ✓
          </button>
        </div>

        <div className="keyboard-hint">
          <kbd>Space</kbd> 정답 확인 &nbsp; <kbd>←</kbd> 몰랐어 &nbsp;{' '}
          <kbd>→</kbd> 알았어
        </div>

        <div className="controls" style={{ marginTop: 20 }}>
          <button type="button" className="ctrl-btn" onClick={() => initQuiz()}>
            🔀 조건 랜덤 퀴즈
          </button>
          <button
            type="button"
            className="ctrl-btn star-quiz-btn"
            onClick={startHardQuiz}
          >
            ★ 어려운 단어만 퀴즈
          </button>
        </div>
      </div>
    </div>
  );
}
