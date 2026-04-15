import type { EquipmentTier } from '../types';

export const COMBAT_CONSTANTS = {
  COMBAT_CHANCE_PER_RISK: 0.15, // 위험도 1당 15% 확률로 교전
  TIER_MULTIPLIER: {
    '하급': 1.0,
    '중급': 1.2,
    '상급': 1.5,
    '군용': 2.0,
    '전설': 3.0
  } as Record<EquipmentTier, number>,
  BASE_DAMAGE_RANDOM_MIN: 0.8,
  BASE_DAMAGE_RANDOM_MAX: 1.2,
};
