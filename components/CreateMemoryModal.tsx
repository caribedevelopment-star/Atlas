'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { X, MapPin, Calendar, Wine, Users } from 'lucide-react';

export interface UserProfile {
  id: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
}

export interface CreateMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableFriends?: UserProfile[];
  onSubmit?: (data?: any) => void;
}

export default function CreateMemoryModal({
  isOpen,
  onClose,
  availableFriends = [],
  onSubmit,
}: CreateMemoryModalProps) {
  const [activeUsers, setActiveUsers] = useState<UserProfile[]>(availableFriends);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [wine, setWine] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  useEffect(() => {
    if (!isOpen) return;

    if (availableFriends && availableFriends.length > 0) {
      setActiveUsers(availableFriends);
      return;
    }

    async function fetchActiveUsers() {
      const { data: users, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url');

      if (!error && users) {
        setActiveUsers(users);
      }
    }

    fetchActiveUsers();
  }, [isOpen, availableFriends, supabase]);

  const toggleFriend = (id: string) => {
    setSelectedFriends((prev) =>
      prev.includes(id) ? prev.filter((fId) => fId !== id) : [...prev, id]
    );
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const memoryData = {
      title,
      location,
      wine,
      date,
      description,
      friends: selectedFriends,
    };

    if (onSubmit) {
      await onSubmit(memoryData);
    } else {
      try {
        const { error } = await supabase.from('memories').insert([
          {
            title,
            location_name: location,
            wine_name: wine,
            memory_date: date,
            description,
            tagged_friends: selectedFriends,
          },
        ]);

        if (error) throw error;
      } catch (err) {
        console.error('Error al guardar el recuerdo:', err);
      }
    }

    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 text-white shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-base font-semibold mb-4">Añadir Recuerdo</h3>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Título
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Cata en bodega o cena especial"
              className="w-full rounded-xl bg-zinc-800/80 border border-zinc-700/60 p-2.5 text-xs text-white focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Ubicación
              </label>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ciudad o Bodega"
                  className="w-full rounded-xl bg-zinc-800/80 border border-zinc-700/60 pl-8 p-2.5 text-xs text-white focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Fecha
              </label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl bg-zinc-800/80 border border-zinc-700/60 pl-8 p-2.5 text-xs text-white focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Vino / Cata
            </label>
            <div className="relative">
              <Wine className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-500" />
              <input
                type="text"
                value={wine}
                onChange={(e) => setWine(e.target.value)}
                placeholder="Nombre del vino, cepa o cosecha"
                className="w-full rounded-xl bg-zinc-800/80 border border-zinc-700/60 pl-8 p-2.5 text-xs text-white focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Descripción
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notas de cata o detalles de la memoria..."
              className="w-full rounded-xl bg-zinc-800/80 border border-zinc-700/60 p-2.5 text-xs text-white focus:outline-none focus:border-zinc-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Círculo de Amigos
            </label>
            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
              {activeUsers.map((user) => {
                const isSelected = selectedFriends.includes(user.id);
                const displayName = user.full_name || user.email || 'Usuario';

                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => toggleFriend(user.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 border transition-all ${
                      isSelected
                        ? 'bg-white text-zinc-950 border-white font-medium'
                        : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/60 hover:border-zinc-500'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-zinc-600 text-[9px] flex items-center justify-center font-bold uppercase">
                      {displayName.charAt(0)}
                    </div>
                    <span>{displayName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold bg-white text-zinc-950 rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar Recuerdo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
