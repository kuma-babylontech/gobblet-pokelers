import { Piece, Player, PokemonInfo, Size, Line, AbilityType, ABILITY_NAMES, LINE_ABILITIES } from '../types';
import { PieceComponent } from './PieceComponent';
import './PlayerPanel.css';

interface PlayerPanelProps {
  player: Player;
  pieces: Piece[];
  pokemonCache: Map<number, PokemonInfo>;
  isCurrentPlayer: boolean;
  selectedPieceId: string | null;
  onPieceClick: (pieceId: string) => void;
  line: Line | null;
  abilityUsesRemaining: number;
  isAbilityMode: boolean;
  onAbilityClick: () => void;
  onCancelAbility: () => void;
}

const SIZE_ORDER: Size[] = ['L', 'M', 'S'];

const ABILITY_DESCRIPTIONS: Record<AbilityType, string> = {
  LEECH_SEED: '移動不可',
  EMBER: '手札に戻す',
  PROTECT: 'バリア',
};

export const PlayerPanel = ({
  player,
  pieces,
  pokemonCache,
  isCurrentPlayer,
  selectedPieceId,
  onPieceClick,
  line,
  abilityUsesRemaining,
  isAbilityMode,
  onAbilityClick,
  onCancelAbility,
}: PlayerPanelProps) => {
  const sortedPieces = [...pieces].sort(
    (a, b) => SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size)
  );

  const playerLabel = player === 'A' ? 'プレイヤー1' : 'プレイヤー2';
  const playerClass = player === 'A' ? 'player-a' : 'player-b';

  const abilityType = line ? LINE_ABILITIES[line] : null;
  const abilityName = abilityType ? ABILITY_NAMES[abilityType] : '';
  const description = abilityType ? ABILITY_DESCRIPTIONS[abilityType] : '';
  const canUse = isCurrentPlayer && abilityUsesRemaining > 0 && !isAbilityMode;

  return (
    <div className={`player-panel ${playerClass} ${isCurrentPlayer ? 'active' : ''}`}>
      <div className="player-panel-header">
        <span className="player-name">{playerLabel}</span>
        {line && isCurrentPlayer && (
          <div className="ability-inline">
            {isAbilityMode ? (
              <button className="ability-btn cancel" onClick={onCancelAbility}>
                キャンセル
              </button>
            ) : (
              <button
                className="ability-btn"
                onClick={onAbilityClick}
                disabled={!canUse}
                title={`${abilityName}: ${description}`}
              >
                {abilityUsesRemaining > 0 ? abilityName : '使用済'}
              </button>
            )}
          </div>
        )}
      </div>
      <div className="player-panel-pieces">
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
