
import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { AreaEntrega } from '../types';
import { formatCurrency } from '../utils';
import { MapContainer, TileLayer, Circle, useMapEvents, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// --- CONFIGURAÇÃO DE ÍCONES DO LEAFLET (Fix para React) ---
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// --- COMPONENTES AUXILIARES DO MAPA ---

// 1. Captura cliques no mapa para definir coordenadas
const MapClickEvent = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// 2. Corrige renderização do mapa dentro de Modais (Tela cinza)
const MapResizer = () => {
  const map = useMapEvents({});
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 400); // Aguarda a transição do modal
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

// 3. Atualiza o centro do mapa quando a coordenada muda externamente
const MapUpdater = ({ center }: { center: { lat: number, lng: number } }) => {
  const map = useMapEvents({});
  useEffect(() => {
    if (center.lat && center.lng) {
      map.flyTo([center.lat, center.lng], map.getZoom(), { duration: 1.5 });
    }
  }, [center, map]);
  return null;
};

export const LojistaAreasEntrega = () => {
  const { lojas, updateLoja, addNotification, user } = useStore();
  const minhaLoja = user?.lojaId ? lojas.find(l => l.id === user.lojaId) || lojas[0] : lojas[0];
  const areas = minhaLoja.areasEntrega || [];

  // Coordenadas Padrão (Ex: Centro de SP ou Tucuruí conforme demo)
  const DEFAULT_COORDS = { lat: -3.766052, lng: -49.672367 };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mapOverviewCenter, setMapOverviewCenter] = useState(DEFAULT_COORDS);
  
  const [editingArea, setEditingArea] = useState<Partial<AreaEntrega>>({
    nome: '',
    taxa: 0,
    tempoMin: 30,
    tempoMax: 50,
    raioKm: 2,
    ativa: true,
    tipoTaxa: 'fixa',
    lat: DEFAULT_COORDS.lat,
    lng: DEFAULT_COORDS.lng
  });

  // Abre Modal (Criação ou Edição)
  const handleOpenModal = (area?: AreaEntrega) => {
    if (area) {
      setEditingArea({ ...area });
    } else {
      // Nova área: Tenta pegar a última localização usada ou padrão
      const lastLat = areas.length > 0 ? areas[areas.length - 1].lat : DEFAULT_COORDS.lat;
      const lastLng = areas.length > 0 ? areas[areas.length - 1].lng : DEFAULT_COORDS.lng;
      
      setEditingArea({
        nome: '',
        taxa: 5.00,
        tempoMin: 30,
        tempoMax: 50,
        raioKm: 3,
        ativa: true,
        tipoTaxa: 'fixa',
        lat: lastLat,
        lng: lastLng
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!editingArea.nome) {
      addNotification('error', 'Defina um nome para a área.');
      return;
    }
    if (!editingArea.lat || !editingArea.lng) {
      addNotification('error', 'Clique no mapa para definir a localização.');
      return;
    }

    let newAreas;
    if (editingArea.id) {
      // Atualizar
      newAreas = areas.map(a => a.id === editingArea.id ? { ...a, ...editingArea } as AreaEntrega : a);
      addNotification('success', 'Área atualizada!');
    } else {
      // Criar
      const newId = Math.random().toString(36).substr(2, 9);
      newAreas = [...areas, { ...editingArea, id: newId } as AreaEntrega];
      addNotification('success', 'Nova área criada!');
    }

    updateLoja(minhaLoja.id, { areasEntrega: newAreas });
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Excluir esta área de entrega?')) {
      const newAreas = areas.filter(a => a.id !== id);
      updateLoja(minhaLoja.id, { areasEntrega: newAreas });
      addNotification('info', 'Área removida.');
    }
  };

  const focusOnArea = (area: AreaEntrega) => {
    if (area.lat && area.lng) {
      setMapOverviewCenter({ lat: area.lat, lng: area.lng });
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6 font-sans pb-4">
      
      {/* Coluna Esquerda: Lista de Áreas */}
      <div className="w-full md:w-[420px] shrink-0 flex flex-col h-full gap-4">
        <header>
           <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Raios de Entrega</h1>
           <p className="text-gray-500 font-medium text-sm mt-1">Defina onde sua loja entrega e quanto cobra.</p>
        </header>

        <button 
            onClick={() => handleOpenModal()}
            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
        >
           <span>+</span> Nova Área de Entrega
        </button>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
           {areas.length === 0 ? (
               <div className="text-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                   <span className="text-4xl block mb-2">🗺️</span>
                   <p className="text-gray-400 font-bold text-sm">Nenhuma área configurada.</p>
               </div>
           ) : (
               areas.map(area => (
                   <div 
                      key={area.id} 
                      onClick={() => focusOnArea(area)}
                      className={`bg-white p-5 rounded-3xl border shadow-sm cursor-pointer transition-all hover:shadow-md group relative overflow-hidden ${area.ativa ? 'border-gray-100' : 'border-gray-100 opacity-60 grayscale'}`}
                   >
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${area.ativa ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                      
                      <div className="flex justify-between items-start mb-3 pl-3">
                          <h4 className="font-black text-gray-800 text-lg">{area.nome}</h4>
                          <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                              <button onClick={() => handleOpenModal(area)} className="p-2 text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors">✎</button>
                              <button onClick={() => handleDelete(area.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">✕</button>
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pl-3">
                          <div className="bg-gray-50 p-2 rounded-xl text-center">
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Taxa</p>
                              <p className="font-bold text-gray-800">{formatCurrency(area.taxa)}</p>
                          </div>
                          <div className="bg-gray-50 p-2 rounded-xl text-center">
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Raio</p>
                              <p className="font-bold text-gray-800">{area.raioKm} km</p>
                          </div>
                      </div>
                   </div>
               ))
           )}
        </div>
      </div>

      {/* Coluna Direita: Mapa Principal (Visão Geral) */}
      <div className="flex-1 bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden relative z-0 min-h-[400px]">
         <MapContainer 
            center={[mapOverviewCenter.lat, mapOverviewCenter.lng]} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
         >
            <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater center={mapOverviewCenter} />

            {/* Renderiza todas as áreas ativas */}
            {areas.filter(a => a.ativa && a.lat && a.lng).map(area => (
                <React.Fragment key={area.id}>
                    <Circle
                        center={[area.lat!, area.lng!]}
                        radius={area.raioKm * 1000} // Metros
                        pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.1, weight: 2 }}
                    >
                        <Popup>
                            <div className="text-center">
                                <strong className="block text-sm">{area.nome}</strong>
                                <span className="text-xs text-gray-500">{formatCurrency(area.taxa)} • {area.raioKm}km</span>
                            </div>
                        </Popup>
                    </Circle>
                    <Marker position={[area.lat!, area.lng!]} icon={icon} />
                </React.Fragment>
            ))}
         </MapContainer>
         
         <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur px-4 py-3 rounded-2xl shadow-lg border border-gray-100 text-xs font-bold text-gray-500 z-[400]">
            Visão Geral das Zonas
         </div>
      </div>

      {/* MODAL DE EDIÇÃO/CRIAÇÃO COM MAPA INTERATIVO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-[2.5rem] w-full max-w-6xl h-[90vh] shadow-2xl flex flex-col md:flex-row overflow-hidden">
                
                {/* Lado Esquerdo: Formulário */}
                <div className="w-full md:w-[400px] p-8 border-r border-gray-100 bg-[#fafbfc] overflow-y-auto custom-scrollbar flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-black text-gray-900">{editingArea.id ? 'Editar Zona' : 'Nova Zona'}</h2>
                        <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 font-bold hover:bg-gray-300">✕</button>
                    </div>

                    <div className="space-y-6 flex-1">
                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Nome da Zona</label>
                            <input 
                                type="text" 
                                value={editingArea.nome}
                                onChange={e => setEditingArea({...editingArea, nome: e.target.value})}
                                placeholder="Ex: Centro, Bairro Nobre..."
                                className="w-full bg-white border border-gray-200 rounded-xl p-4 font-bold text-gray-800 outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>

                        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4 flex justify-between">
                                <span>Raio de Cobertura</span>
                                <span className="text-emerald-600">{editingArea.raioKm} km</span>
                            </label>
                            <input 
                                type="range" 
                                min="0.5" max="20" step="0.5"
                                value={editingArea.raioKm}
                                onChange={e => setEditingArea({...editingArea, raioKm: Number(e.target.value)})}
                                className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                            <p className="text-[10px] text-gray-400 mt-2 text-center">Arraste para ajustar o tamanho da área no mapa.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Taxa (R$)</label>
                                <input 
                                    type="number" step="0.50"
                                    value={editingArea.taxa}
                                    onChange={e => setEditingArea({...editingArea, taxa: Number(e.target.value)})}
                                    className="w-full bg-white border border-gray-200 rounded-xl p-4 font-bold text-gray-800 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Tempo (min)</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="number" 
                                        value={editingArea.tempoMin}
                                        onChange={e => setEditingArea({...editingArea, tempoMin: Number(e.target.value)})}
                                        className="w-full bg-white border border-gray-200 rounded-xl p-4 font-bold text-center text-gray-800 outline-none"
                                    />
                                    <input 
                                        type="number" 
                                        value={editingArea.tempoMax}
                                        onChange={e => setEditingArea({...editingArea, tempoMax: Number(e.target.value)})}
                                        className="w-full bg-white border border-gray-200 rounded-xl p-4 font-bold text-center text-gray-800 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                            <span className="text-2xl">📍</span>
                            <p className="text-xs text-blue-800 font-medium leading-tight">
                                <strong>Clique no mapa</strong> para definir o centro da região de entrega.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <button 
                            onClick={handleSave}
                            className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-emerald-500 transition-all"
                        >
                            Salvar Configuração
                        </button>
                    </div>
                </div>

                {/* Lado Direito: Mapa Interativo de Edição */}
                <div className="flex-1 bg-gray-100 relative">
                    <MapContainer 
                        center={[editingArea.lat || DEFAULT_COORDS.lat, editingArea.lng || DEFAULT_COORDS.lng]} 
                        zoom={14} 
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; OpenStreetMap'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        
                        {/* Funcionalidades Críticas */}
                        <MapResizer /> 
                        <MapClickEvent onMapClick={(lat, lng) => setEditingArea(prev => ({...prev, lat, lng}))} />
                        
                        {/* Visualização da Área em Edição */}
                        {editingArea.lat && editingArea.lng && (
                            <>
                                {/* Move o mapa se o usuário editar coordenadas via input (opcional) ou na abertura */}
                                <MapUpdater center={{ lat: editingArea.lat, lng: editingArea.lng }} />
                                
                                <Circle
                                    center={[editingArea.lat, editingArea.lng]}
                                    radius={(editingArea.raioKm || 1) * 1000}
                                    pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.2, weight: 2, dashArray: '5, 10' }}
                                />
                                <Marker position={[editingArea.lat, editingArea.lng]} icon={icon}>
                                    <Popup>Centro da nova área</Popup>
                                </Marker>
                            </>
                        )}
                    </MapContainer>

                    {/* Overlay de Instrução */}
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-6 py-3 rounded-full shadow-lg z-[1000] border border-gray-200 pointer-events-none">
                        <p className="text-xs font-bold text-gray-700 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"/> 
                            Modo de Edição
                        </p>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
