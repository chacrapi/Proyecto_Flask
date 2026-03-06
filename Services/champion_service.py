import requests

C_DRAGON_URL = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-summary.json"

def get_all_champions():
    """
    Obtiene la lista de campeones desde CommunityDragon.
    Devuelve una lista de diccionarios con info básica.
    """
    try:
        response = requests.get(C_DRAGON_URL, timeout=10)
        response.raise_for_status()

        data = response.json()

        # Quitamos el champion placeholder (id = -1)
        champions = [champ for champ in data if champ.get("id") != -1]

        # Ordenar por nombre (más limpio visualmente)
        champions.sort(key=lambda c: c.get("name", "").lower())

        return champions

    except requests.RequestException as e:
        print(f"Error al obtener campeones: {e}")
        return []