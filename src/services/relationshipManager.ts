import type { Character } from '../types';

export const calculateMbtiAffinity = (mbtiA: string, mbtiB: string): number => {
  if (mbtiA.length !== 4 || mbtiB.length !== 4) return 0;

  // 특수 극상성 로직
  const pair = [mbtiA, mbtiB].sort().join('-');
  if (pair === 'ENTP-INTP') return +20;
  if (pair === 'ENTP-ISFJ') return -15;
  if (pair === 'ENFP-INTJ') return +20;
  if (pair === 'ESTJ-INFP') return -20;

  // 일반 N/S, T/F 축 검사
  const isMatchNS = mbtiA[1] === mbtiB[1];
  const isMatchTF = mbtiA[2] === mbtiB[2];

  if (isMatchNS && isMatchTF) return 10;
  if (!isMatchNS && !isMatchTF) return -10;
  return 0; // 한 축만 동일
};

/**
 * 질투 시스템: A가 B에게 긍정적인 행동을 했을 때, A를 좋아하는 C가 B를 질투.
 */
export const calculateJealousy = (
  survivors: Character[], 
  sourceId: string, 
  targetId: string, 
  posAmount: number
): { jealousySourceId: string; targetId: string; amount: number }[] => {
  if (posAmount <= 0) return [];

  const jealousyUpdates: { jealousySourceId: string; targetId: string; amount: number }[] = [];

  survivors.forEach(c => {
    if (c.id === sourceId || c.id === targetId || !c.isAlive) return;

    // C(현재 반복중인 캐릭터)가 A(sourceId)를 깊이 신뢰한다면 (> 50)
    const cLikesA = c.favorability[sourceId] || 0;
    if (cLikesA > 50) {
      // C는 B를 질투하여 점수가 깎임 (증가치 절반 수준 혹은 랜덤 하락)
      const jealousyDrop = Math.ceil(posAmount / 2) + Math.floor(Math.random() * 5);
      jealousyUpdates.push({
        jealousySourceId: c.id,
        targetId: targetId,
        amount: -jealousyDrop
      });
      console.log(`[Jealousy Engine] ${c.name} 은(는) ${survivors.find(s=>s.id===sourceId)?.name}와 ${survivors.find(s=>s.id===targetId)?.name}의 관계 진전을 질투하여 ${jealousyDrop} 하락했습니다.`);
    }
  });

  return jealousyUpdates;
};

/**
 * 그룹 내 호감도 평균 계산 (탐사 시너지 등에 응용)
 */
export const calculateGroupSynergy = (groupPlayers: Character[]): number => {
  if (groupPlayers.length < 2) return 0;

  let totalScore = 0;
  let matches = 0;

  for (let i = 0; i < groupPlayers.length; i++) {
    for (let j = i + 1; j < groupPlayers.length; j++) {
      const p1 = groupPlayers[i];
      const p2 = groupPlayers[j];

      totalScore += (p1.favorability[p2.id] || 0);
      totalScore += (p2.favorability[p1.id] || 0);
      matches += 2;
    }
  }

  return matches > 0 ? (totalScore / matches) : 0;
};
