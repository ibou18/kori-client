export async function analyzeReceipt(file: File): Promise<any> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(
      `${process.env.NEXT_API_URL}/receipts/analyze`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Échec de l'analyse");
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur lors de l'analyse du reçu:", error);
    throw error;
  }
}
