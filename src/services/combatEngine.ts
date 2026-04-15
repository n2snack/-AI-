import type { Character, Item } from '../types';
import { COMBAT_CONSTANTS } from '../data/Constants';

export interface Enemy {
  name: string;
  hp: number;
  atk: number;
  defRate: number;
  evasionRate: number;
  exclusiveLoot?: Item;
}

export interface CombatResult {
  won: boolean;
  logText: string;
  hpRemaining: number;
  enemyName: string;
  exclusiveLoot?: Item;
  damageTaken: number;
  isFirstStrike: boolean;
  weaponUsedTier?: string;
  armorUsedTier?: string;
}

export const generateEnemy = (riskLevel: number): Enemy => {
  const enemies: Enemy[] = [
    { name: '부랑자', hp: 30, atk: 5, defRate: 0, evasionRate: 0.1 },
    { name: '들개 무리', hp: 50, atk: 12, defRate: 0.1, evasionRate: 0.3 },
    { name: '일반 좀비 무리', hp: 80, atk: 25, defRate: 0.2, evasionRate: 0.05 },
    { name: '변종 좀비', hp: 150, atk: 40, defRate: 0.4, evasionRate: 0.1, exclusiveLoot: { id: crypto.randomUUID(), name: '변이체 코어', quantity: 1, category: '자원', isNew: true, tier: '상급' } },
    { name: '무장 탈영병 그룹', hp: 250, atk: 60, defRate: 0.5, evasionRate: 0.2, exclusiveLoot: { id: crypto.randomUUID(), name: '군용 철판', quantity: 1, category: '방어구', damageReduction: 0.4, isNew: true, tier: '군용' } }
  ];
  
  const index = Math.max(0, Math.min(riskLevel - 1, enemies.length - 1));
  return { ...enemies[index] };
};

export const processCombat = (survivor: Character, enemy: Enemy): CombatResult => {
  let logText: string[] = [];
  const startHp = survivor.status.hp;
  let sHp = startHp;
  let eHp = enemy.hp;

  const weapon = survivor.equipment?.weapon;
  const armor = survivor.equipment?.armor;
  
  // 선제 공격권: AGI가 적의 evasion보다 우월하면 선공
  const isFirstStrike = survivor.stats.agi > enemy.evasionRate * 100;

  logText.push(`[전투 발생] ${survivor.name} 님이 ${enemy.name}와(과) 조우했습니다!`);
  if (weapon) logText.push(`* 무기 활성화: [${weapon.tier}] ${weapon.name}`);
  if (armor) logText.push(`* 방어구 활성화: [${armor.tier}] ${armor.name}`);

  const survivorTurn = () => {
    // 명중률 계산
    const myHitScore = survivor.stats.agi + survivor.stats.int;
    if (Math.random() * 100 > myHitScore && myHitScore < enemy.evasionRate * 100) {
      logText.push(`-> ${survivor.name}의 공격이 빗나갔습니다!`);
      return;
    }
    
    const baseAtk = survivor.stats.str;
    const wpnBonus = weapon?.damageMultiplier || 0;
    const tierMult = weapon?.tier ? COMBAT_CONSTANTS.TIER_MULTIPLIER[weapon.tier] : 1;
    const variance = COMBAT_CONSTANTS.BASE_DAMAGE_RANDOM_MIN + Math.random() * (COMBAT_CONSTANTS.BASE_DAMAGE_RANDOM_MAX - COMBAT_CONSTANTS.BASE_DAMAGE_RANDOM_MIN);
    
    // 최종 데미지 시공식
    const rawDmg = (baseAtk + wpnBonus) * tierMult * variance;
    const finalDmg = Math.max(1, Math.floor(rawDmg * (1 - enemy.defRate)));
    
    eHp -= finalDmg;
    logText.push(`-> ${survivor.name} 공격 명중! ${enemy.name}에게 ${finalDmg} 데미지.`);
  };

  const enemyTurn = () => {
    const armorReduc = armor?.damageReduction || 0;
    const variance = COMBAT_CONSTANTS.BASE_DAMAGE_RANDOM_MIN + Math.random() * (COMBAT_CONSTANTS.BASE_DAMAGE_RANDOM_MAX - COMBAT_CONSTANTS.BASE_DAMAGE_RANDOM_MIN);
    const rawDmg = enemy.atk * variance;
    
    // 방어력 감소 공식
    const finalDmg = Math.max(1, Math.floor(rawDmg * (1 - armorReduc)));
    
    sHp -= finalDmg;
    logText.push(`-> ${enemy.name}의 반격. ${survivor.name}이(가) ${finalDmg} 데미지 피격.`);
  };

  let maxRounds = 10;
  while (sHp > 0 && eHp > 0 && maxRounds > 0) {
    if (isFirstStrike) {
      survivorTurn();
      if (eHp <= 0) break;
      enemyTurn();
    } else {
      enemyTurn();
      if (sHp <= 0) break;
      survivorTurn();
    }
    maxRounds--;
  }

  const won = sHp > 0 && eHp <= 0;
  
  if (won) {
    logText.push(`[승리] ${enemy.name}을(를) 쓰러뜨렸습니다!`);
  } else if (sHp <= 0) {
    logText.push(`[패배] ${survivor.name}이(가) 전투 중 쓰러졌습니다...`);
  } else {
    logText.push(`[도주] 전투가 길어져 도주했습니다.`);
  }

  return {
    won: sHp > 0,
    hpRemaining: Math.max(0, sHp),
    enemyName: enemy.name,
    logText: logText.join('\n'),
    exclusiveLoot: won ? enemy.exclusiveLoot : undefined,
    damageTaken: startHp - Math.max(0, sHp),
    isFirstStrike,
    weaponUsedTier: weapon?.tier,
    armorUsedTier: armor?.tier
  };
};
