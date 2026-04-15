import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Character, Item, LogEntry } from '../types';
import { LogManager } from '../services/LogManager';
import { processExpedition } from '../services/expeditionEngine';
import { MAP_LOCATIONS } from '../data/mapData';
import { calculateMbtiAffinity, calculateJealousy, calculateGroupSynergy } from '../services/relationshipManager';

export interface CampStats {
  defense: number;
  hygiene: number;
  comfort: number;
}

interface GameState {
  day: number;
  survivors: Character[];
  inventory: Item[];
  logs: LogEntry[];
  isAiModeEnabled: boolean;
  isAiLoading: boolean;
  
  // Modals
  isMapModalOpen: boolean;
  isDevModalOpen: boolean;
  isBaseModalOpen: boolean;
  isRelationModalOpen: boolean;
  isSettingsModalOpen: boolean;

  // New States
  campStats: CampStats;
  apiKey: string | null;
  skillCooldowns: Record<string, number>;
  activeBuffs: Record<string, string>;
  foldedLogs: Record<string, boolean>;
  relationshipPopups: { id: string; sourceId: string; targetId: string; diff: number }[];

  // Actions
  removeRelationshipPopup: (id: string) => void;
  toggleLogFold: (logId: string) => void;
  toggleAiMode: () => void;
  toggleMapModal: () => void;
  toggleDevModal: () => void;
  toggleBaseModal: () => void;
  toggleRelationModal: () => void;
  toggleSettingsModal: () => void;
  
  setApiKey: (key: string | null) => void;
  upgradeCampStat: (stat: keyof CampStats) => void;
  useActiveSkill: (survivorId: string, job: string) => void;

  loadSaveData: (data: Partial<GameState>) => void;
  addSurvivor: (survivor: Character) => void;
  addItem: (item: Item) => void;
  nextDay: () => Promise<void>;
  addLog: (log: Omit<LogEntry, 'id' | 'day'>) => void;
  updateRelationship: (sourceId: string, targetId: string, amount: number) => void;
  assignExpedition: (survivorId: string, locationId: string | null) => void;
  equipItem: (survivorId: string, itemId: string) => void;
  unequipItem: (survivorId: string, slot: 'weapon' | 'armor') => void;
}

const randomEvents = [
  "[이벤트] 막사 주변을 보수했습니다.",
  "[이벤트] 생존자들 사이에 사소한 다툼이 있었습니다.",
  "[이벤트] 비가 내려 식수를 확보했습니다.",
  "[이벤트] 밤새 좀비의 울음소리가 들려 잠을 설쳤습니다."
];

const initialSurvivors: Character[] = [
  {
    id: '1',
    name: '임시',
    gender: '남성',
    mbti: 'ENTP',
    job: '군인',
    stats: { str: 10, agi: 15, con: 15, int: 10, cha: 10 },
    status: { hp: 250, maxHp: 250, mental: 185, maxMental: 200, hunger: 100, maxHunger: 100, fatigue: 35, maxFatigue: 100 },
    isAlive: true,
    kills: 0,
    favorability: {},
    equipment: {}
  }
];

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      day: 1,
      survivors: initialSurvivors,
      inventory: [
        { id: '1', name: '붕대', quantity: 2, category: '의약품' },
        { id: '2', name: '통조림', quantity: 5, category: '식량' },
        { id: '3', name: '녹슨 나이프', quantity: 1, category: '무기', tier: '하급', damageMultiplier: 3 },
        { id: '4', name: '가죽 방어구', quantity: 1, category: '방어구', tier: '중급', damageReduction: 0.15 },
        { id: '5', name: '고철', quantity: 5, category: '자원' },
        { id: '6', name: '부품', quantity: 3, category: '자원' }
      ],
      logs: [
        { id: crypto.randomUUID(), day: 1, content: '[시스템] 생존 시뮬레이터가 시작되었습니다.', type: 'system' }
      ],
      isAiModeEnabled: false,
      isAiLoading: false,
      
      isMapModalOpen: false,
      isDevModalOpen: false,
      isBaseModalOpen: false,
      isRelationModalOpen: false,
      isSettingsModalOpen: false,

      campStats: { defense: 0, hygiene: 0, comfort: 0 },
      apiKey: null,
      skillCooldowns: {},
      activeBuffs: {},
      foldedLogs: {},
      relationshipPopups: [],

      removeRelationshipPopup: (id) => set((state) => ({ relationshipPopups: state.relationshipPopups.filter(p => p.id !== id) })),
      toggleLogFold: (logId) => set((state) => ({ foldedLogs: { ...state.foldedLogs, [logId]: !state.foldedLogs[logId] } })),

      toggleAiMode: () => set((state) => ({ isAiModeEnabled: !state.isAiModeEnabled })),
      toggleMapModal: () => set((state) => ({ isMapModalOpen: !state.isMapModalOpen })),
      toggleDevModal: () => set((state) => ({ isDevModalOpen: !state.isDevModalOpen })),
      toggleBaseModal: () => set((state) => ({ isBaseModalOpen: !state.isBaseModalOpen })),
      toggleRelationModal: () => set((state) => ({ isRelationModalOpen: !state.isRelationModalOpen })),
      toggleSettingsModal: () => set((state) => ({ isSettingsModalOpen: !state.isSettingsModalOpen })),

      setApiKey: (key) => set({ apiKey: key }),

      // 업그레이드 액션
      upgradeCampStat: (stat) => set((state) => {
        const inventory = [...state.inventory];
        const scrapIdx = inventory.findIndex(i => i.name === '고철');
        const partsIdx = inventory.findIndex(i => i.name === '부품');
        
        let scrapCost = 2;
        let partsCost = 1;

        if (scrapIdx === -1 || partsIdx === -1 || inventory[scrapIdx].quantity < scrapCost || inventory[partsIdx].quantity < partsCost) {
            alert("자원이 부족합니다.");
            return state;
        }

        inventory[scrapIdx].quantity -= scrapCost;
        if(inventory[scrapIdx].quantity === 0) inventory.splice(scrapIdx, 1);
        
        const newPartsIdx = inventory.findIndex(i => i.name === '부품');
        if (newPartsIdx !== -1) {
            inventory[newPartsIdx].quantity -= partsCost;
            if(inventory[newPartsIdx].quantity === 0) inventory.splice(newPartsIdx, 1);
        }

        return {
          inventory,
          campStats: {
            ...state.campStats,
            [stat]: state.campStats[stat] + 1
          }
        };
      }),

      // 스킬 사용
      useActiveSkill: (survivorId, job) => set((state) => {
        const survivor = state.survivors.find(s => s.id === survivorId);
        if (!survivor || !survivor.isAlive) return state;

        if (state.skillCooldowns[survivorId] && state.skillCooldowns[survivorId] > 0) {
            alert(`쿨타임 중입니다. (${state.skillCooldowns[survivorId]}일 남음)`);
            return state;
        }

        let newLogs = [...state.logs];
        let newInventory = [...state.inventory];
        let newSurvivors = [...state.survivors];
        let newBuffs = { ...state.activeBuffs };

        if (job === '의사') {
            const bandageIdx = newInventory.findIndex(i => i.name === '붕대');
            if (bandageIdx === -1) {
                alert("붕대가 없습니다!");
                return state;
            }
            newInventory[bandageIdx].quantity -= 1;
            if (newInventory[bandageIdx].quantity <= 0) newInventory.splice(bandageIdx, 1);
            
            newSurvivors = newSurvivors.map(s => s.id === survivorId ? { ...s, status: { ...s.status, hp: Math.min(s.status.maxHp, s.status.hp + 100) } } : s);
            newLogs = [{ id: crypto.randomUUID(), day: state.day, content: `[스킬] 의사 ${survivor.name}님이 붕대를 사용하여 체력을 크게(100) 회복했습니다.`, type: 'event' }, ...newLogs];
            
            // 본인 치유 시에는 별점 오르는 타겟이 없음. 파티 전체 위안으로 타인들이 의사를 좋아하게 됨.
            newSurvivors = newSurvivors.map(s => {
                if (s.id !== survivorId) {
                   s.favorability[survivorId] = Math.min(100, (s.favorability[survivorId] || 0) + 10);
                }
                return s;
            });
            // 팝업 시뮬 - 본인에게 +10, 타겟은 아님. 편의상 생략 혹은 전체 띄우기
        } else if (job === '군인') {
            newBuffs[survivorId] = 'soldier_buff';
            newLogs = [{ id: crypto.randomUUID(), day: state.day, content: `[스킬] 군인 ${survivor.name}님이 전술적 위치를 잡아 다음 탐사의 부상 확률을 낮춥니다.`, type: 'combat' }, ...newLogs];
        } else if (job === '아이돌') {
            newSurvivors = newSurvivors.map(s => s.isAlive ? { ...s, status: { ...s.status, mental: Math.min(s.status.maxMental, s.status.mental + 30) } } : s);
            newLogs = [{ id: crypto.randomUUID(), day: state.day, content: `[스킬] 아이돌 ${survivor.name}님의 긴급 콘서트! 캠프 전체의 멘탈이 대폭 회복됩니다.`, type: 'event' }, ...newLogs];
        } else {
            alert("활성 스킬이 없는 직업입니다.");
            return state;
        }

        return {
            logs: newLogs,
            inventory: newInventory,
            survivors: newSurvivors,
            activeBuffs: newBuffs,
            skillCooldowns: { ...state.skillCooldowns, [survivorId]: 3 } // 쿨 3턴
        };
      }),

      loadSaveData: (data) => set((state) => ({ ...state, ...data, isAiLoading: false, relationshipPopups: [] })),

      addSurvivor: (survivor) => set((state) => {
        const newSurvivors = [...state.survivors];
        const newRelations: Record<string, number> = {};

        // 기존 캐릭터들과의 MBTI 상성 계산
        newSurvivors.forEach(existing => {
          if (!existing.isAlive) return;
          const affinity = calculateMbtiAffinity(survivor.mbti, existing.mbti);
          newRelations[existing.id] = affinity;
          existing.favorability = { ...existing.favorability, [survivor.id]: affinity };
        });

        return { survivors: [...newSurvivors, { ...survivor, favorability: newRelations }] };
      }),

      addItem: (item) => set((state) => {
        const inventory = [...state.inventory];
        const existing = inventory.findIndex(i => i.name === item.name && i.tier === item.tier);
        if (existing >= 0 && !item.tier) {
            inventory[existing].quantity += item.quantity;
        } else {
            inventory.push(item);
        }
        return { inventory };
      }),

      assignExpedition: (survivorId, locationId) => set((state) => ({
        survivors: state.survivors.map(s => s.id === survivorId ? { ...s, assignedLocationId: locationId } : s)
      })),

      equipItem: (survivorId, itemId) => set((state) => {
        const survivorIndex = state.survivors.findIndex(s => s.id === survivorId);
        const itemIndex = state.inventory.findIndex(i => i.id === itemId);
        if (survivorIndex === -1 || itemIndex === -1) return state;

        const item = state.inventory[itemIndex];
        const slot = item.category === '무기' ? 'weapon' : item.category === '방어구' ? 'armor' : null;
        if (!slot) return state;

        const newInventory = [...state.inventory];
        const newSurvivors = [...state.survivors];
        const survivor = { ...newSurvivors[survivorIndex] };
        survivor.equipment = { ...(survivor.equipment || {}) };

        const existingEquippedItem = survivor.equipment[slot];
        if (existingEquippedItem) {
          const exIdx = newInventory.findIndex(i => i.name === existingEquippedItem.name);
          if (exIdx >= 0 && !existingEquippedItem.tier) {
             newInventory[exIdx].quantity += 1;
          } else {
             newInventory.push(existingEquippedItem);
          }
        }

        survivor.equipment[slot] = { ...item, quantity: 1 };
        
        if (newInventory[itemIndex].quantity > 1) {
          newInventory[itemIndex] = { ...newInventory[itemIndex], quantity: newInventory[itemIndex].quantity - 1 };
        } else {
          newInventory.splice(itemIndex, 1);
        }

        newSurvivors[survivorIndex] = survivor;
        return { inventory: newInventory, survivors: newSurvivors };
      }),

      unequipItem: (survivorId, slot) => set((state) => {
        const survivorIndex = state.survivors.findIndex(s => s.id === survivorId);
        if (survivorIndex === -1) return state;

        const newSurvivors = [...state.survivors];
        const survivor = { ...newSurvivors[survivorIndex] };
        if (!survivor.equipment || !survivor.equipment[slot]) return state;

        const unequippedItem = survivor.equipment[slot]!;
        const newInventory = [...state.inventory];
        
        const exIdx = newInventory.findIndex(i => i.name === unequippedItem.name);
        if (exIdx >= 0 && !unequippedItem.tier) {
           newInventory[exIdx].quantity += 1;
        } else {
           newInventory.push(unequippedItem);
        }

        delete survivor.equipment[slot];
        newSurvivors[survivorIndex] = survivor;
        return { inventory: newInventory, survivors: newSurvivors };
      }),

      updateRelationship: (sourceId, targetId, amount) => set((state) => {
        let newPopups = [...state.relationshipPopups];
        const sourceName = state.survivors.find(s=>s.id === sourceId)?.name;
        const targetName = state.survivors.find(s=>s.id === targetId)?.name;
        console.log(`[Relationship Update] ${sourceName} <-> ${targetName}: ${amount > 0 ? '+'+amount : amount}`);

        newPopups.push({ id: crypto.randomUUID(), sourceId, targetId, diff: amount });

        let updatedSurvivors = state.survivors.map((s) => {
          if (s.id === sourceId) {
            return {
              ...s,
              favorability: {
                ...s.favorability,
                [targetId]: Math.max(-100, Math.min(100, (s.favorability[targetId] || 0) + amount))
              }
            };
          }
          return s;
        });

        // 질투 엔진 반영
        const jealousies = calculateJealousy(updatedSurvivors, sourceId, targetId, amount);
        jealousies.forEach(j => {
            updatedSurvivors = updatedSurvivors.map(s => {
                if (s.id === j.jealousySourceId) {
                    return {
                        ...s,
                        favorability: {
                            ...s.favorability,
                            [j.targetId]: Math.max(-100, Math.min(100, (s.favorability[j.targetId] || 0) + j.amount))
                        }
                    }
                }
                return s;
            });
            newPopups.push({ id: crypto.randomUUID(), sourceId: j.jealousySourceId, targetId: j.targetId, diff: j.amount });
        });

        return { survivors: updatedSurvivors, relationshipPopups: newPopups };
      }),

      nextDay: async () => {
        const currentState = get();
        if (currentState.isAiLoading) return;

        set({ isAiLoading: true });
        
        const newDay = currentState.day + 1;
        let jobLogs: LogEntry[] = [];
        let expedLogs: LogEntry[] = [];
        let currentSurvivors = [...currentState.survivors];
        let currentInventory: Item[] = currentState.inventory.map(item => ({ ...item, isNew: false }));
        let newBuffs = { ...currentState.activeBuffs };
        let newCooldowns = { ...currentState.skillCooldowns };

        // 쿨타임 감소
        Object.keys(newCooldowns).forEach(key => {
            if (newCooldowns[key] > 0) newCooldowns[key] -= 1;
        });

        const aliveSurvivors = currentSurvivors.filter(s => s.isAlive);
        
        // --- 0. 탐사(Expedition) 및 전투 시스템 처리 ---
        const exploringSurvivors = aliveSurvivors.filter(s => s.assignedLocationId);
        
        exploringSurvivors.forEach(survivor => {
          const locData = MAP_LOCATIONS.find(loc => loc.id === survivor.assignedLocationId);
          if (!locData) return;

          const sameLocGroup = exploringSurvivors.filter(s => s.assignedLocationId === locData.id);
          const synergyScore = calculateGroupSynergy(sameLocGroup);

          const result = processExpedition(survivor, locData, synergyScore);
          
          if (result.combatResult) {
            expedLogs.push({ id: crypto.randomUUID(), day: newDay, content: result.combatResult.logText, type: 'combat' });
          }

          if (result.success && result.lootedItem) {
            const existingItemIndex = currentInventory.findIndex(i => i.name === result.lootedItem!.name && i.tier === result.lootedItem!.tier);
            if (existingItemIndex >= 0 && !result.lootedItem.tier) {
              currentInventory[existingItemIndex].quantity += result.lootedItem.quantity;
              currentInventory[existingItemIndex].isNew = true;
            } else {
              currentInventory.push(result.lootedItem);
            }
            expedLogs.push({ id: crypto.randomUUID(), day: newDay, content: `[탐사 완료] ${result.survivorName}님이 ${result.locationName} 탐사를 마무리지으며 ${result.lootedItem.name}(${result.lootedItem.quantity}개)을(를) 구했습니다!`, type: 'expedition' });
            
            // 거점 디펜스 스탯에 따라 피로도 덜 증가
            const fatigueInc = Math.max(5, 15 - (currentState.campStats.defense * 2));
            currentSurvivors = currentSurvivors.map(s => s.id === survivor.id ? { ...s, status: { ...s.status, fatigue: Math.min(s.status.maxFatigue, s.status.fatigue + fatigueInc) } } : s);
          } else if (!result.success && result.damageTaken) {
            let finalDmg = result.damageTaken;
            // 군인 버프가 있으면 데미지 반감
            if (newBuffs[survivor.id] === 'soldier_buff') {
                finalDmg = Math.floor(finalDmg / 2);
            }
            const newHp = Math.max(0, survivor.status.hp - finalDmg);
            currentSurvivors = currentSurvivors.map(s => 
              s.id === survivor.id ? { ...s, status: { ...s.status, hp: newHp }, isAlive: newHp > 0 } : s
            );
            expedLogs.push({ id: crypto.randomUUID(), day: newDay, content: `[탐사/전투 실패] ${result.survivorName}님이 ${result.locationName}에서 공격당해 체력을 ${finalDmg} 잃었습니다.`, type: 'expedition' });
            
            if (newHp <= 0) {
              expedLogs.push({ id: crypto.randomUUID(), day: newDay, content: `[사망] ${result.survivorName}님이 탐사 중 목숨을 잃었습니다... 캠프 인벤토리가 털렸습니다.`, type: 'system' });
              
              if (currentInventory.length > 0) {
                const dropCount = Math.min(3, currentInventory.length);
                for(let i=0; i<dropCount; i++) {
                  const rIdx = Math.floor(Math.random() * currentInventory.length);
                  const targetDrop = currentInventory[rIdx];
                  targetDrop.quantity -= Math.ceil(targetDrop.quantity / 2);
                  if(targetDrop.quantity <= 0) {
                    currentInventory.splice(rIdx, 1);
                  }
                }
              }
            }
          }
          
          // 버프 해제
          if (newBuffs[survivor.id] === 'soldier_buff') {
              delete newBuffs[survivor.id];
          }

          currentSurvivors = currentSurvivors.map(s => s.id === survivor.id ? { ...s, assignedLocationId: null } : s);
        });

        // --- 1. 밤(사건 중심) 관계 무작위 갱신 ---
        if (aliveSurvivors.length >= 2) {
           const s1 = aliveSurvivors[Math.floor(Math.random() * aliveSurvivors.length)];
           const s2 = aliveSurvivors.filter(s=>s.id !== s1.id)[Math.floor(Math.random() * (aliveSurvivors.length - 1))];
           if (s1 && s2) {
             const isPositive = Math.random() > 0.5;
             const change = isPositive ? 5 : -5;
             s1.favorability[s2.id] = Math.max(-100, Math.min(100, (s1.favorability[s2.id]||0) + change));
             s2.favorability[s1.id] = Math.max(-100, Math.min(100, (s2.favorability[s1.id]||0) + change));
             jobLogs.push({ id: crypto.randomUUID(), day: newDay, content: `[관계] ${s1.name}와 ${s2.name} 사이에 가벼운 ${isPositive?'담소':'말다툼'}가 오가며 관계가 ${change} 되었습니다.`, type: 'event' as const });
           }
        }

        // --- 2. 기본 스탯 업데이트 (거점 스탯 보정치) ---
        const comfortBonus = currentState.campStats.comfort * 2;
        const hygieneBonus = currentState.campStats.hygiene * 1;
        
        const updatedSurvivors = currentSurvivors.map((survivor) => {
          if (!survivor.isAlive) return survivor;
          const newHunger = Math.max(0, survivor.status.hunger - 15);
          const newFatigue = Math.max(0, Math.min(survivor.status.maxFatigue, survivor.status.fatigue + 10 - comfortBonus));
          const newMental = Math.min(survivor.status.maxMental, survivor.status.mental + hygieneBonus);
          let newHp = survivor.status.hp;
          if (newHunger <= 0) newHp = Math.max(0, newHp - 20); 
          return { ...survivor, status: { ...survivor.status, hunger: newHunger, fatigue: newFatigue, hp: newHp, mental: newMental }, isAlive: newHp > 0 };
        });

        // --- 3. 일반 로그 생성 ---
        const dayLogContent = `--- ${newDay}일차 아침이 밝았습니다 ---`;
        const eventText = randomEvents[Math.floor(Math.random() * randomEvents.length)];
        
        const deathLogs: LogEntry[] = [];
        updatedSurvivors.forEach((s, i) => {
            if (!s.isAlive && currentState.survivors[i].isAlive && s.status.hunger <= 0) {
               deathLogs.push({ id: crypto.randomUUID(), day: newDay, content: `[사망] ${s.name}님이 굶주리고 지쳐서 사망했습니다.`, type: 'system' as const });
               // 사망 패널티 (관계도 비례 멘탈 감소)
               updatedSurvivors.forEach(other => {
                  if (other.isAlive && other.id !== s.id) {
                     const likeScore = other.favorability[s.id] || 0;
                     const drop = likeScore > 50 ? 80 : likeScore > 0 ? 40 : likeScore < -50 ? 5 : 20;
                     other.status.mental = Math.max(0, other.status.mental - drop);
                  }
               });
            }
        });

        const regularLogs = [
          ...deathLogs,
          ...expedLogs,
          ...jobLogs,
          { id: crypto.randomUUID(), day: newDay, content: eventText, type: 'event' as const },
          { id: crypto.randomUUID(), day: newDay, content: dayLogContent, type: 'system' as const }
        ];

        let finalLogs: LogEntry[] = [];
        const allEventsText = regularLogs.map(l => l.content);

        if (currentState.isAiModeEnabled) {
          const survivorsInfo = updatedSurvivors.filter(s => s.isAlive).map(s => `- ${s.name} (직업:${s.job}, HP:${Math.floor(s.status.hp)}, 무기:${s.equipment?.weapon?.name || '없음'})`).join('\n');
          // 생존자들의 상호 호감도 관계를 텍스트화
          const relationInfo = updatedSurvivors.filter(s=>s.isAlive).map(s => {
              const rels = Object.entries(s.favorability).map(([tId, score]) => {
                  const targetName = updatedSurvivors.find(u=>u.id===tId)?.name;
                  return targetName ? `${targetName}(${score>50?'매우 신뢰':score>0?'호감':score<-50?'증오':score<-20?'불신':'중립'})` : '';
              }).filter(r=>r!=='').join(', ');
              return rels ? `${s.name}의 심리: [${rels}]` : '';
          }).filter(r=>r!=='').join('\n');
          const finalInfo = `${survivorsInfo}\n\n[현재 인물 간 심리 상태 (가면 뒤의 본심)]\n${relationInfo}`;

          const aiNarrative = await LogManager.generateNarrativeLog(newDay, allEventsText, finalInfo, currentState.apiKey);
          finalLogs = [
            { id: crypto.randomUUID(), day: newDay, content: aiNarrative, type: 'story' },
            ...regularLogs
          ];
        } else {
          finalLogs = regularLogs;
        }

        set((state) => ({
          day: newDay,
          survivors: updatedSurvivors,
          inventory: currentInventory,
          logs: [...finalLogs, ...state.logs],
          skillCooldowns: newCooldowns,
          activeBuffs: newBuffs,
          isAiLoading: false
        }));
      },

      addLog: (log) => set((state) => ({ logs: [{ id: crypto.randomUUID(), day: state.day, ...log }, ...state.logs] })),
    }),
    {
      name: 'z-simulator-storage',
      partialize: (state) => ({
        day: state.day,
        survivors: state.survivors,
        inventory: state.inventory,
        logs: state.logs,
        isAiModeEnabled: state.isAiModeEnabled,
        campStats: state.campStats,
        apiKey: state.apiKey,
        skillCooldowns: state.skillCooldowns,
        foldedLogs: state.foldedLogs
      })
    }
  )
);
