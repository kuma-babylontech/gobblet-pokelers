import { Line, Player, PokemonInfo, LINE_POKEMON_IDS } from '../types';
import './LineSelector.css';

interface LineSelectorProps {
  currentPlayer: Player;
  selectedLineA: Line | null;
  selectedLineB: Line | null;
  pokemonCache: Map<number, PokemonInfo>;
  onSelectLine: (line: Line) => void;
}

const LINE_INFO: Record<Line, { name: string; ability: string }> = {
  GRASS: { name: '草タイプ', ability: 'やどりぎのタネ' },
  FIRE: { name: '炎タイプ', ability: 'ひのこ' },
  WATER: { name: '水タイプ', ability: 'まもる' },
};

export const LineSelector = ({
  currentPlayer,
  selectedLineA,
  selectedLineB,
  pokemonCache,
  onSelectLine,
}: LineSelectorProps) => {
  const isLineDisabled = (line: Line): boolean => {
    if (currentPlayer === 'A') {
      return false;
    }
    // Player B cannot select same line as Player A
    return selectedLineA === line;
  };

  const getLinePokemonImages = (line: Line) => {
    return LINE_POKEMON_IDS[line].map((id) => pokemonCache.get(id));
  };

  const playerLabel = currentPlayer === 'A' ? 'プレイヤー1' : 'プレイヤー2';

  return (
    <div className="line-selector">
      <h2 className="selector-title">{playerLabel}のポケモンを選択</h2>
      <div className="line-options">
        {(['GRASS', 'FIRE', 'WATER'] as Line[]).map((line) => {
          const info = LINE_INFO[line];
          const pokemon = getLinePokemonImages(line);
          const disabled = isLineDisabled(line);

          return (
            <button
              key={line}
              className={`line-option line-${line.toLowerCase()} ${disabled ? 'disabled' : ''}`}
              onClick={() => !disabled && onSelectLine(line)}
              disabled={disabled}
            >
              <div className="line-name">{info.name}</div>
              <div className="pokemon-images">
                {pokemon.map(
                  (p, i) =>
                    p && (
                      <img
                        key={i}
                        src={p.imageUrl}
                        alt={p.japaneseName}
                        className="pokemon-preview"
                      />
                    )
                )}
              </div>
              <div className="line-ability">能力: {info.ability}</div>
            </button>
          );
        })}
      </div>
      {selectedLineA && !selectedLineB && (
        <div className="selection-info">
          プレイヤー1は{LINE_INFO[selectedLineA].name}を選択しました
        </div>
      )}
    </div>
  );
};
