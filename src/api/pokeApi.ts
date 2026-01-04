import { PokemonInfo, POKEMON_DATA } from '../types';

const POKE_API_BASE = 'https://pokeapi.co/api/v2';

// キャッシュ
const pokemonCache: Map<number, PokemonInfo> = new Map();

interface PokeApiPokemon {
  id: number;
  name: string;
  sprites: {
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
}

interface PokeApiSpecies {
  names: Array<{
    language: {
      name: string;
    };
    name: string;
  }>;
}

// 単体のポケモン情報を取得
const fetchPokemon = async (id: number): Promise<PokemonInfo> => {
  // キャッシュチェック
  if (pokemonCache.has(id)) {
    return pokemonCache.get(id)!;
  }

  const [pokemonRes, speciesRes] = await Promise.all([
    fetch(`${POKE_API_BASE}/pokemon/${id}`),
    fetch(`${POKE_API_BASE}/pokemon-species/${id}`),
  ]);

  if (!pokemonRes.ok || !speciesRes.ok) {
    throw new Error(`Failed to fetch pokemon ${id}`);
  }

  const pokemon: PokeApiPokemon = await pokemonRes.json();
  const species: PokeApiSpecies = await speciesRes.json();

  const japaneseName =
    species.names.find((n) => n.language.name === 'ja')?.name || pokemon.name;

  const data = POKEMON_DATA[id];
  if (!data) {
    throw new Error(`Unknown pokemon id: ${id}`);
  }

  const info: PokemonInfo = {
    id,
    name: pokemon.name,
    japaneseName,
    imageUrl: pokemon.sprites.other['official-artwork'].front_default,
    line: data.line,
    size: data.size,
  };

  // キャッシュに保存
  pokemonCache.set(id, info);

  return info;
};

// 全ポケモン情報を一括取得（プリフェッチ）
export const prefetchAllPokemon = async (): Promise<Map<number, PokemonInfo>> => {
  const ids = Object.keys(POKEMON_DATA).map(Number);

  const results = await Promise.all(ids.map((id) => fetchPokemon(id)));

  results.forEach((info) => {
    pokemonCache.set(info.id, info);
  });

  return pokemonCache;
};

// キャッシュからポケモン情報を取得
export const getPokemonInfo = (id: number): PokemonInfo | undefined => {
  return pokemonCache.get(id);
};

// キャッシュが準備できているか
export const isCacheReady = (): boolean => {
  return pokemonCache.size === Object.keys(POKEMON_DATA).length;
};

// フック用のポケモンデータ取得
export const usePokemonData = () => {
  return {
    getPokemonInfo,
    isCacheReady: isCacheReady(),
    cache: pokemonCache,
  };
};
