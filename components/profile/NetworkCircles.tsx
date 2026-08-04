
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Users, Globe, ShieldCheck, UserPlus, Sparkles } from 'lucide-react';

export interface NetworkUser {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  relationship: 'circle' | 'network' | 'public'; // 'circle' = anillo interior, 'network' = medio, 'public' = exterior
  memories_count?: number;
}

interface NetworkCirclesProps {
  currentUser: {
    username: string;
    avatar_url?: string;
  };
  users: NetworkUser[];
  onSelectUser?: (user: NetworkUser) => void;
}

export default function NetworkCircles({ currentUser, users, onSelectUser }: NetworkCirclesProps) {
  const [selectedUser, setSelectedUser] = useState<NetworkUser | null>(null);

  // Clasificación de usuarios por anillo / órbita
  const circleUsers = users.filter((u) => u.relationship === 'circle');
  const networkUsers = users.filter((u) => u.relationship === 'network');
  const publicUsers = users.filter((u) => u.relationship === 'public');

  const handleUserClick = (user: NetworkUser) => {
    setSelectedUser(user);
    if (onSelectUser) onSelectUser(user);
  };

  return (
    <div className="relative w-full aspect-square max-w-[500px] mx-auto flex items-center justify-center p-4 selection:bg-none">
      
      {/* ── ANILLO 3: RED PÚBLICA (EXTERIOR) ── */}
      <div className="absolute inset-2 md:inset-4 rounded-full border border-dashed border-zinc-800/80 bg-zinc-950/20 backdrop-blur-[2px] flex items-center justify-center animate-spin-slow" style={{ animationDuration: '120s' }}>
        <span className="absolute -top-2.5 px-2 bg-zinc-950 text-[10px] font-mono tracking-widest text-zinc-600 uppercase flex items-center gap-1">
          <Globe className="w-2.5 h-2.5 text-zinc-500" /> Red Global
        </span>
      </div>

      {/* Renderizado orbital - Anillo Público */}
      {publicUsers.map((user, idx) => {
        const total = publicUsers.length || 1;
        const angle = (idx / total) * 2 * Math.PI;
        const radius = 44; // % de distancia al centro
        const x = 50 + radius * Math.cos(angle);
        const y = 50 + radius * Math.sin(angle);

        return (
          <AvatarBubble
            key={user.id}
            user={user}
            x={x}
            y={y}
            size="w-8 h-8 md:w-9 md:y-9"
            ringColor="ring-zinc-800"
            onClick={() => handleUserClick(user)}
          />
        );
      })}

      {/* ── ANILLO 2: CONEXIONES SECUNDARIAS (MEDIO) ── */}
      <div className="absolute inset-16 md:inset-20 rounded-full border border-zinc-800/60 bg-zinc-900/10 flex items-center justify-center">
        <span className="absolute -top-2.5 px-2 bg-zinc-950 text-[10px] font-mono tracking-widest text-zinc-500 uppercase flex items-center gap-1">
          <Users className="w-2.5 h-2.5 text-amber-500/80" /> Red Extendida
        </span>
      </div>

      {/* Renderizado orbital - Anillo Medio */}
      {networkUsers.map((user, idx) => {
        const total = networkUsers.length || 1;
        const angle = (idx / total) * 2 * Math.PI + 0.5; // Offset para alternar posiciones
        const radius = 30;
        const x = 50 + radius * Math.cos(angle);
        const y = 50 + radius * Math.sin(angle);

        return (
          <AvatarBubble
            key={user.id}
            user={user}
            x={x}
            y={y}
            size="w-9 h-9 md:w-11 md:h-11"
            ringColor="ring-amber-500/30"
            onClick={() => handleUserClick(user)}
          />
        );
      })}

      {/* ── ANILLO 1: TU CÍRCULO INTIMO (INTERIOR) ── */}
      <div className="absolute inset-32 md:inset-36 rounded-full border border-emerald-500/20 bg-emerald-950/5 flex items-center justify-center">
        <span className="absolute -top-2.5 px-2 bg-zinc-950 text-[9px] font-mono tracking-widest text-emerald-400/90 uppercase flex items-center gap-1">
          <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" /> Círculo
        </span>
      </div>

      {/* Renderizado orbital - Anillo Íntimo */}
      {circleUsers.map((user, idx) => {
        const total = circleUsers.length || 1;
        const angle = (idx / total) * 2 * Math.PI - 0.8;
        const radius = 17;
        const x = 50 + radius * Math.cos(angle);
        const y = 50 + radius * Math.sin(angle);

        return (
          <AvatarBubble
            key={user.id}
            user={user}
            x={x}
            y={y}
            size="w-10 h-10 md:w-12 md:h-12"
            ringColor="ring-emerald-500/50"
            onClick={() => handleUserClick(user)}
          />
        );
      })}

      {/* ── NÚCLEO: USUARIO ACTUAL (CENTRO) ── */}
      <motion.div
        whileHover={{ scale: 1.08 }}
        className="relative z-30 w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-tr from-zinc-100 to-zinc-400 text-zinc-950 p-0.5 shadow-[0_0_30px_rgba(255,255,255,0.15)] flex items-center justify-center cursor-pointer"
      >
        <div className="w-full h-full rounded-full bg-zinc-950 p-0.5 overflow-hidden flex items-center justify-center">
          {currentUser.avatar_url ? (
            <img src={currentUser.avatar_url} alt={currentUser.username} className="w-full h-full object-cover rounded-full" />
          ) : (
            <span className="font-bold text-lg md:text-xl text-white">
              {currentUser.username.substring(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        <span className="absolute -bottom-6 text-[11px] font-mono font-semibold text-zinc-300 tracking-wider bg-zinc-900/90 border border-zinc-800 px-2 py-0.5 rounded-full backdrop-blur-md">
          Tú
        </span>
      </motion.div>

      {/* ── POPUP DETALLE DE USUARIO SELECCIONADO ── */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-2 z-40 bg-zinc-900/90 border border-zinc-800 backdrop-blur-xl p-3.5 rounded-2xl shadow-2xl w-[260px] text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center text-xs font-bold">
                  {selectedUser.avatar_url ? (
                    <img src={selectedUser.avatar_url} alt={selectedUser.username} className="w-full h-full object-cover" />
                  ) : (
                    selectedUser.username.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-white leading-none">@{selectedUser.username}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{selectedUser.full_name}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-zinc-500 hover:text-white text-xs px-1"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-[10px] font-mono text-zinc-400">
              <span className="capitalize flex items-center gap-1">
                {selectedUser.relationship === 'circle' && <ShieldCheck className="w-3 h-3 text-emerald-400" />}
                {selectedUser.relationship === 'network' && <Users className="w-3 h-3 text-amber-400" />}
                {selectedUser.relationship === 'public' && <Globe className="w-3 h-3 text-zinc-400" />}
                {selectedUser.relationship}
              </span>
              <span>{selectedUser.memories_count || 0} recuerdos</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Subcomponente individual para cada nodo de usuario en las órbitas
function AvatarBubble({
  user,
  x,
  y,
  size,
  ringColor,
  onClick,
}: {
  user: NetworkUser;
  x: number;
  y: number;
  size: string;
  ringColor: string;
  onClick: () => void;
}) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.2, zIndex: 35 }}
      onClick={onClick}
      style={{ left: `${x}%`, top: `${y}%` }}
      className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group`}
    >
      <div className={`${size} rounded-full bg-zinc-900 border border-zinc-800 ring-2 ${ringColor} overflow-hidden shadow-lg transition-all duration-200 flex items-center justify-center`}>
        {user.avatar_url ? (
          <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
        ) : (
          <span className="text-[10px] md:text-xs font-bold text-zinc-300">
            {user.username.substring(0, 2).toUpperCase()}
          </span>
        )}
      </div>

      {/* Tooltip con hover en Desktop */}
      <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 text-zinc-200 border border-zinc-800 text-[10px] font-mono px-1.5 py-0.5 rounded backdrop-blur-md whitespace-nowrap pointer-events-none">
        @{user.username}
      </span>
    </motion.div>
  );
}
