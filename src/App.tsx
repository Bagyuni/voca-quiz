import { Header } from './Header';
import { Lock } from './Lock';
import { QuizMode } from './QuizMode';
import { StudyMode } from './StudyMode';
import { TableMode } from './TableMode';
import { StoreProvider, useStore } from './useStore';

function AppContent() {
  const { loading, error, currentMode, selectedDays } = useStore();

  if (loading) {
    return (
      <div
        className="container"
        style={{ textAlign: 'center', paddingTop: 50 }}
      >
        <h2 style={{ color: 'var(--text)', marginBottom: 10 }}>
          데이터를 불러오는 중입니다...
        </h2>
        <p style={{ color: 'var(--text-dim)' }}>단어장을 불러오고 있습니다.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="container"
        style={{ textAlign: 'center', paddingTop: 50 }}
      >
        <h2 style={{ color: 'var(--wrong)' }}>데이터 로드 실패</h2>
        <p style={{ color: 'var(--text-dim)', marginTop: 10 }}>{error}</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      {currentMode === 'study' && <StudyMode />}
      {currentMode === 'table' && <TableMode />}
      {currentMode === 'quiz' && (
        <QuizMode
          key={
            selectedDays.size === 0
              ? 'quiz-all'
              : `quiz-${[...selectedDays].sort().join(',')}`
          }
        />
      )}
    </>
  );
}

export function App() {
  return (
    <Lock>
      <StoreProvider>
        <AppContent />
      </StoreProvider>
    </Lock>
  );
}
