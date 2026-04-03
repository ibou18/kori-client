"use client";

import { registerApi } from "@/app/data/services";
import {
  getRegisterErrorMessage,
  phoneE164ForRegister,
  validateClientRegistrationNames,
  validateOptionalRegistrationPhone,
} from "./registerValidation";
import { Button } from "@/components/ui/button";
import { FormattedPhoneInput } from "@/components/ui/FormattedPhoneInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSession, signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface ClientQuickAuthPanelProps {
  onAuthenticated: () => void;
}

const phoneSelectClassName =
  "px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#53745D]/30 focus:border-[#53745D] disabled:bg-slate-50 disabled:cursor-not-allowed shrink-0 min-w-[9.5rem]";

export function ClientQuickAuthPanel({
  onAuthenticated,
}: ClientQuickAuthPanelProps) {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneDialCode, setPhoneDialCode] = useState("+1");
  const [phoneLocal, setPhoneLocal] = useState("");
  const [phoneFieldError, setPhoneFieldError] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const finishAuth = async () => {
    await getSession();
    onAuthenticated();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: loginEmail.trim(),
        password: loginPassword,
      });
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

      const phoneErr = validateOptionalRegistrationPhone(
        phoneDialCode,
        phoneLocal
      );
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
      if (phoneE164) {
        payload.phone = phoneE164;
      }

      const result = await registerApi(payload);
      if (!result?.token) {
        setError(
          (result as { message?: string })?.message ||
            "Inscription refusée. Vérifiez vos informations."
        );
        return;
      }
      const sign = await signIn("credentials", {
        redirect: false,
        email: regEmail.trim(),
        password: regPassword,
      });
      if (sign?.error) {
        setError(
          "Compte créé mais connexion automatique échouée. Connectez-vous manuellement."
        );
        return;
      }
      await finishAuth();
    } catch (err: unknown) {
      setError(getRegisterErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Connectez-vous ou créez un compte client en quelques secondes pour
        poursuivre la réservation.
      </p>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Connexion</TabsTrigger>
          <TabsTrigger value="register">Inscription</TabsTrigger>
        </TabsList>
        <TabsContent value="login" className="space-y-3 pt-2">
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <Label htmlFor="wb-login-email">Email</Label>
              <Input
                id="wb-login-email"
                type="email"
                autoComplete="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="wb-login-password">Mot de passe</Label>
              <Input
                id="wb-login-password"
                type="password"
                autoComplete="current-password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>
        </TabsContent>
        <TabsContent value="register" className="space-y-3 pt-2">
          <form onSubmit={handleRegister} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="wb-reg-fn">Prénom</Label>
                <Input
                  id="wb-reg-fn"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="wb-reg-ln">Nom</Label>
                <Input
                  id="wb-reg-ln"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="wb-reg-email">Email</Label>
              <Input
                id="wb-reg-email"
                type="email"
                autoComplete="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div className="mt-1">
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
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Optionnel. Choisissez l’indicatif puis saisissez le numéro local
                (formaté automatiquement).
              </p>
            </div>
            <div>
              <Label htmlFor="wb-reg-password">Mot de passe</Label>
              <Input
                id="wb-reg-password"
                type="password"
                autoComplete="new-password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
                minLength={5}
                className="mt-1"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Créer mon compte"
              )}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
