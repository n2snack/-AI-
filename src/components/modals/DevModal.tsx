import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { X, Bug, Plus, RefreshCw } from 'lucide-react';
import type { ItemCategory } from '../../types';

export const DevModal: React.FC = () => {
  const { isDevModalOpen, toggleDevModal, addItem, addLog } = useGameStore();
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemCategory, setItemCategory] = useState<ItemCategory>('식량');

  if (!isDevModalOpen) return null;

  const handleAddItem = () => {
    if (!itemName.trim() || itemQuantity <= 0) return;
    addItem({
      id: crypto.randomUUID(),
      name: itemName,
      quantity: itemQuantity,
      category: itemCategory,
      isNew: true
    });
    alert(`${itemName} ${itemQuantity}개가 추가되었습니다.`);
    setItemName('');
  };

  const handleHealAll = () => {
    useGameStore.setState(state => ({
      survivors: state.survivors.map(s => ({ ...s, status: { ...s.status, hp: s.status.maxHp, mental: s.status.maxMental, fatigue: 0, hunger: s.status.maxHunger } }))
    }));
    alert("모든 생존자의 스탯이 최대치로 회복되었습니다.");
  };

  const handleForceEvent = () => {
    addLog({ content: "[Dev] 개발자에 의해 강제 랜덤 이벤트가 발생했습니다.", type: "event" });
    alert("로그에 강제 이벤트가 주입되었습니다.");
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-[#151619] border border-red-900/50 rounded-2xl w-full max-w-md shadow-[0_0_40px_rgba(220,38,38,0.2)] flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="bg-red-900/20 p-5 border-b border-red-900/40 flex justify-between items-center">
          <h2 className="text-xl font-bold text-red-500 flex items-center gap-2">
            <Bug size={20} /> 관리자(Dev) 치트
          </h2>
          <button onClick={toggleDevModal} className="text-gray-500 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-6">
          {/* Add Item Cheat */}
          <div className="bg-[#1a1c20] p-4 rounded-xl border border-[#2b2d35]">
             <h3 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-1"><Plus size={14}/> 커스텀 아이템 주입</h3>
             <div className="flex gap-2 mb-2">
               <input 
                 className="flex-1 bg-[#151619] border border-[#2b2d35] rounded px-2 py-1.5 text-xs text-white" 
                 placeholder="아이템 이름" 
                 value={itemName} onChange={e=>setItemName(e.target.value)} 
               />
               <input 
                 type="number" className="w-16 bg-[#151619] border border-[#2b2d35] rounded px-2 py-1.5 text-xs text-white" 
                 value={itemQuantity} onChange={e=>setItemQuantity(Number(e.target.value))} min={1}
               />
             </div>
             <div className="flex gap-2">
               <select className="flex-1 bg-[#151619] border border-[#2b2d35] rounded px-2 py-1.5 text-xs text-white" value={itemCategory} onChange={e=>setItemCategory(e.target.value as ItemCategory)}>
                 <option value="식량">식량</option>
                 <option value="의약품">의약품</option>
                 <option value="자원">자원</option>
                 <option value="무기">무기</option>
                 <option value="방어구">방어구</option>
               </select>
               <button onClick={handleAddItem} className="bg-red-900/50 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-red-600 transition">추가</button>
             </div>
          </div>

          <div className="bg-[#1a1c20] p-4 rounded-xl border border-[#2b2d35] space-y-2">
             <button onClick={handleHealAll} className="w-full bg-[#151619] hover:bg-[#23252a] border border-[#2b2d35] text-gray-300 py-2 rounded text-sm flex items-center justify-center gap-2 transition">
               <RefreshCw size={14} className="text-green-400"/> 생존자 전원 FULL 회복
             </button>
             <button onClick={handleForceEvent} className="w-full bg-[#151619] hover:bg-[#23252a] border border-[#2b2d35] text-gray-300 py-2 rounded text-sm flex items-center justify-center gap-2 transition">
               <Bug size={14} className="text-purple-400"/> 로그 강제 발생 트리거
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
