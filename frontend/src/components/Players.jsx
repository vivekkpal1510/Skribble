import { useState } from "react";
import { players as dummy } from "../assets/dummyPlayers";

export default function () {
  const [players, setPlayers] = useState(dummy);
  return (
    <>
      <div className="players">
        {players.map((player, idx) => {
          return (
            <div key={idx} className="player">
              <div className="rank">#{player.rank}</div>
              <div className="name">{player.name}</div>
              <div className="score">{player.score} points</div>
            </div>
          );
        })}
      </div>
    </>
  );
}
