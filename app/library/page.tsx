
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  BookOpen,
  Bookmark,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Download,
  Eye,
  Sparkles,
  ExternalLink,
  X,
  FileDown,
  Loader2,
  FolderArchive
} from 'lucide-react';
import { createLibraryItem, importDriveBooks, listLibraryItems, type LibraryRecord } from '@/lib/library/repository';

// URL y ID fijo de tu carpeta de Google Drive
const DRIVE_FOLDER_ID = '1-mPlI7w39RgskUim3MILyMY4GTpJMlHG';
const DRIVE_FOLDER_EMBED_URL = `https://drive.google.com/embeddedfolderview?id=${DRIVE_FOLDER_ID}#list`;
const DRIVE_FOLDER_DIRECT_URL = `https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}?usp=drive_link`;

function extractDriveId(input: string): string {
  if (!input) return '';
  const match = input.match(/\/d\/([a-zA-Z0-9_-]+)/) || input.match(/id=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : input.trim();
}

export default function LibraryPage() {
  const [items, setItems] = useState<LibraryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'my_articles' | 'my_books_pdf' | 'drive_folder'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'reading' | 'completed' | 'backlog'>('all');
  const [search, setSearch] = useState('');
  
  // Visor modal de PDF
  const [viewingPdfUrl, setViewingPdfUrl] = useState<string | null>(null);

  // Modal para añadir contenido
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newCategory, setNewCategory] = useState('Urbanismo y Arquitectura');
  const [newType, setNewType] = useState<'my_article' | 'my_book_pdf'>('my_article');
  const [newDesc, setNewDesc] = useState('');
  const [newDriveInput, setNewDriveInput] = useState('');

  // 1. Cargar datos desde Supabase
  const fetchLibraryItems = async () => {
    setLoading(true);
    try { setItems(await listLibraryItems()); } catch(error) { console.error('Error cargando biblioteca:', error); }
    setLoading(false);
  };

  useEffect(() => {
    fetchLibraryItems();
  }, []);

  // 2. Guardar nuevo elemento en Supabase
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    setSaving(true);
    const driveId = extractDriveId(newDriveInput);

    const newItem = {
      title: newTitle,
      subtitle: newSubtitle || undefined,
      author: newType === 'my_article' ? 'Alessandro' : 'Biblioteca Personal',
      type: newType,
      category: newCategory || 'General',
      description: newDesc,
      drive_file_id: driveId || undefined,
      published_date: new Date().toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
    };
    try {
      await createLibraryItem(newItem);
      await fetchLibraryItems();
      setIsModalOpen(false);
      setNewTitle('');
      setNewSubtitle('');
      setNewCategory('Urbanismo y Arquitectura');
      setNewDesc('');
      setNewDriveInput('');
    } catch(error) { console.error('Error insertando en Supabase:', error); }
    setSaving(false);
  };

  const handleDriveImport = async () => {
    setImporting(true); setImportMessage(null);
    try {
      const result = await importDriveBooks();
      await fetchLibraryItems();
      setImportMessage(result.imported ? `${result.imported} libros añadidos. ${result.skipped} ya estaban en Atlas.` : `Los ${result.total} libros ya estaban sincronizados.`);
      setActiveTab('my_books_pdf');
    } catch (cause) {
      setImportMessage(cause instanceof Error ? cause.message : 'No se pudo importar la carpeta.');
    } finally { setImporting(false); }
  };

  // Filtrado
  const filteredItems = items.filter((item) => {
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'my_articles' && item.type === 'my_article') ||
      (activeTab === 'my_books_pdf' && item.type === 'my_book_pdf');

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

    const matchesSearch =
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase());

    return matchesTab && matchesStatus && matchesSearch;
  });

  const articlesCount = items.filter((i) => i.type === 'my_article').length;
  const booksCount = items.filter((i) => i.type === 'my_book_pdf').length;

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto flex max-w-7xl flex-col space-y-6">
        
        {/* CABECERA */}
        <div className="flex flex-col gap-6 overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_85%_0%,rgba(244,63,94,.16),transparent_36%),linear-gradient(145deg,#27272a,#09090b)] p-6 shadow-2xl sm:flex-row sm:items-end sm:justify-between sm:p-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-[-.04em] text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Biblioteca personal
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Lecturas, publicaciones y documentos reunidos en un solo lugar.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => void handleDriveImport()}
              disabled={importing}
              className="bg-white text-zinc-950 hover:bg-zinc-200 disabled:opacity-60 font-semibold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition active:scale-95"
            >
              {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              <span>{importing ? 'Sincronizando…' : 'Importar carpeta'}</span>
            </button>
            <a
              href={DRIVE_FOLDER_DIRECT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-medium text-xs py-2 px-3 rounded-xl flex items-center gap-1.5 transition"
            >
              <FolderArchive className="w-4 h-4 text-rose-400" />
              <span>Abrir Drive</span>
            </a>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-rose-500 hover:bg-rose-400 text-zinc-950 font-semibold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-rose-500/10"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Registro</span>
            </button>
          </div>
        </div>

        {importMessage && <p role="status" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">{importMessage}</p>}

        {/* BUSCADOR Y FILTROS */}
        <div className="space-y-3 bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-800/80 backdrop-blur-sm">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título, categoría o descripción..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-rose-500/50 transition"
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-between items-center text-xs">
            <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800/80 flex-wrap gap-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg transition font-medium ${
                  activeTab === 'all'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Todos ({items.length})
              </button>
              <button
                onClick={() => setActiveTab('my_articles')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 font-medium ${
                  activeTab === 'my_articles'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                Mis Artículos ({articlesCount})
              </button>
              <button
                onClick={() => setActiveTab('my_books_pdf')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 font-medium ${
                  activeTab === 'my_books_pdf'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <FileDown className="w-3.5 h-3.5 text-sky-400" />
                Libros PDF ({booksCount})
              </button>
              <button
                onClick={() => setActiveTab('drive_folder')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 font-medium ${
                  activeTab === 'drive_folder'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <FolderArchive className="w-3.5 h-3.5 text-emerald-400" />
                Carpeta Drive
              </button>
            </div>

            {activeTab !== 'drive_folder' && (
              <div className="flex gap-1 overflow-x-auto py-1">
                {(['all', 'reading', 'completed', 'backlog'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] transition whitespace-nowrap ${
                      statusFilter === st
                        ? 'bg-zinc-800 border-zinc-600 text-zinc-100 font-medium'
                        : 'bg-zinc-950/50 border-zinc-800/60 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {st === 'all'
                      ? 'Estado: Todos'
                      : st === 'reading'
                      ? 'Leyendo'
                      : st === 'completed'
                      ? 'Completados'
                      : 'Pendientes'}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* VISTA DE CARPETA INTEGRADA DE DRIVE */}
        {activeTab === 'drive_folder' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Navegador directo de la carpeta de Google Drive</span>
              <a
                href={DRIVE_FOLDER_DIRECT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-rose-400 hover:underline flex items-center gap-1"
              >
                Abrir en pestañas aparte <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <iframe
              src={DRIVE_FOLDER_EMBED_URL}
              className="w-full h-[650px] rounded-2xl border border-zinc-800 bg-zinc-900"
              frameBorder="0"
            />
          </div>
        ) : (
          /* CONTENIDO DE SUPABASE */
          <>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-rose-400" />
                <span className="text-xs">Cargando biblioteca desde Supabase...</span>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
                <BookOpen className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-xs text-zinc-400 font-medium">
                  No hay publicaciones o libros registrados aún.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* SECCIÓN ARTÍCULOS */}
                {(activeTab === 'all' || activeTab === 'my_articles') && (
                  <div className="space-y-3">
                    {activeTab === 'all' && (
                      <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
                        <Sparkles className="w-4 h-4" />
                        <span>Mis Artículos & Publicaciones</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredItems
                        .filter((item) => item.type === 'my_article')
                        .map((art) => (
                          <article
                            key={art.id}
                            className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 hover:border-rose-500/40 transition flex flex-col justify-between space-y-4 group relative overflow-hidden"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300">
                                  {art.category}
                                </span>
                                <span className="text-[10px] text-zinc-500 font-mono">
                                  {art.published_date}
                                </span>
                              </div>

                              <div>
                                <h2 className="text-base font-semibold text-zinc-100 group-hover:text-rose-300 transition">
                                  {art.title}
                                </h2>
                                {art.subtitle && (
                                  <p className="text-xs text-zinc-400 mt-0.5 italic">
                                    {art.subtitle}
                                  </p>
                                )}
                              </div>

                              <p className="text-xs text-zinc-300 line-clamp-3 leading-relaxed">
                                {art.description}
                              </p>
                            </div>

                            <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs">
                              <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                                {art.status === 'reading' && (
                                  <Clock className="w-3.5 h-3.5 text-rose-400" />
                                )}
                                {art.status === 'completed' && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                )}
                                {art.status === 'backlog' && (
                                  <Bookmark className="w-3.5 h-3.5 text-zinc-500" />
                                )}
                                <span className="capitalize">{art.status}</span>
                              </span>

                              <button className="text-rose-400 hover:text-rose-300 text-xs font-semibold flex items-center gap-1 transition">
                                <span>Leer Artículo</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </article>
                        ))}
                    </div>
                  </div>
                )}

                {/* SECCIÓN LIBROS PDF */}
                {(activeTab === 'all' || activeTab === 'my_books_pdf') && (
                  <div className="space-y-3">
                    {activeTab === 'all' && (
                      <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider pt-2">
                        <FileDown className="w-4 h-4" />
                        <span>Libros & Documentos PDF</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredItems
                        .filter((item) => item.type === 'my_book_pdf')
                        .map((book) => {
                          const driveThumbnail = book.drive_file_id
                            ? `https://drive.google.com/thumbnail?id=${book.drive_file_id}&sz=w600`
                            : null;
                          const drivePreviewUrl = book.drive_file_id
                            ? `https://drive.google.com/file/d/${book.drive_file_id}/preview`
                            : null;
                          const driveDownloadUrl = book.drive_file_id
                            ? `https://drive.google.com/uc?export=download&id=${book.drive_file_id}`
                            : '#';

                          return (
                            <div
                              key={book.id}
                              className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition flex flex-col justify-between space-y-3"
                            >
                              <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800/80 group">
                                {driveThumbnail ? (
                                  <Image
                                    src={driveThumbnail}
                                    alt={book.title}
                                    fill
                                    unoptimized
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">
                                    Sin id de Drive
                                  </div>
                                )}

                                {drivePreviewUrl && (
                                  <button
                                    onClick={() => setViewingPdfUrl(drivePreviewUrl)}
                                    className="absolute inset-0 bg-zinc-950/70 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-rose-400 font-medium text-xs gap-1.5"
                                  >
                                    <Eye className="w-4 h-4" />
                                    <span>Abrir Visor</span>
                                  </button>
                                )}
                              </div>

                              <div className="space-y-1">
                                <span className="text-[10px] font-semibold text-sky-400 uppercase tracking-wider">
                                  {book.category}
                                </span>
                                <h3 className="text-sm font-semibold text-zinc-100 line-clamp-1">
                                  {book.title}
                                </h3>
                                <p className="text-xs text-zinc-400">{book.author}</p>
                              </div>

                              {book.read_progress !== undefined && (
                                <div className="space-y-1">
                                  <div className="flex justify-between text-[10px] text-zinc-400">
                                    <span>Progreso</span>
                                    <span className="font-mono">{book.read_progress}%</span>
                                  </div>
                                  <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden border border-zinc-800">
                                    <div
                                      className="bg-sky-400 h-full rounded-full transition-all duration-300"
                                      style={{ width: `${book.read_progress}%` }}
                                    />
                                  </div>
                                </div>
                              )}

                              <div className="pt-2 border-t border-zinc-800/60 flex gap-2">
                                <button
                                  onClick={() => drivePreviewUrl && setViewingPdfUrl(drivePreviewUrl)}
                                  disabled={!drivePreviewUrl}
                                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 text-xs py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition"
                                >
                                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                                  <span>Leer</span>
                                </button>
                                <a
                                  href={driveDownloadUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs py-1.5 px-3 rounded-lg flex items-center justify-center transition"
                                  title="Descargar PDF"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL VISOR WEB DE DRIVE */}
      {viewingPdfUrl && (
        <div className="fixed inset-0 z-[3000] bg-zinc-950/90 backdrop-blur-md flex flex-col p-4 md:p-6 space-y-3">
          <div className="flex items-center justify-between text-zinc-200">
            <span className="text-xs font-semibold text-rose-400 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Visor Web Integrado (Google Drive)
            </span>
            <button
              onClick={() => setViewingPdfUrl(null)}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-xl transition flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              <span>Cerrar</span>
            </button>
          </div>
          <iframe
            src={viewingPdfUrl}
            className="w-full h-full rounded-2xl border border-zinc-800 bg-zinc-900"
            allow="autoplay"
          />
        </div>
      )}

      {/* MODAL AÑADIR NUEVO DESDE FORMULARIO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[2000] bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-rose-400" />
                Añadir Nuevo Contenido a Supabase
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-200 p-1 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Tipo de Documento</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewType('my_article')}
                    className={`py-2 px-3 rounded-xl border text-center font-medium transition ${
                      newType === 'my_article'
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    Artículo Propio
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType('my_book_pdf')}
                    className={`py-2 px-3 rounded-xl border text-center font-medium transition ${
                      newType === 'my_book_pdf'
                        ? 'bg-sky-500/20 border-sky-500/40 text-sky-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    Libro PDF (Drive)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Título</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: Integración de Urban Ponics"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-700"
                />
              </div>

              {newType === 'my_book_pdf' && (
                <div>
                  <label className="block text-zinc-400 mb-1">Enlace o ID del PDF de Drive</label>
                  <input
                    type="text"
                    required
                    value={newDriveInput}
                    onChange={(e) => setNewDriveInput(e.target.value)}
                    placeholder="Pega la URL del PDF específico o su ID"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-700 font-mono text-[11px]"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Recuerda que el PDF dentro de la carpeta debe tener acceso de lectura público.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-zinc-400 mb-1">Categoría</label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Ej: Urbanismo, Fenotipos, Arquitectura..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Resumen / Descripción</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Breve descripción del contenido..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-700 resize-none"
                />
              </div>

              <div className="pt-2 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-rose-500 text-zinc-950 font-semibold hover:bg-rose-400 transition flex items-center gap-1.5"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Guardar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
