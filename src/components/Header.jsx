import React from "react";

export default function Header({ currentScore, bestScore, onResetBest }) {
  return (
    <header className="header">
      <div>
        <h1 className="title">포켓몬 기억력 게임</h1>
        <p className="subtitle">
          한번씩만 클릭하세요 - 클릭할 때마다 카드가 섞여요.
        </p>
      </div>

      <div className="scoreboard">
        <div className="scorebox">
          <div className="scorelabel">점수</div>
          <div className="scorevalue">{currentScore}</div>
        </div>

        <div className="scorebox">
          <div className="scorelabel">최고 점수</div>
          <div className="scorevalue">{bestScore}</div>
        </div>

        <button className="btn btn-danger" onClick={onResetBest}>
          점수 초기화
        </button>
      </div>
    </header>
  );
}
