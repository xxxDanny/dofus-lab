import {
  customSet,
  customSet_equippedItems,
} from 'graphql/fragments/__generated__/customSet';
import { item_set } from 'graphql/fragments/__generated__/item';
import {
  Stat,
  ItemFilters,
  WeaponEffectType,
  SpellEffectType,
} from '__generated__/globalTypes';

export type StatWithCalculatedValue = {
  stat: string;
  icon?: {
    backgroundPositionX: number;
    backgroundPositionY: number;
  };
  svgIcon?: string;
};

export type StatGroup = Array<StatWithCalculatedValue>;

export type StatsFromCustomSet = {
  [key: string]: number;
};

export type StatCalculator = (
  statsFromCustomSet: StatsFromCustomSet | null,
  customSet?: customSet | null,
) => number;

export type SetCounter = {
  [key: string]: {
    count: number;
    set: item_set;
    equippedItems: Array<customSet_equippedItems>;
  };
};

export type SharedFilterAction =
  | { type: 'SEARCH'; search: string }
  | { type: 'MAX_LEVEL'; maxLevel: number }
  | { type: 'STATS'; stats: Array<Stat> }
  | { type: 'RESET'; maxLevel: number };

export type MageAction =
  | { type: 'ADD'; stat: Stat }
  | { type: 'REMOVE'; stat: Stat }
  | { type: 'EDIT'; isExo: boolean; stat: Stat; value: number }
  | { type: 'RESET'; originalStatsMap: { [key: string]: { value: number } } };

export interface OriginalStatLine {
  stat: Stat | null;
  maxValue?: number | null;
  value?: number;
}

export interface ExoStatLine {
  stat: Stat;
  value: number;
}

export type SharedFilters = Omit<ItemFilters, 'itemTypeIds'>;

const mobileScreenTypesArr = [
  'HOME',
  'EQUIPPED_ITEM',
  'ITEM_SELECTOR',
  'SET_SELECTOR',
] as const;

export type MobileScreen = typeof mobileScreenTypesArr[number];

export const mobileScreenTypes = mobileScreenTypesArr.reduce(
  (acc, curr) => ({ ...acc, [curr]: curr }),
  {},
) as { [key in MobileScreen]: MobileScreen };

export interface ICalcDamageInput {
  isCrit?: boolean;
  isTrap?: boolean;
  isWeapon?: boolean;
}

export type TSimpleEffect =
  | 'damage'
  | 'pushback_damage'
  | 'heal'
  | 'shield'
  | 'ap'
  | 'mp';

type TEffectMinMax = { min: number | null; max: number; baseMax: number };

export type TEffectLine = {
  id: string;
  type: WeaponEffectType | SpellEffectType;
  nonCrit: TEffectMinMax;
  crit: TEffectMinMax | null;
};

export type TCondition = {
  stat: Stat | 'SET_BONUS';
  operator: '>' | '<';
  value: number;
};

export type TConditionObj =
  | {
      and?: Array<TConditionObj>;
      or?: Array<TConditionObj>;
    }
  | TCondition;

export type TEvaluatedConditionObj =
  | {
      and?: Array<TEvaluatedConditionObj>;
      or?: Array<TEvaluatedConditionObj>;
    }
  | boolean;

export const baseStats = [
  'baseVitality',
  'baseWisdom',
  'baseStrength',
  'baseIntelligence',
  'baseChance',
  'baseAgility',
] as const;

export const scrolledStats = [
  'scrolledVitality',
  'scrolledWisdom',
  'scrolledStrength',
  'scrolledIntelligence',
  'scrolledChance',
  'scrolledAgility',
] as const;

export const stats = [...baseStats, ...scrolledStats] as const;

export type BaseStatKey = typeof baseStats[number];

export type StatKey = typeof stats[number];

export interface IError {
  equippedItem: customSet_equippedItems;
  reason: string;
}
