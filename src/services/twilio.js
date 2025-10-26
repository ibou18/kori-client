import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Envoie un SMS à un numéro de téléphone spécifique.
 * @param {string} to - Numéro de téléphone du destinataire, avec l'indicatif de pays.
 * @param {string} message - Contenu du message à envoyer.
 * @returns {Promise} - Résultat de l'envoi du SMS.
 */
export const sendSMS = async (to, message) => {
  try {
    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });

    console.log("responseTwilio", response);
    return response;
  } catch (error) {
    console.error("Erreur lors de l'envoi du SMS:", error);
    throw error;
  }
};
