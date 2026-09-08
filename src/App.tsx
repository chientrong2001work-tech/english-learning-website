import { useEffect, useRef, useState, type ReactNode } from "react";
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
import InstallBanner from "./components/InstallBanner";
import LoginScreen from "./components/auth/LoginScreen";
import AccessDeniedScreen from "./components/auth/AccessDeniedScreen";
import AdminPage from "./pages/AdminPage";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { loadLearningData, saveLearningData, syncProgress } from "./lib/members";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { createEmptyScores, useLevelProgress } from "./hooks/useLevelProgress";
import { vocabulary } from "./data/vocabulary";
import { levelVocabulary } from "./data/levelVocabulary";

const ALL_VOCAB_IDS = new Set([...vocabulary.map((w) => w.id), ...levelVocabulary.map((w) => w.id)]);
const TOTAL_VOCAB_COUNT = vocabulary.length + levelVocabulary.length;

const ENTRY_TEST_ROUTE = "#/kiem-tra-dau-vao";
const SPEAKING_ROOM_ROUTE = "#/phong-speaking-ao";
const ADMIN_ROUTE = "#/quan-tri";

function AppContent() {
  const { user, loading, configured, isAdmin, authorized, identitySynced } = useAuth();
  const [route, setRoute] = useState(() => window.location.hash);
  const [knownIds, setKnownIds] = useLocalStorage<string[]>("engup-known-words", []);
  const { recordScore, progress, placementLevel, applyPlacement, levelScores, applyCloudScores } =
    useLevelProgress(knownIds);

  // Each account's learning progress (known words, level scores, placement)
  // lives in Firestore under its own uid, so two different logins on the
  // same browser never see each other's data. progressReady gates the main
  // app screen until the signed-in account's own cloud data has been pulled
  // down and applied — otherwise the page would flash whatever was left in
  // this browser's local cache from a previous account before snapping to
  // the right numbers.
  const [progressReady, setProgressReady] = useState(false);
  const loadedUidRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user || !authorized) {
      loadedUidRef.current = null;
      setProgressReady(false);
      return;
    }
    if (loadedUidRef.current === user.uid) return;
    let cancelled = false;
    setProgressReady(false);
    loadLearningData(user.uid)
      .then((data) => {
        if (cancelled) return;
        if (data) {
          setKnownIds(data.knownIds);
          applyCloudScores(data.levelScores, data.placementLevel);
        } else {
          setKnownIds([]);
          applyCloudScores(createEmptyScores(), null);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (cancelled) return;
        loadedUidRef.current = user.uid;
        setProgressReady(true);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authorized]);

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

  const currentLevelInfo = progress.find((p) => p.unlocked && !p.levelPassed) ?? progress[progress.length - 1];
  const currentLevel = currentLevelInfo?.level ?? null;
  const currentLevelKnown = currentLevelInfo?.knownCount ?? 0;
  const currentLevelTarget = currentLevelInfo?.vocabTarget ?? 0;
  const currentLevelPassed = currentLevelInfo?.levelPassed ?? false;

  useEffect(() => {
    if (!user || !authorized || !identitySynced) return;
    syncProgress(user.uid, {
      knownCount: totalKnownCount,
      totalVocab: TOTAL_VOCAB_COUNT,
      placementLevel: placementLevel ?? null,
      currentLevel,
      currentLevelKnown,
      currentLevelTarget,
      currentLevelPassed,
    }).catch(() => {});
  }, [
    user,
    authorized,
    identitySynced,
    totalKnownCount,
    placementLevel,
    currentLevel,
    currentLevelKnown,
    currentLevelTarget,
    currentLevelPassed,
  ]);

  useEffect(() => {
    if (!user || !authorized || !progressReady) return;
    saveLearningData(user.uid, { knownIds, levelScores, placementLevel }).catch(() => {});
  }, [user, authorized, progressReady, knownIds, levelScores, placementLevel]);

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

  if (!progressReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7fbf9]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
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
        <InstallBanner />
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
