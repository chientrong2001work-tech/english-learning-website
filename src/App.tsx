import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Roadmap from "./components/roadmap/Roadmap";
import Flashcards from "./components/Flashcards";
import Quiz from "./components/Quiz";
import GrammarTips from "./components/GrammarTips";
import Footer from "./components/Footer";
import EntryTestPage from "./pages/EntryTestPage";
import SpeakingRoomPage from "./pages/SpeakingRoomPage";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useLevelProgress } from "./hooks/useLevelProgress";
import { vocabulary } from "./data/vocabulary";

const ENTRY_TEST_ROUTE = "#/kiem-tra-dau-vao";
const SPEAKING_ROOM_ROUTE = "#/phong-speaking-ao";

function App() {
  const [route, setRoute] = useState(() => window.location.hash);
  const [knownIds, setKnownIds] = useLocalStorage<string[]>("engup-known-words", []);
  const {
    knownIds: levelKnownIds,
    toggleKnown: toggleLevelKnown,
    recordScore,
    progress,
    placementLevel,
    applyPlacement,
  } = useLevelProgress();

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

  const topicKnownCount = knownIds.filter((id) => vocabulary.some((w) => w.id === id)).length;

  if (route === ENTRY_TEST_ROUTE) {
    return <EntryTestPage placementLevel={placementLevel} onApplyPlacement={applyPlacement} />;
  }

  if (route === SPEAKING_ROOM_ROUTE) {
    return <SpeakingRoomPage />;
  }

  return (
    <div className="min-h-screen bg-[#f7fbf9]">
      <Navbar knownCount={topicKnownCount} totalCount={vocabulary.length} />
      <main>
        <Hero />
        <Roadmap
          progress={progress}
          knownIds={levelKnownIds}
          onToggleKnown={toggleLevelKnown}
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

export default App;
