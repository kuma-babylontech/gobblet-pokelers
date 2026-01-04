import { PokemonInfo } from '../types';
import './RulesModal.css';

interface RulesModalProps {
  pokemonCache: Map<number, PokemonInfo>;
  onClose: () => void;
}

export const RulesModal = ({ pokemonCache, onClose }: RulesModalProps) => {
  return (
    <div className="rules-overlay" onClick={onClose}>
      <div className="rules-modal" onClick={(e) => e.stopPropagation()}>
        <button className="rules-close" onClick={onClose}>×</button>

        <h2 className="rules-title">ルール説明</h2>

        <div className="rules-content">
          <section className="rules-section">
            <h3>ゲーム概要</h3>
            <p>
              3×3の盤面で対戦する2人用ボードゲームです。
              自分の駒を<strong>縦・横・斜めに3つ揃える</strong>と勝利！
            </p>
          </section>

          <section className="rules-section">
            <h3>駒について</h3>
            <p>各プレイヤーは1つのポケモンラインを選び、6個の駒を持ちます。</p>
            <div className="rules-pieces">
              <div className="rules-piece-row">
                <div className="rules-piece-group">
                  <span className="size-label">小(S)</span>
                  <div className="piece-images">
                    {[1, 4, 7].map(id => {
                      const p = pokemonCache.get(id);
                      return p && <img key={id} src={p.imageUrl} alt={p.japaneseName} title={p.japaneseName} />;
                    })}
                  </div>
                  <span className="piece-count">×2</span>
                </div>
                <div className="rules-piece-group">
                  <span className="size-label">中(M)</span>
                  <div className="piece-images">
                    {[2, 5, 8].map(id => {
                      const p = pokemonCache.get(id);
                      return p && <img key={id} src={p.imageUrl} alt={p.japaneseName} title={p.japaneseName} />;
                    })}
                  </div>
                  <span className="piece-count">×2</span>
                </div>
                <div className="rules-piece-group">
                  <span className="size-label">大(L)</span>
                  <div className="piece-images">
                    {[3, 6, 9].map(id => {
                      const p = pokemonCache.get(id);
                      return p && <img key={id} src={p.imageUrl} alt={p.japaneseName} title={p.japaneseName} />;
                    })}
                  </div>
                  <span className="piece-count">×2</span>
                </div>
              </div>
            </div>
            <p className="rules-note">
              <strong>大きい駒で小さい駒を覆える！</strong><br />
              覆われた駒は見えなくなりますが、盤面に残ります。
            </p>
          </section>

          <section className="rules-section">
            <h3>ターンでできること</h3>
            <ul className="rules-list">
              <li>
                <strong>駒を置く</strong> - 手札から駒を盤面に置く
              </li>
              <li>
                <strong>駒を移動</strong> - 盤面の自分の駒を別のマスに移動
              </li>
              <li>
                <strong>能力を使う</strong> - 特殊能力を発動（1ゲーム2回まで）
              </li>
            </ul>
          </section>

          <section className="rules-section">
            <h3>各ラインの能力</h3>
            <div className="rules-abilities">
              <div className="ability-card grass">
                <div className="ability-header">
                  <span className="ability-type">草タイプ</span>
                  <span className="ability-name">やどりぎのタネ</span>
                </div>
                <p>相手の駒を次のターンまで<strong>移動不可</strong>にする</p>
              </div>
              <div className="ability-card fire">
                <div className="ability-header">
                  <span className="ability-type">炎タイプ</span>
                  <span className="ability-name">ひのこ</span>
                </div>
                <p>任意の駒を<strong>持ち主の手札に戻す</strong></p>
              </div>
              <div className="ability-card water">
                <div className="ability-header">
                  <span className="ability-type">水タイプ</span>
                  <span className="ability-name">まもる</span>
                </div>
                <p>自分の駒に<strong>バリア</strong>を付与（覆われなくなる）</p>
              </div>
            </div>
          </section>

          <section className="rules-section">
            <h3>勝利条件</h3>
            <p>
              自分の駒（トップに見えている駒）を<strong>縦・横・斜めに3つ揃える</strong>と即座に勝利！
            </p>
            <div className="win-examples">
              <div className="win-example">
                <div className="mini-board horizontal">
                  <div className="mini-cell active"></div>
                  <div className="mini-cell active"></div>
                  <div className="mini-cell active"></div>
                  <div className="mini-cell"></div>
                  <div className="mini-cell"></div>
                  <div className="mini-cell"></div>
                  <div className="mini-cell"></div>
                  <div className="mini-cell"></div>
                  <div className="mini-cell"></div>
                </div>
                <span>横</span>
              </div>
              <div className="win-example">
                <div className="mini-board vertical">
                  <div className="mini-cell active"></div>
                  <div className="mini-cell"></div>
                  <div className="mini-cell"></div>
                  <div className="mini-cell active"></div>
                  <div className="mini-cell"></div>
                  <div className="mini-cell"></div>
                  <div className="mini-cell active"></div>
                  <div className="mini-cell"></div>
                  <div className="mini-cell"></div>
                </div>
                <span>縦</span>
              </div>
              <div className="win-example">
                <div className="mini-board diagonal">
                  <div className="mini-cell active"></div>
                  <div className="mini-cell"></div>
                  <div className="mini-cell"></div>
                  <div className="mini-cell"></div>
                  <div className="mini-cell active"></div>
                  <div className="mini-cell"></div>
                  <div className="mini-cell"></div>
                  <div className="mini-cell"></div>
                  <div className="mini-cell active"></div>
                </div>
                <span>斜め</span>
              </div>
            </div>
          </section>
        </div>

        <button className="rules-start-button" onClick={onClose}>
          閉じる
        </button>
      </div>
    </div>
  );
};
