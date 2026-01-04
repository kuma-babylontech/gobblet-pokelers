import { Piece, Size, PokemonInfo } from '../types';
import './PieceComponent.css';

interface PieceComponentProps {
  piece: Piece;
  pokemonInfo?: PokemonInfo;
  onClick?: () => void;
  isSelected?: boolean;
  isLocked?: boolean;
  isProtected?: boolean;
  size?: 'normal' | 'small';
}

const SIZE_DIMENSIONS: Record<Size, number> = {
  S: 50,
  M: 70,
  L: 90,
};

const SIZE_DIMENSIONS_SMALL: Record<Size, number> = {
  S: 35,
  M: 50,
  L: 65,
};

export const PieceComponent = ({
  piece,
  pokemonInfo,
  onClick,
  isSelected = false,
  isLocked = false,
  isProtected = false,
  size = 'normal',
}: PieceComponentProps) => {
  const dimensions = size === 'normal' ? SIZE_DIMENSIONS : SIZE_DIMENSIONS_SMALL;
  const dim = dimensions[piece.size];

  const playerClass = piece.owner === 'A' ? 'player-a' : 'player-b';
  const lineClass = `line-${piece.line.toLowerCase()}`;

  return (
    <div
      className={`piece ${playerClass} ${lineClass} ${isSelected ? 'selected' : ''} ${isLocked ? 'locked' : ''} ${isProtected ? 'protected' : ''}`}
      style={{ width: dim, height: dim }}
      onClick={onClick}
    >
      {pokemonInfo ? (
        <img
          src={pokemonInfo.imageUrl}
          alt={pokemonInfo.japaneseName}
          className="piece-image"
        />
      ) : (
        <div className="piece-placeholder">{piece.size}</div>
      )}
      {isLocked && <div className="effect-indicator locked-indicator">🌱</div>}
      {isProtected && <div className="effect-indicator protected-indicator">🛡️</div>}
    </div>
  );
};
