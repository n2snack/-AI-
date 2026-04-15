import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { X, Shield, Sparkles, Smile, ArrowUpCircle } from 'lucide-react';

export const BaseModal: React.FC = () => {
  const { isBaseModalOpen, toggleBaseModal, campStats, upgradeCampStat, inventory } = useGameStore();

  if (!isBaseModalOpen) return null;

  const scrapCount = inventory.find(i => i.name === '고철')?.quantity || 0;
  const partsCount = inventory.find(i => i.name === '부품')?.quantity || 0;

  const maxLevel = 10;

  const renderStatBar = (label: string, icon: React.ReactNode, value: number, statKey: 'defense'|'hygiene'|'comfort', color: string) => (
    <div className="bg-[#1a1c20] border border-[#2b2d35] rounded-xl p-4 flex flex-col mb-3 relative overflow-hidden group">
      <div className="flex justify-between items-center mb-2 z-10 relative">
        <div className="flex items-center gap-2 text-gray-200 font-bold">
          {icon} {label}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400">Lv.{value} / {maxLevel}</span>
          <button 
            onClick={() => upgradeCampStat(statKey)}
            disabled={value >= maxLevel || scrapCount < 2 || partsCount < 1}
            className="flex items-center gap-1 bg-[#23252a] hover:bg-[#32363d] disabled:opacity-50 border border-[#3b3e46] text-[#a0d911] px-2 py-1 rounded transition-colors"
          >
            <ArrowUpCircle size={14} /> 업그레이드
          </button>
        </div>
      </div>
      
      <div className="w-full bg-[#131417] h-2.5 rounded-full overflow-hidden shadow-inner z-10 relative">
         <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${(value / maxLevel) * 100}%`}}></div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-[#151619] border border-[#2b2d35] rounded-2xl w-full max-w-md shadow-[0_0_40px_rgba(139,92,246,0.15)] flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/40 to-transparent p-5 border-b border-[#2b2d35] flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              거점 관리
            </h2>
            <p className="text-[12px] text-gray-400 mt-1">캠프의 시설을 업그레이드하여 생존 확률을 높입니다.</p>
          </div>
          <button onClick={toggleBaseModal} className="text-gray-500 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto">
          <div className="flex justify-between items-center mb-4 bg-[#1a1c20] p-3 rounded-lg border border-[#2b2d35]">
             <span className="text-sm font-bold text-gray-300">보유 자원</span>
             <div className="flex gap-4 text-xs font-mono">
                <span className={scrapCount >= 2 ? 'text-gray-200' : 'text-red-400'}>고철: {scrapCount}</span>
                <span className={partsCount >= 1 ? 'text-gray-200' : 'text-red-400'}>부품: {partsCount}</span>
             </div>
          </div>
          
          <div className="text-[10px] text-gray-500 mb-4 text-right">
             1레벨 업그레이드 소모 비용: 고철 2, 부품 1
          </div>

          {renderStatBar("방어력", <Shield size={16} className="text-red-400"/>, campStats.defense, "defense", "bg-gradient-to-r from-red-800 to-red-500")}
          <div className="text-xs text-gray-500 mb-4 pl-1">- 탐사 및 습격 시 받는 데미지가 줄어듭니다.</div>

          {renderStatBar("위생", <Sparkles size={16} className="text-blue-400"/>, campStats.hygiene, "hygiene", "bg-gradient-to-r from-blue-800 to-blue-500")}
          <div className="text-xs text-gray-500 mb-4 pl-1">- 매일 정신력(멘탈) 자연 회복량이 증가합니다.</div>

          {renderStatBar("안락함", <Smile size={16} className="text-yellow-400"/>, campStats.comfort, "comfort", "bg-gradient-to-r from-yellow-700 to-yellow-400")}
          <div className="text-xs text-gray-500 mb-2 pl-1">- 매일 쌓이는 피로도 증가량이 감소합니다.</div>
        </div>
      </div>
    </div>
  );
};
