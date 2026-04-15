import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { X, Users } from 'lucide-react';

export const RelationModal: React.FC = () => {
  const { isRelationModalOpen, toggleRelationModal, survivors } = useGameStore();

  if (!isRelationModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-[#151619] border border-[#2b2d35] rounded-2xl w-full max-w-2xl shadow-[0_0_40px_rgba(59,130,246,0.15)] flex flex-col relative overflow-hidden h-[70vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900/30 to-transparent p-5 border-b border-[#2b2d35] flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users size={20} className="text-blue-400" /> 호감도 및 인물 관계도
            </h2>
            <p className="text-[12px] text-gray-400 mt-1">캠프 내 구성원들이 서로 어떻게 생각하는지 파악합니다.</p>
          </div>
          <button onClick={toggleRelationModal} className="text-gray-500 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {survivors.map(survivor => (
              <div key={survivor.id} className="bg-[#1a1c20] border border-[#2b2d35] rounded-xl p-4">
                <h3 className="text-md font-bold text-gray-200 mb-3 border-b border-[#2b2d35] pb-2">
                  {survivor.name}의 생각
                </h3>
                
                {Object.keys(survivor.favorability).length === 0 ? (
                  <div className="text-xs text-gray-500 italic text-center py-4">형성된 평판이 없습니다.</div>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(survivor.favorability).map(([target, score]) => (
                      <div key={target} className="flex justify-between items-center bg-[#151619] px-3 py-2 rounded-lg border border-[#23252a]">
                        <span className="text-sm text-gray-300 font-medium">➡️ {target}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${score >= 50 ? 'bg-green-900/40 text-green-400 border border-green-500/30' : score >= 10 ? 'bg-lime-900/30 text-lime-400 border border-lime-500/20' : score <= -50 ? 'bg-red-900/50 text-red-500 border border-red-600/50' : score <= -20 ? 'bg-orange-900/30 text-orange-400 border border-orange-500/30' : 'bg-gray-800 text-gray-400 border border-gray-600'}`}>
                            {score >= 50 ? '소울메이트 (협동+)' : score >= 10 ? '친밀함' : score <= -50 ? '적대 (분열!)' : score <= -20 ? '경계' : '중립'}
                          </span>
                          <span className="text-[11px] font-mono w-10 text-right text-gray-400">
                            {score > 0 ? `+${score}` : score}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
