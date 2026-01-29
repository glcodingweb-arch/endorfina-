
export interface ThemedRace {
  slug: string;
  heading: string;
  description: string;
  longDescription: string;
  imgSrc: string;
  logoSrc: string;
  imageHint: string;
  gallery: {
    id: string;
    url: string;
    alt: string;
    hint: string;
  }[];
}

export const THEMED_RACES_DATA: ThemedRace[] = [
  {
    slug: "bubble-run-fest",
    heading: "Bubble Run Fest",
    description: "Uma corrida divertida em meio a um mar de espuma.",
    longDescription: "A Bubble Run Fest é uma experiência única onde os participantes correm através de portais de espuma colorida. É um evento não competitivo, focado na diversão para toda a família, com música, dança e, claro, muitas bolhas!",
    imgSrc: "/EVENTOS%20PASSADOS/BUBBLE%20RUN/BUBBLE%20RUN.png",
    logoSrc: "/EVENTOS%20PASSADOS/BUBBLE%20RUN/BUBBLE%20RUN%20LOGO.png",
    imageHint: "bubble party",
    gallery: []
  },
  {
    slug: "color-explosion-run",
    heading: "Color Explosion Run",
    description: "Prepare-se para uma explosão de cores e alegria a cada quilômetro.",
    longDescription: "A Color Explosion Run é a corrida mais colorida do planeta! A cada quilômetro percorrido, os participantes são banhados com pós de cores vibrantes. A festa continua na linha de chegada com uma grande celebração de música e cor.",
    imgSrc: "/EVENTOS%20PASSADOS/COLOR%20EXPLOSION/COLOR%20EXPLOSION.png",
    logoSrc: "/EVENTOS%20PASSADOS/COLOR%20EXPLOSION/COLOR%20EXPLOSION%20LOGO.png",
    imageHint: "color run",
    gallery: [
      { "id": "v1", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(1).jpeg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "h1", "url": "/ENDORFINA%20ESPORTES/HORIZONTAL/CORES/COLOR%20EXPLOSION%20RUN%20HORIZONTAL%20(1).jpeg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v2", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(1).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "h2", "url": "/ENDORFINA%20ESPORTES/HORIZONTAL/CORES/COLOR%20EXPLOSION%20RUN%20HORIZONTAL%20(1).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v3", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(3).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "h3", "url": "/ENDORFINA%20ESPORTES/HORIZONTAL/CORES/COLOR%20EXPLOSION%20RUN%20HORIZONTAL%20(2).jpeg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v4", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(4).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "h4", "url": "/ENDORFINA%20ESPORTES/HORIZONTAL/CORES/COLOR%20EXPLOSION%20RUN%20HORIZONTAL%20(2).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v5", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(2).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "h5", "url": "/ENDORFINA%20ESPORTES/HORIZONTAL/CORES/COLOR%20EXPLOSION%20RUN%20HORIZONTAL%20(3).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v6", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(9).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "h6", "url": "/ENDORFINA%20ESPORTES/HORIZONTAL/CORES/COLOR%20EXPLOSION%20RUN%20HORIZONTAL%20(3).jpeg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v7", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(8).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "h7", "url": "/ENDORFINA%20ESPORTES/HORIZONTAL/CORES/COLOR%20EXPLOSION%20RUN%20HORIZONTAL%20(4).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v8", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(7).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "h8", "url": "/ENDORFINA%20ESPORTES/HORIZONTAL/CORES/COLOR%20EXPLOSION%20RUN%20HORIZONTAL%20(5).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v9", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(6).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "h9", "url": "/ENDORFINA%20ESPORTES/HORIZONTAL/CORES/COLOR%20EXPLOSION%20RUN%20HORIZONTAL%20(6).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v10", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(5).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "h10", "url": "/ENDORFINA%20ESPORTES/HORIZONTAL/CORES/COLOR%20EXPLOSION%20RUN%20HORIZONTAL%20(7).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v11", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(46).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "h11", "url": "/ENDORFINA%20ESPORTES/HORIZONTAL/CORES/COLOR%20EXPLOSION%20RUN%20HORIZONTAL%20(8).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v12", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(45).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "h12", "url": "/ENDORFINA%20ESPORTES/HORIZONTAL/CORES/COLOR%20EXPLOSION%20RUN%20HORIZONTAL%20(9).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v13", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(44).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "h13", "url": "/ENDORFINA%20ESPORTES/HORIZONTAL/CORES/COLOR%20EXPLOSION%20RUN%20HORIZONTAL%20(10).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v14", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(43).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v15", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(42).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v16", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(41).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v17", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(40).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v18", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(39).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v19", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(38).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v20", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(36).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v21", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(37).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v22", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(35).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v23", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(34).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v24", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(33).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v25", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(10).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v26", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(11).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v27", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(12).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v28", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(13).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v29", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(14).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v30", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(15).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v31", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(16).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v32", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(17).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v33", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(18).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v34", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(19).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v35", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(20).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v36", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(21).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v37", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(22).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v38", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(23).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v39", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(24).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v40", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(25).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v41", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(26).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v42", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(27).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v43", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(28).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v44", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(29).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v45", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(30).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v46", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(31).jpg", "alt": "Color Explosion Run", "hint": "color run" },
      { "id": "v47", "url": "/ENDORFINA%20ESPORTES/VERTICAL/CORES/COLOR%20EXPLOSION%20RUN%20VERTICAL%20(32).jpg", "alt": "Color Explosion Run", "hint": "color run" }
    ]
  },
  {
    slug: "neon-run-party",
    heading: "Neon Run Party",
    description: "Corra sob luzes neon ao som dos maiores hits das últimas décadas.",
    longDescription: "A Neon Run Party transforma a noite em um espetáculo de luz e som. Os corredores usam acessórios neon e correm por um percurso iluminado com luz negra. A festa é garantida do início ao fim com DJs e muita música.",
    imgSrc: "/EVENTOS%20PASSADOS/NEON%20RUN/NEON%20RUN%201.png",
    logoSrc: "/EVENTOS%20PASSADOS/NEON%20RUN/NEON%20RUN%20LOGO%201.png",
    imageHint: "neon party",
    gallery: [
      { id: "nv1", url: "/ENDORFINA%20ESPORTES/VERTICAL/NEON/NEON%20RUN%20VERTICAL%20(1).jpeg", alt: "Neon Run Vertical", hint: "neon run" },
      { id: "nh1", url: "/ENDORFINA%20ESPORTES/HORIZONTAL/NEON/NEON%20RUN%20HORIZONTAL%20(1).jpg", alt: "Neon Run Horizontal", hint: "neon run" },
      { id: "nv2", url: "/ENDORFINA%20ESPORTES/VERTICAL/NEON/NEON%20RUN%20VERTICAL%20(1).jpg", alt: "Neon Run Vertical", hint: "neon run" },
      { id: "nh2", url: "/ENDORFINA%20ESPORTES/HORIZONTAL/NEON/NEON%20RUN%20HORIZONTAL%20(1).jpg", alt: "Neon Run Horizontal", hint: "neon run" },
      { id: "nv3", url: "/ENDORFINA%20ESPORTES/VERTICAL/NEON/NEON%20RUN%20VERTICAL%20(2).jpg", alt: "Neon Run Vertical", hint: "neon run" },
      { id: "nh3", url: "/ENDORFINA%20ESPORTES/HORIZONTAL/NEON/NEON%20RUN%20HORIZONTAL%20(2).jpeg", alt: "Neon Run Horizontal", hint: "neon run" },
      { id: "nv4", url: "/ENDORFINA%20ESPORTES/VERTICAL/NEON/NEON%20RUN%20VERTICAL%20(2).jpeg", alt: "Neon Run Vertical", hint: "neon run" },
      { id: "nh4", url: "/ENDORFINA%20ESPORTES/HORIZONTAL/NEON/NEON%20RUN%20HORIZONTAL%20(2).jpg", alt: "Neon Run Horizontal", hint: "neon run" },
      { id: "nv5", url: "/ENDORFINA%20ESPORTES/VERTICAL/NEON/NEON%20RUN%20VERTICAL%20(3).jpeg", alt: "Neon Run Vertical", hint: "neon run" },
      { id: "nh5", url: "/ENDORFINA%20ESPORTES/HORIZONTAL/NEON/NEON%20RUN%20HORIZONTAL%20(3).jpeg", alt: "Neon Run Horizontal", hint: "neon run" },
      { id: "nv6", url: "/ENDORFINA%20ESPORTES/VERTICAL/NEON/NEON%20RUN%20VERTICAL%20(3).jpg", alt: "Neon Run Vertical", hint: "neon run" },
      { id: "nh6", url: "/ENDORFINA%20ESPORTES/HORIZONTAL/NEON/NEON%20RUN%20HORIZONTAL%20(4).jpeg", alt: "Neon Run Horizontal", hint: "neon run" },
      { id: "nv7", url: "/ENDORFINA%20ESPORTES/VERTICAL/NEON/NEON%20RUN%20VERTICAL%20(4).jpeg", alt: "Neon Run Vertical", hint: "neon run" },
      { id: "nv8", url: "/ENDORFINA%20ESPORTES/VERTICAL/NEON/NEON%20RUN%20VERTICAL%20(4).jpg", alt: "Neon Run Vertical", hint: "neon run" },
      { id: "nv9", url: "/ENDORFINA%20ESPORTES/VERTICAL/NEON/NEON%20RUN%20VERTICAL%20(5).jpeg", alt: "Neon Run Vertical", hint: "neon run" },
      { id: "nv10", url: "/ENDORFINA%20ESPORTES/VERTICAL/NEON/NEON%20RUN%20VERTICAL%20(5).jpg", alt: "Neon Run Vertical", hint: "neon run" },
      { id: "nv11", url: "/ENDORFINA%20ESPORTES/VERTICAL/NEON/NEON%20RUN%20VERTICAL%20(6).jpeg", alt: "Neon Run Vertical", hint: "neon run" },
      { id: "nv12", url: "/ENDORFINA%20ESPORTES/VERTICAL/NEON/NEON%20RUN%20VERTICAL%20(6).jpg", alt: "Neon Run Vertical", hint: "neon run" },
      { id: "nv13", url: "/ENDORFINA%20ESPORTES/VERTICAL/NEON/NEON%20RUN%20VERTICAL%20(7).jpeg", alt: "Neon Run Vertical", hint: "neon run" },
      { id: "nv14", url: "/ENDORFINA%20ESPORTES/VERTICAL/NEON/NEON%20RUN%20VERTICAL%20(7).jpg", alt: "Neon Run Vertical", hint: "neon run" },
      { id: "nv15", url: "/ENDORFINA%20ESPORTES/VERTICAL/NEON/NEON%20RUN%20VERTICAL%20(8).jpeg", alt: "Neon Run Vertical", hint: "neon run" },
      { id: "nv16", url: "/ENDORFINA%20ESPORTES/VERTICAL/NEON/NEON%20RUN%20VERTICAL%20(8).jpg", alt: "Neon Run Vertical", hint: "neon run" },
      { id: "nv17", url: "/ENDORFINA%20ESPORTES/VERTICAL/NEON/NEON%20RUN%20VERTICAL%20(9).jpeg", alt: "Neon Run Vertical", hint: "neon run" },
      { id: "nv18", url: "/ENDORFINA%20ESPORTES/VERTICAL/NEON/NEON%20RUN%20VERTICAL%20(9).jpg", alt: "Neon Run Vertical", hint: "neon run" },
      { id: "nv19", url: "/ENDORFINA%20ESPORTES/VERTICAL/NEON/NEON%20RUN%20VERTICAL%20(10).jpeg", alt: "Neon Run Vertical", hint: "neon run" },
      { id: "nv20", url: "/ENDORFINA%20ESPORTES/VERTICAL/NEON/NEON%20RUN%20VERTICAL%20(10).jpg", alt: "Neon Run Vertical", hint: "neon run" },
      { id: "nv21", url: "/ENDORFINA%20ESPORTES/VERTICAL/NEON/NEON%20RUN%20VERTICAL%20(11).jpeg", alt: "Neon Run Vertical", hint: "neon run" },
      { id: "nv22", url: "/ENDORFINA%20ESPORTES/VERTICAL/NEON/NEON%20RUN%20VERTICAL%20(11).jpg", alt: "Neon Run Vertical", hint: "neon run" },
      { id: "nv23", url: "/ENDORFINA%20ESPORTES/VERTICAL/NEON/NEON%20RUN%20VERTICAL%20(12).jpeg", alt: "Neon Run Vertical", hint: "neon run" },
      { id: "nv24", url: "/ENDORFINA%20ESPORTES/VERTICAL/NEON/NEON%20RUN%20VERTICAL%20(12).jpg", alt: "Neon Run Vertical", hint: "neon run" },
      { id: "nv25", url: "/ENDORFINA%20ESPORTES/VERTICAL/NEON/NEON%20RUN%20VERTICAL%20(13).jpg", alt: "Neon Run Vertical", hint: "neon run" }
    ]
  },
  {
    slug: "pink-gru",
    heading: "Pink GRU",
    description: "Vista o rosa e corra por uma causa nobre em Guarulhos.",
    longDescription: "A Pink GRU é um evento de conscientização sobre o câncer de mama. Parte da renda é revertida para instituições de apoio a pacientes. É uma corrida emocionante que une esporte, solidariedade e a celebração da vida.",
    imgSrc: "/EVENTOS%20PASSADOS/PINK%20GRU/PINK%20GRU.png",
    logoSrc: "/EVENTOS%20PASSADOS/PINK%20GRU/PINK%20GRU%20LOGO.png",
    imageHint: "pink october run",
    gallery: [
      { id: "pv1", url: "/ENDORFINA%20ESPORTES/VERTICAL/PINK/PINK%20GRU%20VERTICAL%20(1).jpeg", alt: "Pink GRU Vertical", hint: "pink run" },
      { id: "ph1", url: "/ENDORFINA%20ESPORTES/HORIZONTAL/PINK/PINK%20GRU%20HORIZONTAL%20(1).jpg", alt: "Pink GRU Horizontal", hint: "pink run" },
      { id: "pv2", url: "/ENDORFINA%20ESPORTES/VERTICAL/PINK/PINK%20GRU%20VERTICAL%20(1).jpg", alt: "Pink GRU Vertical", hint: "pink run" },
      { id: "ph2", url: "/ENDORFINA%20ESPORTES/HORIZONTAL/PINK/PINK%20GRU%20HORIZONTAL%20(2).jpg", alt: "Pink GRU Horizontal", hint: "pink run" },
      { id: "pv3", url: "/ENDORFINA%20ESPORTES/VERTICAL/PINK/PINK%20GRU%20VERTICAL%20(2).jpg", alt: "Pink GRU Vertical", hint: "pink run" },
      { id: "pv4", url: "/ENDORFINA%20ESPORTES/VERTICAL/PINK/PINK%20GRU%20VERTICAL%20(3).jpg", alt: "Pink GRU Vertical", hint: "pink run" },
      { id: "pv5", url: "/ENDORFINA%20ESPORTES/VERTICAL/PINK/PINK%20GRU%20VERTICAL%20(4).jpg", alt: "Pink GRU Vertical", hint: "pink run" },
      { id: "pv6", url: "/ENDORFINA%20ESPORTES/VERTICAL/PINK/PINK%20GRU%20VERTICAL%20(5).jpg", alt: "Pink GRU Vertical", hint: "pink run" },
      { id: "pv7", url: "/ENDORFINA%20ESPORTES/VERTICAL/PINK/PINK%20GRU%20VERTICAL%20(6).jpg", alt: "Pink GRU Vertical", hint: "pink run" },
      { id: "pv8", url: "/ENDORFINA%20ESPORTES/VERTICAL/PINK/PINK%20GRU%20VERTICAL%20(7).jpg", alt: "Pink GRU Vertical", hint: "pink run" },
      { id: "pv9", url: "/ENDORFINA%20ESPORTES/VERTICAL/PINK/PINK%20GRU%20VERTICAL%20(8).jpg", alt: "Pink GRU Vertical", hint: "pink run" },
      { id: "pv10", url: "/ENDORFINA%20ESPORTES/VERTICAL/PINK/PINK%20GRU%20VERTICAL%20(9).jpg", alt: "Pink GRU Vertical", hint: "pink run" }
    ]
  },
];

    
