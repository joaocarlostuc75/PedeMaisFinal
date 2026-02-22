
import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { DiaFuncionamento, Feriado, Intervalo } from '../types';

const DAYS_OF_WEEK = [
  'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'
];

export const LojistaHorarios = () => {
  const { lojas, updateLoja, addNotification, user } = useStore();
  const minhaLoja = user?.lojaId ? lojas.find(l => l.id === user.lojaId) || lojas[0] : lojas[0];

  const [schedule, setSchedule] = useState<DiaFuncionamento[]>(() => {
    if (minhaLoja.horarios && minhaLoja.horarios.length > 0) return minhaLoja.horarios;
    return DAYS_OF_WEEK.map(dia => ({
      dia,
      ativo: true,
      intervalos: [{ inicio: '08:00', fim: '18:00' }]
    }));
  });
  const [holidays, setHolidays] = useState<Feriado[]>(minhaLoja.feriados || []);
  const [isStoreOpenManual, setIsStoreOpenManual] = useState(minhaLoja.lojaAbertaManual ?? true);
  const [showAllDays, setShowAllDays] = useState(false);
  const [newHoliday, setNewHoliday] = useState<{ date: string; desc: string }>({ date: '', desc: '' });

  const [lastLojaId, setLastLojaId] = useState(minhaLoja.id);

  // Sincroniza se a loja mudar
  if (minhaLoja.id !== lastLojaId) {
      setLastLojaId(minhaLoja.id);
      setSchedule(minhaLoja.horarios && minhaLoja.horarios.length > 0 ? minhaLoja.horarios : DAYS_OF_WEEK.map(dia => ({
          dia,
          ativo: true,
          intervalos: [{ inicio: '08:00', fim: '18:00' }]
      })));
      setHolidays(minhaLoja.feriados || []);
      setIsStoreOpenManual(minhaLoja.lojaAbertaManual ?? true);
  }

  const handleSaveAll = () => {
    updateLoja(minhaLoja.id, {
      horarios: schedule,
      feriados: holidays,
      lojaAbertaManual: isStoreOpenManual
    });
    addNotification('success', 'Horários e configurações salvos com sucesso!');
  };

  const handleIntervalChange = (diaIndex: number, intervaloIndex: number, field: keyof Intervalo, value: string) => {
    const newSchedule = [...schedule];
    newSchedule[diaIndex].intervalos[intervaloIndex][field] = value;
    setSchedule(newSchedule);
  };

  const addInterval = (diaIndex: number) => {
    const newSchedule = [...schedule];
    newSchedule[diaIndex].intervalos.push({ inicio: '18:00', fim: '22:00' });
    setSchedule(newSchedule);
  };

  const removeInterval = (diaIndex: number, intervaloIndex: number) => {
    const newSchedule = [...schedule];
    newSchedule[diaIndex].intervalos = newSchedule[diaIndex].intervalos.filter((_, i) => i !== intervaloIndex);
    setSchedule(newSchedule);
  };

  const toggleDayActive = (diaIndex: number) => {
    const newSchedule = [...schedule];
    newSchedule[diaIndex].ativo = !newSchedule[diaIndex].ativo;
    setSchedule(newSchedule);
  };

  const repeatForValues = () => {
    if (window.confirm('Isso copiará os horários de Segunda-feira para todos os outros dias. Deseja continuar?')) {
        const monday = schedule.find(d => d.dia === 'Segunda-feira') || schedule[0];
        const newSchedule = schedule.map(d => ({
            ...d,
            ativo: monday.ativo,
            intervalos: JSON.parse(JSON.stringify(monday.intervalos)) // Deep copy
        }));
        setSchedule(newSchedule);
        addNotification('info', 'Horários replicados com sucesso.');
    }
  };

  // Holiday Logic
  const handleAddHoliday = () => {
    if (!newHoliday.date || !newHoliday.desc) {
      addNotification('error', 'Preencha a data e a descrição.');
      return;
    }
    const holiday: Feriado = {
      id: Math.random().toString(36).substr(2, 9),
      data: newHoliday.date,
      descricao: newHoliday.desc,
      tipo: 'fechado'
    };
    setHolidays([...holidays, holiday]);
    setNewHoliday({ date: '', desc: '' });
  };

  const removeHoliday = (id: string) => {
    setHolidays(holidays.filter(h => h.id !== id));
  };

  const toggleHolidayType = (id: string) => {
      setHolidays(holidays.map(h => h.id === id ? { ...h, tipo: h.tipo === 'fechado' ? 'horario_especial' : 'fechado' } : h));
  };

  // Preview Logic
  const isOpenNow = () => {
      if (!isStoreOpenManual) return false;
      const now = new Date();
      const todayStr = DAYS_OF_WEEK[now.getDay() === 0 ? 6 : now.getDay() - 1]; // getDay 0 is Sunday
      const todayConfig = schedule.find(d => d.dia === todayStr);
      
      // Check Holiday
      const todayDateStr = now.toISOString().split('T')[0];
      const holiday = holidays.find(h => h.data === todayDateStr);
      if (holiday && holiday.tipo === 'fechado') return false;

      if (!todayConfig?.ativo) return false;

      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      
      return todayConfig.intervalos.some(interval => {
          const [startH, startM] = interval.inicio.split(':').map(Number);
          const [endH, endM] = interval.fim.split(':').map(Number);
          const startTotal = startH * 60 + startM;
          const endTotal = endH * 60 + endM;
          return currentMinutes >= startTotal && currentMinutes <= endTotal;
      });
  };

  const displayedDays = showAllDays ? schedule : schedule.slice(0, 3); // Show first 3 days initially

  return (
    <div className="max-w-7xl mx-auto pb-20 font-sans">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Horários de Funcionamento</h1>
          <p className="text-gray-500 font-medium mt-1">Gerencie quando sua loja aceita pedidos na plataforma.</p>
        </div>
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => setIsStoreOpenManual(!isStoreOpenManual)}>
           <div className={`px-4 py-2 rounded-full border flex items-center gap-3 transition-colors ${isStoreOpenManual ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${isStoreOpenManual ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${isStoreOpenManual ? 'text-emerald-700' : 'text-red-700'}`}>
                  {isStoreOpenManual ? 'Loja Aberta (Auto)' : 'Loja Fechada (Manual)'}
              </span>
              <div className={`w-12 h-6 rounded-full relative flex items-center px-1 shadow-inner transition-colors ${isStoreOpenManual ? 'bg-emerald-600' : 'bg-gray-300'}`}>
                 <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform ${isStoreOpenManual ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
           </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
             <div className="p-8 border-b border-gray-50 bg-[#fafbfc] flex justify-between items-center">
                <h3 className="font-black text-gray-800 flex items-center gap-3 uppercase tracking-tighter">
                  <span className="text-emerald-600 text-xl">📅</span> Programação Semanal
                </h3>
                <button 
                    onClick={repeatForValues}
                    className="text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-2"
                >
                  <svg xmlns="https://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                  Repetir para todos os dias
                </button>
             </div>
             
             <div className="p-10 space-y-10">
                {displayedDays.map((diaConfig, index) => {
                  const realIndex = schedule.findIndex(s => s.dia === diaConfig.dia);
                  return (
                    <div key={diaConfig.dia} className="space-y-6">
                        <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 cursor-pointer" onClick={() => toggleDayActive(realIndex)}>
                            <h4 className={`font-black text-lg w-40 transition-colors ${diaConfig.ativo ? 'text-gray-800' : 'text-gray-400'}`}>{diaConfig.dia}</h4>
                            <div className={`w-12 h-6 rounded-full relative flex items-center px-1 shadow-inner transition-colors ${diaConfig.ativo ? 'bg-emerald-600' : 'bg-gray-200'}`}>
                                <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform ${diaConfig.ativo ? 'translate-x-6' : 'translate-x-0'}`} />
                            </div>
                        </div>
                        {!diaConfig.ativo && <p className="text-[10px] font-bold text-gray-400 italic">Fechado</p>}
                        </div>
                        
                        {diaConfig.ativo && (
                            <div className="space-y-4">
                                {diaConfig.intervalos.map((interval, iIdx) => (
                                    <div key={iIdx} className="flex flex-wrap items-center gap-6 animate-fade-in">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Início</span>
                                            <div className="relative">
                                                <input 
                                                    type="time" 
                                                    value={interval.inicio} 
                                                    onChange={(e) => handleIntervalChange(realIndex, iIdx, 'inicio', e.target.value)}
                                                    className="bg-[#f8fafc] border border-gray-100 rounded-xl py-3 px-6 text-xs font-black text-gray-700 outline-none w-32 text-center" 
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fim</span>
                                            <div className="relative">
                                                <input 
                                                    type="time" 
                                                    value={interval.fim} 
                                                    onChange={(e) => handleIntervalChange(realIndex, iIdx, 'fim', e.target.value)}
                                                    className="bg-[#f8fafc] border border-gray-100 rounded-xl py-3 px-6 text-xs font-black text-gray-700 outline-none w-32 text-center" 
                                                />
                                            </div>
                                        </div>
                                        <button onClick={() => removeInterval(realIndex, iIdx)} className="text-red-400 hover:text-red-600 transition-colors p-2 bg-red-50 rounded-lg">
                                            <svg xmlns="https://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                        </button>
                                    </div>
                                ))}

                                <button onClick={() => addInterval(realIndex)} className="text-emerald-600 text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:underline">
                                    <span className="text-lg">+</span> Adicionar Intervalo
                                </button>
                            </div>
                        )}
                    </div>
                  );
                })}

                <div className="pt-8 border-t border-gray-50 flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                   <p>{showAllDays ? 'Exibindo todos os dias da semana' : 'Exibindo dias principais...'}</p>
                   <button onClick={() => setShowAllDays(!showAllDays)} className="text-emerald-600 hover:underline">
                       {showAllDays ? 'Recolher dias' : 'Expandir todos os dias'}
                   </button>
                </div>
             </div>
          </section>

          <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
             <div className="p-8 border-b border-gray-50 bg-[#fafbfc]">
                <h3 className="font-black text-gray-800 flex items-center gap-3 uppercase tracking-tighter">
                  <span className="text-orange-500 text-xl">🗓️</span> Feriados e Datas Especiais
                </h3>
             </div>
             <div className="p-10 space-y-8">
                <div className="flex flex-col md:flex-row gap-4">
                   <div className="flex-1 space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Data</label>
                      <input 
                        type="date" 
                        value={newHoliday.date}
                        onChange={(e) => setNewHoliday({...newHoliday, date: e.target.value})}
                        className="w-full bg-[#f8fafc] border border-gray-100 rounded-xl p-4 text-xs font-bold outline-none" 
                      />
                   </div>
                   <div className="flex-[2] space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Descrição/Motivo</label>
                      <input 
                        type="text" 
                        value={newHoliday.desc}
                        onChange={(e) => setNewHoliday({...newHoliday, desc: e.target.value})}
                        placeholder="Ex: Feriado de Carnaval" 
                        className="w-full bg-[#f8fafc] border border-gray-100 rounded-xl p-4 text-xs font-bold outline-none" 
                      />
                   </div>
                   <button onClick={handleAddHoliday} className="self-end bg-[#2d7a3a] text-white w-full md:w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg hover:scale-105 transition-all">
                      +
                   </button>
                </div>

                <div className="space-y-4">
                   {holidays.map(h => (
                        <div key={h.id} className="flex justify-between items-center p-6 bg-[#fafbfc] rounded-2xl border border-gray-50 group hover:bg-white hover:shadow-md transition-all">
                            <div className="flex items-center gap-6">
                                <div className="bg-white p-3 rounded-xl border border-gray-100 text-center w-14 shadow-sm">
                                    <span className="text-[10px] font-black text-gray-400 uppercase block leading-none">
                                        {new Date(h.data + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '')}
                                    </span>
                                    <span className="text-2xl font-black text-gray-800 block mt-1 leading-none">
                                        {new Date(h.data + 'T00:00:00').getDate()}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-black text-gray-800">{h.descricao}</p>
                                    <div className="flex items-center gap-2 mt-1 cursor-pointer" onClick={() => toggleHolidayType(h.id)}>
                                        <div className={`w-8 h-4 rounded-full relative flex items-center px-0.5 transition-colors ${h.tipo === 'fechado' ? 'bg-red-200' : 'bg-orange-200'}`}>
                                            <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${h.tipo === 'fechado' ? 'translate-x-0' : 'translate-x-4'}`} />
                                        </div>
                                        <p className={`text-[9px] font-black uppercase tracking-widest ${h.tipo === 'fechado' ? 'text-red-400' : 'text-orange-400'}`}>
                                            {h.tipo === 'fechado' ? 'Fechado o dia todo' : 'Horário Especial'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => removeHoliday(h.id)} className="text-gray-300 hover:text-red-500 transition-colors p-2">
                                <svg xmlns="https://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </div>
                   ))}
                   {holidays.length === 0 && (
                       <p className="text-center py-6 text-gray-400 text-xs font-bold uppercase">Nenhum feriado cadastrado.</p>
                   )}
                </div>
             </div>
          </section>
        </div>

        <div className="space-y-8">
           <div className="bg-[#eff7f1] p-10 rounded-[2.5rem] border border-emerald-100">
              <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center text-lg font-black mb-6 shadow-lg shadow-emerald-500/20">i</div>
              <h3 className="text-xl font-black text-emerald-900 tracking-tight mb-4">Dica de Gestão</h3>
              <p className="text-emerald-700/80 font-medium leading-relaxed">Configurar horários de almoço e jantar separadamente ajuda a gerenciar melhor as expectativas dos seus clientes e a disponibilidade da sua equipe de cozinha.</p>
           </div>

           <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 flex flex-col justify-between h-fit sticky top-32">
              <div>
                 <h3 className="text-xl font-black text-gray-800 mb-8 tracking-tighter">Preview Atual</h3>
                 <div className="bg-[#f8fafc] rounded-3xl p-6 border border-gray-50 mb-8">
                    <div className="flex items-center justify-between mb-4">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status Agora</span>
                       <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-white ${isOpenNow() ? 'bg-emerald-500' : 'bg-red-500'}`}>
                           {isOpenNow() ? 'Aberto' : 'Fechado'}
                       </span>
                    </div>
                    <div className="space-y-3">
                       <div className="flex justify-between text-xs">
                          <span className="text-gray-400 font-bold">Hoje</span>
                          <span className="font-black text-gray-700">
                              {(() => {
                                  const today = new Date().getDay();
                                  const dayName = DAYS_OF_WEEK[today === 0 ? 6 : today - 1];
                                  const config = schedule.find(s => s.dia === dayName);
                                  if (!config?.ativo) return 'Fechado';
                                  return config.intervalos.map(i => `${i.inicio} - ${i.fim}`).join(', ');
                              })()}
                          </span>
                       </div>
                    </div>
                 </div>
              </div>
              
              <div className="space-y-4">
                 <button onClick={handleSaveAll} className="w-full bg-[#2d7a3a] text-white py-5 rounded-2xl font-black text-sm tracking-widest shadow-xl shadow-emerald-900/10 hover:bg-[#256631] transition-all flex items-center justify-center gap-3">
                    <svg xmlns="https://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                    Salvar Alterações
                 </button>
                 <button onClick={() => setShowAllDays(true)} className="w-full text-center text-xs font-bold text-emerald-600 hover:underline">Ver todos os horários</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
