document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("championSearch");
    const cards = document.querySelectorAll(".champion-card");

    if (!searchInput || cards.length === 0) return;

    searchInput.addEventListener("input", () => {
        const searchText = searchInput.value.toLowerCase().trim();

        cards.forEach((card) => {
            const championName = card.dataset.name || "";

            if (championName.includes(searchText)) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });
    });
});