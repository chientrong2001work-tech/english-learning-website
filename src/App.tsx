import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import PlacementTest from "./components/placement/PlacementTest";
import Roadmap from "./components/roadmap/Roadmap";
import Flashcards from "./components/Flashcards";
import Quiz from "./components/Quiz";
import GrammarTips from "./components/GrammarTips";
import Footer from "./components/Footer";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useLevelProgress } from "./hooks/useLevelProgress";
import { vocabulary } from "./data/vocabulary";

function App() {
  const [knownIds, setKnownIds] = useLocalStorage<string[]>("engup-known-words", []);
  const {
    knownIds: levelKnownIds,
    toggleKnown: toggleLevelKnown,
    recordScore,
    progress,
    placementLevel,
    applyPlacement,
  } = useLevelProgress();

  function handleToggleKnown(id: string, known: boolean) {
    setKnownIds((prev) => {
      if (known) {
        return prev.includes(id) ? prev : [...prev, id];
      }
      return prev.filter((wordId) => wordId !== id);
    });
  }

  const topicKnownCount = knownIds.filter((id) => vocabulary.some((w) => w.id === id)).length;

  return (
    <div className="min-h-screen bg-[#f7fbf9]">
      <Navbar knownCount={topicKnownCount} totalCount={vocabulary.length} />
      <main>
        <Hero />
        <PlacementTest placementLevel={placementLevel} onApplyPlacement={applyPlacement} />
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
