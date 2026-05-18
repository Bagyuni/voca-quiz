import { useEffect } from 'react';
import { useDragScroll } from './useDragScroll';
import { useStore } from './useStore';
import { cn } from './utils';

export function Header() {
  const {
    currentMode,
    setMode,
    selectedDays,
    toggleDay,
    clearDays,
    daysAvailable,
    syncing,
    syncStatus,
    syncFromSheet,
  } = useStore();

  const tabsRef = useDragScroll<HTMLDivElement>();

  // 선택된 탭 중 첫 번째를 중앙으로 스크롤
  const firstSelected = [...selectedDays][0] ?? '';
  const days = daysAvailable;
  useEffect(() => {
    if (!firstSelected || days.length === 0) return;
    const container = tabsRef.current;
    if (!container) return;
    const active = container.querySelector<HTMLElement>('.day-btn.active');
    if (!active) return;
    if (container.scrollWidth > container.clientWidth) {
      container.scrollTo({
        left:
          active.offsetLeft -
          container.clientWidth / 2 +
          active.offsetWidth / 2,
      });
    }
  }, [firstSelected, days, tabsRef]);

  const syncIcon =
    syncStatus === 'done' ? '✓' : syncStatus === 'fail' ? '✗' : '↻';

  return (
    <div className="header">
      <h1>
        JLPT <span>단어장</span>
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
          {syncIcon}
        </button>
      </h1>

      <div className="mode-switch">
        <button
          type="button"
          className={cn('mode-btn', currentMode === 'table' && 'active')}
          onClick={() => setMode('table')}
        >
          📋 표 모드
        </button>
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

      <div className="selection-bar">
        {selectedDays.size === 0 ? (
          <span className="selection-empty">전체</span>
        ) : (
          <span className="selection-indicator">
            {selectedDays.size}개 선택중
            <button
              type="button"
              className="selection-clear-btn"
              onClick={clearDays}
              aria-label="전체로 돌아가기"
            >
              ✕
            </button>
          </span>
        )}
      </div>

      <div className="day-tabs" ref={tabsRef}>
        {daysAvailable.map((d) => (
          <button
            type="button"
            key={d}
            className={cn('day-btn', selectedDays.has(d) && 'active')}
            onClick={() => toggleDay(d)}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}
