import type { WineItem } from '@/types/wine';
import type { AtlasWineRegion } from '@/types/map';

type RegionDefinition = {
  name: string;
  aliases: string[];
  latitude: number;
  longitude: number;
  radius: number;
  country: string;
  description: string;
  grapes: string[];
  signature: string;
  featured?: boolean;
};

const REGION_DEFINITIONS: RegionDefinition[] = [
  { name: 'DOCa Rioja', aliases: ['doca rioja','do rioja','rioja'], latitude: 42.466, longitude: -2.445, radius: 72000, country: 'España', description: 'Valle del Ebro, tradición de crianza y una identidad marcada por Tempranillo, altitud y mezcla de influencias atlánticas y mediterráneas.', grapes: ['Tempranillo','Garnacha','Graciano'], signature: 'Crianza · frescura · especias', featured: true },
  { name: 'DO Ribera del Duero', aliases: ['do ribera del duero','ribera del duero'], latitude: 41.671, longitude: -3.689, radius: 76000, country: 'España', description: 'Meseta alta a orillas del Duero, con días intensos y noches frías que dan tintos profundos, tensos y longevos.', grapes: ['Tinto Fino','Cabernet Sauvignon'], signature: 'Altitud · fruta negra · estructura', featured: true },
  { name: 'DO Rueda', aliases: ['do rueda','rueda'], latitude: 41.414, longitude: -4.958, radius: 56000, country: 'España', description: 'Blancos castellanos de perfil fresco y herbal, con Verdejo como variedad emblemática y suelos de cantos rodados.', grapes: ['Verdejo','Sauvignon Blanc'], signature: 'Herbal · cítrico · mineral' },
  { name: 'DO Rías Baixas', aliases: ['do rias baixas','do rías baixas','rias baixas','rías baixas'], latitude: 42.438, longitude: -8.716, radius: 56000, country: 'España', description: 'Galicia atlántica, granito y brisa marina. Albariños vibrantes con acidez, salinidad y fruta de hueso.', grapes: ['Albariño'], signature: 'Atlántico · salino · cítrico', featured: true },
  { name: 'DO Ribeira Sacra', aliases: ['do ribeira sacra','ribeira sacra'], latitude: 42.409, longitude: -7.639, radius: 42000, country: 'España', description: 'Viticultura heroica en laderas sobre los ríos Sil y Miño, con tintos fragantes y minerales.', grapes: ['Mencía','Godello'], signature: 'Ladera · mineral · floral' },
  { name: 'DO Monterrei', aliases: ['do monterrei','monterrei'], latitude: 41.948, longitude: -7.449, radius: 34000, country: 'España', description: 'La Galicia más continental: valles cálidos y noches frescas que favorecen Godello y Mencía con carácter preciso.', grapes: ['Godello','Mencía'], signature: 'Fruta blanca · tensión · montaña' },
  { name: 'DO Bierzo', aliases: ['do bierzo','bierzo'], latitude: 42.546, longitude: -6.596, radius: 48000, country: 'España', description: 'Bierzo combina montaña, pizarra y clima de transición. Mencía y Godello ofrecen perfume, frescura y textura.', grapes: ['Mencía','Godello'], signature: 'Pizarra · perfume · frescura' },
  { name: 'DO Toro', aliases: ['do toro','toro'], latitude: 41.524, longitude: -5.394, radius: 48000, country: 'España', description: 'Tintos intensos de la cuenca del Duero, con viñas viejas de Tinta de Toro y gran concentración.', grapes: ['Tinta de Toro'], signature: 'Potencia · viña vieja · cacao' },
  { name: 'DO Navarra', aliases: ['do navarra','navarra'], latitude: 42.612, longitude: -1.674, radius: 76000, country: 'España', description: 'Región diversa entre Pirineos y valle del Ebro, histórica en rosados y hoy muy versátil en estilos y variedades.', grapes: ['Garnacha','Tempranillo'], signature: 'Versátil · fruta roja · montaña' },
  { name: 'DO Somontano', aliases: ['do somontano','somontano'], latitude: 42.089, longitude: 0.123, radius: 45000, country: 'España', description: 'Viñedo al pie del Pirineo con amplitud térmica, madurez contenida y vinos aromáticos de corte moderno.', grapes: ['Tempranillo','Cabernet Sauvignon','Gewürztraminer'], signature: 'Pirineo · aromático · fresco' },
  { name: 'DO Txakoli de Getaria', aliases: ['getariako txakolina','txakoli getaria','txakoli'], latitude: 43.294, longitude: -2.203, radius: 28000, country: 'España', description: 'Viñedos costeros del Cantábrico. Blancos ligeros, punzantes y salinos, hechos para beber con frescura.', grapes: ['Hondarrabi Zuri'], signature: 'Mar · acidez · salinidad' },
  { name: 'DO Jumilla', aliases: ['do jumilla','jumilla'], latitude: 38.479, longitude: -1.325, radius: 52000, country: 'España', description: 'Clima seco del sureste español, suelos pobres y Monastrell de fruta madura, hierbas mediterráneas y cuerpo.', grapes: ['Monastrell'], signature: 'Mediterráneo · fruta madura · monte' },
  { name: 'DO Alicante', aliases: ['do alicante','alicante'], latitude: 38.48, longitude: -0.52, radius: 62000, country: 'España', description: 'Sol mediterráneo, altitudes variables y tradición de Monastrell, Moscatel y Fondillón.', grapes: ['Monastrell','Moscatel'], signature: 'Sol · especias · Mediterráneo' },
  { name: 'DO La Mancha', aliases: ['do la mancha','la mancha'], latitude: 39.45, longitude: -3.35, radius: 145000, country: 'España', description: 'Gran meseta vitícola de clima continental extremo, con enorme diversidad de viñas y estilos.', grapes: ['Airén','Tempranillo'], signature: 'Meseta · amplitud · fruta' },
  { name: 'DO Uclés', aliases: ['do ucles','do uclés','ucles','uclés'], latitude: 39.981, longitude: -2.861, radius: 43000, country: 'España', description: 'Viñedos de altura en Castilla-La Mancha con énfasis en sostenibilidad y tintos de perfil fresco.', grapes: ['Tempranillo'], signature: 'Altitud · fruta · equilibrio' },
  { name: 'DO Cava', aliases: ['do cava','cava'], latitude: 41.423, longitude: 1.785, radius: 52000, country: 'España', description: 'Espumoso de método tradicional con epicentro histórico en Penedès y una identidad basada en finura y burbuja.', grapes: ['Macabeo','Xarel·lo','Parellada'], signature: 'Burbuja · tiza · cítrico' },
  { name: 'DOQ Priorat', aliases: ['doq priorat','doca priorat','priorat','priorato'], latitude: 41.163, longitude: 0.915, radius: 30000, country: 'España', description: 'Laderas de llicorella en Tarragona. Garnacha y Cariñena producen vinos concentrados, minerales y de enorme personalidad.', grapes: ['Garnacha','Cariñena'], signature: 'Llicorella · profundidad · hierbas', featured: true },
  { name: 'DO Jerez-Xérès-Sherry', aliases: ['jerez','xeres','sherry','do jerez','jerez-xeres-sherry'], latitude: 36.686, longitude: -6.137, radius: 42000, country: 'España', description: 'Albariza, criaderas y solera. Uno de los territorios de vino generoso más singulares del mundo.', grapes: ['Palomino','Pedro Ximénez','Moscatel'], signature: 'Albariza · flor · salinidad', featured: true },
  { name: 'IGP Extremadura', aliases: ['igp extremadura','extremadura'], latitude: 39.179, longitude: -6.142, radius: 98000, country: 'España', description: 'Amplio territorio de clima cálido y continental, con estilos que van desde blancos frescos a tintos maduros.', grapes: ['Tempranillo','Garnacha'], signature: 'Sol · amplitud · fruta' },

  { name: 'Douro DOC', aliases: ['douro doc','doc douro','douro'], latitude: 41.167, longitude: -7.55, radius: 82000, country: 'Portugal', description: 'Terrazas de esquisto sobre el Duero. Cuna del Oporto y de tintos secos intensos, minerales y de gran profundidad.', grapes: ['Touriga Nacional','Touriga Franca','Tinta Roriz'], signature: 'Esquisto · terraza · intensidad', featured: true },
  { name: 'DOC Vinho Verde', aliases: ['vinho verde','doc vinho verde'], latitude: 41.7, longitude: -8.25, radius: 80000, country: 'Portugal', description: 'Noroeste húmedo y atlántico, famoso por blancos ligeros, tensos y refrescantes.', grapes: ['Alvarinho','Loureiro'], signature: 'Atlántico · ligero · cítrico' },
  { name: 'Dão DOC', aliases: ['dao doc','dão doc','dao','dão'], latitude: 40.55, longitude: -7.92, radius: 62000, country: 'Portugal', description: 'Meseta granítica rodeada de montañas, con tintos elegantes y blancos minerales de gran equilibrio.', grapes: ['Touriga Nacional','Encruzado'], signature: 'Granito · elegancia · bosque' },
  { name: 'DOC Alentejo', aliases: ['alentejo doc','doc alentejo','alentejo'], latitude: 38.45, longitude: -7.86, radius: 105000, country: 'Portugal', description: 'Paisaje cálido y ondulado del sur portugués, con fruta generosa y una creciente escena de vinos de parcela.', grapes: ['Aragonez','Alicante Bouschet'], signature: 'Sol · fruta · textura' },

  { name: 'Champagne AOC', aliases: ['champagne aoc','aoc champagne','champagne'], latitude: 49.054, longitude: 4.027, radius: 72000, country: 'Francia', description: 'Tiza, clima fresco y segunda fermentación en botella. El referente mundial del vino espumoso de precisión.', grapes: ['Chardonnay','Pinot Noir','Meunier'], signature: 'Tiza · burbuja · tensión', featured: true },
  { name: 'Bordeaux AOC', aliases: ['bordeaux aoc','aoc bordeaux','bordeaux','burdeos'], latitude: 44.837, longitude: -0.579, radius: 95000, country: 'Francia', description: 'Estuarios, gravas y arcillas articulan uno de los mosaicos de terroir más influyentes del vino tinto y dulce.', grapes: ['Cabernet Sauvignon','Merlot','Cabernet Franc'], signature: 'Grava · cassis · estructura', featured: true },
  { name: 'Bourgogne AOC', aliases: ['bourgogne','burgundy','borgoña','aoc bourgogne'], latitude: 47.05, longitude: 4.84, radius: 90000, country: 'Francia', description: 'Parcelas, climat y suelos calcáreos. Pinot Noir y Chardonnay llevados a una lectura extremadamente precisa del lugar.', grapes: ['Pinot Noir','Chardonnay'], signature: 'Caliza · parcela · precisión', featured: true },
  { name: 'Rhône AOC', aliases: ['rhone','rhône','cotes du rhone','côtes du rhône'], latitude: 44.55, longitude: 4.83, radius: 115000, country: 'Francia', description: 'Del norte granítico al sur mediterráneo: Syrah, Garnacha y una enorme diversidad de paisajes y estilos.', grapes: ['Syrah','Grenache','Viognier'], signature: 'Ródano · especias · hierbas' },
  { name: 'Loire AOC', aliases: ['loire','val de loire','valle del loira'], latitude: 47.37, longitude: 0.69, radius: 145000, country: 'Francia', description: 'Un corredor de vinos frescos y expresivos: Sauvignon Blanc, Chenin Blanc, Cabernet Franc y estilos muy distintos.', grapes: ['Chenin Blanc','Sauvignon Blanc','Cabernet Franc'], signature: 'Río · frescura · diversidad' },
  { name: 'Alsace AOC', aliases: ['alsace','alsacia','aoc alsace'], latitude: 48.15, longitude: 7.32, radius: 62000, country: 'Francia', description: 'Ladera seca al abrigo de los Vosgos, célebre por blancos aromáticos, precisos y de marcada identidad varietal.', grapes: ['Riesling','Gewürztraminer','Pinot Gris'], signature: 'Aromático · seco · mineral' },

  { name: 'Prosecco DOC', aliases: ['prosecco doc','doc prosecco','prosecco'], latitude: 45.876, longitude: 12.214, radius: 76000, country: 'Italia', description: 'Colinas del noreste italiano y Glera como protagonista de espumosos frescos, florales y fáciles de reconocer.', grapes: ['Glera'], signature: 'Floral · pera · burbuja' },
  { name: 'Chianti Classico DOCG', aliases: ['chianti classico','chianti classico docg','chianti'], latitude: 43.47, longitude: 11.31, radius: 43000, country: 'Italia', description: 'Colinas entre Florencia y Siena. Sangiovese, suelos de galestro y una combinación de cereza, hierbas y tensión.', grapes: ['Sangiovese'], signature: 'Cereza · galestro · hierbas', featured: true },
  { name: 'Barolo DOCG', aliases: ['barolo','barolo docg'], latitude: 44.61, longitude: 7.94, radius: 22000, country: 'Italia', description: 'Nebbiolo en las Langhe: perfume, tanino y una capacidad extraordinaria para expresar cada colina y exposición.', grapes: ['Nebbiolo'], signature: 'Rosa · alquitrán · tanino', featured: true },
  { name: 'Brunello di Montalcino DOCG', aliases: ['brunello di montalcino','brunello'], latitude: 43.056, longitude: 11.489, radius: 25000, country: 'Italia', description: 'Sangiovese de Montalcino, con madurez mediterránea, estructura y una gran vocación de guarda.', grapes: ['Sangiovese'], signature: 'Cereza · cuero · guarda' },
  { name: 'Etna DOC', aliases: ['etna doc','doc etna','etna'], latitude: 37.74, longitude: 15.0, radius: 31000, country: 'Italia', description: 'Viñas en altura sobre suelos volcánicos del Etna. Tintos transparentes y blancos tensos con una energía mineral singular.', grapes: ['Nerello Mascalese','Carricante'], signature: 'Volcán · ceniza · tensión', featured: true },
  { name: 'Amarone della Valpolicella DOCG', aliases: ['amarone','valpolicella','amarone della valpolicella'], latitude: 45.52, longitude: 10.91, radius: 30000, country: 'Italia', description: 'Véneto y técnica de appassimento para tintos densos, especiados y de gran riqueza.', grapes: ['Corvina','Corvinone','Rondinella'], signature: 'Appassimento · ciruela · especias' },
];

export function buildWineRegions(wines: WineItem[]): AtlasWineRegion[] {
  const grouped = new Map<string, WineItem[]>();
  for (const wine of wines) {
    const key = wine.denomination?.trim() || wine.region?.trim();
    if (!key) continue;
    const definition = findDefinition(key);
    if (!definition) continue;
    grouped.set(definition.name, [...(grouped.get(definition.name) ?? []), wine]);
  }

  return REGION_DEFINITIONS
    .filter((definition) => definition.featured || (grouped.get(definition.name)?.length ?? 0) > 0)
    .map((definition) => {
      const items = grouped.get(definition.name) ?? [];
      const wineries = new Set(items.map((wine) => wine.winery).filter(Boolean));
      const favorites = items.filter((wine) => wine.favorite).length;
      const averageRating = average(items.map((wine) => wine.rating));
      const multiplier = 1 + Math.min(items.length, 8) * 0.035;
      return {
        id: slug(definition.name),
        name: definition.name,
        country: definition.country,
        latitude: definition.latitude,
        longitude: definition.longitude,
        radius: Math.round(definition.radius * multiplier),
        wineCount: items.length,
        wineryCount: wineries.size,
        favoriteCount: favorites,
        averageRating,
        description: definition.description,
        grapes: definition.grapes,
        signature: definition.signature,
        featured: Boolean(definition.featured),
      };
    })
    .sort((a, b) => b.wineCount - a.wineCount || Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name, 'es'));
}

function findDefinition(value: string) {
  const normalized = normalize(value);
  return REGION_DEFINITIONS.find((definition) => definition.aliases.some((alias) => normalized === normalize(alias) || normalized.includes(normalize(alias))));
}

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function average(values: Array<number | undefined>) {
  const valid = values.filter((value): value is number => Number.isFinite(value));
  if (!valid.length) return undefined;
  return Math.round((valid.reduce((sum, value) => sum + value, 0) / valid.length) * 10) / 10;
}

function slug(value: string) {
  return normalize(value).replace(/\s+/g, '-');
}
