import { useEffect, useRef, useState } from 'react';
import { type Font, type Theme, useStore } from './useStore';
import { cn } from './utils';

export function Settings() {
  const { theme, font, setTheme, setFont } = useStore();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="settings-wrap" ref={wrapRef}>
      <button
        type="button"
        className={cn('settings-btn', open && 'open')}
        onClick={() => setOpen((v) => !v)}
        aria-label="설정"
      >
        ⚙
      </button>
      {open && (
        <div className="settings-popover" role="dialog" aria-label="설정">
          <SegmentRow
            label="테마"
            value={theme}
            options={[
              { value: 'dark', label: '다크' },
              { value: 'light', label: '라이트' },
            ]}
            onChange={setTheme}
          />
          <SegmentRow
            label="폰트"
            value={font}
            options={[
              { value: 'serif', label: '명조' },
              { value: 'sans', label: '고딕' },
            ]}
            onChange={setFont}
          />
        </div>
      )}
    </div>
  );
}

interface SegmentRowProps<T extends string> {
  label: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (v: T) => void;
}

function SegmentRow<T extends Theme | Font>({
  label,
  value,
  options,
  onChange,
}: SegmentRowProps<T>) {
  return (
    <div className="settings-row">
      <div className="settings-label">{label}</div>
      <div className="settings-segment">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={cn('seg-btn', value === opt.value && 'active')}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
