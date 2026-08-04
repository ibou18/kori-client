/**
 * Validation / messages d'erreur pour le formulaire de login.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type LoginCredentials = {
  email: string;
  password: string;
};

/**
 * Valide email + mot de passe avant l'appel signIn.
 * @returns message d'erreur ou null si OK
 */
export function validateLoginCredentials(
  credentials: LoginCredentials,
): string | null {
  const email = credentials.email.trim();
  const password = credentials.password;

  if (!email) {
    return "L'email est requis";
  }
  if (!EMAIL_RE.test(email)) {
    return "Format d'email invalide";
  }
  if (!password.trim()) {
    return "Le mot de passe est requis";
  }
  return null;
}

/**
 * Message lisible à partir d'une erreur NextAuth / réseau.
 */
export function getLoginErrorMessage(error: unknown): string {
  if (typeof error === "string" && error.trim()) {
    if (error === "CredentialsSignin") {
      return "Email ou mot de passe incorrect.";
    }
    return error;
  }

  const err = error as {
    error?: string;
    message?: string;
  };

  const code = err?.error || err?.message;
  if (code === "CredentialsSignin") {
    return "Email ou mot de passe incorrect.";
  }
  if (typeof code === "string" && code.trim()) {
    return code;
  }

  return "Une erreur s'est produite. Veuillez réessayer.";
}
