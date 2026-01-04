import { Line, AbilityType, ABILITY_NAMES, LINE_ABILITIES } from '../types';
import './AbilityPanel.css';

interface AbilityPanelProps {
  line: Line;
  usesRemaining: number;
  isCurrentPlayer: boolean;
  isAbilityMode: boolean;
  onAbilityClick: () => void;
  onCancelAbility: () => void;
}

const ABILITY_DESCRIPTIONS: Record<AbilityType, string> = {
  LEECH_SEED: '相手の駒を次のターン中移動不可にする',
  EMBER: '任意のトップ駒を手札に戻す',
  PROTECT: '自分の駒をバリアで守る',
};

export const AbilityPanel = ({
  line,
  usesRemaining,
  isCurrentPlayer,
  isAbilityMode,
  onAbilityClick,
  onCancelAbility,
}: AbilityPanelProps) => {
  const abilityType = LINE_ABILITIES[line];
  const abilityName = ABILITY_NAMES[abilityType];
  const description = ABILITY_DESCRIPTIONS[abilityType];

  const canUse = isCurrentPlayer && usesRemaining > 0 && !isAbilityMode;

  return (
    <div className={`ability-panel line-${line.toLowerCase()}`}>
      <h4 className="ability-name">{abilityName}</h4>
      <p className="ability-description">{description}</p>
      <div className="ability-uses">
        残り: {usesRemaining}/2
      </div>
      {isAbilityMode ? (
        <button className="ability-button cancel" onClick={onCancelAbility}>
          キャンセル
        </button>
      ) : (
        <button
          className="ability-button"
          onClick={onAbilityClick}
          disabled={!canUse}
        >
          {usesRemaining > 0 ? '使用する' : '使用済み'}
        </button>
      )}
    </div>
  );
};
