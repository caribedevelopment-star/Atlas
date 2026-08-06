'use client';
import { useCallback, useEffect, useState } from 'react';
import { listMyMemories } from '@/lib/memories/repository';
import { listTrips } from '@/lib/trips/repository';
import { getCurrentWineUserId } from '@/lib/wines/repository';
import type { ProfileMemory } from '@/types/profile'; import type { AtlasTrip } from '@/types/trip';
export function useMemoryArchive(){const[memories,setMemories]=useState<ProfileMemory[]>([]),[trips,setTrips]=useState<AtlasTrip[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState<string|null>(null);const refresh=useCallback(async()=>{setLoading(true);setError(null);try{const[memoryRows,tripRows,userId]=await Promise.all([listMyMemories(),listTrips(),getCurrentWineUserId()]);setMemories(memoryRows);setTrips(tripRows.filter((trip)=>trip.userId===userId))}catch(cause){setError(cause instanceof Error?cause.message:'No se pudo cargar el archivo.')}finally{setLoading(false)}},[]);useEffect(()=>{void refresh()},[refresh]);return{memories,trips,loading,error,refresh}}
