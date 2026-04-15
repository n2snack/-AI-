import { TopBar } from './components/layout/TopBar';
import { MissionLog } from './components/log/MissionLog';
import { SurvivorForm } from './components/survivor/SurvivorForm';
import { SurvivorGrid } from './components/survivor/SurvivorGrid';
import { Inventory } from './components/inventory/Inventory';
import { MapModal } from './components/map/MapModal';
import { BaseModal } from './components/modals/BaseModal';
import { DevModal } from './components/modals/DevModal';
import { RelationModal } from './components/modals/RelationModal';
import { SettingsModal } from './components/modals/SettingsModal';

function App() {
  return (
    <div className="min-h-screen bg-[#151619] flex flex-col pt-16">
      <div className="fixed top-0 left-0 right-0 z-40">
        <TopBar />
      </div>
      
      {/* Modals Root */}
      <MapModal />
      <BaseModal />
      <DevModal />
      <RelationModal />
      <SettingsModal />
      
      <main className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-4rem)]">
        {/* Left: Mission Log */}
        <div className="lg:col-span-1 h-full overflow-hidden">
          <MissionLog />
        </div>
        
        {/* Center: Add Form & Survivor List */}
        <div className="lg:col-span-2 flex flex-col h-full overflow-y-auto pr-2 custom-scrollbar">
          <SurvivorForm />
          <SurvivorGrid />
        </div>
        
        {/* Right: Camp Inventory */}
        <div className="lg:col-span-1 h-full overflow-hidden">
          <Inventory />
        </div>
      </main>
    </div>
  );
}

export default App;
