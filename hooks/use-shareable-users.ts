'use client';
import { useEffect, useState } from 'react';
import { listShareableUsers, type NetworkUser } from '@/lib/network';
export function useShareableUsers(){const[users,setUsers]=useState<NetworkUser[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState<string|null>(null);useEffect(()=>{let active=true;void listShareableUsers().then((data)=>{if(active)setUsers(data)}).catch((cause)=>{if(active)setError(cause instanceof Error?cause.message:'No se pudieron cargar los usuarios.')}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[]);return{users,loading,error}}
