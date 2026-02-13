
import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { AreaEntrega } from '../types';
import { formatCurrency } from '../utils';
import { MapContainer, TileLayer, Circle, useMapEvents, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix para ícones padrão do Leaflet no React
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Componente para capturar cliques no mapa e definir nova posição
const LocationMarker = ({ setPosition }: { setPosition: (pos: { lat: number, lng: number }) => void }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return null;
};

// Componente para controlar a visão do mapa (Voar para a localização)
const MapUpdater = ({ center }: { center: { lat: number, lng: number } }) => {
  const map = useMapEvents({});
  useEffect(() => {
    map.flyTo([center.lat, center.lng], map.getZoom());
  }, [center, map]);
  return null;
};

export const LojistaAreasEntrega = () => {
  const { lojas, updateLoja, addNotification, user } = useStore();
  const minhaLoja = user?.lojaId ? lojas.find(l => l.id === user.lojaId) || lojas[0] : lojas[0];
  const areas = minhaLoja.areasEntrega || [];

  // Coordenadas centrais de Tucuruí - PA
  const TUCURUI_COORDS = { lat: -3.766052, lng: -49.672367 };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Partial<AreaEntrega>>({
    nome: '',
    taxa: 0,
    tempoMin: 20,
    tempoMax: 40,
    raioKm: 2,
    ativa: true,
    tipoTaxa: 'fixa',
    lat: TUCURUI_COORDS.lat,
    lng: TUCURUI_COORDS.lng
  });

  // Estado para controlar a visão do mapa principal
  const [mapCenter, setMapCenter] = useState(TUCURUI_COORDS);

  const handleOpenModal = (area?: AreaEntrega) => {
    if (area) {
      setEditingArea(area);
      // Se a área tem coordenadas, centraliza nelas no modal, senão usa Tucuruí
      if(area.lat && area.lng) {
          // O mapa do modal usará o editingArea.lat/lng para renderizar, 
          // mas é bom garantir que o estado inicial esteja limpo.
      }
    } else {
      setEditingArea({
        nome: '',
        taxa: 0,
        tempoMin: 20,
        tempoMax: 40,
        raioKm: 2,
        ativa: true,
        tipoTaxa: 'fixa',
        lat: TUCURUI_COORDS.lat,
        lng: TUCURUI_COORDS.lng
      });
    }
    setIsModalOpen(true);
  };

  const handleFocusArea = (area: AreaEntrega) => {
      if (area.lat && area.lng) {
          setMapCenter({ lat: area.lat, lng: area.lng });
      }
  };

  const handleSave = () => {
    if (!editingArea.nome) {
        addNotification('error', 'O nome da área é obrigatório.');
        return;
    }

    let newAreas;
    if (editingArea.id) {
        // Editando existente
        newAreas = areas.map(a => a.id === editingArea.id ? { ...a, ...editingArea } as AreaEntrega : a);
        addNotification('success', 'Área atualizada com sucesso!');
    } else {
        // Criando nova
        const newArea = {
            ...editingArea,
            id: Math.random().toString(36).substr(2, 9)
        } as AreaEntrega;
        newAreas = [...areas, newArea];
        addNotification('success', 'Nova área criada!');
    }

    updateLoja(minhaLoja.id, { areasEntrega: newAreas });
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
      if (window.confirm('Tem certeza que deseja remover esta área de entrega?')) {
          const newAreas = areas.filter(a => a.id !== id);
          updateLoja(minhaLoja.id, { areasEntrega: newAreas });
          addNotification('info', 'Área removida.');
      }
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
      const newAreas = areas.map(a => a.id === id ? { ...a, ativa: !currentStatus } : a);
      updateLoja(minhaLoja.id, { areasEntrega: newAreas });
  };

  return (
    <div className="h-[calc(100vh-80px)] md:h-[calc(100vh-120px)] flex flex-col md:flex-row gap-6 font-sans">
      {/* Sidebar Lista */}
      <div className="w-full md:w-[450px] shrink-0 flex flex-col h-full bg-white md:bg-transparent rounded-[2.5rem] md:rounded-none p-6 md:p-0 shadow-sm md:shadow-none border md:border-none border-gray-100 mb-6 md:mb-0">
        <header className="mb-6 md:mb-8">
           <div className="flex items-center gap-2 mb-2">
               <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest">Tucuruí - PA</span>
           </div>
           <h1 className="text-3xl font-black text-gray-900 tracking-tight">Áreas de Entrega</h1>
           <p className="text-gray-500 font-medium mt-1 leading-tight">Gerencie os raios de entrega da sua loja.</p>
        </header>

        <button 
            onClick={() => handleOpenModal()}
            className="w-full bg-[#2d7a3a] text-white py-5 rounded-2xl font-black text-sm tracking-widest shadow-xl shadow-emerald-900/10 hover:bg-[#256631] transition-all flex items-center justify-center gap-3 mb-6"
        >
           <span className="text-xl leading-none">📍</span> Adicionar Nova Área
        </button>

        <div className="space-y-4 overflow-y-auto pr-2 pb-10 flex-1 custom-scrollbar">
           {areas.length === 0 ? (
               <div className="text-center py-10 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                   <p className="text-4xl mb-4">🗺️</p>
                   <p className="text-gray-400 font-bold text-sm">Nenhuma área configurada.</p>
               </div>
           ) : (
               areas.map(area => (
                <div key={area.id} className={`bg-white rounded-3xl border shadow-sm overflow-hidden relative group p-6 transition-all cursor-pointer hover:shadow-md ${area.ativa ? 'border-emerald-500 opacity-100' : 'border-gray-200 opacity-60 grayscale'}`} onClick={() => handleFocusArea(area)}>
                    <div className="absolute top-6 right-6 flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => handleOpenModal(area)} className="text-gray-300 hover:text-emerald-500 transition-colors p-1" title="Editar">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                        </button>
                        <button onClick={() => handleDelete(area.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1" title="Excluir">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                        <button onClick={() => handleToggleStatus(area.id, area.ativa)} className={`p-1 transition-colors ${area.ativa ? 'text-emerald-500' : 'text-gray-400'}`} title={area.ativa ? "Desativar" : "Ativar"}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
                        </button>
                    </div>
                    
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${area.ativa ? 'text-emerald-600' : 'text-gray-400'}`}>
                        {area.ativa ? 'Zona Ativa' : 'Inativo'}
                    </p>
                    <h4 className="text-lg font-black text-gray-800 mb-4">{area.nome}</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#f8fafc] p-3 rounded-2xl border border-gray-50">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Taxa</p>
                            <p className="font-black text-gray-700 text-sm">
                                {formatCurrency(area.taxa)} 
                                <span className="text-[9px] text-gray-400 font-bold italic ml-1">
                                    {area.tipoTaxa === 'km' ? '/ km' : 'fixa'}
                                </span>
                            </p>
                        </div>
                        <div className="bg-[#f8fafc] p-3 rounded-2xl border border-gray-100">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Tempo</p>
                            <p className="font-black text-gray-700 text-sm">{area.tempoMin}-{area.tempoMax} min</p>
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-2 text-[10px] font-bold text-gray-500">
                        <span>⭕ Raio: {area.raioKm} km</span>
                        <span className="ml-auto text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded cursor-pointer hover:bg-emerald-100">Ver no mapa</span>
                    </div>
                </div>
               ))
           )}
        </div>
      </div>

      {/* Mapa Interativo Principal */}
      <div className="flex-1 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden relative z-0 h-[400px] md:h-auto min-h-[400px]">
         <MapContainer 
            center={[mapCenter.lat, mapCenter.lng]} 
            zoom={14} 
            style={{ height: '100%', width: '100%', zIndex: 0 }}
            zoomControl={false}
         >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapUpdater center={mapCenter} />

            {/* Renderiza as Áreas Existentes */}
            {areas.filter(a => a.ativa && a.lat && a.lng).map(area => (
                <React.Fragment key={area.id}>
                    <Circle
                        center={[area.lat!, area.lng!]}
                        radius={area.raioKm * 1000} // Leaflet usa metros
                        pathOptions={{ 
                            color: '#059669', 
                            fillColor: '#10b981', 
                            fillOpacity: 0.15,
                            weight: 2 
                        }}
                    >
                        <Popup>
                            <strong>{area.nome}</strong><br/>
                            Taxa: {formatCurrency(area.taxa)}<br/>
                            Raio: {area.raioKm}km
                        </Popup>
                    </Circle>
                    <Marker position={[area.lat!, area.lng!]} icon={icon}>
                        <Popup>
                            <strong>{area.nome}</strong><br/>
                            Centro da zona
                        </Popup>
                    </Marker>
                </React.Fragment>
            ))}
         </MapContainer>

         {/* Legenda de Mapa */}
         <div className="absolute bottom-8 right-8 bg-white/90 backdrop-blur-md p-6 rounded-[2rem] shadow-xl border border-gray-100 min-w-[200px] z-[1000]">
            <h5 className="text-[10px] font-black text-gray-800 uppercase tracking-widest mb-4">Legenda (Tucuruí)</h5>
            <div className="space-y-3">
               <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-emerald-100 border border-emerald-500 rounded-full" />
                  <span className="text-[9px] font-black text-gray-500 uppercase">Área Ativa</span>
               </div>
               <div className="flex items-center gap-3">
                  <span className="text-lg">📍</span>
                  <span className="text-[9px] font-black text-gray-500 uppercase">Centro da Zona</span>
               </div>
            </div>
         </div>
      </div>

      {/* Modal de Criação/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-[2.5rem] w-full max-w-5xl shadow-2xl h-[90vh] md:h-[80vh] flex flex-col md:flex-row overflow-hidden relative">
                
                {/* Formuário */}
                <div className="w-full md:w-1/3 p-8 border-r border-gray-100 overflow-y-auto custom-scrollbar bg-[#fafbfc]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black text-gray-900">{editingArea.id ? 'Editar' : 'Nova'}</h3>
                        <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 font-bold hover:bg-gray-300">✕</button>
                    </div>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Nome da Área</label>
                            <input 
                                type="text" 
                                placeholder="Ex: Santa Mônica"
                                value={editingArea.nome}
                                onChange={e => setEditingArea({...editingArea, nome: e.target.value})}
                                className="w-full bg-white border border-gray-200 rounded-xl p-4 font-bold text-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Taxa (R$)</label>
                                <input 
                                    type="number" step="0.50"
                                    value={editingArea.taxa}
                                    onChange={e => setEditingArea({...editingArea, taxa: Number(e.target.value)})}
                                    className="w-full bg-white border border-gray-200 rounded-xl p-3 font-bold text-gray-800 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Tipo</label>
                                <select 
                                    value={editingArea.tipoTaxa}
                                    onChange={e => setEditingArea({...editingArea, tipoTaxa: e.target.value as any})}
                                    className="w-full bg-white border border-gray-200 rounded-xl p-3 font-bold text-gray-800 outline-none"
                                >
                                    <option value="fixa">Fixa</option>
                                    <option value="km">/ KM</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Raio (KM): {editingArea.raioKm} km</label>
                            <input 
                                type="range" 
                                min="0.5" max="15" step="0.1"
                                value={editingArea.raioKm}
                                onChange={e => setEditingArea({...editingArea, raioKm: Number(e.target.value)})}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                        </div>

                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-[10px] text-blue-700 font-medium">
                            <span className="font-black block mb-1">📍 Defina no Mapa</span>
                            Clique no mapa ao lado para definir o centro exato do bairro/região.
                        </div>

                        <div className="flex gap-4 pt-4 mt-auto">
                            <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 font-black text-gray-400 uppercase text-xs hover:text-gray-600">Cancelar</button>
                            <button onClick={handleSave} className="flex-[2] bg-emerald-600 text-white rounded-xl font-black uppercase text-xs shadow-lg hover:bg-emerald-500">Salvar</button>
                        </div>
                    </div>
                </div>

                {/* Mapa de Edição */}
                <div className="flex-1 bg-gray-100 relative h-full min-h-[300px]">
                    <MapContainer 
                        center={[editingArea.lat || TUCURUI_COORDS.lat, editingArea.lng || TUCURUI_COORDS.lng]} 
                        zoom={14} 
                        style={{ height: '100%', width: '100%', zIndex: 0 }}
                    >
                        <TileLayer
                            attribution='&copy; OpenStreetMap'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationMarker setPosition={(pos) => setEditingArea({...editingArea, lat: pos.lat, lng: pos.lng})} />
                        
                        {/* Se a área estiver sendo editada, move o mapa para lá */}
                        {editingArea.lat && editingArea.lng && (
                            <MapUpdater center={{ lat: editingArea.lat, lng: editingArea.lng }} />
                        )}

                        {editingArea.lat && editingArea.lng && (
                            <>
                                <Circle
                                    center={[editingArea.lat, editingArea.lng]}
                                    radius={(editingArea.raioKm || 1) * 1000}
                                    pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.3 }}
                                />
                                <Marker position={[editingArea.lat, editingArea.lng]} icon={icon} />
                            </>
                        )}
                    </MapContainer>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg z-[1000] text-xs font-bold text-gray-600 border border-gray-200 pointer-events-none">
                        {editingArea.lat ? 'Localização Definida' : 'Clique no mapa para posicionar'}
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
