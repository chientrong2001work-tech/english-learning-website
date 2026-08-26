import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Roadmap from "./components/roadmap/Roadmap";
import Flashcards from "./components/Flashcards";
import Quiz from "./components/Quiz";
import GrammarTips from "./components/GrammarTips";
import Footer from "./components/Footer";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { vocabulary } from "./data/vocabulary";

function App() {
  const [knownIds, setKnownIds] = useLocalStorage<string[]>("engup-known-words", []);

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
        <Roadmap />
        <Flashcards knownIds={knownIds} onToggleKnown={handleToggleKnown} />
        <Quiz />
        <GrammarTips />
      </main>
      <Footer />
    </div>
  );
}

export default App;
