import { useEffect, useRef, useState } from 'react';

const PASSWORD_HASH =
  '39e287b0a470630fccf13e717b8e6b2d5c0dff8cad9a9d19fc7d2acf45a3aed3';
const STORAGE_KEY = 'voca-quiz:unlocked';

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(text),
  );
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

interface Props {
  children: React.ReactNode;
}

export function Lock({ children }: Props) {
  const [unlocked, setUnlocked] = useState(
    () => localStorage.getItem(STORAGE_KEY) === '1',
  );
  const [input, setInput] = useState('');
  const [wrong, setWrong] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!wrong) return;
    const t = setTimeout(() => setWrong(false), 600);
    return () => clearTimeout(t);
  }, [wrong]);

  if (unlocked) return <>{children}</>;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hash = await sha256(input);
    if (hash === PASSWORD_HASH) {
      localStorage.setItem(STORAGE_KEY, '1');
      setUnlocked(true);
    } else {
      setWrong(true);
      setInput('');
    }
  };

  return (
    <form className="lock-screen" onSubmit={submit}>
      <h1 className="lock-title">🔒</h1>
      <input
        ref={inputRef}
        type="password"
        className={wrong ? 'lock-input is-wrong' : 'lock-input'}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="비밀번호"
      />
      <button type="submit" className="lock-submit">
        들어가기
      </button>
    </form>
  );
}
