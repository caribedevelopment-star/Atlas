'use client';

import NetworkCircles, { NetworkUser } from '@/components/profile/NetworkCircles';

const MOCK_NETWORK_USERS: NetworkUser[] = [
  { id: '1', username: 'camila', full_name: 'Camila R.', relationship: 'circle', memories_count: 14 },
  { id: '2', username: 'santiago', full_name: 'Santiago M.', relationship: 'circle', memories_count: 8 },
  { id: '3', username: 'mateo_arch', full_name: 'Mateo V.', relationship: 'network', memories_count: 22 },
  { id: '4', username: 'lucia_design', full_name: 'Lucía B.', relationship: 'network', memories_count: 5 },
  { id: '5', username: 'elena_urban', full_name: 'Elena P.', relationship: 'public', memories_count: 31 },
  { id: '6', username: 'david_p', full_name: 'David P.', relationship: 'public', memories_count: 3 },
];

export default function ProfilePage() {
  const currentUser = {
    username: 'alessandro',
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Tu Red & Círculos</h2>
            <p className="text-xs text-zinc-400">Visualización interactiva de usuarios en la red Atlas</p>
          </div>
        </div>

        <NetworkCircles
          currentUser={currentUser}
          users={MOCK_NETWORK_USERS}
          onSelectUser={(user) => console.log('Usuario seleccionado:', user)}
        />
      </div>
    </div>
  );
}
