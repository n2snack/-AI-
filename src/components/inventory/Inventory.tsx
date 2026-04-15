import { useGameStore } from '../../store/useGameStore';
import { Package } from 'lucide-react';

export const Inventory = () => {
  const { inventory, nextDay } = useGameStore();

  return (
    <div className="glass-panel p-4 h-full flex flex-col bg-[#141517] border border-[#27282d] rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      <h2 className="text-[15px] font-bold mb-4 flex items-center gap-2 pb-3 border-b border-[#27282d] text-gray-200">
        <Package className="text-[#d89e5a]" size={18} /> 캠프 인벤토리 
        <span className="bg-[#212328] text-gray-400 text-[11px] px-2 py-0.5 rounded-full ml-auto border border-[#30323a]">{inventory.length}</span>
      </h2>
      
      <div className="grid grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3 flex-1 content-start overflow-y-auto custom-scrollbar pr-1">
        {inventory.map((item) => (
          <div key={item.id} className={`bg-[#1b1c21] border ${item.isNew ? 'border-[#a0d911] shadow-[0_0_15px_rgba(160,217,17,0.3)] animate-pulse' : 'border-[#2b2d35]'} rounded-xl p-2 flex flex-col items-center justify-center aspect-square hover:bg-[#22242a] hover:border-gray-500 transition-all cursor-pointer shadow-md group relative`}>
            <span className="text-[32px] mb-2 flex-1 flex items-center justify-center group-hover:scale-110 transition-transform">
              {item.category === '의약품' ? '💊' : item.category === '식량' ? '🥫' : '📦'}
            </span>
            <span className="text-[11px] text-center text-gray-300 font-medium truncate w-full px-1">{item.name}</span>
            {item.quantity > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#141517] text-gray-300 text-[10px] w-5 h-5 rounded-full border border-gray-700 shadow-md flex items-center justify-center font-bold">
                {item.quantity}
              </span>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-[#27282d]">
        <button 
          onClick={nextDay}
          className="w-full bg-gradient-to-r from-red-800 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-bold py-3.5 rounded-xl shadow-[0_0_15px_rgba(220,38,38,0.15)] hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all transform active:scale-[0.98] tracking-widest text-[14px]"
        >
          다음 날
        </button>
      </div>
    </div>
  );
};
