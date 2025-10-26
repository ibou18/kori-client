/* eslint-disable @typescript-eslint/no-explicit-any */
type DataItem = {
  [key: string]: any;
  createdAt: string;
};

type GroupedData = {
  date: string;
  total: number;
  timestamp: number;
};

export function amountSort(
  data: DataItem[],
  dateKey: string,
  valueKey: string
): GroupedData[] {
  const groupedData = data.reduce(
    (acc: { [key: string]: GroupedData }, item) => {
      const date = new Date(item[dateKey]);
      const month = date.toLocaleString("default", { month: "short" });
      const year = date.getFullYear();
      const key = `${month}-${year}`;

      if (!acc[key]) {
        acc[key] = { date: key, total: 0, timestamp: date.getTime() };
      }

      acc[key].total += item[valueKey]; // Increment the total by the value of valueKey
      return acc;
    },
    {}
  );

  // Convertir l'objet en tableau
  const stats = Object.values(groupedData);

  // Trier les données par date (du plus ancien au plus récent)
  stats.sort((a, b) => a.timestamp - b.timestamp);

  return stats;
}
