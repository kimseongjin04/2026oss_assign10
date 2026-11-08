import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import Card from "./components/Card";
import Modal from "./components/Modal";

// Utility function to capitalize first letter of a string
function capitalize(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function App() {
  // State for list of cards
  const [cards, setCards] = useState([]);
  // State for storing which card IDs have been clicked
  const [clicked, setClicked] = useState(new Set());
  // Current score in this game round
  const [currentScore, setCurrentScore] = useState(0);
  // Best score persisted in localStorage
  const [bestScore, setBestScore] = useState(() => {
    const v = localStorage.getItem("memory.bestScore");
    return v ? parseInt(v, 10) : 0;
  });
  // Loading state while fetching cards
  const [loading, setLoading] = useState(true);
  // Message to display when player makes mistake or info text
  const [message, setMessage] = useState("");
  // State to trigger congratulations modal
  const [showCongrats, setShowCongrats] = useState(false);

  // Fetch cards from API when component mounts
  useEffect(() => {
    fetchCards();
  }, []);

  // Fetch Pokémon cards from PokeAPI
  async function fetchCards() {
    setLoading(true);
    try {
      const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=20");
      if (!res.ok) throw new Error("Network error");
      const data = await res.json();
      // Map results to card objects with id, name, and image
      const items = await Promise.all(
        data.results.map(async (r) => {
        const parts = r.url.split("/").filter(Boolean);
        const id = parts[parts.length - 1];

        const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
        const species = await speciesRes.json();
        const ko = species.names.find((n) => n.language.name === "ko");
        
        
        return {
          id: Number(id),
          name: ko ? ko.name : capitalize(r.name),
          image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
          };
        })
      ); 
      // Shuffle cards before setting them
      setCards(shuffleArray(items));
    } catch (err) {
      console.error(err);
      setMessage("Failed to fetch cards — check network and try again.");
    } finally {
      setLoading(false);
    }
  }

  // Utility function to shuffle array using Fisher-Yates algorithm
  function shuffleArray(array) {
    const a = [...array];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Handle logic when user clicks on a card
  function handleCardClick(id) {
    // If card already clicked, game restarts
    if (clicked.has(id)) {
      setMessage("이런! 이미 클릭한 카드입니다. 게임을 다시 시작합니다.");
      // Update best score if necessary
      setBestScore((prev) => {
        const nb = Math.max(prev, currentScore);
        localStorage.setItem("memory.bestScore", String(nb));
        return nb;
      });
      // Reset game state
      setClicked(new Set());
      setCurrentScore(0);
      setCards((prev) => shuffleArray(prev));
      return;
    }

    // Otherwise, add card ID to clicked set
    const newSet = new Set(clicked);
    newSet.add(id);
    setClicked(newSet);

    // Increase score
    const newScore = currentScore + 1;
    setCurrentScore(newScore);
    setBestScore((prev) => {
      const nb = Math.max(prev, newScore);
      localStorage.setItem("memory.bestScore", String(nb));
      return nb;
    });

    // If all cards clicked without repeats, show congrats modal
    if (newSet.size === cards.length) {
      setShowCongrats(true);
    } else {
      setMessage("");
    }

    // Shuffle cards after each click
    setCards((prev) => shuffleArray(prev));
  }

  // Reset the best score stored in localStorage
  function handleResetBest() {
    localStorage.removeItem("memory.bestScore");
    setBestScore(0);
  }

  // Close congrats modal and reset game for a new round
  function closeCongrats() {
    setShowCongrats(false);
    setClicked(new Set());
    setCurrentScore(0);
    setMessage("좋았어! 최고 점수에 도전해 보세요.");
    setCards((prev) => shuffleArray(prev));
  }

  return (
    <div className="container">
      {/* Header with scores and reset button */}
      <Header
        currentScore={currentScore}
        bestScore={bestScore}
        onResetBest={handleResetBest}
      />

      {/* Display message if present */}
      {message && <div className="message">{message}</div>}

      {/* Show loading or the card grid */}
      {loading ? (
        <div
          style={{
            padding: "60px 0",
            textAlign: "center",
            color: "var(--muted)",
          }}
        >
          카드 가져오는 중...
        </div>
      ) : (
        <main>
          <div className="grid">
            {cards.map((c) => (
              <Card key={c.id} card={c} onClick={handleCardClick} />
            ))}
          </div>
        </main>
      )}

      {/* Congratulatory modal */}
      <Modal show={showCongrats} onClose={closeCongrats}>
        <h2>🎉 축하합니다!</h2>
        <p style={{ marginTop: 8 }}>
          실수 없이 모든 카드를 선택했습니다. — 완벽합니다. 점수:{" "}
          {cards.length}
        </p>
      </Modal>

      <div className="footer-note"> 출처 - PokeAPI.</div>
    </div>
  );
}
