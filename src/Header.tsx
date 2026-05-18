import { useEffect, useRef, useState } from 'react';
import { useDragScroll } from './useDragScroll';
import { useStore } from './useStore';
import { cn } from './utils';

export function Header() {
  const {
    currentMode,
    setMode,
    currentDay,
    setDay,
    dayRange,
    setDayRange,
    daysAvailable,
    syncing,
    syncStatus,
    syncFromSheet,
  } = useStore();

  const tabsRef = useDragScroll<HTMLDivElement>();
  const [rangeOpen, setRangeOpen] = useState(false);
  const [pendingStart, setPendingStart] = useState<string>('');
  const [pendingEnd, setPendingEnd] = useState<string>('');
  const popoverRef = useRef<HTMLDivElement>(null);
  const rangeBtnRef = useRef<HTMLButtonElement>(null);

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

  // 팝오버 외부 클릭 시 닫기
  useEffect(() => {
    if (!rangeOpen) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (popoverRef.current?.contains(target)) return;
      if (rangeBtnRef.current?.contains(target)) return;
      setRangeOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [rangeOpen]);

  const openRangePopover = () => {
    if (daysAvailable.length === 0) return;
    const fallbackStart = daysAvailable[0];
    const fallbackEnd = daysAvailable[daysAvailable.length - 1];
    setPendingStart(dayRange?.start ?? fallbackStart);
    setPendingEnd(dayRange?.end ?? fallbackEnd);
    setRangeOpen((v) => !v);
  };

  const applyRange = () => {
    if (!pendingStart || !pendingEnd) return;
    setDayRange({ start: pendingStart, end: pendingEnd });
    setRangeOpen(false);
  };

  const isRangeActive = currentDay === 'range' && dayRange !== null;
  const rangeLabel = isRangeActive
    ? `${dayRange.start}~${dayRange.end}`
    : '범위';

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

      <div className="day-pinned">
        <button
          type="button"
          className={cn('day-btn', currentDay === 'all' && 'active')}
          onClick={() => setDay('all')}
        >
          전체
        </button>
        <div className="range-wrap">
          <button
            ref={rangeBtnRef}
            type="button"
            className={cn(
              'day-btn',
              'range-btn',
              isRangeActive && 'active',
              rangeOpen && 'open',
            )}
            onClick={openRangePopover}
          >
            {isRangeActive ? `📐 ${rangeLabel}` : '📐 범위'}
          </button>
          {rangeOpen && (
            <div className="range-popover" ref={popoverRef}>
              <div className="range-row">
                <label className="range-field">
                  <span>시작</span>
                  <select
                    value={pendingStart}
                    onChange={(e) => setPendingStart(e.target.value)}
                  >
                    {daysAvailable.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </label>
                <span className="range-dash">~</span>
                <label className="range-field">
                  <span>끝</span>
                  <select
                    value={pendingEnd}
                    onChange={(e) => setPendingEnd(e.target.value)}
                  >
                    {daysAvailable.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <button
                type="button"
                className="range-apply"
                onClick={applyRange}
              >
                적용
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="day-tabs" ref={tabsRef}>
        {daysAvailable.map((d) => (
          <button
            type="button"
            key={d}
            className={cn('day-btn', currentDay === d && 'active')}
            onClick={() => setDay(d)}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}
