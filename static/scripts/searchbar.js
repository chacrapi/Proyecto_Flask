document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("championSearch");
    const championContainer = document.getElementById("championContainer");
    const championCards = document.querySelectorAll(".champion-card");

    // Modal elements
    const modal = document.getElementById("championModal");
    const modalOverlay = document.getElementById("modalOverlay");
    const modalClose = document.getElementById("modalClose");
    const modalChampionName = document.getElementById("modalChampionName");
    const modalChampionAlias = document.getElementById("modalChampionAlias");
    const modalChampionIcon = document.getElementById("modalChampionIcon");
    const modalLanes = document.getElementById("modalLanes");

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
        const champAlias = card.dataset.alias || "";
        const champId = card.dataset.id || "";
        const champRoles = (card.dataset.roles || "")
            .split(",")
            .map(r => r.trim().toLowerCase())
            .filter(Boolean);

        const lanes = getRecommendedLanes(champAlias, champRoles);

        // Rellenar modal
        modalChampionName.textContent = champName;
        modalChampionAlias.textContent = champAlias ? `Alias: ${capitalize(champAlias)}` : "";
        modalChampionIcon.src = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${champId}.png`;
        modalChampionIcon.alt = champName;

        renderLanes(lanes, modalLanes);

        openModal();
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
    // 3) REGLAS DE LÍNEAS (SENCILLAS)
    // =========================
    function getRecommendedLanes(alias, roles) {
        // Overrides manuales para algunos campeones flexibles o raros
        const overrides = {
            "teemo": ["top", "mid"],
            "pantheon": ["top", "mid", "jungle", "support"],
            "brand": ["mid", "support"],
            "zyra": ["support", "mid"],
            "velkoz": ["mid", "support"],
            "swain": ["mid", "support", "adc"],
            "seraphine": ["support", "mid", "adc"],
            "yasuo": ["mid", "top"],
            "yone": ["mid", "top"],
            "vayne": ["adc", "top"],
            "kindred": ["jungle"],
            "ivern": ["jungle", "support"],
            "senna": ["support", "adc"],
            "nautilus": ["support", "top"],
            "pyke": ["support", "mid"],
            "gragas": ["top", "jungle", "mid"],
            "jarvaniv": ["jungle", "top"],
            "warwick": ["jungle", "top"],
            "karthus": ["jungle", "mid"],
            "taliyah": ["jungle", "mid"],
            "rumble": ["top", "jungle", "mid"],
            "tristana": ["adc", "mid"],
            "corki": ["mid", "adc"],
            "lucian": ["adc", "mid"],
            "akshan": ["mid", "top"],
            "quinn": ["top", "adc"]
        };

        if (alias && overrides[alias]) {
            return overrides[alias].map(toLaneObject);
        }

        // Heurística por "roles" si viene en el JSON de CDragon
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
                default:
                    break;
            }
        });

        // Fallback si no hay roles (o vienen vacíos)
        if (laneSet.size === 0) {
            laneSet.add("top");
            laneSet.add("mid");
        }

        return Array.from(laneSet).map(toLaneObject);
    }

    function toLaneObject(laneKey) {
    const laneMap = {
        top:     { key: "top",     label: "Top" },
        jungle:  { key: "jungle",  label: "Jungla" },
        mid:     { key: "mid",     label: "Mid" },
        adc:     { key: "adc",     label: "ADC" },
        support: { key: "support", label: "Support" }
    };

    return laneMap[laneKey] || { key: "mid", label: "Flexible" };
    }

    function capitalize(text) {
        if (!text) return "";
        return text.charAt(0).toUpperCase() + text.slice(1);
    }
});