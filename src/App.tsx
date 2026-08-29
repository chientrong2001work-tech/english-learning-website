import { useEffect, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Roadmap from "./components/roadmap/Roadmap";
import Flashcards from "./components/Flashcards";
import Quiz from "./components/Quiz";
import GrammarTips from "./components/GrammarTips";
import Footer from "./components/Footer";
import EntryTestPage from "./pages/EntryTestPage";
import SpeakingRoomPage from "./pages/SpeakingRoomPage";
import ContactWidget from "./components/ContactWidget";
import LoginScreen from "./components/auth/LoginScreen";
import AccessDeniedScreen from "./components/auth/AccessDeniedScreen";
import AdminPage from "./pages/AdminPage";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useLevelProgress } from "./hooks/useLevelProgress";
import { vocabulary } from "./data/vocabulary";
import { levelVocabulary } from "./data/levelVocabulary";

const ALL_VOCAB_IDS = new Set([...vocabulary.map((w) => w.id), ...levelVocabulary.map((w) => w.id)]);
const TOTAL_VOCAB_COUNT = vocabulary.length + levelVocabulary.length;

const ENTRY_TEST_ROUTE = "#/kiem-tra-dau-vao";
const SPEAKING_ROOM_ROUTE = "#/phong-speaking-ao";
const ADMIN_ROUTE = "#/quan-tri";

function AppContent() {
  const { user, loading, configured, isAdmin, authorized } = useAuth();
  const [route, setRoute] = useState(() => window.location.hash);
  const [knownIds, setKnownIds] = useLocalStorage<string[]>("engup-known-words", []);
  const { recordScore, progress, placementLevel, applyPlacement } = useLevelProgress(knownIds);

  useEffect(() => {
    function handleHashChange() {
      setRoute(window.location.hash);
    }
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  function handleToggleKnown(id: string, known: boolean) {
    setKnownIds((prev) => {
      if (known) {
        return prev.includes(id) ? prev : [...prev, id];
      }
      return prev.filter((wordId) => wordId !== id);
    });
  }

  const totalKnownCount = knownIds.filter((id) => ALL_VOCAB_IDS.has(id)).length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7fbf9]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!configured || !user) {
    return <LoginScreen />;
  }

  if (!authorized) {
    return <AccessDeniedScreen />;
  }

  let page: ReactNode;
  if (route === ADMIN_ROUTE && isAdmin) {
    page = <AdminPage />;
  } else if (route === ENTRY_TEST_ROUTE) {
    page = <EntryTestPage placementLevel={placementLevel} onApplyPlacement={applyPlacement} />;
  } else if (route === SPEAKING_ROOM_ROUTE) {
    page = <SpeakingRoomPage />;
  } else {
    page = (
      <div className="min-h-screen bg-[#f7fbf9]">
        <Navbar knownCount={totalKnownCount} totalCount={TOTAL_VOCAB_COUNT} />
        <main>
          <Hero />
          <Roadmap
            progress={progress}
            knownIds={knownIds}
            onToggleKnown={handleToggleKnown}
            onRecordScore={recordScore}
          />
          <Flashcards knownIds={knownIds} onToggleKnown={handleToggleKnown} />
          <Quiz />
          <GrammarTips />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      {page}
      <ContactWidget />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
