// Fonction pour formater le montant au format monétaire pour le Canada
export const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

export const formatMoney = (amount: number) => {
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

// Fonction pour formater les numéros de téléphone pour le Canada
export const formatPhoneNumber = (phoneNumber: string) => {
  return phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
};

// Fonction pour formater les codes postaux pour le Canada
export const formatZipcode = (zipcode: string) => {
  return zipcode.replace(/([A-Z]\d[A-Z])(\d[A-Z]\d)/, "$1 $2");
};

// Fonction pour formater les dates et heures pour le Canada
export const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString("en-CA");
};
