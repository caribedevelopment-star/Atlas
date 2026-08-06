
'use client';

import React, { useState } from 'react';
import { Lock, Globe, Users, X } from 'lucide-react';

export type VisibilityMode = 'public' | 'private' | 'shared';

export interface Friend {
  id: string;
  name: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  availableFriends: Friend[];
  onSubmit: (memory: { title: string; desc: string; visibility: VisibilityMode; sharedWith: string[] }) => void;
}

export default function CreateMemoryModal({ isOpen, onClose, availableFriends, onSubmit }: Props) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [visibility, setVisibility] = useState<VisibilityMode>('public');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);

  if (!isOpen) return null;

  const toggleFriend = (id: string) => {
    setSelectedFriends((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onSubmit({
      title,
      desc,
      visibility,
      sharedWith: visibility === 'shared' ? selectedFriends : [],
    });

    setTitle('');
    setDesc('');
    setVisibility('public');
    setSelectedFriends([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-slate-900/40 p-3 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="relative max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-3xl border border-slate-100 bg-white p-4 font-sans text-slate-800 shadow-2xl sm:p-6">
        <button onClick={onClose} className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>

        <h3 className="mb-4 pr-10 text-lg font-bold text-slate-900">Añadir Memoria al Mapa</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Título</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Cena de cumpleaños"
              className="min-h-11 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-base outline-none focus:border-slate-800 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Historia</label>
            <textarea
              rows={2}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="¿Qué pasó aquí?"
              className="min-h-11 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-base outline-none focus:border-slate-800 sm:text-sm"
            />
          </div>

          {/* PRIVACIDAD */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">¿Quién puede ver esta memoria?</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setVisibility('public')}
                className={`flex min-h-[4.25rem] flex-col items-center justify-center gap-1 rounded-2xl border p-2 text-center text-[11px] font-medium transition sm:p-3 sm:text-xs ${
                  visibility === 'public' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-slate-200 text-slate-500'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>Pública</span>
              </button>

              <button
                type="button"
                onClick={() => setVisibility('shared')}
                className={`flex min-h-[4.25rem] flex-col items-center justify-center gap-1 rounded-2xl border p-2 text-center text-[11px] font-medium transition sm:p-3 sm:text-xs ${
                  visibility === 'shared' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-slate-200 text-slate-500'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Elegir amigos</span>
              </button>

              <button
                type="button"
                onClick={() => setVisibility('private')}
                className={`flex min-h-[4.25rem] flex-col items-center justify-center gap-1 rounded-2xl border p-2 text-center text-[11px] font-medium transition sm:p-3 sm:text-xs ${
                  visibility === 'private' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-slate-200 text-slate-500'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Solo yo</span>
              </button>
            </div>
          </div>

          {/* SELECCIÓN DE AMIGOS */}
          {visibility === 'shared' && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 max-h-32 overflow-y-auto">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Selecciona contactos:</span>
              {availableFriends.map((friend) => (
                <label key={friend.id} className="flex items-center justify-between text-xs p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer">
                  <span>{friend.name}</span>
                  <input
                    type="checkbox"
                    checked={selectedFriends.includes(friend.id)}
                    onChange={() => toggleFriend(friend.id)}
                    className="accent-indigo-600"
                  />
                </label>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="min-h-11 rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100">
              Cancelar
            </button>
            <button type="submit" className="min-h-11 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-slate-800">
              Guardar memoria
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}