import { useState } from 'react';
import { PokemonInfo } from '../types';
import { RulesModal } from './RulesModal';
import './TitleScreen.css';

interface TitleScreenProps {
  pokemonCache: Map<number, PokemonInfo>;
  onStartGame: () => void;
}

export const TitleScreen = ({ pokemonCache, onStartGame }: TitleScreenProps) => {
  const [showRules, setShowRules] = useState(false);

  // 御三家の最終進化形を表示
  const pokemon = [
    pokemonCache.get(3),  // フシギバナ
    pokemonCache.get(6),  // リザードン
    pokemonCache.get(9),  // カメックス
  ];

  return (
    <div className="title-screen">
      <div className="title-content">
        <h1 className="title-logo">
          <span className="title-main">Gobblet</span>
          <span className="title-sub">Pokelers</span>
        </h1>

        <div className="title-pokemon">
          {pokemon.map((p, i) => p && (
            <img
              key={i}
              src={p.imageUrl}
              alt={p.japaneseName}
              className="title-pokemon-img"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>

        <p className="title-tagline">
          ゴブレットゴブラーズ × ポケモン
        </p>

        <div className="title-buttons">
          <button className="title-button start" onClick={onStartGame}>
            ゲームスタート
          </button>
          <button className="title-button rules" onClick={() => setShowRules(true)}>
            ルール説明
          </button>
        </div>

        <p className="title-credit">
          Powered by PokeAPI
        </p>
      </div>

      {showRules && (
        <RulesModal
          pokemonCache={pokemonCache}
          onClose={() => setShowRules(false)}
        />
      )}
    </div>
  );
};
