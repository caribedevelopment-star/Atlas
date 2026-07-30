'use client';

import React from 'react';
import { BookOpen, Download } from 'lucide-react';

interface PDFBook {
  id: string;
  category: string;
  title: string;
  author: string;
  description: string;
  pages: number;
  size: string;
  coverImage: string;
  pdfUrl: string;
  downloadUrl?: string;
}

// ID de la carpeta principal de Google Drive: 1-mPlI7w39RgskUim3MILyMY4GTpJMlHG
const DRIVE_FOLDER_URL = 'https://drive.google.com/drive/folders/1-mPlI7w39RgskUim3MILyMY4GTpJMlHG?usp=sharing';

const BOOKS: PDFBook[] = [
  {
    id: '1',
    category: 'WINE',
    title: 'The Atlas of Wines',
    author: 'Kimberly Toboada',
    description: 'A field companion to the regions, grapes, and quiet cellars worth...',
    pages: 148,
    size: '4.2 MB',
    coverImage: '/covers/wine-atlas.jpg',
    // Si tienes el ID directo de un PDF concreto reemplaza TU_FILE_ID, de lo contrario abre la carpeta de Drive
    pdfUrl: DRIVE_FOLDER_URL,
    downloadUrl: DRIVE_FOLDER_URL,
  },
  {
    id: '2',
    category: 'TRAVEL',
    title: 'Travel & Memory',
    author: 'Leo Bobbio',
    description: 'Essays on why some places stay with us long after we leave, and how to ho...',
    pages: 96,
    size: '2.8 MB',
    coverImage: '/covers/travel-memory.jpg',
    pdfUrl: DRIVE_FOLDER_URL,
    downloadUrl: DRIVE_FOLDER_URL,
  },
  {
    id: '3',
    category: 'WINE',
    title: 'A Guide to Terroir',
    author: 'Helene L.',
    description: 'Soil, slope, and season — a gentle introduction to tasting the place insid...',
    pages: 112,
    size: '3.5 MB',
    coverImage: '/covers/terroir-guide.jpg',
    pdfUrl: DRIVE_FOLDER_URL,
    downloadUrl: DRIVE_FOLDER_URL,
  },
];

export default function BooksPage() {
  return (
    <div className="min-h-screen bg-[#FBFBFA] p-6 md:p-12 font-sans text-stone-800">
      <div className="max-w-xl mx-auto space-y-8">
        {/* Header */}
        <header className="space-y-2">
          <span className="text-[11px] font-semibold tracking-widest text-stone-400 uppercase">
            READING ROOM
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">
            Books
          </h1>
          <p className="text-sm text-stone-500 leading-relaxed">
            A small shelf of PDFs on wine, travel, and memory — open to read or download.
          </p>
        </header>

        {/* List of Book Cards */}
        <div className="space-y-4">
          {BOOKS.map((book) => (
            <div
              key={book.id}
              className="bg-white border border-stone-200/70 rounded-2xl p-4 flex gap-5 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Cover Thumbnail */}
              <div className="w-24 h-32 shrink-0 rounded-lg bg-stone-100 border border-stone-200 overflow-hidden shadow-inner">
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              {/* Book Details */}
              <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
                <div>
                  <span className="text-[10px] font-bold tracking-wider text-stone-400 uppercase block mb-0.5">
                    {book.category}
                  </span>
                  <h2 className="text-base font-bold text-stone-900 truncate leading-tight">
                    {book.title}
                  </h2>
                  <p className="text-xs text-stone-500 font-medium mb-1.5">
                    {book.author}
                  </p>
                  <p className="text-xs text-stone-600 line-clamp-2 leading-snug">
                    {book.description}
                  </p>
                </div>

                {/* Footer Metadata & Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100 mt-2">
                  <span className="text-[11px] font-medium text-stone-400">
                    PDF · {book.pages} pages · {book.size}
                  </span>

                  <div className="flex items-center gap-2">
                    {/* Botón Leer (Abre Google Drive) */}
                    <a
                      href={book.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#546243] hover:bg-[#434f35] text-white rounded-lg text-xs font-medium transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Read</span>
                    </a>

                    {/* Botón Descargar */}
                    <a
                      href={book.downloadUrl || book.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
