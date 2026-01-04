import {
  GameState,
  Board,
  Cell,
  Piece,
  Player,
  Line,
  Effect,
  GameAction,
  PlaceAction,
  MoveAction,
  AbilityAction,
  PlayerState,
  SIZE_ORDER,
  POKEMON_DATA,
  LINE_POKEMON_IDS,
} from '../types';

// ユニークIDの生成
let idCounter = 0;
const generateId = (): string => `piece_${++idCounter}`;

// 空の盤面を作成
const createEmptyBoard = (): Board => {
  return Array(3)
    .fill(null)
    .map(() =>
      Array(3)
        .fill(null)
        .map(() => ({ stack: [] }))
    );
};

// プレイヤーの初期駒を生成
const createPlayerPieces = (player: Player, line: Line): Piece[] => {
  const pokemonIds = LINE_POKEMON_IDS[line];
  const pieces: Piece[] = [];

  // 各サイズ2個ずつ
  pokemonIds.forEach((pokemonId) => {
    const data = POKEMON_DATA[pokemonId];
    for (let i = 0; i < 2; i++) {
      pieces.push({
        id: generateId(),
        owner: player,
        line: data.line,
        pokemonId,
        size: data.size,
      });
    }
  });

  return pieces;
};

// 初期ゲーム状態を作成（ライン選択画面）
export const createInitialState = (): GameState => {
  return {
    phase: 'LINE_SELECT',
    board: createEmptyBoard(),
    currentPlayer: 'A',
    playerA: {
      line: null,
      reserve: [],
      abilityUsesRemaining: 2,
    },
    playerB: {
      line: null,
      reserve: [],
      abilityUsesRemaining: 2,
    },
    effects: [],
    winner: null,
    turnCount: 0,
  };
};

// ライン選択
export const selectLine = (state: GameState, player: Player, line: Line): GameState => {
  const newState = { ...state };

  if (player === 'A') {
    newState.playerA = {
      ...state.playerA,
      line,
      reserve: createPlayerPieces('A', line),
    };
  } else {
    newState.playerB = {
      ...state.playerB,
      line,
      reserve: createPlayerPieces('B', line),
    };
  }

  // 両プレイヤーがライン選択済みならゲーム開始
  if (newState.playerA.line && newState.playerB.line) {
    newState.phase = 'PLAYING';
    newState.currentPlayer = 'A';
    newState.turnCount = 1;
  }

  return newState;
};

// マスのトップ駒を取得
export const getTopPiece = (cell: Cell): Piece | null => {
  if (cell.stack.length === 0) return null;
  return cell.stack[cell.stack.length - 1];
};

// 駒が固定されているか（やどりぎ）
export const isPieceLocked = (state: GameState, pieceId: string): boolean => {
  return state.effects.some(
    (effect) => effect.type === 'SEED_LOCK' && effect.targetPieceId === pieceId
  );
};

// 駒がバリア状態か
export const isPieceProtected = (state: GameState, pieceId: string): boolean => {
  return state.effects.some(
    (effect) => effect.type === 'BARRIER' && effect.targetPieceId === pieceId
  );
};

// 配置が有効かチェック
export const canPlacePiece = (
  state: GameState,
  piece: Piece,
  row: number,
  col: number
): boolean => {
  const cell = state.board[row][col];
  const topPiece = getTopPiece(cell);

  // 空マスなら配置可能
  if (!topPiece) return true;

  // バリア中の駒は覆えない
  if (isPieceProtected(state, topPiece.id)) return false;

  // サイズが大きければ覆える
  return SIZE_ORDER[piece.size] > SIZE_ORDER[topPiece.size];
};

// 移動が有効かチェック
export const canMovePiece = (
  state: GameState,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number
): boolean => {
  const fromCell = state.board[fromRow][fromCol];
  const topPiece = getTopPiece(fromCell);

  // トップ駒がない
  if (!topPiece) return false;

  // 自分の駒でない
  if (topPiece.owner !== state.currentPlayer) return false;

  // 固定されている
  if (isPieceLocked(state, topPiece.id)) return false;

  // 同じマスへの移動は不可
  if (fromRow === toRow && fromCol === toCol) return false;

  // 移動先に配置可能か
  return canPlacePiece(state, topPiece, toRow, toCol);
};

// 駒を配置
export const placePiece = (state: GameState, action: PlaceAction): GameState => {
  const player = state.currentPlayer === 'A' ? state.playerA : state.playerB;
  const pieceIndex = player.reserve.findIndex((p) => p.id === action.pieceId);

  if (pieceIndex === -1) return state;

  const piece = player.reserve[pieceIndex];

  if (!canPlacePiece(state, piece, action.to.row, action.to.col)) {
    return state;
  }

  // 新しい盤面を作成
  const newBoard = state.board.map((row) => row.map((cell) => ({ stack: [...cell.stack] })));
  newBoard[action.to.row][action.to.col].stack.push(piece);

  // 手札から駒を削除
  const newReserve = [...player.reserve];
  newReserve.splice(pieceIndex, 1);

  const newPlayerState: PlayerState = {
    ...player,
    reserve: newReserve,
  };

  return {
    ...state,
    board: newBoard,
    playerA: state.currentPlayer === 'A' ? newPlayerState : state.playerA,
    playerB: state.currentPlayer === 'B' ? newPlayerState : state.playerB,
  };
};

// 駒を移動
export const movePiece = (state: GameState, action: MoveAction): GameState => {
  if (!canMovePiece(state, action.from.row, action.from.col, action.to.row, action.to.col)) {
    return state;
  }

  const newBoard = state.board.map((row) => row.map((cell) => ({ stack: [...cell.stack] })));

  // 移動元から駒を取り出す
  const piece = newBoard[action.from.row][action.from.col].stack.pop();
  if (!piece) return state;

  // バリアを解除（自分で移動した場合）
  const newEffects = state.effects.filter(
    (effect) => !(effect.type === 'BARRIER' && effect.targetPieceId === piece.id)
  );

  // 移動先に配置
  newBoard[action.to.row][action.to.col].stack.push(piece);

  return {
    ...state,
    board: newBoard,
    effects: newEffects,
  };
};

// 能力: やどりぎのタネ
const useLeechSeed = (
  state: GameState,
  targetRow: number,
  targetCol: number
): GameState => {
  const cell = state.board[targetRow][targetCol];
  const topPiece = getTopPiece(cell);

  // 対象がない or 自分の駒 or バリア中
  if (!topPiece || topPiece.owner === state.currentPlayer) return state;
  if (isPieceProtected(state, topPiece.id)) return state;

  const newEffect: Effect = {
    type: 'SEED_LOCK',
    targetPieceId: topPiece.id,
    expiresAt: 'OPP_TURN_START',
    appliedBy: state.currentPlayer,
  };

  return {
    ...state,
    effects: [...state.effects, newEffect],
  };
};

// 能力: ひのこ
const useEmber = (state: GameState, targetRow: number, targetCol: number): GameState => {
  const cell = state.board[targetRow][targetCol];
  const topPiece = getTopPiece(cell);

  // 対象がない or バリア中
  if (!topPiece) return state;
  if (isPieceProtected(state, topPiece.id)) return state;

  // 盤面から駒を除去
  const newBoard = state.board.map((row) => row.map((c) => ({ stack: [...c.stack] })));
  newBoard[targetRow][targetCol].stack.pop();

  // 駒を持ち主の手札に戻す
  const owner = topPiece.owner;
  const ownerState = owner === 'A' ? state.playerA : state.playerB;
  const newReserve = [...ownerState.reserve, topPiece];

  // 固定効果を解除
  const newEffects = state.effects.filter(
    (effect) => effect.targetPieceId !== topPiece.id
  );

  return {
    ...state,
    board: newBoard,
    playerA: owner === 'A' ? { ...state.playerA, reserve: newReserve } : state.playerA,
    playerB: owner === 'B' ? { ...state.playerB, reserve: newReserve } : state.playerB,
    effects: newEffects,
  };
};

// 能力: まもる
const useProtect = (state: GameState, targetRow: number, targetCol: number): GameState => {
  const cell = state.board[targetRow][targetCol];
  const topPiece = getTopPiece(cell);

  // 対象がない or 相手の駒
  if (!topPiece || topPiece.owner !== state.currentPlayer) return state;

  const newEffect: Effect = {
    type: 'BARRIER',
    targetPieceId: topPiece.id,
    expiresAt: 'OPP_TURN_END',
    appliedBy: state.currentPlayer,
  };

  return {
    ...state,
    effects: [...state.effects, newEffect],
  };
};

// 能力を使用
export const useAbility = (state: GameState, action: AbilityAction): GameState => {
  const player = state.currentPlayer === 'A' ? state.playerA : state.playerB;

  // 能力使用回数チェック
  if (player.abilityUsesRemaining <= 0) return state;

  if (!action.targetPosition) return state;

  const { row, col } = action.targetPosition;
  let newState: GameState;

  switch (action.ability) {
    case 'LEECH_SEED':
      newState = useLeechSeed(state, row, col);
      break;
    case 'EMBER':
      newState = useEmber(state, row, col);
      break;
    case 'PROTECT':
      newState = useProtect(state, row, col);
      break;
    default:
      return state;
  }

  // 状態が変わっていなければ失敗
  if (newState === state) return state;

  // 能力使用回数を減らす
  const newPlayerState: PlayerState = {
    ...player,
    abilityUsesRemaining: player.abilityUsesRemaining - 1,
  };

  return {
    ...newState,
    playerA: state.currentPlayer === 'A' ? newPlayerState : newState.playerA,
    playerB: state.currentPlayer === 'B' ? newPlayerState : newState.playerB,
  };
};

// 勝利判定
export const checkWinner = (state: GameState): Player | null => {
  const board = state.board;
  const lines = [
    // 横
    [
      [0, 0],
      [0, 1],
      [0, 2],
    ],
    [
      [1, 0],
      [1, 1],
      [1, 2],
    ],
    [
      [2, 0],
      [2, 1],
      [2, 2],
    ],
    // 縦
    [
      [0, 0],
      [1, 0],
      [2, 0],
    ],
    [
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    [
      [0, 2],
      [1, 2],
      [2, 2],
    ],
    // 斜め
    [
      [0, 0],
      [1, 1],
      [2, 2],
    ],
    [
      [0, 2],
      [1, 1],
      [2, 0],
    ],
  ];

  for (const line of lines) {
    const pieces = line.map(([row, col]) => getTopPiece(board[row][col]));

    if (pieces.every((p) => p !== null)) {
      const owners = pieces.map((p) => p!.owner);
      if (owners[0] === owners[1] && owners[1] === owners[2]) {
        return owners[0];
      }
    }
  }

  return null;
};

// ターン終了時の効果期限処理
const processEffectExpiry = (state: GameState, timing: 'OPP_TURN_START' | 'OPP_TURN_END'): Effect[] => {
  return state.effects.filter((effect) => {
    // 自分がかけた効果で、相手のターンで期限が来るもの
    if (effect.appliedBy !== state.currentPlayer && effect.expiresAt === timing) {
      return false;
    }
    return true;
  });
};

// ターンを終了して次のプレイヤーへ
export const endTurn = (state: GameState): GameState => {
  // 勝利判定
  const winner = checkWinner(state);
  if (winner) {
    return {
      ...state,
      phase: 'GAME_OVER',
      winner,
    };
  }

  // ターン終了時の効果期限処理
  const effectsAfterTurnEnd = processEffectExpiry(state, 'OPP_TURN_END');

  // 次のプレイヤー
  const nextPlayer: Player = state.currentPlayer === 'A' ? 'B' : 'A';

  // ターン開始時の効果期限処理
  const newState: GameState = {
    ...state,
    currentPlayer: nextPlayer,
    effects: effectsAfterTurnEnd,
    turnCount: state.turnCount + 1,
  };

  // 新プレイヤーのターン開始時の効果期限処理
  const effectsAfterTurnStart = processEffectExpiry(newState, 'OPP_TURN_START');

  return {
    ...newState,
    effects: effectsAfterTurnStart,
  };
};

// アクションを実行
export const executeAction = (state: GameState, action: GameAction): GameState => {
  if (state.phase !== 'PLAYING') return state;

  let newState: GameState;

  switch (action.type) {
    case 'PLACE':
      newState = placePiece(state, action);
      break;
    case 'MOVE':
      newState = movePiece(state, action);
      break;
    case 'ABILITY':
      newState = useAbility(state, action);
      break;
    default:
      return state;
  }

  // アクションが有効だった場合、ターンを終了
  if (newState !== state) {
    return endTurn(newState);
  }

  return state;
};

// 盤面上の駒の位置を取得
export const findPiecePosition = (
  state: GameState,
  pieceId: string
): { row: number; col: number } | null => {
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const cell = state.board[row][col];
      if (cell.stack.some((p) => p.id === pieceId)) {
        return { row, col };
      }
    }
  }
  return null;
};

// 有効な配置先を取得
export const getValidPlacements = (state: GameState, piece: Piece): { row: number; col: number }[] => {
  const valid: { row: number; col: number }[] = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (canPlacePiece(state, piece, row, col)) {
        valid.push({ row, col });
      }
    }
  }
  return valid;
};

// 有効な移動先を取得
export const getValidMoves = (
  state: GameState,
  fromRow: number,
  fromCol: number
): { row: number; col: number }[] => {
  const valid: { row: number; col: number }[] = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (canMovePiece(state, fromRow, fromCol, row, col)) {
        valid.push({ row, col });
      }
    }
  }
  return valid;
};
