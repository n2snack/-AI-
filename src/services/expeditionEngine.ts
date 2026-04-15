import type { Character, LocationData, Item } from '../types';
import { processCombat, generateEnemy } from './combatEngine';
import type { CombatResult } from './combatEngine';
import { COMBAT_CONSTANTS } from '../data/Constants';

export interface ExpeditionResult {
  survivorId: string;
  survivorName: string;
  locationName: string;
  success: boolean;
  lootedItem?: Item;
  damageTaken?: number;
  combatResult?: CombatResult;
}

export const processExpedition = (survivor: Character, location: LocationData, synergy: number = 0): ExpeditionResult => {
  const result: ExpeditionResult = {
    survivorId: survivor.id,
    survivorName: survivor.name,
    locationName: location.name,
    success: false
  };

  // 1. 전투 발생 체크 로직
  const isCombat = Math.random() < location.riskLevel * COMBAT_CONSTANTS.COMBAT_CHANCE_PER_RISK;
  
  if (isCombat) {
    const enemy = generateEnemy(location.riskLevel);
    const combatRes = processCombat(survivor, enemy);
    result.combatResult = combatRes;
    
    if (!combatRes.won) {
      // 전투 패배 시: HP 0이 되므로 곧바로 실패 반환
      result.damageTaken = combatRes.damageTaken;
      return result;
    }
    
    // 전투로 데미지를 입었을 경우
    if (combatRes.damageTaken > 0) {
      result.damageTaken = combatRes.damageTaken;
    }
    
    // 전투 승리 및 특별 아이템 획득
    if (combatRes.exclusiveLoot) {
      result.success = true;
      result.lootedItem = combatRes.exclusiveLoot;
      return result;
    }
  }

  // 2. 기본 탐사 확률 로직
  const baseStatSum = survivor.stats.agi + survivor.stats.int;
  const luck = Math.random() * 20;
  
  let successProb = 70 - (location.riskLevel * 10) + (baseStatSum * 0.8) + luck;
  
  if (synergy >= 50) {
     successProb += 15; // 협동심 버프
  } else if (synergy <= -30) {
     successProb -= 30; // 분열 패널티
  }

  successProb = Math.max(5, Math.min(95, successProb));
  
  const roll = Math.random() * 100;
  result.success = roll <= successProb;

  if (result.success) {
    const totalWeight = location.lootTable.reduce((sum, item) => sum + item.weight, 0);
    let randomWeight = Math.random() * totalWeight;
    
    let selectedLoot = location.lootTable[location.lootTable.length - 1]; 
    for (const loot of location.lootTable) {
      if (randomWeight <= loot.weight) {
        selectedLoot = loot;
        break;
      }
      randomWeight -= loot.weight;
    }

    const quantity = Math.floor(Math.random() * (selectedLoot.maxQuantity - selectedLoot.minQuantity + 1)) + selectedLoot.minQuantity;
    
    result.lootedItem = {
      id: crypto.randomUUID(),
      name: selectedLoot.name,
      category: selectedLoot.category,
      quantity,
      isNew: true
    };
  } else if (!isCombat) {
    // 순수 파밍 실패 시에만 위험도 비례 데미지
    let damage = location.riskLevel * (Math.floor(Math.random() * 10) + 10);
    if (synergy <= -30) {
        damage = Math.floor(damage * 1.5); // 내분으로 인한 추가 피해
    }
    result.damageTaken = (result.damageTaken || 0) + damage;
  }

  return result;
}
