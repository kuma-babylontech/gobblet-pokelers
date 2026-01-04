import { Player, PokemonInfo, Line, LINE_POKEMON_IDS } from '../types';
import './GameOver.css';

interface GameOverProps {
  winner: Player;
  winnerLine: Line;
  pokemonCache: Map<number, PokemonInfo>;
  onRestart: () => void;
}

export const GameOver = ({
  winner,
  winnerLine,
  pokemonCache,
  onRestart,
}: GameOverProps) => {
  const playerLabel = winner === 'A' ? 'プレイヤー1' : 'プレイヤー2';
  const pokemonIds = LINE_POKEMON_IDS[winnerLine];

  return (
    <div className="game-over-overlay">
      <div className="game-over-modal">
        <h2 className="winner-title">ゲーム終了!</h2>
        <div className="winner-info">
          <span className={`winner-name player-${winner.toLowerCase()}`}>
            {playerLabel}
          </span>
          の勝利!
        </div>
        <div className="winner-pokemon">
          {pokemonIds.map((id) => {
            const pokemon = pokemonCache.get(id);
            return (
              pokemon && (
                <img
                  key={id}
                  src={pokemon.imageUrl}
                  alt={pokemon.japaneseName}
                  className="winner-pokemon-img"
                />
              )
            );
          })}
        </div>
        <button className="restart-button" onClick={onRestart}>
          もう一度プレイ
        </button>
      </div>
    </div>
  );
};
