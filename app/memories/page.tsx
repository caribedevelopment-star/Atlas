"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";

interface Memory {
  id: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  tags: string[];
}

// Datos de ejemplo para renderizado
const mockMemories: Memory[] = [
  {
    id: "1",
    title: "Notas sobre integración de Urban Ponics",
    date: "2026-02-15",
    category: "Proyectos",
    excerpt: "Reflexiones sobre la integración de sistemas de agricultura urbana e infraestructura cultural en el diseño arquitectónico.",
    tags: ["Arquitectura", "Diseño", "Urbano"],
  },
  {
    id: "2",
    title: "Escapada gastronómica a Toledo",
    date: "2026-03-20",
    category: "Viajes",
    excerpt: "Recorrido histórico y degustación de cocina local. Apuntes sobre la ciudad y selección de maridaje.",
    tags: ["Gastronomía", "Viajes", "Toledo"],
  },
  {
    id: "3",
    title: "Primera sesión en circuito con la moto",
    date: "2026-03-28",
    category: "Deporte",
    excerpt: "Sensaciones en pista, trazado de curvas y notas sobre la preparación física y suplementación.",
    tags: ["Circuito", "Motor", "Fitness"],
  },
];

export default function MemoriesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");

  const categories = ["Todas", "Proyectos", "Viajes", "Deporte", "Personal"];

  const filteredMemories = mockMemories.filter((mem) => {
    const matchesSearch =
      mem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mem.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat =
      selectedCategory === "Todas" || mem.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Memorias"
        description="Archivo de momentos, proyectos y reflexiones personales."
        action={
          <Link href="/memories/new" className="atlas-button-primary">
            + Nueva Memoria
          </Link>
        }
      />

      {/* Controles de Filtro y Búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <input
          type="text"
          placeholder="Buscar en el archivo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="atlas-input max-w-md"
        />

        <div className="flex gap-1.5 overflow-x-auto pb-2 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-accent text-accent-foreground font-semibold"
                  : "bg-surface border border-surface-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Tarjetas */}
      {filteredMemories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMemories.map((memory) => (
            <Link key={memory.id} href={`/memories/${memory.id}`}>
              <Card className="h-full flex flex-col justify-between hover:-translate-y-1">
                <div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-surface-hover font-medium">
                      {memory.category}
                    </span>
                    <time>{memory.date}</time>
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{memory.title}</CardTitle>
                  </CardHeader>
                  <CardDescription className="line-clamp-3 mb-4">
                    {memory.excerpt}
                  </CardDescription>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-surface-border/50">
                  {memory.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        /* Estado Vacío */
        <div className="atlas-card p-12 text-center flex flex-col items-center justify-center">
          <p className="text-muted-foreground mb-4">
            No se encontraron memorias con esos criterios.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("Todas");
            }}
            className="atlas-button-secondary text-xs"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}
