import { useEffect } from 'react';
import { useDragScroll } from './useDragScroll';
import { useStore } from './useStore';
import { cn } from './utils';

export function Header() {
  const {
    currentMode,
    setMode,
    currentDay,
    setDay,
    daysAvailable,
    syncing,
    syncStatus,
    syncDiff,
    syncFromSheet,
  } = useStore();

  const tabsRef = useDragScroll<HTMLDivElement>();

  // 선택된 탭이 잘리지 않도록 중앙으로 스크롤
  const day = currentDay;
  const days = daysAvailable;
  useEffect(() => {
    if (!day || days.length === 0) return;
    const container = tabsRef.current;
    if (!container) return;
    const active = container.querySelector<HTMLElement>('.day-btn.active');
    if (!active) return;
    // 탭이 넘칠 때만 스크롤 (넘치지 않으면 부모 flex가 중앙정렬)
    if (container.scrollWidth > container.clientWidth) {
      container.scrollTo({
        left:
          active.offsetLeft -
          container.clientWidth / 2 +
          active.offsetWidth / 2,
      });
    }
  }, [day, days, tabsRef]);

  const syncBtnText = syncing
    ? '↻ 동기화 중...'
    : syncStatus === 'done'
      ? syncDiff > 0
        ? `✓ +${syncDiff}개 동기화 완료`
        : '✓ 최신 상태'
      : syncStatus === 'fail'
        ? '✗ 동기화 실패'
        : '↻ 동기화';

  return (
    <div className="header">
      <div className="title-row">
        <h1>
          JLPT <span>단어장</span>
        </h1>
        <button
          type="button"
          className={cn(
            'sync-btn',
            syncing && 'syncing',
            syncStatus === 'done' && 'done',
            syncStatus === 'fail' && 'fail',
          )}
          onClick={syncFromSheet}
        >
          {syncBtnText}
        </button>
      </div>

      <div className="mode-switch">
        <button
          type="button"
          className={cn('mode-btn', currentMode === 'study' && 'active')}
          onClick={() => setMode('study')}
        >
          📖 공부 모드
        </button>
        <button
          type="button"
          className={cn('mode-btn', currentMode === 'quiz' && 'active')}
          onClick={() => setMode('quiz')}
        >
          📝 퀴즈 모드
        </button>
      </div>

      <div className="day-tabs" ref={tabsRef}>
        <button
          type="button"
          className={cn('day-btn', currentDay === 'all' && 'active')}
          onClick={() => setDay('all')}
        >
          전체
        </button>
        {daysAvailable.map((d) => (
          <button
            type="button"
            key={d}
            className={cn('day-btn', currentDay === d && 'active')}
            onClick={() => setDay(d)}
          >
            Day {d}
          </button>
        ))}
      </div>
    </div>
  );
}
