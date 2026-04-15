export interface Stats {
  str: number; // 힘
  agi: number; // 민첩
  con: number; // 체력
  int: number; // 지능
  cha: number; // 매력
}

export interface Status {
  hp: number;
  maxHp: number;
  mental: number;
  maxMental: number;
  hunger: number;
  maxHunger: number;
  fatigue: number;
  maxFatigue: number;
}

export interface Character {
  id: string;
  name: string;
  gender: '남성' | '여성' | '기타';
  mbti: string;
  job: string;
  stats: Stats;
  status: Status;
  isAlive: boolean;
  kills: number;
  favorability: Record<string, number>;
  assignedLocationId?: string | null;
  equipment?: {
    weapon?: Item;
    armor?: Item;
  };
}

export type ItemCategory = '의약품' | '식량' | '자원' | '기타' | '무기' | '방어구';
export type EquipmentTier = '하급' | '중급' | '상급' | '군용' | '전설';

export interface Item {
  id: string;
  name: string;
  quantity: number;
  category: ItemCategory;
  icon?: string;
  isNew?: boolean;
  tier?: EquipmentTier;
  damageMultiplier?: number;
  damageReduction?: number;
  durability?: number;
}

export interface LogEntry {
  id: string;
  day: number;
  content: string;
  type: 'story' | 'system' | 'combat' | 'event' | 'expedition';
}

export interface LootItem {
  name: string;
  category: ItemCategory;
  weight: number;
  minQuantity: number;
  maxQuantity: number;
}

export interface LocationData {
  id: string;
  name: string;
  description: string;
  riskLevel: number;
  lootTable: LootItem[];
}
