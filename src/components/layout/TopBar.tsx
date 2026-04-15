import { useGameStore } from '../../store/useGameStore';
import { Moon, Map as MapIcon, Home, Users, Settings, Bug } from 'lucide-react';

export const TopBar: React.FC = () => {
  const { day, survivors, toggleMapModal, toggleBaseModal, toggleRelationModal, toggleSettingsModal, toggleDevModal } = useGameStore();

  return (
    <header className="flex justify-between items-center p-4 border-b border-gray-800 bg-[#151619] h-16">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-red-500 flex items-center gap-2 gap-x-2">
          Z-SIMULATOR <span className="text-white text-lg">1.2.0v</span>
        </h1>
        <Moon className="text-gray-400 w-5 h-5 ml-2 cursor-pointer hover:text-white" />
        <span className="text-sm text-gray-500 ml-2 hidden sm:block">MBTI 성격 기반 생존 시뮬레이터</span>
      </div>

      <div className="flex gap-3 items-center">
        {/* Modals */}
        <button onClick={toggleBaseModal} className="flex items-center gap-1.5 bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/50 text-purple-200 px-3 py-1.5 rounded-lg text-sm font-bold transition-all hover:scale-105 active:scale-95">
          <Home size={14} /> <span className="hidden md:inline">거점 관리</span>
        </button>
        <button onClick={toggleRelationModal} className="flex items-center gap-1.5 bg-sky-900/40 hover:bg-sky-900/60 border border-sky-500/50 text-sky-200 px-3 py-1.5 rounded-lg text-sm font-bold transition-all hover:scale-105 active:scale-95">
          <Users size={14} /> <span className="hidden md:inline">인물 관계도</span>
        </button>
        <button onClick={toggleSettingsModal} className="flex items-center gap-1.5 bg-[#23252a] hover:bg-[#32363d] border border-[#3b3e46] text-gray-300 px-3 py-1.5 rounded-lg text-sm font-bold transition-all hover:scale-105 active:scale-95">
          <Settings size={14} /> <span className="hidden md:inline">설정</span>
        </button>
        <button onClick={toggleDevModal} className="flex items-center gap-1.5 bg-green-900/30 hover:bg-green-900/50 border border-green-500/50 text-green-400 px-3 py-1.5 rounded-lg text-sm font-bold transition-all hover:scale-105 active:scale-95">
          <Bug size={14} /> DEV
        </button>

        <div className="w-px h-6 bg-gray-700 mx-2"></div>

        <button onClick={toggleMapModal} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-all shadow-[0_0_10px_rgba(37,99,235,0.3)] hover:scale-105 active:scale-95 mr-2">
          <MapIcon size={16} /> <span>지역 탐사</span>
        </button>
        
        <div className="text-right">
          <div className="text-xs text-gray-400">생존 일수</div>
          <div className="text-xl font-bold text-[#a0d911] leading-none">{day}</div>
        </div>
        <div className="text-right ml-4">
          <div className="text-xs text-gray-400">생존자</div>
          <div className="text-xl font-bold leading-none">{survivors.length}/4</div>
        </div>
      </div>
    </header>
  );
};
