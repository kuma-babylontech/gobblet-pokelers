import { Piece, Player, PokemonInfo, Size } from '../types';
import { PieceComponent } from './PieceComponent';
import './Reserve.css';

interface ReserveProps {
  player: Player;
  pieces: Piece[];
  pokemonCache: Map<number, PokemonInfo>;
  isCurrentPlayer: boolean;
  selectedPieceId: string | null;
  onPieceClick: (pieceId: string) => void;
  abilityUsesRemaining: number;
  lineName: string;
}

const SIZE_ORDER: Size[] = ['L', 'M', 'S'];

export const Reserve = ({
  player,
  pieces,
  pokemonCache,
  isCurrentPlayer,
  selectedPieceId,
  onPieceClick,
  abilityUsesRemaining,
  lineName,
}: ReserveProps) => {
  // サイズ順にソート
  const sortedPieces = [...pieces].sort(
    (a, b) => SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size)
  );

  const playerLabel = player === 'A' ? 'プレイヤー1' : 'プレイヤー2';
  const playerClass = player === 'A' ? 'player-a' : 'player-b';

  return (
    <div className={`reserve ${playerClass} ${isCurrentPlayer ? 'active' : ''}`}>
      <div className="reserve-header">
        <h3 className="reserve-title">{playerLabel}</h3>
        <span className="reserve-line">{lineName}</span>
      </div>
      <div className="reserve-info">
        <span className="ability-uses">能力: {abilityUsesRemaining}/1</span>
      </div>
      <div className="reserve-pieces">
        {sortedPieces.map((piece) => (
          <PieceComponent
            key={piece.id}
            piece={piece}
            pokemonInfo={pokemonCache.get(piece.pokemonId)}
            isSelected={piece.id === selectedPieceId}
            onClick={() => isCurrentPlayer && onPieceClick(piece.id)}
            size="small"
          />
        ))}
        {pieces.length === 0 && (
          <div className="no-pieces">手札なし</div>
        )}
      </div>
    </div>
  );
};
