'use client';

import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Circle, CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip, useMap, ZoomControl } from 'react-leaflet';
import type { AtlasMapPoint, MapLayer } from '@/types/map';
import { WineCard } from '@/components/wine-ui';
import { MapOwner } from './MapOwner';
import { MemoryPopup } from './MemoryPopup';
import { TripPopup } from './TripPopup';

export function AtlasLeafletMap({points}:{points:AtlasMapPoint[]}) {
  const trips=points.filter((point)=>point.trip&&point.trip.points.length>1);
  const markers=points.filter((point)=>!point.trip);
  const regions=useMemo(()=>wineRegions(points),[points]);
  return <MapContainer center={[20,0]} zoom={3} minZoom={2} scrollWheelZoom className="h-full w-full bg-[#d9d8d3]" zoomControl={false} preferCanvas>
    <ZoomControl position="bottomright"/>
    <TileLayer attribution='&copy; OpenStreetMap &copy; CARTO' url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"/>
    <FitBounds points={points}/><CurrentLocation focus={points.length===0}/>
    {regions.map((region)=><Circle key={region.name} center={[region.latitude,region.longitude]} radius={region.radius} pathOptions={{color:'#7c2d12',fillColor:'#9f1239',fillOpacity:.055,opacity:.32,weight:1,dashArray:'4 7'}}><Tooltip direction="top" sticky><strong>{region.name}</strong><br/>{region.count} {region.count===1?'vino':'vinos'} · {region.wineries} {region.wineries===1?'bodega':'bodegas'}</Tooltip></Circle>)}
    <MarkerClusterGroup chunkedLoading chunkInterval={100} chunkDelay={20} removeOutsideVisibleBounds spiderfyOnMaxZoom>
      {markers.map((point)=><Marker key={point.id} position={[point.latitude,point.longitude]} icon={icon(point.layer)} title={point.title} keyboard><Popup className="atlas-map-popup" maxWidth={340} minWidth={260}>{point.wine?<div className="w-[300px] bg-zinc-950 p-2"><WineCard name={point.wine.name} winery={point.wine.winery} imageUrl={point.wine.image_url} vintage={point.wine.vintage} country={point.wine.country} region={point.wine.region} grapes={point.wine.grapes} rating={point.wine.rating} price={point.wine.price} favorite={point.wine.favorite} visibility={point.wine.visibility}/><div className="px-2 pb-2"><MapOwner id={point.ownerId} name={point.ownerName} avatarUrl={point.ownerAvatarUrl}/></div></div>:point.memory?<MemoryPopup memory={point.memory}/>:null}</Popup></Marker>)}
    </MarkerClusterGroup>
    {trips.map((point)=><Polyline key={`route-${point.id}`} positions={point.trip!.points.map((item)=>[item.latitude,item.longitude])} pathOptions={{color:'#007aff',weight:5,opacity:.82,lineCap:'round',lineJoin:'round'}}><Popup className="atlas-map-popup"><TripPopup trip={point.trip!}/></Popup></Polyline>)}
    {trips.flatMap((point)=>point.trip!.points.map((item,index)=><CircleMarker key={`${point.id}-stop-${index}`} center={[item.latitude,item.longitude]} radius={6} pathOptions={{color:'#fff',fillColor:'#007aff',fillOpacity:1,weight:3}}><Tooltip direction="top">{point.trip!.stops[index]?.title??`Parada ${index+1}`}</Tooltip></CircleMarker>))}
  </MapContainer>;
}

function FitBounds({points}:{points:AtlasMapPoint[]}) { const map=useMap(); useEffect(()=>{const resize=new ResizeObserver(()=>map.invalidateSize({animate:false}));resize.observe(map.getContainer());map.invalidateSize({animate:false});if(points.length){const coordinates=points.flatMap((point)=>point.trip?.points.map((item)=>[item.latitude,item.longitude] as [number,number])??[[point.latitude,point.longitude] as [number,number]]);map.fitBounds(L.latLngBounds(coordinates),{padding:[54,54],maxZoom:13,animate:points.length<300});}return()=>resize.disconnect();},[map,points]);return null; }
function CurrentLocation({focus}:{focus:boolean}) { const map=useMap(),[position,setPosition]=useState<[number,number]|null>(null),[label,setLabel]=useState('Tu ubicación actual'); useEffect(()=>{if(!navigator.geolocation)return;const watch=navigator.geolocation.watchPosition(({coords})=>{const next:[number,number]=[coords.latitude,coords.longitude];setPosition(next);if(focus)map.setView(next,13,{animate:true});fetch(`/api/geocode?lat=${coords.latitude}&lon=${coords.longitude}`).then((response)=>response.ok?response.json():null).then((data)=>data?.label&&setLabel(data.label)).catch(()=>undefined);},()=>undefined,{enableHighAccuracy:true,maximumAge:30000,timeout:10000});return()=>navigator.geolocation.clearWatch(watch);},[focus,map]);return position?<><Circle center={position} radius={120} pathOptions={{color:'#007aff',fillColor:'#007aff',fillOpacity:.08,weight:1}}/><CircleMarker center={position} radius={8} pathOptions={{color:'#fff',fillColor:'#007aff',fillOpacity:1,weight:3}}><Tooltip direction="top" offset={[0,-8]}>{label}</Tooltip></CircleMarker></>:null; }

function wineRegions(points:AtlasMapPoint[]) { const groups=new Map<string,AtlasMapPoint[]>(); points.filter((point)=>point.wine?.region).forEach((point)=>{const name=point.wine!.region!.trim();groups.set(name,[...(groups.get(name)??[]),point]);});return [...groups].map(([name,items])=>({name,count:items.length,wineries:new Set(items.map((item)=>item.wine?.winery).filter(Boolean)).size,latitude:items.reduce((sum,item)=>sum+item.latitude,0)/items.length,longitude:items.reduce((sum,item)=>sum+item.longitude,0)/items.length,radius:Math.min(70000,22000+items.length*6000)})); }
const cache=new Map<MapLayer,L.DivIcon>();
function icon(layer:MapLayer) { const existing=cache.get(layer);if(existing)return existing;const colors:Record<MapLayer,string>={memories:'#ff375f',wines:'#7c2d12',trips:'#007aff',favorites:'#ff9f0a',restaurants:'#30d158'};const size=layer==='wines'?18:28;const value=L.divIcon({className:`atlas-map-marker atlas-map-marker-${layer}`,html:`<span style="background:${colors[layer]};width:${size}px;height:${size}px"></span>`,iconSize:[size,size],iconAnchor:[size/2,size/2],popupAnchor:[0,-size/2]});cache.set(layer,value);return value;}
