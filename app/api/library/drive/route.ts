import { NextResponse } from 'next/server';

const FOLDER_ID = '1-mPlI7w39RgskUim3MILyMY4GTpJMlHG';
const FILE_PATTERN = /\[\[null,"([A-Za-z0-9_-]{20,})"\],null,null,null,"application\/pdf"(?:(?!\[\[null,"[A-Za-z0-9_-]{20,}"\]).){0,1000}?\[\[16,null,\[null,\[\[\["(.*?)",null,1/gs;
const VERIFIED_FILES = [
  ['1bahXMGUWJxNQ-wXvYuXaJIxbs8cO0baG','Attached: Are you Anxious, Avoidant or Secure?'],
  ['1yQYDV6Vb5FSAokc13O0NIMIQhuLqNNFq','Paulo Coelho - Kimyagər'],
  ['1v6Ux1Z8_0ReI0nSClK3-eYUjSaGHXU7I','De la lectura del arte de escribir'],
  ['1QQplag3IZGRpD4zpYTKQOuWxIjRidzyS','Dios, ciencia y pruebas'],
  ['1VxyRpORNpFWJfo-McGIUiz3LDGwnky9v','El arte de la guerra — Sun Tzu'],
  ['1tO5ze6gnsrsNkNvN7ybk1PV7gtF6yvk3','El viejo y el mar — Ernest Hemingway'],
  ['1ao-kiOTOuVP0CdQsR7AYlm4IV9TS_IX7','Los cinco lenguajes del amor — Gary Chapman'],
  ['1avp10UVE3UH5RAacQP0JnCvQXU8ygyix','El elogio de la sombra — Junichiro Tanizaki'],
  ['1K2zUSklEGyCvK5wgXRuKh2k6sZtWpHib','La venganza de Juan Planchard — Jonathan Jakubowicz'],
  ['1VrGgc31jjTQxH9XHu8xM1Jza8k5GMmHH','La vida invisible de Addie LaRue — V. E. Schwab'],
  ['1D0CkrI-XxUNsU-Ao8VW-UxQKwWnyMtpe','Los renglones torcidos de Dios'],
  ['1Prjpzva9ev_Va36B1bUvV7TYrAqjGMII','Maneras de amar — Amir Levine y Rachel Heller'],
  ['1Ho_zVeEun4VouoeDGYXxdB390lpbXrnQ','Basta ya de ser un tipo lindo — Robert Glover'],
  ['1VD_XPBekT6884-fmckL4bXWLj1hmKEND','El nombre del viento — Patrick Rothfuss'],
  ['1tMMBoy9q2yiKSMaZmyNdk0oKF4lle3ch','The Old Man and the Sea — Ernest Hemingway'],
  ['1ax6qOW4BeNWMPUCCgO_sQpOB4Ykdzj0e','Tu mente es un océano'],
  ['1f3RwJgHG0IKTbqD1X4I3Ok7ptz3iDPYi','Vida y enseñanza de Buda'],
] as const;

export async function GET() {
  try {
    const response = await fetch(`https://drive.google.com/drive/folders/${FOLDER_ID}?usp=drive_link`, {
      headers: { 'User-Agent': 'Atlas/1.0 (personal library)', Accept: 'text/html' },
      next: { revalidate: 3600 },
    });
    if (!response.ok) throw new Error('DRIVE_FOLDER_UNAVAILABLE');
    const html = await response.text();
    const files = [...html.matchAll(FILE_PATTERN)].map((match) => ({
      id: match[1],
      title: cleanTitle(decodeDriveText(match[2])),
      viewUrl: `https://drive.google.com/file/d/${match[1]}/view`,
    }));
    return NextResponse.json({ folderId: FOLDER_ID, files: files.length ? files : verifiedFiles() });
  } catch {
    return NextResponse.json({ folderId: FOLDER_ID, files: verifiedFiles(), source: 'verified-snapshot' });
  }
}

function verifiedFiles() { return VERIFIED_FILES.map(([id,title]) => ({ id, title, viewUrl:`https://drive.google.com/file/d/${id}/view` })); }

function decodeDriveText(value: string) {
  try { return JSON.parse(`"${value.replace(/"/g, '\\"')}"`) as string; } catch { return value; }
}

function cleanTitle(value: string) {
  return value.replace(/^Copia de\s+/i, '').replace(/^Microsoft Word -\s+/i, '').replace(/\.(pdf|docx?)$/i, '').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
}
