// ポケモンの進化ライン（タイプ）
export type Line = 'GRASS' | 'FIRE' | 'WATER';

// 駒のサイズ（進化段階に対応）
export type Size = 'S' | 'M' | 'L';

// プレイヤー識別子
export type Player = 'A' | 'B';

// 効果の種類
export type EffectType = 'SEED_LOCK' | 'BARRIER';

// 効果の有効期限
export type EffectExpiry = 'OPP_TURN_START' | 'OPP_TURN_END';

// 能力の種類
export type AbilityType = 'LEECH_SEED' | 'EMBER' | 'PROTECT';

// 駒
export interface Piece {
  id: string;
  owner: Player;
  line: Line;
  pokemonId: number;
  size: Size;
}

// 効果（やどりぎ、まもる）
export interface Effect {
  type: EffectType;
  targetPieceId: string;
  expiresAt: EffectExpiry;
  appliedBy: Player;
}

// 盤面のマス（スタック構造）
export interface Cell {
  stack: Piece[]; // 下から上の順で格納
}

// 3x3の盤面
export type Board = Cell[][];

// アクションの種類
export type ActionType = 'PLACE' | 'MOVE' | 'ABILITY';

// 配置アクション
export interface PlaceAction {
  type: 'PLACE';
  pieceId: string;
  to: { row: number; col: number };
}

// 移動アクション
export interface MoveAction {
  type: 'MOVE';
  from: { row: number; col: number };
  to: { row: number; col: number };
}

// 能力アクション
export interface AbilityAction {
  type: 'ABILITY';
  ability: AbilityType;
  targetPosition?: { row: number; col: number };
  targetPieceId?: string;
}

export type GameAction = PlaceAction | MoveAction | AbilityAction;

// ゲームフェーズ
export type GamePhase = 'LINE_SELECT' | 'PLAYING' | 'GAME_OVER';

// ゲーム状態
export interface GameState {
  phase: GamePhase;
  board: Board;
  currentPlayer: Player;
  playerA: PlayerState;
  playerB: PlayerState;
  effects: Effect[];
  winner: Player | null;
  turnCount: number;
}

// プレイヤーの状態
export interface PlayerState {
  line: Line | null;
  reserve: Piece[]; // 手札
  abilityUsesRemaining: number;
}

// ポケモン情報（PokeAPI から取得）
export interface PokemonInfo {
  id: number;
  name: string;
  japaneseName: string;
  imageUrl: string;
  line: Line;
  size: Size;
}

// ポケモンデータのマッピング
export const POKEMON_DATA: Record<number, { line: Line; size: Size }> = {
  // 草ライン
  1: { line: 'GRASS', size: 'S' }, // フシギダネ
  2: { line: 'GRASS', size: 'M' }, // フシギソウ
  3: { line: 'GRASS', size: 'L' }, // フシギバナ
  // 炎ライン
  4: { line: 'FIRE', size: 'S' }, // ヒトカゲ
  5: { line: 'FIRE', size: 'M' }, // リザード
  6: { line: 'FIRE', size: 'L' }, // リザードン
  // 水ライン
  7: { line: 'WATER', size: 'S' }, // ゼニガメ
  8: { line: 'WATER', size: 'M' }, // カメール
  9: { line: 'WATER', size: 'L' }, // カメックス
};

// サイズの強さ順
export const SIZE_ORDER: Record<Size, number> = {
  S: 1,
  M: 2,
  L: 3,
};

// 各ラインのポケモンID
export const LINE_POKEMON_IDS: Record<Line, number[]> = {
  GRASS: [1, 2, 3],
  FIRE: [4, 5, 6],
  WATER: [7, 8, 9],
};

// 能力とラインの対応
export const LINE_ABILITIES: Record<Line, AbilityType> = {
  GRASS: 'LEECH_SEED',
  FIRE: 'EMBER',
  WATER: 'PROTECT',
};

// 能力名（日本語）
export const ABILITY_NAMES: Record<AbilityType, string> = {
  LEECH_SEED: 'やどりぎのタネ',
  EMBER: 'ひのこ',
  PROTECT: 'まもる',
};
