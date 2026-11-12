"use client";

import { forgotPasswordApi, registerApi } from "@/app/data/services";
import { FormattedPhoneInput } from "@/components/ui/FormattedPhoneInput";
import { cn } from "@/lib/utils";
import { getSession, signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { useState, type InputHTMLAttributes } from "react";

import {
  getRegisterErrorMessage,
  phoneE164ForRegister,
  validateClientRegistrationNames,
  validateOptionalRegistrationPhone,
} from "./registerValidation";
import {
  WebBookingCta,
  WebBookingSecondaryAction,
  WebBookingStepActions,
  type WebBookingFooterSummary,
} from "./WebBookingStepActions";

interface ClientQuickAuthPanelProps {
  onAuthenticated: () => void;
  summary: WebBookingFooterSummary | null;
}

type Mode = "register" | "login";

const inputClass =
  "h-12 w-full rounded-xl border border-site-border-strong bg-site-bg px-3.5 text-[15px] text-site-fg placeholder:text-site-muted focus:border-site-accent focus:outline-none focus:ring-2 focus:ring-site-accent/20 disabled:opacity-60";

const phoneSelectClassName =
  "h-12 w-[6.75rem] rounded-xl border border-site-border-strong bg-site-bg pl-3.5 text-[15px] text-site-fg focus:border-site-accent focus:outline-none focus:ring-2 focus:ring-site-accent/20 disabled:cursor-not-allowed disabled:opacity-60";

function Field({
  id,
  label,
  hint,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { id: string; label: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input id={id} className={inputClass} aria-describedby={hint ? `${id}-hint` : undefined} {...props} />
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-site-muted">
          {hint}
        </p>
      )}
    </div>
  );
}

/**
 * Étape coordonnées (maquette) : sélecteur « Créer un compte / Se connecter » en
 * pilule, formulaire, bouton principal dans la barre basse (il soumet le
 * formulaire visible).
 */
export function ClientQuickAuthPanel({ onAuthenticated, summary }: ClientQuickAuthPanelProps) {
  const [mode, setMode] = useState<Mode>("register");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneDialCode, setPhoneDialCode] = useState("+1");
  const [phoneLocal, setPhoneLocal] = useState("");
  const [phoneFieldError, setPhoneFieldError] = useState<string | undefined>();
  const [forgotEmail, setForgotEmail] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const openForgotPassword = () => {
    setError(null);
    setForgotSuccess(false);
    setForgotEmail(loginEmail.trim());
    setShowForgotPassword(true);
  };

  const closeForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotSuccess(false);
    setError(null);
  };

  const finishAuth = async () => {
    await getSession();
    onAuthenticated();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", { redirect: false, email: loginEmail.trim(), password: loginPassword });
      if (res?.error) {
        setError(res.error);
        return;
      }
      await finishAuth();
    } catch {
      setError("Connexion impossible. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setForgotSuccess(false);
    const email = forgotEmail.trim();
    if (!email) {
      setError("Veuillez saisir votre adresse courriel.");
      return;
    }
    setLoading(true);
    try {
      const result = await forgotPasswordApi(email);
      if (!result) {
        setError("Erreur lors de l'envoi du courriel de réinitialisation.");
        return;
      }
      setForgotSuccess(true);
    } catch {
      setError("Erreur lors de l'envoi du courriel de réinitialisation.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPhoneFieldError(undefined);
    setLoading(true);
    try {
      const nameError = validateClientRegistrationNames(firstName, lastName);
      if (nameError) {
        setError(nameError);
        return;
      }
      const phoneErr = validateOptionalRegistrationPhone(phoneDialCode, phoneLocal);
      if (phoneErr) {
        setPhoneFieldError(phoneErr);
        setError(phoneErr);
        return;
      }
      const payload: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        role: "CLIENT";
        phone?: string;
      } = {
        email: regEmail.trim(),
        password: regPassword,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role: "CLIENT",
      };
      const phoneE164 = phoneE164ForRegister(phoneDialCode, phoneLocal);
      if (phoneE164) payload.phone = phoneE164;

      const result = await registerApi(payload);
      if (!result?.token) {
        setError((result as { message?: string })?.message || "Inscription refusée. Vérifiez vos informations.");
        return;
      }
      const sign = await signIn("credentials", { redirect: false, email: regEmail.trim(), password: regPassword });
      if (sign?.error) {
        setError("Compte créé mais connexion automatique échouée. Connectez-vous manuellement.");
        return;
      }
      await finishAuth();
    } catch (err: unknown) {
      setError(getRegisterErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const activeFormId = showForgotPassword ? "wb-forgot-form" : mode === "register" ? "wb-register-form" : "wb-login-form";
  const ctaLabel = showForgotPassword
    ? "Envoyer le lien"
    : mode === "register"
      ? "Créer mon compte et continuer"
      : "Se connecter et continuer";

  return (
    <>
      <div className="flex flex-1 flex-col gap-3.5 px-5 pb-5 pt-5">
        {!showForgotPassword && (
          <div role="tablist" aria-label="Type de compte" className="flex rounded-full bg-site-surface p-1">
            {(
              [
                { key: "register", label: "Créer un compte" },
                { key: "login", label: "Se connecter" },
              ] as { key: Mode; label: string }[]
            ).map((t) => {
              const selected = mode === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => {
                    setMode(t.key);
                    setError(null);
                  }}
                  className={cn(
                    "h-11 flex-1 rounded-full text-sm transition-colors",
                    selected ? "bg-site-bg font-semibold text-site-fg shadow-sm" : "font-medium text-site-fg-2",
                  )}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        )}

        {forgotSuccess && (
          <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Si un compte existe pour cette adresse, un courriel de réinitialisation a été envoyé. Consultez votre boîte
            de réception puis reconnectez-vous ici.
          </p>
        )}
        {error && <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        {showForgotPassword ? (
          <form id="wb-forgot-form" onSubmit={handleForgotPassword} className="flex flex-col gap-3.5">
            <p className="text-[13px] text-site-muted">
              Saisissez le courriel de votre compte. Nous vous enverrons un lien pour choisir un nouveau mot de passe.
            </p>
            <Field
              id="wb-forgot-email"
              label="Courriel"
              type="email"
              autoComplete="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
              disabled={loading || forgotSuccess}
            />
            <button
              type="button"
              onClick={closeForgotPassword}
              className="flex min-h-11 items-center self-start text-sm font-semibold text-site-fg hover:underline"
            >
              Retour à la connexion
            </button>
          </form>
        ) : mode === "register" ? (
          <form id="wb-register-form" onSubmit={handleRegister} className="flex flex-col gap-3.5">
            <p className="-mt-1 text-[13px] text-site-fg">
              Créez votre compte <b>korí</b> pour retrouver vos rendez-vous et réserver plus vite la prochaine fois.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <Field id="wb-reg-fn" label="Prénom" autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              <Field id="wb-reg-ln" label="Nom" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <FormattedPhoneInput
                id="wb-reg-phone"
                label="Téléphone"
                required={false}
                value={phoneLocal}
                countryCode={phoneDialCode}
                onPhoneChange={(v) => {
                  setPhoneLocal(v);
                  if (phoneFieldError) setPhoneFieldError(undefined);
                }}
                onCountryCodeChange={(dial) => {
                  setPhoneDialCode(dial);
                  if (phoneFieldError) setPhoneFieldError(undefined);
                }}
                error={phoneFieldError}
                disabled={loading}
                selectClassName={phoneSelectClassName}
                inputClassName={cn(inputClass, "shadow-none md:text-[15px]")}
                labelClassName="text-sm font-medium text-site-fg"
                className="space-y-1.5"
                dialCodeOnly
              />
              <p className="text-xs text-site-muted">Optionnel. Utile pour le rappel par texto la veille.</p>
            </div>
            <Field
              id="wb-reg-email"
              label="Courriel"
              type="email"
              autoComplete="email"
              placeholder="vous@exemple.com"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              required
            />
            <Field
              id="wb-reg-password"
              label="Créer un mot de passe"
              type="password"
              autoComplete="new-password"
              placeholder="5 caractères minimum"
              hint="Au moins 5 caractères."
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              required
              minLength={5}
            />
          </form>
        ) : (
          <form id="wb-login-form" onSubmit={handleLogin} className="flex flex-col gap-3.5">
            <p className="-mt-1 text-[13px] text-site-muted">Connectez-vous : vos coordonnées seront remplies automatiquement.</p>
            <Field
              id="wb-login-email"
              label="Courriel"
              type="email"
              autoComplete="email"
              placeholder="vous@exemple.com"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />
            <div className="flex flex-col gap-1.5">
              <Field
                id="wb-login-password"
                label="Mot de passe"
                type="password"
                autoComplete="current-password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={openForgotPassword}
                className="flex min-h-11 items-center self-start text-sm font-semibold text-site-fg hover:underline"
              >
                Mot de passe oublié ?
              </button>
            </div>
          </form>
        )}
      </div>

      <WebBookingStepActions
        summary={summary}
        secondary={
          showForgotPassword ? (
            <WebBookingSecondaryAction onClick={closeForgotPassword}>Annuler</WebBookingSecondaryAction>
          ) : null
        }
      >
        <WebBookingCta type="submit" form={activeFormId} disabled={loading || (showForgotPassword && forgotSuccess)}>
          {loading ? <Loader2 className="size-5 animate-spin" /> : ctaLabel}
        </WebBookingCta>
      </WebBookingStepActions>
    </>
  );
}
