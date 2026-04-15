import { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import type { Character } from '../../types';

export const SurvivorForm = () => {
  const { addSurvivor } = useGameStore();

  const [name, setName] = useState('');
  const [job, setJob] = useState('(직업 없음/모름)');
  const [gender, setGender] = useState<'남성' | '여성' | '기타'>('남성');
  const [mbti, setMbti] = useState('ENTP');

  // 기본 스탯 평균 5로 초기화
  const [stats, setStats] = useState({ str: 5, agi: 5, con: 5, int: 5, cha: 5 });

  const handleRandomStats = () => {
    setStats({
      str: Math.floor(Math.random() * 10) + 1,
      agi: Math.floor(Math.random() * 10) + 1,
      con: Math.floor(Math.random() * 10) + 1,
      int: Math.floor(Math.random() * 10) + 1,
      cha: Math.floor(Math.random() * 10) + 1,
    });
  };

  const handleRandomSurvivor = () => {
    const randomNames = ['제임스', '레온', '사라', '은지', '민수', '케이트', '잭', '존스', '루시'];
    const randomJobs = ['(직업 없음/모름)', '의사', '아이돌', '군인'];
    const randomMbtis = ['ENTP', 'INFP', 'ESTJ', 'INTJ', 'ENFP', 'ISFJ'];
    const randomGenders: ('남성' | '여성' | '기타')[] = ['남성', '여성', '기타'];

    setName(randomNames[Math.floor(Math.random() * randomNames.length)]);
    setJob(randomJobs[Math.floor(Math.random() * randomJobs.length)]);
    setMbti(randomMbtis[Math.floor(Math.random() * randomMbtis.length)]);
    setGender(randomGenders[Math.floor(Math.random() * randomGenders.length)]);
    handleRandomStats();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert("생존자 이름을 입력해주세요.");
      return;
    }

    const newSurvivor: Character = {
      id: crypto.randomUUID(),
      name: name.trim(),
      gender,
      mbti,
      job: job === '(직업 없음/모름)' ? '무직' : job,
      stats: { ...stats },
      status: { 
        hp: 250, maxHp: 250, 
        mental: 200, maxMental: 200, 
        hunger: 100, maxHunger: 100, 
        fatigue: 0, maxFatigue: 100 
      },
      isAlive: true,
      kills: 0,
      favorability: {},
      equipment: {}
    };

    console.log("[FormData] 새로운 생존자 생성됨:", newSurvivor);
    addSurvivor(newSurvivor);

    // 폼 초기화
    setName('');
    setJob('(직업 없음/모름)');
    handleRandomStats();
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel p-5 mb-4 bg-[#141517] border border-[#27282d] rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.4)]">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-[16px] font-bold text-[#a0d911] flex items-center gap-2 tracking-wide">새로운 생존자</h2>
        <button type="button" onClick={handleRandomSurvivor} className="text-[11px] text-[#8e6bbd] flex items-center gap-1 hover:text-[#af81e6] transition font-medium border border-[#8e6bbd]/30 px-2 py-1 rounded bg-[#2c1d3f]/20">
          <span className="text-[12px]">🎲</span> 랜덤 생존자 추가
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] text-gray-400 mb-1.5 ml-1 font-medium tracking-wide">이름</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="생존자 이름" 
            className="w-full bg-[#1b1c21] border border-[#2b2d35] rounded-lg p-2.5 text-[13px] text-gray-200 outline-none focus:border-[#4a4d5e] focus:bg-[#202126] transition shadow-inner placeholder-gray-600" 
          />
        </div>
        <div>
          <label className="block text-[11px] text-gray-400 mb-1.5 ml-1 font-medium tracking-wide">직업 (선택)</label>
          <select 
            value={job}
            onChange={(e) => setJob(e.target.value)}
            className="w-full bg-[#1b1c21] border border-[#2b2d35] rounded-lg p-2.5 text-[13px] text-gray-300 outline-none focus:border-[#4a4d5e] focus:bg-[#202126] transition appearance-none shadow-inner"
          >
            <option>(직업 없음/모름)</option>
            <option>의사</option>
            <option>아이돌</option>
            <option>군인</option>
          </select>
        </div>
      </div>
      
      <div className="mt-5 bg-[#111215] border border-[#1e2025] rounded-xl p-3.5 shadow-inner">
         <div className="flex justify-between items-center mb-3">
            <div className="text-[11px] text-gray-500 tracking-wider">능력치 (STATS 0-10)</div>
            <button type="button" onClick={handleRandomStats} className="text-[10px] bg-[#1e2025] border border-[#2b2d35] px-2 py-1 rounded text-gray-400 hover:text-gray-200 transition">스탯 랜덤</button>
         </div>
         <div className="flex justify-around text-center mt-3">
             <div className="flex flex-col gap-1.5 items-center"><span className="text-[#d89e5a] text-[10px] drop-shadow-sm">힘</span><div className="bg-[#1b1c21] w-10 py-1.5 rounded-md text-[13px] font-bold text-gray-300 border border-[#2b2d35]">{stats.str}</div></div>
             <div className="flex flex-col gap-1.5 items-center"><span className="text-[#a0d911] text-[10px] drop-shadow-sm">민첩</span><div className="bg-[#1b1c21] w-10 py-1.5 rounded-md text-[13px] font-bold text-gray-300 border border-[#2b2d35]">{stats.agi}</div></div>
             <div className="flex flex-col gap-1.5 items-center"><span className="text-blue-400 text-[10px] drop-shadow-sm">체력</span><div className="bg-[#1b1c21] w-10 py-1.5 rounded-md text-[13px] font-bold text-gray-300 border border-[#2b2d35]">{stats.con}</div></div>
             <div className="flex flex-col gap-1.5 items-center"><span className="text-pink-400 text-[10px] drop-shadow-sm">지능</span><div className="bg-[#1b1c21] w-10 py-1.5 rounded-md text-[13px] font-bold text-gray-300 border border-[#2b2d35]">{stats.int}</div></div>
             <div className="flex flex-col gap-1.5 items-center"><span className="text-orange-400 text-[10px] drop-shadow-sm">매력</span><div className="bg-[#1b1c21] w-10 py-1.5 rounded-md text-[13px] font-bold text-gray-300 border border-[#2b2d35]">{stats.cha}</div></div>
         </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-5">
        <div>
          <label className="block text-[11px] text-gray-400 mb-1.5 ml-1 font-medium tracking-wide">성별</label>
          <select 
            value={gender}
            onChange={(e) => setGender(e.target.value as '남성' | '여성' | '기타')}
            className="w-full bg-[#1b1c21] border border-[#2b2d35] rounded-lg p-2.5 text-[13px] text-gray-300 outline-none focus:border-[#4a4d5e] appearance-none shadow-inner"
          >
            <option>남성</option>
            <option>여성</option>
            <option>기타</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] text-gray-400 mb-1.5 ml-1 font-medium tracking-wide">MBTI</label>
          <select 
            value={mbti}
            onChange={(e) => setMbti(e.target.value)}
            className="w-full bg-[#1b1c21] border border-[#2b2d35] rounded-lg p-2.5 text-[13px] text-gray-300 outline-none focus:border-[#4a4d5e] appearance-none shadow-inner"
          >
            <option>ENTP</option>
            <option>INFP</option>
            <option>ESTJ</option>
            <option>INTJ</option>
            <option>ENFP</option>
            <option>ISFJ</option>
          </select>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-[#23252a]">
        <button type="submit" className="w-full bg-gradient-to-r from-[#3e5f22] to-[#314a1a] border border-[#50772e] hover:from-[#496e2a] hover:to-[#38561d] text-gray-100 font-bold py-3.5 rounded-xl shadow-[0_0_10px_rgba(75,114,37,0.2)] hover:shadow-[0_0_15px_rgba(75,114,37,0.3)] transition-all text-sm tracking-widest uppercase">
          그룹에 추가
        </button>
      </div>
    </form>
  );
};
