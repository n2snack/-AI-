import { useGameStore } from '../../store/useGameStore';
import { Heart, FileText, Settings, Trash2, Edit3, MapPin, Swords, Shield, X, Plus, Zap } from 'lucide-react';
import type { Character } from '../../types';
import { useState, useEffect } from 'react';

const SurvivorCard = ({ survivor }: { survivor: Character }) => {
  const { inventory, equipItem, unequipItem, skillCooldowns, useActiveSkill, relationshipPopups, removeRelationshipPopup, survivors } = useGameStore();
  const [openSlot, setOpenSlot] = useState<'weapon' | 'armor' | null>(null);

  useEffect(() => {
    const popups = relationshipPopups.filter(p => p.targetId === survivor.id || p.sourceId === survivor.id);
    popups.forEach(p => {
       const timer = setTimeout(() => {
          removeRelationshipPopup(p.id);
       }, 1500 + Math.random() * 500);
       return () => clearTimeout(timer);
    });
  }, [relationshipPopups, survivor.id, removeRelationshipPopup]);

  const activePopups = relationshipPopups.filter(p => p.targetId === survivor.id || p.sourceId === survivor.id).slice(-3);

  const getTierColor = (tier?: string) => {
    switch(tier) {
      case '하급': return 'text-gray-400';
      case '중급': return 'text-blue-400';
      case '상급': return 'text-purple-400';
      case '군용': return 'text-red-400 shadow-red-500/50';
      case '전설': return 'text-yellow-400 drop-shadow-[0_0_3px_rgba(250,204,21,0.8)]';
      default: return 'text-gray-300';
    }
  };

  const getTierBorder = (tier?: string) => {
    switch(tier) {
      case '하급': return 'border-gray-500';
      case '중급': return 'border-blue-500 bg-blue-900/10';
      case '상급': return 'border-purple-500 bg-purple-900/10';
      case '군용': return 'border-red-500 bg-red-900/10';
      case '전설': return 'border-yellow-500 bg-yellow-900/10 shadow-[0_0_8px_rgba(234,179,8,0.2)]';
      default: return 'border-[#2b2d35]';
    }
  };

  const renderDropdown = (slot: 'weapon' | 'armor') => {
    if (openSlot !== slot) return null;
    const items = inventory.filter(i => i.category === (slot === 'weapon' ? '무기' : '방어구'));
    
    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1c20] border border-[#30323a] rounded-lg shadow-xl z-20 max-h-32 overflow-y-auto custom-scrollbar">
        {items.length === 0 ? (
          <div className="p-2 text-center text-xs text-gray-500">인벤토리에 장비가 없습니다.</div>
        ) : (
          items.map(item => (
            <div 
              key={item.id} 
              className={`p-2 hover:bg-[#25262c] text-xs cursor-pointer border-b border-[#2b2d35] last:border-0 flex justify-between items-center ${getTierColor(item.tier)}`}
              onClick={(e) => {
                e.stopPropagation();
                equipItem(survivor.id, item.id);
                setOpenSlot(null);
              }}
            >
              <span className="font-bold">[{item.tier}] {item.name}</span>
              <span className="text-[10px] text-gray-400">수량: {item.quantity}</span>
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="bg-[#17181c] border border-[#23252a] rounded-xl p-4 flex flex-col relative shadow-[0_4px_15px_rgba(0,0,0,0.3)] hover:border-[#383b43] transition-colors">
      {/* Header */}
      <div className="flex justify-between items-start mb-4 relative">
        {/* Floating Icons */}
        <div className="absolute -top-10 left-0 w-full flex justify-center gap-1 pointer-events-none z-50">
           {activePopups.map((popup) => (
             <div key={popup.id} className="animate-bounce flex items-center bg-[#151619] border border-[#2b2d35] px-2 py-0.5 rounded-full shadow-xl">
               {popup.diff > 0 ? <Heart fill="rgba(239,68,68,1)" className="text-red-500 w-3 h-3 mr-1" /> : <Heart fill="rgba(31,41,55,1)" className="text-gray-500 w-3 h-3 mr-1 stroke-gray-400" />}
               <span className={`text-xs font-bold ${popup.diff > 0 ? "text-green-400" : "text-red-500"}`}>
                 {popup.diff > 0 ? `+${popup.diff}` : popup.diff}
               </span>
             </div>
           ))}
        </div>
        <div>
          <h3 className="text-lg font-extrabold flex items-center gap-2 text-gray-100">
             {survivor.name} 
             {survivor.favorability['player'] > 50 ? (
                <Heart fill="rgba(236,72,153,1)" className="text-pink-500 w-4 h-4 shadow-pink-500/50" />
             ) : (
                <Heart className="text-pink-500/50 w-4 h-4" />
             )}
          </h3>
          <div className="flex items-center gap-2 mt-1 mb-2">
            <span className="bg-[#28292f] border border-[#373942] text-gray-300 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold tracking-wider">{survivor.mbti}</span>
            <span className="text-gray-400 text-[12px]">{survivor.gender}</span>
          </div>
          <div className="text-[12px] font-medium bg-sky-900/30 text-[#6cb5e2] w-fit px-2 py-0.5 rounded border border-sky-800/40">
            {survivor.job}
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex space-x-2 text-gray-500 mb-2">
            <FileText size={14} className="cursor-pointer hover:text-gray-200 transition" />
            <Settings size={14} className="cursor-pointer hover:text-gray-200 transition" />
            <Edit3 size={14} className="cursor-pointer hover:text-gray-200 transition" />
            <Trash2 size={14} className="cursor-pointer hover:text-red-400 transition" />
          </div>
          <div className="text-[10px] text-right text-gray-500 font-mono tracking-wider">
            ID: {survivor.id.slice(0,8)}...
            <br /> <span className="inline-block mt-0.5">처치 : {survivor.kills}</span>
            <br /> <span className={`inline-block mt-1 uppercase text-[11px] ${survivor.isAlive ? "text-gray-100 font-bold" : "text-red-600 font-bold"}`}>
              {survivor.isAlive ? "Alive" : "Dead"}
            </span>
            {survivor.assignedLocationId && (
              <span className="flex items-center justify-end gap-1 mt-1.5 text-blue-400 bg-blue-900/30 px-1.5 py-0.5 rounded border border-blue-500/30 w-fit ml-auto">
                <MapPin size={10} /> 탐사 대기
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-5 gap-1 text-center bg-[#101115] p-2 rounded-lg mb-4 border border-[#1e2025]">
         <div className="flex flex-col items-center"><span className="text-gray-500 text-[9px] mb-0.5 font-bold tracking-widest">STR</span><span className="text-gray-200 text-[13px] font-bold">{survivor.stats.str}</span></div>
         <div className="flex flex-col items-center border-l border-[#22242a]"><span className="text-gray-500 text-[9px] mb-0.5 font-bold tracking-widest">AGI</span><span className="text-gray-200 text-[13px] font-bold">{survivor.stats.agi}</span></div>
         <div className="flex flex-col items-center border-l border-[#22242a]"><span className="text-gray-500 text-[9px] mb-0.5 font-bold tracking-widest">CON</span><span className="text-gray-200 text-[13px] font-bold">{survivor.stats.con}</span></div>
         <div className="flex flex-col items-center border-l border-[#22242a]"><span className="text-gray-500 text-[9px] mb-0.5 font-bold tracking-widest">INT</span><span className="text-gray-200 text-[13px] font-bold">{survivor.stats.int}</span></div>
         <div className="flex flex-col items-center border-l border-[#22242a]"><span className="text-gray-500 text-[9px] mb-0.5 font-bold tracking-widest">CHA</span><span className="text-gray-200 text-[13px] font-bold">{survivor.stats.cha}</span></div>
      </div>
      
      {/* Status Bars */}
      <div className="space-y-3 mb-5">
        <div>
          <div className="text-[11px] flex justify-between mb-1.5 text-gray-400 font-medium">
            <span>체력</span>
            <span>{Math.floor(survivor.status.hp)}/{survivor.status.maxHp}</span>
          </div>
          <div className="w-full bg-[#1b1c21] h-1.5 rounded-full overflow-hidden shadow-inner">
            <div className="bg-gradient-to-r from-red-800 to-red-500 h-full transition-all duration-500" style={{ width: `${(survivor.status.hp / survivor.status.maxHp) * 100}%`}}></div>
          </div>
        </div>
        <div>
          <div className="text-[11px] flex justify-between mb-1.5 text-gray-400 font-medium">
            <span>정신력</span>
            <span>{Math.floor(survivor.status.mental)}/{survivor.status.maxMental}</span>
          </div>
          <div className="w-full bg-[#1b1c21] h-1.5 rounded-full overflow-hidden shadow-inner">
            <div className="bg-gradient-to-r from-blue-800 to-blue-500 h-full transition-all duration-500" style={{ width: `${(survivor.status.mental / survivor.status.maxMental) * 100}%`}}></div>
          </div>
        </div>
        <div>
          <div className="text-[11px] flex justify-between mb-1.5 text-gray-400 font-medium">
            <span>허기 (Hunger)</span>
            <span>{Math.floor(survivor.status.hunger)}/{survivor.status.maxHunger}</span>
          </div>
          <div className="w-full bg-[#1b1c21] h-1.5 rounded-full overflow-hidden shadow-inner">
             <div className="bg-gradient-to-r from-orange-700 to-orange-400 h-full transition-all duration-500" style={{ width: `${(survivor.status.hunger / survivor.status.maxHunger) * 100}%`}}></div>
          </div>
        </div>
        <div>
          <div className="text-[11px] flex justify-between mb-1.5 text-gray-400 font-medium">
            <span>피로도</span>
            <span>{Math.floor(survivor.status.fatigue)}/{survivor.status.maxFatigue}</span>
          </div>
          <div className="w-full bg-[#1b1c21] h-1.5 rounded-full overflow-hidden shadow-inner">
             <div className="bg-gradient-to-r from-gray-600 to-gray-400 h-full transition-all duration-500" style={{ width: `${(survivor.status.fatigue / survivor.status.maxFatigue) * 100}%`}}></div>
          </div>
        </div>
      </div>

      {/* Equipment Slots */}
      <div className="grid grid-cols-2 gap-2 mb-4 relative">
        {/* Weapon Slot */}
        <div 
          onClick={() => setOpenSlot(openSlot === 'weapon' ? null : 'weapon')}
          className={`relative bg-[#121316] border rounded-lg p-2.5 flex items-center justify-between group cursor-pointer transition-colors ${getTierBorder(survivor.equipment?.weapon?.tier)}`}
        >
          <div className="flex flex-col w-full">
            <span className="text-[10px] text-gray-500 font-bold mb-0.5 flex items-center gap-1">
              <Swords size={10} className="text-red-400" /> 무기
            </span>
            {survivor.equipment?.weapon ? (
               <span className={`text-xs font-bold ${getTierColor(survivor.equipment.weapon.tier)} truncate w-full pr-4 block`}>
                 {survivor.equipment.weapon.name}
               </span>
            ) : (
               <span className="text-xs text-gray-600 font-medium flex-1">장비 없음</span>
            )}
          </div>
          {survivor.equipment?.weapon ? (
            <button 
              onClick={(e) => { e.stopPropagation(); unequipItem(survivor.id, 'weapon'); setOpenSlot(null); }} 
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity bg-[#121316] pl-1"
            >
              <X size={14} />
            </button>
          ) : (
            <Plus size={14} className="text-gray-600 absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
          {renderDropdown('weapon')}
        </div>
        
        {/* Armor Slot */}
        <div 
          onClick={() => setOpenSlot(openSlot === 'armor' ? null : 'armor')}
          className={`relative bg-[#121316] border rounded-lg p-2.5 flex items-center justify-between group cursor-pointer transition-colors ${getTierBorder(survivor.equipment?.armor?.tier)}`}
        >
           <div className="flex flex-col w-full">
            <span className="text-[10px] text-gray-500 font-bold mb-0.5 flex items-center gap-1">
              <Shield size={10} className="text-blue-400" /> 방어구
            </span>
            {survivor.equipment?.armor ? (
               <span className={`text-xs font-bold ${getTierColor(survivor.equipment.armor.tier)} truncate w-full pr-4 block`}>
                 {survivor.equipment.armor.name}
               </span>
            ) : (
               <span className="text-xs text-gray-600 font-medium flex-1">장비 없음</span>
            )}
          </div>
          {survivor.equipment?.armor ? (
            <button 
              onClick={(e) => { e.stopPropagation(); unequipItem(survivor.id, 'armor'); setOpenSlot(null); }} 
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity bg-[#121316] pl-1"
            >
              <X size={14} />
            </button>
          ) : (
            <Plus size={14} className="text-gray-600 absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
          {renderDropdown('armor')}
        </div>
      </div>

      <button 
        onClick={() => {
           if (['의사', '군인', '아이돌'].includes(survivor.job)) {
             useActiveSkill(survivor.id, survivor.job);
           }
        }} 
        disabled={skillCooldowns[survivor.id] > 0 || !['의사', '군인', '아이돌'].includes(survivor.job) || !survivor.isAlive}
        className="w-full bg-[#2a2312] border border-[#4a3f1f] disabled:opacity-50 disabled:cursor-not-allowed text-[#d6b75a] text-[12px] font-bold py-2 rounded-lg hover:bg-[#362d18] transition-colors mt-6 mb-4 flex items-center justify-center gap-2"
      >
        {['의사', '군인', '아이돌'].includes(survivor.job) ? (
          <>
            <Zap size={14} /> 
            {survivor.job} 스킬 사용
            {skillCooldowns[survivor.id] > 0 && <span className="text-red-400">({skillCooldowns[survivor.id]}턴 후)</span>}
          </>
        ) : (
          "활성 직업 스킬 없음"
        )}
      </button>

      {/* Favorability */}
      <div className="mt-auto pt-4 border-t border-[#23252a] text-[12px]">
        <div className="text-gray-500 mb-2.5 tracking-wide">호감도 ({Object.keys(survivor.favorability).length})</div>
        <div className="space-y-1.5">
          {Object.entries(survivor.favorability).map(([targetId, amount]) => {
             const targetName = survivors.find(s => s.id === targetId)?.name || '알 수 없음';
             return (
               <div key={targetId} className="flex justify-between items-center bg-[#131417] px-2 py-1.5 rounded border border-[#1e2025]">
                 <span className="text-gray-300 truncate pr-2 w-3/4">{targetName}</span>
                 <span className={`font-mono font-bold ${amount >= 50 ? "text-green-400" : amount >= 0 ? "text-[#a0d911]" : amount <= -50 ? "text-red-600" : "text-red-400"}`}>
                   {amount > 0 ? `+${amount}` : amount}
                 </span>
               </div>
             );
          })}
          {Object.keys(survivor.favorability).length === 0 && (
            <div className="text-gray-600 text-xs italic bg-[#131417] px-2 py-1.5 rounded border border-[#1e2025]">관계 데이터 없음</div>
          )}
        </div>
      </div>
    </div>
  );
};

export const SurvivorGrid = () => {
  const { survivors } = useGameStore();

  return (
    <div className="flex-1 mt-6">
      <h2 className="text-[17px] font-bold mb-4 flex items-center gap-2 text-gray-200">
        생존자 목록 
        <span className="bg-[#1e2025] text-gray-400 text-[11px] px-2 py-0.5 rounded-full border border-gray-700 shadow-sm">{survivors.length}</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-5 pb-10">
        {survivors.map((survivor) => (
          <SurvivorCard key={survivor.id} survivor={survivor} />
        ))}
      </div>
    </div>
  );
};
