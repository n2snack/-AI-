import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { X, Save, AlertTriangle } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const { isSettingsModalOpen, toggleSettingsModal, apiKey, setApiKey } = useGameStore();
  const [inputKey, setInputKey] = useState(apiKey || '');

  if (!isSettingsModalOpen) return null;

  const handleSave = () => {
    setApiKey(inputKey);
    alert('설정이 저장되었습니다.');
    toggleSettingsModal();
  };

  const handleClear = () => {
    if (confirm('모든 세이브 데이터가 삭제되고 초기화됩니다. 정말 진행하시겠습니까?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-[#151619] border border-[#2b2d35] rounded-2xl w-full max-w-sm shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#2b2d35] flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-200">
            시스템 설정
          </h2>
          <button onClick={toggleSettingsModal} className="text-gray-500 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1">
          <div className="mb-6">
            <label className="block text-xs text-gray-400 mb-2 font-bold">Gemini API 키 입력</label>
            <input 
              type="password" 
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="AI 서사용 API 키 입력"
              className="w-full bg-[#1b1c21] border border-[#2b2d35] rounded-lg p-2.5 text-sm text-gray-200 outline-none focus:border-blue-500 transition shadow-inner"
            />
            <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">
              * 키 입력 시 '.env' 환경 변수보다 우선하여 적용됩니다.<br/>
              * 키는 브라우저 로컬 스토리지에만 보관됩니다.
            </p>
          </div>
          
          <button 
            onClick={handleSave} 
            className="w-full flex items-center justify-center gap-2 bg-[#23252a] hover:bg-[#2c2f36] border border-[#3b3e46] text-gray-200 font-bold py-2.5 rounded-lg transition-colors mb-6"
          >
            <Save size={16} /> 설정 저장
          </button>

          <div className="pt-6 border-t border-[#2b2d35]">
             <button onClick={handleClear} className="w-full flex items-center justify-center gap-2 bg-red-900/30 hover:bg-red-900/50 border border-red-500/30 text-red-500 font-bold py-2.5 rounded-lg transition-colors">
                <AlertTriangle size={16} /> 초기화 (모든 데이터 삭제)
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
