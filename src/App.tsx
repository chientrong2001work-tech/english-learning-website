import { useEffect, useState, type ReactNode } from "react";
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
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useLevelProgress } from "./hooks/useLevelProgress";
import { vocabulary } from "./data/vocabulary";
import { levelVocabulary } from "./data/levelVocabulary";

const ALL_VOCAB_IDS = new Set([...vocabulary.map((w) => w.id), ...levelVocabulary.map((w) => w.id)]);
const TOTAL_VOCAB_COUNT = vocabulary.length + levelVocabulary.length;

const ENTRY_TEST_ROUTE = "#/kiem-tra-dau-vao";
const SPEAKING_ROOM_ROUTE = "#/phong-speaking-ao";

function App() {
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

  let page: ReactNode;
  if (route === ENTRY_TEST_ROUTE) {
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

export default App;
