import { useRef } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Download, Upload, AlertTriangle, BookOpen, Utensils, Swords, Info, Sparkles, Loader2, Compass, ChevronDown, ChevronUp } from 'lucide-react';

export const MissionLog = () => {
  const { logs, isAiModeEnabled, toggleAiMode, isAiLoading, foldedLogs, toggleLogFold } = useGameStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getIconForType = (type: string, content: string) => {
    if (content.includes('[스토리]')) return <BookOpen size={16} className="text-gray-400" />;
    if (content.includes('[식량 부족]')) return <Utensils size={16} className="text-orange-400" />;
    if (content.includes('[사망]')) return <AlertTriangle size={16} className="text-red-500" />;
    if (type === 'combat') return <Swords size={16} className="text-red-400" />;
    if (type === 'expedition') return <Compass size={16} className="text-blue-400" />;
    if (type === 'event') return <Info size={16} className="text-[#a0d911]" />;
    if (type === 'story') return <Sparkles size={16} className="text-purple-400 animate-pulse" />;
    return <span className="w-2 h-2 rounded-full bg-gray-500 ml-1 mt-1"></span>;
  };

  const handleExport = () => {
    const state = useGameStore.getState();
    const dataToSave = {
      day: state.day,
      survivors: state.survivors,
      inventory: state.inventory,
      logs: state.logs,
      isAiModeEnabled: state.isAiModeEnabled
    };
    const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `z_simulator_save_day${state.day}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        useGameStore.getState().loadSaveData(parsed);
        alert('게임을 성공적으로 불러왔습니다!');
      } catch (err) {
        alert('잘못된 저장 파일 형식입니다.');
      }
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="glass-panel p-4 h-full flex flex-col bg-[#141517] border border-[#27282d] rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.5)] relative">
      <div className="flex justify-between items-center mb-4 border-b border-[#27282d] pb-3">
        <h2 className="text-[15px] font-bold flex items-center gap-2 text-gray-200">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
          생존 일지 
        </h2>
        
        <div className="flex items-center gap-2">
          {/* AI 모드 토글 */}
          <label className="flex items-center cursor-pointer gap-2 group mr-2">
             <div className="relative">
               <input type="checkbox" className="sr-only" checked={isAiModeEnabled} onChange={toggleAiMode} disabled={isAiLoading} />
               <div className={`block w-9 h-5 rounded-full transition-colors ${isAiModeEnabled ? 'bg-purple-600' : 'bg-[#2b2d35]'}`}></div>
               <div className={`dot absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform ${isAiModeEnabled ? 'transform translate-x-4' : ''}`}></div>
             </div>
             <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${isAiModeEnabled ? 'text-purple-400 drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]' : 'text-gray-500'}`}>
               AI 서사 모드
             </span>
          </label>

          <button onClick={handleExport} title="현재 상태 다운로드" className="text-xs flex items-center gap-1 text-gray-400 hover:text-gray-200 bg-[#1e1f23] border border-[#2b2d35] px-2 py-1 rounded transition hover:bg-[#28292d]">
            <Download size={13} /> Save
          </button>
          <button onClick={handleImportClick} title="세이브 파일 불러오기" className="text-xs flex items-center gap-1 text-gray-400 hover:text-gray-200 bg-[#1e1f23] border border-[#2b2d35] px-2 py-1 rounded transition hover:bg-[#28292d]">
            <Upload size={13} /> Load
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileChange} />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 custom-scrollbar relative">
        {isAiLoading && (
          <div className="absolute top-0 left-0 right-0 p-5 bg-[#1b1c21]/95 rounded border border-purple-500/30 z-10 backdrop-blur shadow-lg flex flex-col items-center justify-center">
            <Loader2 className="w-6 h-6 text-purple-400 animate-spin mb-2.5" />
            <span className="text-purple-300 text-[12px] font-bold tracking-widest animate-pulse">AI가 일지를 기록 중입니다...</span>
          </div>
        )}
      
        {logs.map((log) => (
          <div key={log.id} className={`text-sm flex items-start gap-3 border-l-[3px] py-1.5 px-2 transition-colors rounded-r-md ${log.type === 'story' ? 'border-purple-500 bg-purple-900/10 flex-col' : 'border-[#2c2d33] hover:border-gray-500'}`}>
            {log.type === 'story' ? (
              <div className="w-full flex flex-col">
                <div 
                  className="flex justify-between items-center cursor-pointer w-full text-purple-300 font-bold hover:text-purple-100 transition px-1 py-1"
                  onClick={() => toggleLogFold(log.id)}
                >
                  <span className="flex items-center gap-2 text-[12px] uppercase tracking-wider"><Sparkles size={14} className="text-purple-400" /> AI 서사 생존 일지</span>
                  {foldedLogs[log.id] ? <ChevronDown size={14}/> : <ChevronUp size={14}/>}
                </div>
                <div className={`transition-all duration-300 origin-top overflow-hidden pl-5 pr-2 ${foldedLogs[log.id] ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100 mt-2 pb-2'}`}>
                  <p className="leading-relaxed tracking-wide whitespace-pre-wrap text-purple-200 text-[13.5px] italic font-serif">
                    "{log.content}"
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="mt-0.5 min-w-[20px] flex justify-center opacity-80">
                  {getIconForType(log.type, log.content)}
                </div>
                <p className="leading-relaxed tracking-wide whitespace-pre-wrap text-gray-300 text-[13px]">
                  {log.content}
                </p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
