import { GameState, PokemonInfo } from '../types';
import { getTopPiece, isPieceLocked, isPieceProtected } from '../engine/gameEngine';
import { PieceComponent } from './PieceComponent';
import './GameBoard.css';

interface GameBoardProps {
  gameState: GameState;
  pokemonCache: Map<number, PokemonInfo>;
  selectedPieceId: string | null;
  validTargets: { row: number; col: number }[];
  onCellClick: (row: number, col: number) => void;
}

export const GameBoard = ({
  gameState,
  pokemonCache,
  selectedPieceId,
  validTargets,
  onCellClick,
}: GameBoardProps) => {
  const isValidTarget = (row: number, col: number): boolean => {
    return validTargets.some((t) => t.row === row && t.col === col);
  };

  return (
    <div className="game-board">
      {gameState.board.map((row, rowIndex) => (
        <div key={rowIndex} className="board-row">
          {row.map((cell, colIndex) => {
            const topPiece = getTopPiece(cell);
            const isTarget = isValidTarget(rowIndex, colIndex);
            const isSelected =
              topPiece !== null && topPiece.id === selectedPieceId;

            return (
              <div
                key={colIndex}
                className={`board-cell ${isTarget ? 'valid-target' : ''}`}
                onClick={() => onCellClick(rowIndex, colIndex)}
              >
                {topPiece && (
                  <PieceComponent
                    piece={topPiece}
                    pokemonInfo={pokemonCache.get(topPiece.pokemonId)}
                    isSelected={isSelected}
                    isLocked={isPieceLocked(gameState, topPiece.id)}
                    isProtected={isPieceProtected(gameState, topPiece.id)}
                  />
                )}
                {cell.stack.length > 1 && (
                  <div className="stack-indicator">
                    +{cell.stack.length - 1}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
