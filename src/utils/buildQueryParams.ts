/**
 * Construit une chaîne de requête URL à partir d'un objet de paramètres
 *
 * @param params - Un objet contenant les paramètres à convertir en chaîne de requête
 * @returns Une chaîne de requête URL commençant par '?' ou une chaîne vide
 */
export const buildQueryParams = (params: Record<string, any>): string => {
  // Filtrer les valeurs undefined, null ou vides
  const filteredParams = Object.entries(params).filter(
    ([_, value]) => value !== undefined && value !== null && value !== ""
  );

  // Si aucun paramètre valide, retourner une chaîne vide
  if (filteredParams.length === 0) {
    return "";
  }

  // Construire l'objet URLSearchParams
  const urlParams = new URLSearchParams();

  // Ajouter chaque paramètre à l'objet URLSearchParams
  filteredParams.forEach(([key, value]) => {
    // Convertir les dates en chaînes ISO si nécessaire
    if (value instanceof Date) {
      urlParams.append(key, value.toISOString());
    }
    // Convertir les nombres et booléens en chaînes
    else if (typeof value === "number" || typeof value === "boolean") {
      urlParams.append(key, value.toString());
    }
    // Utiliser directement les chaînes
    else if (typeof value === "string") {
      urlParams.append(key, value);
    }
    // Pour les tableaux, ajouter chaque élément séparément
    else if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null) {
          urlParams.append(`${key}[]`, item.toString());
        }
      });
    }
    // Pour les objets, convertir en JSON
    else if (typeof value === "object") {
      urlParams.append(key, JSON.stringify(value));
    }
  });

  // Retourner la chaîne de requête avec un '?' au début
  return urlParams.toString() ? `?${urlParams.toString()}` : "";
};
