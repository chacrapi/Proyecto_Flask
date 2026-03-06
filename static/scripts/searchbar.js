document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("championSearch");
  const championContainer = document.getElementById("championContainer");
  const championCards = document.querySelectorAll(".champion-card");
  const championDetailsCache = new Map();

  // Modal elements
  const modal = document.getElementById("championModal");
  const modalOverlay = document.getElementById("modalOverlay");
  const modalClose = document.getElementById("modalClose");
  const modalChampionName = document.getElementById("modalChampionName");
  const modalChampionIcon = document.getElementById("modalChampionIcon");
  const modalLanes = document.getElementById("modalLanes");
  const modalNoteText = document.getElementById("modalNoteText");
  const modalContent = document.getElementById("modalContent");

  // Si no estamos en la página de campeones, salimos sin error
  if (!championContainer || championCards.length === 0) return;

  // =========================
  // 1) FILTRO EN VIVO (SEARCHBAR)
  // =========================
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const text = searchInput.value.toLowerCase().trim();

      championCards.forEach((card) => {
        const name = (card.dataset.name || "").toLowerCase();
        const alias = (card.dataset.alias || "").toLowerCase();
        const match = name.includes(text) || alias.includes(text);
        card.classList.toggle("is-hidden", !match);
      });
    });
  }

  // =========================
  // 2) POPUP AL CLICAR CAMPEÓN
  // =========================
  championContainer.addEventListener("click", (event) => {
    const card = event.target.closest(".champion-card");
    if (!card) return;

    const champName = card.dataset.displayName || "Campeón";
    const champAlias = card.dataset.alias || ""; // se usa para overrides, NO se muestra
    const champId = card.dataset.id || "";

    const champRoles = (card.dataset.roles || "")
      .split(",")
      .map((r) => r.trim().toLowerCase())
      .filter(Boolean);

    const lanes = getRecommendedLanes(champAlias, champRoles);

    // Rellenar modal (sin alias visible)
    if (modalChampionName) modalChampionName.textContent = champName;
    if (modalChampionIcon) {
      modalChampionIcon.src = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${champId}.png`;
      modalChampionIcon.alt = champName;
    }

    renderLanes(lanes, modalLanes);

    // Nota interesante (carga dinámica)
    if (modalNoteText) modalNoteText.textContent = "Cargando dato interesante...";

    // Splash inmediato (base)
    setModalSplash(buildSplashUrl(champId, `${champId}000`));

    openModal();

    loadChampionInterestingNote(champId, champName);
  });

  // Cerrar modal
  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modalOverlay) modalOverlay.addEventListener("click", closeModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && !modal.classList.contains("hidden")) {
      closeModal();
    }
  });

  function openModal() {
    if (!modal) return;
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  function renderLanes(lanes, container) {
    if (!container) return;
    container.innerHTML = "";

    lanes.forEach((lane) => {
      const chip = document.createElement("div");
      chip.className = "lane-chip";
      chip.innerHTML = `
        <img class="lane-icon-img" src="/static/img/roles/${lane.key}.svg" alt="${lane.label}">
        <span class="lane-label">${lane.label}</span>
      `;
      container.appendChild(chip);
    });
  }

  // =========================
  // 3) REGLAS DE LÍNEAS
  // =========================
  function getRecommendedLanes(alias, roles) {
    const overrides = {
      teemo: ["top", "mid"],
      pantheon: ["top", "mid", "jungle", "support"],
      brand: ["mid", "support"],
      zyra: ["support", "mid"],
      velkoz: ["mid", "support"],
      swain: ["mid", "support", "adc"],
      seraphine: ["support", "mid", "adc"],
      yasuo: ["mid", "top"],
      yone: ["mid", "top"],
      vayne: ["adc", "top"],
      kindred: ["jungle"],
      ivern: ["jungle", "support"],
      senna: ["support", "adc"],
      nautilus: ["support", "top"],
      pyke: ["support", "mid"],
      gragas: ["top", "jungle", "mid"],
      jarvaniv: ["jungle", "top"],
      warwick: ["jungle", "top"],
      karthus: ["jungle", "mid"],
      taliyah: ["jungle", "mid"],
      rumble: ["top", "jungle", "mid"],
      tristana: ["adc", "mid"],
      corki: ["mid", "adc"],
      lucian: ["adc", "mid"],
      akshan: ["mid", "top"],
      quinn: ["top", "adc"],
    };

    const key = (alias || "").toLowerCase();
    if (key && overrides[key]) return overrides[key].map(toLaneObject);

    const laneSet = new Set();

    roles.forEach((role) => {
      switch (role) {
        case "marksman":
          laneSet.add("adc");
          break;
        case "support":
          laneSet.add("support");
          break;
        case "mage":
          laneSet.add("mid");
          laneSet.add("support");
          break;
        case "assassin":
          laneSet.add("mid");
          laneSet.add("jungle");
          break;
        case "fighter":
          laneSet.add("top");
          laneSet.add("jungle");
          break;
        case "tank":
          laneSet.add("top");
          laneSet.add("support");
          break;
      }
    });

    if (laneSet.size === 0) {
      laneSet.add("top");
      laneSet.add("mid");
    }

    return Array.from(laneSet).map(toLaneObject);
  }

  function toLaneObject(laneKey) {
    const laneMap = {
      top: { key: "top", label: "Top" },
      jungle: { key: "jungle", label: "Jungla" },
      mid: { key: "mid", label: "Mid" },
      adc: { key: "adc", label: "ADC" },
      support: { key: "support", label: "Support" },
    };
    return laneMap[laneKey] || { key: "mid", label: "Flexible" };
  }

  async function loadChampionInterestingNote(champId, champName) {
    if (!modalNoteText || !champId) return;

    try {
      const data = await getChampionDetailsById(champId);

      const skinId = pickSplashSkinId(data, champId);
      setModalSplash(buildSplashUrl(champId, skinId));

      const note = buildInterestingNote(data, champName);
      modalNoteText.textContent = note;
    } catch (error) {
      console.error("Error cargando detalle del campeón:", error);
      modalNoteText.textContent = `Dato interesante: ${champName} tiene múltiples estilos de juego según línea y composición.`;
    }
  }

  function pickSplashSkinId(data, champId) {
  // 1) Intentar base skin por flag
  if (data?.skins && Array.isArray(data.skins) && data.skins.length > 0) {
    const base = data.skins.find(s => s.isBase);
    if (base?.id !== undefined) return base.id;

    // 2) Fallback: primer skin con id
    const first = data.skins.find(s => s.id !== undefined);
    if (first) return first.id;
  }

  // 3) Fallback matemático: champId * 1000
  return parseInt(champId, 10) * 1000;
}

  async function getChampionDetailsById(champId) {
  if (championDetailsCache.has(champId)) return championDetailsCache.get(champId);

  const urls = [
    `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champions/${champId}.json`,
    // si algún día quieres intentar locale, aquí podrías añadirlo, pero default es el seguro
  ];

  let lastError = null;
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      championDetailsCache.set(champId, data);
      return data;
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError;
}

  function buildInterestingNote(data, fallbackName) {
    const name = data?.name || fallbackName || "Este campeón";
    const title = data?.title ? capitalizeText(data.title) : "";
    const shortBio = cleanText(data?.shortBio || "");
    const skinsCount = Array.isArray(data?.skins) ? data.skins.length : null;

    const difficulty = data?.tacticalInfo?.difficulty;
    const damageType = translateDamageType(data?.tacticalInfo?.damageType);

    const shortLore = shortBio ? truncateText(shortBio, 180) : "";

    const parts = [];
    parts.push(title ? `${name}, ${title}.` : `${name}.`);
    if (shortLore) parts.push(shortLore);

    const extra = [];
    if (typeof difficulty === "number") extra.push(`dificultad ${difficulty}/10`);
    if (damageType) extra.push(`daño principal ${damageType}`);
    if (skinsCount !== null) extra.push(`${skinsCount} skins registradas`);

    if (extra.length) parts.push(`Info rápida: ${extra.join(" · ")}.`);
    return parts.join(" ");
  }

  function translateDamageType(value) {
    const map = {
      kMagic: "mágico",
      kPhysical: "físico",
      kMixed: "mixto",
      kTrue: "verdadero",
    };
    return map[value] || null;
  }

  function cleanText(text) {
    return String(text || "")
      .replace(/\s+/g, " ")
      .replace(/[\r\n]+/g, " ")
      .trim();
  }

  function truncateText(text, max = 180) {
    if (!text || text.length <= max) return text;
    return text.slice(0, max).trimEnd() + "...";
  }

  function capitalizeText(text) {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function buildSplashUrl(champId, skinId) {
  return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-splashes/${champId}/${skinId}.jpg`;
  }

  function setModalSplash(url) {
    if (!modalContent) return;
    modalContent.style.setProperty("--modal-splash", `url("${url}")`);
  }
});