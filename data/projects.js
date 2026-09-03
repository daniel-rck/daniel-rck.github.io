/* The curated project list — this is the file you edit by hand.
   Live URLs are NOT kept here: they come from each repository's
   "About > Website" field on GitHub and land in data/live.js,
   which scripts/sync-live-urls.py regenerates. */

window.PROJECTS = [
  {
    id: "amigo-engine",
    emoji: "🎮",
    name: "amigo-engine",
    category: "labs",
    repo: "https://github.com/amigo-labs/amigo-engine",
    tech: ["Rust"],
    desc: {
      en: "2D pixel art game engine in Rust",
      de: "2D-Pixel-Art-Game-Engine in Rust"
    }
  },
  {
    id: "amigo-pincel",
    emoji: "🎨",
    name: "amigo-pincel",
    category: "labs",
    repo: "https://github.com/amigo-labs/amigo-pincel",
    tech: ["Svelte", "Rust", "PWA", "Tauri"],
    desc: {
      en: "Pixel art editor, in the browser and on the desktop",
      de: "Pixel-Art-Editor, im Browser und auf dem Desktop"
    }
  },
  {
    id: "amigo-fineliner",
    emoji: "✏️",
    name: "amigo-fineliner",
    category: "labs",
    repo: "https://github.com/amigo-labs/amigo-fineliner",
    tech: ["Rust"],
    desc: {
      en: "Raster paint app inspired by Paint.NET and rs-paint",
      de: "Raster-Malprogramm, inspiriert von Paint.NET und rs-paint"
    }
  },
  {
    id: "amigo-trommel",
    emoji: "🥁",
    name: "amigo-trommel",
    category: "labs",
    repo: "https://github.com/amigo-labs/amigo-trommel",
    tech: ["Svelte", "Rust", "PWA", "Tauri"],
    desc: {
      en: "Game audio authoring with sample-based voices and Strudel patterns",
      de: "Game-Audio-Werkzeug mit sample-basierten Stimmen und Strudel-Patterns"
    }
  },
  {
    id: "amigo-downloader",
    emoji: "⬇️",
    name: "amigo-downloader",
    category: "labs",
    repo: "https://github.com/amigo-labs/amigo-downloader",
    tech: ["Rust", "Tauri"],
    desc: {
      en: "Cross-platform download manager",
      de: "Plattformübergreifender Download-Manager"
    }
  },
  {
    id: "amigo-native",
    emoji: "📦",
    name: "amigo-native",
    category: "labs",
    repo: "https://github.com/amigo-labs/amigo-native",
    tech: ["Rust", "WASM", "Node"],
    desc: {
      en: "Rust-powered native Node.js packages, plus wasm for the browser",
      de: "Native Node.js-Pakete auf Rust-Basis, dazu WASM für den Browser"
    }
  },
  {
    id: "amigo-metropolis",
    emoji: "🏙️",
    name: "amigo-metropolis",
    category: "labs",
    repo: "https://github.com/amigo-labs/amigo-metropolis",
    tech: ["Three.js", "Cloudflare"],
    desc: {
      en: "Browser-based Future Cop: Precinct Assault homage, a proto-MOBA",
      de: "Browser-Hommage an Future Cop: Precinct Assault, ein Proto-MOBA"
    }
  },

  {
    id: "nuget-workbench-vscode",
    emoji: "🧩",
    name: "nuget-workbench-vscode",
    category: "tools",
    repo: "https://github.com/nuget-workbench/nuget-workbench-vscode",
    tech: ["VS Code", "TypeScript"],
    desc: {
      en: "NuGet package manager for VS Code with vulnerability scanning",
      de: "NuGet-Paketmanager für VS Code mit Schwachstellen-Scan"
    }
  },
  {
    id: "Vectorizer",
    emoji: "📐",
    name: "Vectorizer",
    category: "tools",
    repo: "https://github.com/daniel-rck/Vectorizer",
    tech: [],
    desc: {
      en: "Convert raster images to vector format (SVG)",
      de: "Rasterbilder ins Vektorformat (SVG) umwandeln"
    }
  },
  {
    id: "Codes",
    emoji: "🔣",
    name: "Codes",
    category: "tools",
    repo: "https://github.com/daniel-rck/Codes",
    tech: [],
    desc: {
      en: "Scan and create barcodes and QR codes",
      de: "Barcodes und QR-Codes scannen und erstellen"
    }
  },

  {
    id: "Hausverwaltung",
    emoji: "🏠",
    name: "Hausverwaltung",
    category: "apps",
    repo: "https://github.com/daniel-rck/Hausverwaltung",
    tech: ["PWA"],
    desc: {
      en: "For private landlords managing small multi-unit properties",
      de: "Für private Vermieter kleiner Mehrfamilienhäuser"
    }
  },
  {
    id: "Tennisturnier",
    emoji: "🎾",
    name: "Tennisturnier",
    category: "apps",
    repo: "https://github.com/daniel-rck/Tennisturnier",
    tech: ["PWA"],
    desc: {
      en: "For running small tennis tournaments",
      de: "Für kleine Tennisturniere"
    }
  },
  {
    id: "ErinnerMich",
    emoji: "🔔",
    name: "ErinnerMich",
    category: "apps",
    repo: "https://github.com/daniel-rck/ErinnerMich",
    tech: ["PWA"],
    desc: {
      en: "For recurring reminders and habit tracking",
      de: "Für wiederkehrende Erinnerungen und Gewohnheiten"
    }
  },
  {
    id: "Zeiterfassung",
    emoji: "⏱️",
    name: "Zeiterfassung",
    category: "apps",
    repo: "https://github.com/daniel-rck/Zeiterfassung",
    tech: ["PWA"],
    desc: {
      en: "For personal work-time tracking",
      de: "Für die persönliche Arbeitszeiterfassung"
    }
  },
  {
    id: "Minispiele",
    emoji: "🕹️",
    name: "Minispiele",
    category: "apps",
    repo: "https://github.com/daniel-rck/Minispiele",
    tech: ["PWA"],
    desc: {
      en: "A small collection of games",
      de: "Eine Sammlung kleiner Spiele"
    }
  },
  {
    id: "Tankzettel",
    emoji: "⛽",
    name: "Tankzettel",
    category: "apps",
    repo: "https://github.com/daniel-rck/Tankzettel",
    tech: ["PWA"],
    desc: {
      en: "For capturing and analyzing fuel receipts",
      de: "Zum Erfassen und Auswerten von Tankquittungen"
    }
  },
  {
    id: "Pizzateig",
    emoji: "🍕",
    name: "Pizzateig",
    category: "apps",
    repo: "https://github.com/daniel-rck/Pizzateig",
    tech: ["PWA"],
    desc: {
      en: "Pizza dough calculator with smart scaling and local recipe sharing",
      de: "Pizzateig-Rechner mit intelligenter Skalierung und lokalem Rezept-Sharing"
    }
  },
  {
    id: "Tonspur",
    emoji: "🎥",
    name: "Tonspur",
    category: "apps",
    repo: "https://github.com/daniel-rck/Tonspur",
    tech: ["PWA"],
    desc: {
      en: "Movie guessing game based on the soundtrack",
      de: "Film-Ratespiel anhand der Musik"
    }
  }
];
