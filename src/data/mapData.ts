import type { LocationData } from '../types';

export const MAP_LOCATIONS: LocationData[] = [
  {
    id: 'loc_downtown',
    name: '도심지',
    description: '좀비가 많지 않은 안전한 지역. 자질구레한 자원들을 구할 수 있습니다.',
    riskLevel: 1,
    lootTable: [
      { name: '고철', category: '자원', weight: 60, minQuantity: 1, maxQuantity: 3 },
      { name: '통조림', category: '식량', weight: 30, minQuantity: 1, maxQuantity: 2 },
      { name: '붕대', category: '의약품', weight: 10, minQuantity: 1, maxQuantity: 1 },
    ]
  },
  {
    id: 'loc_mart',
    name: '대형마트',
    description: '식량을 대규모로 구할 가능성이 높지만 방심은 금물입니다.',
    riskLevel: 2,
    lootTable: [
      { name: '통조림', category: '식량', weight: 40, minQuantity: 2, maxQuantity: 4 },
      { name: '생수', category: '식량', weight: 30, minQuantity: 1, maxQuantity: 3 },
      { name: '가방', category: '기타', weight: 10, minQuantity: 1, maxQuantity: 1 },
      { name: '부품', category: '자원', weight: 20, minQuantity: 1, maxQuantity: 2 },
    ]
  },
  {
    id: 'loc_hospital',
    name: '폐병원',
    description: '의약품이 절실하다면 반드시 가야 할 곳. 감염자 무리가 도사리고 있습니다.',
    riskLevel: 3,
    lootTable: [
      { name: '구급상자', category: '의약품', weight: 25, minQuantity: 1, maxQuantity: 1 },
      { name: '항생제', category: '의약품', weight: 35, minQuantity: 1, maxQuantity: 2 },
      { name: '붕대', category: '의약품', weight: 40, minQuantity: 1, maxQuantity: 3 },
    ]
  },
  {
    id: 'loc_base',
    name: '군사기지',
    description: '최고 위험 구역. 목숨을 걸어야 하지만 고급 식량과 물자를 얻을 수 있습니다.',
    riskLevel: 5,
    lootTable: [
      { name: '전투식량', category: '식량', weight: 30, minQuantity: 2, maxQuantity: 5 },
      { name: '탄약', category: '자원', weight: 30, minQuantity: 5, maxQuantity: 15 },
      { name: '돌격소총', category: '기타', weight: 10, minQuantity: 1, maxQuantity: 1 },
      { name: '고철', category: '자원', weight: 15, minQuantity: 3, maxQuantity: 6 },
      { name: '부품', category: '자원', weight: 15, minQuantity: 2, maxQuantity: 5 },
    ]
  }
];
