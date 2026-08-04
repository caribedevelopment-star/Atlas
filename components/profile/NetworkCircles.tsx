'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Users, ShieldCheck } from 'lucide-react';

export interface NetworkUser {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  relationship: 'circle' | 'network' | 'public';
  memories_count?: number;
}

interface NetworkCirclesProps {
  currentUser: {
    username: string;
    avatar_url?: string;
  };
  users: NetworkUser[];
  onSelectUser?: (user: NetworkUser) => void;
  onRelationshipChange?: (userId: string, newRelationship: 'circle' | 'network' | 'public') => void;
}

export default function NetworkCircles({
  currentUser,
  users,
  onSelectUser,
  onRelationshipChange,
}: NetworkCirclesProps) {
  const [selectedUser, setSelectedUser] = useState<NetworkUser | null>(null);

  const circleUsers = users.filter((u) => u.relationship === 'circle');
  const networkUsers = users.filter((u) => u.relationship === 'network');
  const publicUsers = users.filter((u) => u.relationship === 'public');

  const handleUserClick = (user: NetworkUser) => {
    setSelectedUser(user);
    if (onSelectUser) onSelectUser(user);
  };

  const handleLevelChange = (newLevel: 'circle' | 'network' | 'public') => {
    if (!selectedUser) return;
    const updated = { ...selectedUser, relationship: newLevel };
    setSelectedUser(updated);
    if (onRelationshipChange) {
      onRelationshipChange(selectedUser.id, newLevel);
    }
  };

  return (
    <div className="relative w-full aspect-square max-w-[480px] mx-auto flex items-center justify-center p-4 select-none">
      
      {/* ANILLO 3: RED PÚBLICA */}
      <div className="absolute inset-2 md:inset-4 rounded-full border border-dashed border-zinc-800 bg-zinc-950/20 flex items-center justify-center">
        <span className="absolute -top-2.5 px-2 bg-zinc-950 text-[10px] font-mono tracking-widest text-zinc-600 uppercase flex items-center gap-1">
          <Globe className="w-2.5 h-2.5 text-zinc-500" /> Red Global
        </span>
      </div>

      {publicUsers.map((user, idx) => {
        const total = publicUsers.length || 1;
        const angle = (idx / total) * 2 * Math.PI;
        const radius = 43;
        const x = 50 + radius * Math.cos(angle);
        const y = 50 + radius * Math.sin(angle);

        return (
          <AvatarBubble
            key={user.id}
            user={user}
            x={x}
            y={y}
            size="w-8 h-8"
            ringColor="ring-zinc-800"
            onClick={() => handleUserClick(user)}
          />
        );
      })}

      {/* ANILLO 2: RED EXTENDIDA */}
      <div className="absolute inset-16 md:inset-20 rounded-full border border-zinc-800/80 bg-zinc-900/10 flex items-center justify-center">
        <span className="absolute -top-2.5 px-2 bg-zinc-950 text-[10px] font-mono tracking-widest text-zinc-500 uppercase flex items-center gap-1">
          <Users className="w-2.5 h-2.5 text-amber-500/80" /> Red Extendida
        </span>
      </div>

      {networkUsers.map((user, idx) => {
        const total = networkUsers.length || 1;
        const angle = (idx / total) * 2 * Math.PI + 0.5;
        const radius = 30;
        const x = 50 + radius * Math.cos(angle);
        const y = 50 + radius * Math.sin(angle);

        return (
          <AvatarBubble
            key={user.id}
            user={user}
            x={x}
            y={y}
            size="w-9 h-9"
            ringColor="ring-amber-500/40"
            onClick={() => handleUserClick(user)}
          />
        );
      })}

      {/* ANILLO 1: CÍRCULO ÍNTIMO */}
      <div className="absolute inset-32 md:inset-36 rounded-full border border-emerald-500/30 bg-emerald-950/10 flex items-center justify-center">
        <span className="absolute -top-2.5 px-2 bg-zinc-950 text-[9px] font-mono tracking-widest text-emerald-400 uppercase flex items-center gap-1">
          <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" /> Círculo
        </span>
      </div>

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
            size="w-10 h-10"
            ringColor="ring-emerald-500/60"
            onClick={() => handleUserClick(user)}
          />
        );
      })}

      {/* CENTRO: USUARIO ACTUAL */}
      <motion.div
        whileHover={{ scale: 1.08 }}
        className="relative z-30 w-14 h-14 rounded-full bg-gradient-to-tr from-zinc-100 to-zinc-400 text-zinc-950 p-0.5 shadow-xl flex items-center justify-center cursor-pointer"
      >
        <div className="w-full h-full rounded-full bg-zinc-950 p-0.5 overflow-hidden flex items-center justify-center">
          {currentUser.avatar_url ? (
            <img src={currentUser.avatar_url} alt={currentUser.username} className="w-full h-full object-cover rounded-full" />
          ) : (
            <span className="font-bold text-base text-white">
              {currentUser.username.substring(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        <span className="absolute -bottom-5 text-[10px] font-mono font-semibold text-zinc-300 tracking-wider bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full">
          Tú
        </span>
      </motion.div>

      {/* POPUP CON BOTONES PARA CAMBIAR DE NIVEL DE CÍRCULO */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-2 z-40 bg-zinc-900 border border-zinc-800 p-3.5 rounded-2xl shadow-2xl w-[260px] text-left"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center text-xs font-bold text-white">
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
              <button onClick={() => setSelectedUser(null)} className="text-zinc-500 hover:text-white text-xs p-1">
                ✕
              </button>
            </div>

            <p className="text-[10px] font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">Mover a:</p>

            <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              <button
                type="button"
                onClick={() => handleLevelChange('circle')}
                className={`py-1 rounded-lg text-[9px] font-mono font-medium transition ${
                  selectedUser.relationship === 'circle'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Círculo
              </button>
              <button
                type="button"
                onClick={() => handleLevelChange('network')}
                className={`py-1 rounded-lg text-[9px] font-mono font-medium transition ${
                  selectedUser.relationship === 'network'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Red
              </button>
              <button
                type="button"
                onClick={() => handleLevelChange('public')}
                className={`py-1 rounded-lg text-[9px] font-mono font-medium transition ${
                  selectedUser.relationship === 'public'
                    ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Global
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
      layout
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      whileHover={{ scale: 1.25, zIndex: 35 }}
      onClick={onClick}
      style={{ left: `${x}%`, top: `${y}%` }}
      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
    >
      <div className={`${size} rounded-full bg-zinc-900 border border-zinc-800 ring-2 ${ringColor} overflow-hidden flex items-center justify-center shadow-lg`}>
        {user.avatar_url ? (
          <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
        ) : (
          <span className="text-[10px] font-bold text-zinc-300">
            {user.username.substring(0, 2).toUpperCase()}
          </span>
        )}
      </div>
      <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 text-zinc-200 border border-zinc-800 text-[9px] font-mono px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none z-30">
        @{user.username}
      </span>
    </motion.div>
  );
}
