import { Header } from './Header';
import { QuizMode } from './QuizMode';
import { StudyMode } from './StudyMode';
import { StoreProvider, useStore } from './useStore';

function AppContent() {
  const { loading, error, currentMode, currentDay } = useStore();

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
      {currentMode === 'quiz' && <QuizMode key={`quiz-${currentDay}`} />}
    </>
  );
}

export function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
