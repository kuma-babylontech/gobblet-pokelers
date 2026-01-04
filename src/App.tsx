import { useState, useEffect, useCallback } from 'react';
import {
  GameState,
  Line,
  PokemonInfo,
  LINE_ABILITIES,
} from './types';
import {
  createInitialState,
  selectLine,
  executeAction,
  getTopPiece,
  getValidPlacements,
  getValidMoves,
  isPieceLocked,
  isPieceProtected,
} from './engine/gameEngine';
import { prefetchAllPokemon } from './api/pokeApi';
import { TitleScreen } from './components/TitleScreen';
import { LineSelector } from './components/LineSelector';
import { GameBoard } from './components/GameBoard';
import { Reserve } from './components/Reserve';
import { AbilityPanel } from './components/AbilityPanel';
import { GameOver } from './components/GameOver';
import './App.css';

type SelectionMode = 'none' | 'piece' | 'ability';

const LINE_NAMES: Record<Line, string> = {
  GRASS: '草タイプ',
  FIRE: '炎タイプ',
  WATER: '水タイプ',
};

function App() {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [pokemonCache, setPokemonCache] = useState<Map<number, PokemonInfo>>(
    new Map()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 選択状態
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('none');
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [selectedFromBoard, setSelectedFromBoard] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [validTargets, setValidTargets] = useState<
    { row: number; col: number }[]
  >([]);

  // ポケモンデータをプリフェッチ
  useEffect(() => {
    const loadPokemon = async () => {
      try {
        const cache = await prefetchAllPokemon();
        setPokemonCache(cache);
        setIsLoading(false);
      } catch (err) {
        setError('ポケモンデータの読み込みに失敗しました');
        setIsLoading(false);
      }
    };
    loadPokemon();
  }, []);

  // ライン選択
  const handleSelectLine = useCallback(
    (line: Line) => {
      const player = gameState.playerA.line ? 'B' : 'A';
      setGameState((prev) => selectLine(prev, player, line));
    },
    [gameState.playerA.line]
  );

  // 選択をリセット
  const resetSelection = useCallback(() => {
    setSelectionMode('none');
    setSelectedPieceId(null);
    setSelectedFromBoard(null);
    setValidTargets([]);
  }, []);

  // 手札の駒を選択
  const handleReservePieceClick = useCallback(
    (pieceId: string) => {
      const currentPlayer =
        gameState.currentPlayer === 'A' ? gameState.playerA : gameState.playerB;
      const piece = currentPlayer.reserve.find((p) => p.id === pieceId);

      if (!piece) return;

      if (selectedPieceId === pieceId) {
        resetSelection();
        return;
      }

      setSelectionMode('piece');
      setSelectedPieceId(pieceId);
      setSelectedFromBoard(null);
      setValidTargets(getValidPlacements(gameState, piece));
    },
    [gameState, selectedPieceId, resetSelection]
  );

  // 盤面のセルをクリック
  const handleCellClick = useCallback(
    (row: number, col: number) => {
      const cell = gameState.board[row][col];
      const topPiece = getTopPiece(cell);

      // 能力モードの場合
      if (selectionMode === 'ability') {
        const currentPlayer =
          gameState.currentPlayer === 'A'
            ? gameState.playerA
            : gameState.playerB;
        if (!currentPlayer.line) return;

        const ability = LINE_ABILITIES[currentPlayer.line];

        // 能力の対象チェック
        if (ability === 'LEECH_SEED') {
          // やどりぎ: 相手のトップ駒
          if (!topPiece || topPiece.owner === gameState.currentPlayer) return;
          if (isPieceProtected(gameState, topPiece.id)) return;
        } else if (ability === 'EMBER') {
          // ひのこ: 任意のトップ駒
          if (!topPiece) return;
          if (isPieceProtected(gameState, topPiece.id)) return;
        } else if (ability === 'PROTECT') {
          // まもる: 自分のトップ駒
          if (!topPiece || topPiece.owner !== gameState.currentPlayer) return;
        }

        const newState = executeAction(gameState, {
          type: 'ABILITY',
          ability,
          targetPosition: { row, col },
        });

        if (newState !== gameState) {
          setGameState(newState);
          resetSelection();
        }
        return;
      }

      // 駒を選択済みで、有効な配置先をクリックした場合
      if (
        selectedPieceId &&
        validTargets.some((t) => t.row === row && t.col === col)
      ) {
        if (selectedFromBoard) {
          // 盤面から移動
          const newState = executeAction(gameState, {
            type: 'MOVE',
            from: selectedFromBoard,
            to: { row, col },
          });
          if (newState !== gameState) {
            setGameState(newState);
            resetSelection();
          }
        } else {
          // 手札から配置
          const newState = executeAction(gameState, {
            type: 'PLACE',
            pieceId: selectedPieceId,
            to: { row, col },
          });
          if (newState !== gameState) {
            setGameState(newState);
            resetSelection();
          }
        }
        return;
      }

      // 自分のトップ駒をクリックした場合（移動元として選択）
      if (topPiece && topPiece.owner === gameState.currentPlayer) {
        if (isPieceLocked(gameState, topPiece.id)) {
          return;
        }

        if (selectedPieceId === topPiece.id && selectedFromBoard) {
          resetSelection();
          return;
        }

        setSelectionMode('piece');
        setSelectedPieceId(topPiece.id);
        setSelectedFromBoard({ row, col });
        setValidTargets(getValidMoves(gameState, row, col));
        return;
      }

      // それ以外は選択解除
      resetSelection();
    },
    [
      gameState,
      selectionMode,
      selectedPieceId,
      selectedFromBoard,
      validTargets,
      resetSelection,
    ]
  );

  // 能力ボタンをクリック
  const handleAbilityClick = useCallback(() => {
    setSelectionMode('ability');
    setSelectedPieceId(null);
    setSelectedFromBoard(null);

    // 能力の対象候補をハイライト
    const currentPlayer =
      gameState.currentPlayer === 'A' ? gameState.playerA : gameState.playerB;
    if (!currentPlayer.line) return;

    const ability = LINE_ABILITIES[currentPlayer.line];
    const targets: { row: number; col: number }[] = [];

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const topPiece = getTopPiece(gameState.board[r][c]);
        if (!topPiece) continue;

        if (ability === 'LEECH_SEED') {
          if (
            topPiece.owner !== gameState.currentPlayer &&
            !isPieceProtected(gameState, topPiece.id)
          ) {
            targets.push({ row: r, col: c });
          }
        } else if (ability === 'EMBER') {
          if (!isPieceProtected(gameState, topPiece.id)) {
            targets.push({ row: r, col: c });
          }
        } else if (ability === 'PROTECT') {
          if (topPiece.owner === gameState.currentPlayer) {
            targets.push({ row: r, col: c });
          }
        }
      }
    }

    setValidTargets(targets);
  }, [gameState]);

  // 能力をキャンセル
  const handleCancelAbility = useCallback(() => {
    resetSelection();
  }, [resetSelection]);

  // ゲームをリスタート
  const handleRestart = useCallback(() => {
    setGameState(createInitialState());
    resetSelection();
  }, [resetSelection]);

  // タイトル画面からゲーム開始
  const handleStartGame = useCallback(() => {
    setGameState((prev) => ({ ...prev, phase: 'LINE_SELECT' }));
  }, []);

  // ローディング画面
  if (isLoading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>ポケモンデータを読み込み中...</p>
      </div>
    );
  }

  // エラー画面
  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>再読み込み</button>
      </div>
    );
  }

  // タイトル画面
  if (gameState.phase === 'TITLE') {
    return (
      <TitleScreen
        pokemonCache={pokemonCache}
        onStartGame={handleStartGame}
      />
    );
  }

  // ライン選択画面
  if (gameState.phase === 'LINE_SELECT') {
    const currentPlayer = gameState.playerA.line ? 'B' : 'A';
    return (
      <LineSelector
        currentPlayer={currentPlayer}
        selectedLineA={gameState.playerA.line}
        selectedLineB={gameState.playerB.line}
        pokemonCache={pokemonCache}
        onSelectLine={handleSelectLine}
      />
    );
  }

  const playerALineName = gameState.playerA.line
    ? LINE_NAMES[gameState.playerA.line]
    : '';
  const playerBLineName = gameState.playerB.line
    ? LINE_NAMES[gameState.playerB.line]
    : '';

  return (
    <div className="game-container">
      <header className="game-header">
        <h1 className="game-title">Gobblet Pokelers</h1>
        <div className="turn-indicator">
          <span className={`turn-player player-${gameState.currentPlayer.toLowerCase()}`}>
            {gameState.currentPlayer === 'A' ? 'プレイヤー1' : 'プレイヤー2'}
          </span>
          のターン
        </div>
      </header>

      <div className="game-layout">
        <div className="side-panel left">
          <Reserve
            player="A"
            pieces={gameState.playerA.reserve}
            pokemonCache={pokemonCache}
            isCurrentPlayer={gameState.currentPlayer === 'A'}
            selectedPieceId={
              gameState.currentPlayer === 'A' && !selectedFromBoard
                ? selectedPieceId
                : null
            }
            onPieceClick={handleReservePieceClick}
            abilityUsesRemaining={gameState.playerA.abilityUsesRemaining}
            lineName={playerALineName}
          />
          {gameState.playerA.line && gameState.currentPlayer === 'A' && (
            <AbilityPanel
              line={gameState.playerA.line}
              usesRemaining={gameState.playerA.abilityUsesRemaining}
              isCurrentPlayer={true}
              isAbilityMode={selectionMode === 'ability'}
              onAbilityClick={handleAbilityClick}
              onCancelAbility={handleCancelAbility}
            />
          )}
        </div>

        <div className="board-container">
          <GameBoard
            gameState={gameState}
            pokemonCache={pokemonCache}
            selectedPieceId={selectedPieceId}
            validTargets={validTargets}
            onCellClick={handleCellClick}
          />
          {selectionMode === 'ability' && (
            <div className="ability-hint">
              能力の対象を選択してください
            </div>
          )}
        </div>

        <div className="side-panel right">
          <Reserve
            player="B"
            pieces={gameState.playerB.reserve}
            pokemonCache={pokemonCache}
            isCurrentPlayer={gameState.currentPlayer === 'B'}
            selectedPieceId={
              gameState.currentPlayer === 'B' && !selectedFromBoard
                ? selectedPieceId
                : null
            }
            onPieceClick={handleReservePieceClick}
            abilityUsesRemaining={gameState.playerB.abilityUsesRemaining}
            lineName={playerBLineName}
          />
          {gameState.playerB.line && gameState.currentPlayer === 'B' && (
            <AbilityPanel
              line={gameState.playerB.line}
              usesRemaining={gameState.playerB.abilityUsesRemaining}
              isCurrentPlayer={true}
              isAbilityMode={selectionMode === 'ability'}
              onAbilityClick={handleAbilityClick}
              onCancelAbility={handleCancelAbility}
            />
          )}
        </div>
      </div>

      {gameState.phase === 'GAME_OVER' && gameState.winner && (
        <GameOver
          winner={gameState.winner}
          winnerLine={
            gameState.winner === 'A'
              ? gameState.playerA.line!
              : gameState.playerB.line!
          }
          pokemonCache={pokemonCache}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}

export default App;
