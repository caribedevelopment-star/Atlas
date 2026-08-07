'use client';

import { useEffect, useId, useState } from 'react';
import { Check, Loader2, MapPin, Search } from 'lucide-react';
import { searchPlaces, type AtlasPlace } from '@/lib/places/repository';

export function PlaceAutocomplete({
  label,
  value,
  onChange,
  onSelect,
  required = false,
  placeholder = 'Busca ciudad, calle, hotel o lugar',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (place: AtlasPlace) => void;
  required?: boolean;
  placeholder?: string;
}) {
  const id = useId();
  const [places, setPlaces] = useState<AtlasPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const query = value.trim();
    if (query.length < 3 || selected) {
      setPlaces([]);
      setError(null);
      setSearched(false);
      if (query.length < 3) setOpen(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await searchPlaces(query, controller.signal);
        setPlaces(results);
        setSearched(true);
        setOpen(true);
      } catch (cause) {
        if ((cause as Error).name !== 'AbortError') {
          setPlaces([]);
          setSearched(true);
          setOpen(true);
          setError(cause instanceof Error ? cause.message : 'No se pudo buscar la ubicación.');
        }
      } finally {
        setLoading(false);
      }
    }, 450);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [selected, value]);

  return (
    <div className="relative block text-sm font-medium text-zinc-300">
      <label htmlFor={id}>{label}</label>
      <div className="relative mt-2">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
        <input
          id={id}
          required={required}
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setSelected(false);
          }}
          onFocus={() => {
            if (places.length || searched || error) setOpen(true);
          }}
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder}
          aria-autocomplete="list"
          aria-expanded={open}
          className="h-12 w-full rounded-2xl border border-white/10 bg-white/[.045] pl-11 pr-10 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-white/30 focus:ring-4 focus:ring-white/5"
        />
        {loading ? (
          <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-zinc-500" />
        ) : selected ? (
          <Check className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-400" />
        ) : null}
      </div>

      {!selected && value.trim().length > 0 && value.trim().length < 3 && (
        <p className="mt-1.5 text-[11px] font-normal text-zinc-600">Escribe al menos 3 caracteres.</p>
      )}

      {open && !selected && (
        <div className="absolute z-[100] mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl shadow-black/50">
          {error ? (
            <div className="px-4 py-3 text-xs font-normal text-red-300">{error} Inténtalo de nuevo.</div>
          ) : loading ? (
            <div className="px-4 py-3 text-xs font-normal text-zinc-500">Buscando lugares…</div>
          ) : places.length ? (
            <ul role="listbox" className="max-h-72 overflow-y-auto p-1.5">
              {places.map((place) => (
                <li key={place.id}>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      onChange(place.label);
                      onSelect(place);
                      setSelected(true);
                      setOpen(false);
                    }}
                    className="flex w-full items-start gap-2.5 rounded-xl p-3 text-left text-xs font-normal text-zinc-300 transition hover:bg-white/5 focus:bg-white/5 focus:outline-none"
                  >
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-300" />
                    <span>
                      <span className="block text-zinc-200">{place.label}</span>
                      {(place.city || place.country) && (
                        <span className="mt-0.5 block text-[10px] text-zinc-500">{[place.city, place.country].filter(Boolean).join(' · ')}</span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : searched ? (
            <div className="px-4 py-3 text-xs font-normal text-zinc-500">No encontramos ese lugar. Prueba con ciudad + país.</div>
          ) : null}
        </div>
      )}
    </div>
  );
}
