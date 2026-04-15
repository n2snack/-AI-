import { useGameStore } from '../../store/useGameStore';
import { MAP_LOCATIONS } from '../../data/mapData';
import { X, Map as MapIcon, ShieldAlert, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export const MapModal = () => {
  const { isMapModalOpen, toggleMapModal, survivors, assignExpedition } = useGameStore();
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  if (!isMapModalOpen) return null;

  const locInfo = MAP_LOCATIONS.find(l => l.id === selectedLocation);
  
  // HP 20% 이상인 생존자만 파견 가능
  const availableSurvivors = survivors.filter(s => s.isAlive && (s.status.hp / s.status.maxHp) > 0.2);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#141517] w-full max-w-4xl h-[80vh] border border-[#27282d] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-[#27282d] bg-[#1a1c20]">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-100">
            <MapIcon className="text-blue-400" />
            지역 탐사 (Expedition)
          </h2>
          <button onClick={toggleMapModal} className="text-gray-400 hover:text-white p-1 bg-[#25262c] rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Map List Left */}
          <div className="w-1/3 border-r border-[#27282d] bg-[#17181c] p-4 flex flex-col gap-3 overflow-y-auto custom-scrollbar">
            {MAP_LOCATIONS.map(loc => {
              const bg = selectedLocation === loc.id ? 'bg-blue-900/30 border-blue-500' : 'bg-[#1e1f24] hover:bg-[#25262c] border-[#2b2d35]';
              return (
                <div key={loc.id} onClick={() => setSelectedLocation(loc.id)} className={`p-4 rounded-xl border ${bg} cursor-pointer transition-all`}>
                  <h3 className="font-bold text-gray-200 mb-1">{loc.name}</h3>
                  <div className="flex items-center gap-1 text-xs font-bold text-gray-400">
                    <ShieldAlert size={12} className={loc.riskLevel >= 4 ? 'text-red-400' : 'text-yellow-400'} /> 
                    위험도: {'★'.repeat(loc.riskLevel)}{'☆'.repeat(5 - loc.riskLevel)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Map Details Right */}
          <div className="w-2/3 p-6 bg-[#141517] overflow-y-auto custom-scrollbar">
            {locInfo ? (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-black text-white mb-2">{locInfo.name}</h1>
                  <p className="text-gray-400 text-sm leading-relaxed">{locInfo.description}</p>
                </div>
                
                <div className="bg-[#1b1c21] p-4 rounded-xl border border-[#2b2d35]">
                  <h4 className="font-bold text-sm text-gray-300 mb-3 flex items-center gap-2">
                    <ArrowRight size={14} className="text-blue-400"/> 주요 파밍 자원
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {locInfo.lootTable.map(loot => (
                      <span key={loot.name} className="px-3 py-1 bg-[#25262c] border border-[#30323a] rounded-lg text-xs font-semibold text-gray-300">
                        {loot.name} ({loot.category})
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-gray-300 mb-3 flex items-center justify-between">
                    <span>탐사대 배정</span>
                    <span className="text-xs text-red-400 font-normal">* HP 20% 이하는 배정 불가</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {availableSurvivors.map(s => {
                      const isAssignedToThis = s.assignedLocationId === locInfo.id;
                      const isAssignedElse = s.assignedLocationId && s.assignedLocationId !== locInfo.id;
                      
                      return (
                        <div key={s.id} className={`p-3 rounded-xl border flex items-center justify-between ${isAssignedToThis ? 'bg-blue-600/20 border-blue-500' : isAssignedElse ? 'bg-[#1a1c21] border-[#22242a] opacity-50' : 'bg-[#1e1f24] border-[#2b2d35]'}`}>
                          <div>
                            <div className="font-bold text-sm text-gray-200">{s.name}</div>
                            <div className="text-[10.5px] text-gray-400 mt-1">AGI {s.stats.agi} | INT {s.stats.int}</div>
                          </div>
                          {!isAssignedElse && (
                            <button 
                              onClick={() => assignExpedition(s.id, isAssignedToThis ? null : locInfo.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${isAssignedToThis ? 'bg-red-500/20 text-red-400 hover:bg-red-500/40 border border-red-500/30' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'}`}
                            >
                              {isAssignedToThis ? '배정 취소' : '파견하기'}
                            </button>
                          )}
                          {isAssignedElse && <span className="text-xs text-gray-600 font-bold pr-2">타 지역 파견됨</span>}
                        </div>
                      )
                    })}
                    {availableSurvivors.length === 0 && (
                      <div className="col-span-2 text-center py-8 bg-[#1b1c21] rounded-xl border border-[#2b2d35] text-gray-500 text-sm">
                        건강한 생존자가 없습니다.
                      </div>
                    )}
                  </div>
                  <div className="mt-4 text-xs text-gray-500">
                    * 탐사 배정은 다음 '다음 날'로 넘어갈 때 1회 실행되며 자동 해제됩니다. <br/>
                    * 민첩(AGI)과 지능(INT)의 합계가 높을수록 획득/생존 확률이 상승합니다.
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4">
                <MapIcon size={48} className="opacity-20" />
                <p>좌측에서 탐사할 지역을 선택해주세요.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
