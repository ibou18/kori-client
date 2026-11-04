"use client";

import PageWrapper from "@/app/components/block/PageWrapper";
import {
  useDeleteSalonSiteLogo,
  useGetSalon,
  useGetSalonSite,
  useUpdateSalonSite,
  useUploadSalonSiteLogo,
} from "@/app/data/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  contrastRatio,
  normalizeHex,
  onColor,
  PRIMARY_PRESETS,
  resolveSalonTheme,
  salonInitials,
  SALON_FONT_OPTIONS,
  SALON_SITE_PREVIEW_MESSAGE,
  SALON_SITE_PREVIEW_READY,
  SALON_TEMPLATES,
  SECONDARY_PRESETS,
  type SalonSiteDto,
  type SalonSiteFontKey,
  type SalonSiteTemplate,
} from "@/app/[locale]/salon/[id]/theme/salonTheme";
import { SALON_FONT_FAMILIES } from "@/app/[locale]/salon/[id]/theme/fonts";
import {
  AlertTriangle,
  Check,
  ExternalLink,
  ImagePlus,
  Loader2,
  Monitor,
  RotateCcw,
  Smartphone,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface Draft {
  template: SalonSiteTemplate;
  primaryColor: string;
  secondaryColor: string;
  font: SalonSiteFontKey;
  tagline: string;
}

const draftFromSite = (site: SalonSiteDto | null | undefined): Draft => {
  const t = resolveSalonTheme(site);
  return {
    template: t.template,
    primaryColor: t.primaryColor,
    secondaryColor: t.secondaryColor,
    font: t.font,
    tagline: t.tagline ?? "",
  };
};

const LOGO_MAX_BYTES = 2 * 1024 * 1024;

/**
 * Éditeur du mini-site : formulaire à gauche, vraie page salon en aperçu à
 * droite (iframe `?preview=1`). Chaque réglage est poussé à l'iframe par
 * `postMessage` ; rien n'est enregistré avant « Publier ».
 */
export default function MonSitePage() {
  const params = useParams();
  const locale = (params.locale as string) || "fr";
  const { data: session } = useSession();
  const salonId = (session?.user as { salonId?: string } | undefined)?.salonId ?? "";

  const { data: salonRes } = useGetSalon(salonId);
  const { data: siteRes, isLoading } = useGetSalonSite(salonId);
  const updateSite = useUpdateSalonSite();
  const uploadLogo = useUploadSalonSiteLogo();
  const deleteLogo = useDeleteSalonSiteLogo();

  const salon = (salonRes as any)?.data ?? salonRes;
  const savedSite = (siteRes?.data ?? null) as SalonSiteDto | null;

  const [draft, setDraft] = useState<Draft>(() => draftFromSite(null));
  const [dirty, setDirty] = useState(false);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [iframeReady, setIframeReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Charger le brouillon depuis la version publiée (une fois, ou après publication).
  useEffect(() => {
    if (isLoading || dirty) return;
    setDraft(draftFromSite(savedSite));
  }, [savedSite, isLoading, dirty]);

  const previewSite: SalonSiteDto = useMemo(
    () => ({
      template: draft.template,
      primaryColor: draft.primaryColor,
      secondaryColor: draft.secondaryColor,
      font: draft.font,
      tagline: draft.tagline || null,
      logoUrl: savedSite?.logoUrl ?? null,
    }),
    [draft, savedSite?.logoUrl],
  );

  const postPreview = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: SALON_SITE_PREVIEW_MESSAGE, site: previewSite },
      window.location.origin,
    );
  }, [previewSite]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if ((e.data as { type?: string })?.type === SALON_SITE_PREVIEW_READY) {
        setIframeReady(true);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (iframeReady) postPreview();
  }, [iframeReady, postPreview]);

  const patch = (p: Partial<Draft>) => {
    setDraft((d) => ({ ...d, ...p }));
    setDirty(true);
  };

  const secondaryContrast = contrastRatio(draft.secondaryColor, onColor(draft.secondaryColor));
  const primaryOnWhiteContrast = contrastRatio(draft.primaryColor, "#FFFFFF");
  const lowContrast = secondaryContrast < 4.5 || primaryOnWhiteContrast < 3;

  const onPublish = () => {
    updateSite.mutate(
      {
        salonId,
        data: {
          template: draft.template,
          primaryColor: draft.primaryColor,
          secondaryColor: draft.secondaryColor,
          font: draft.font,
          tagline: draft.tagline.trim() || null,
        },
      },
      { onSuccess: () => setDirty(false) },
    );
  };

  const onReset = () => {
    setDraft(draftFromSite(null));
    setDirty(true);
  };

  const onPickLogo = (file: File | undefined) => {
    if (!file) return;
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      alert("Logo : PNG ou JPG uniquement.");
      return;
    }
    if (file.size > LOGO_MAX_BYTES) {
      alert("Logo : 2 Mo maximum.");
      return;
    }
    uploadLogo.mutate({ salonId, file });
  };

  const previewUrl = salonId ? `/${locale}/salon/${salonId}?preview=1` : "";
  const publicUrl = salonId ? `/${locale}/salon/${salonId}` : "";
  const initials = salonInitials(salon?.name);

  if (!salonId) {
    return (
      <PageWrapper title="Mon mini-site">
        <p className="text-sm text-slate-600">Aucun salon associé à ce compte.</p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Mon mini-site"
      description="Couleurs, police, logo : votre page publique à votre image. Les clients y réservent directement."
      actions={
        publicUrl ? (
          <Button asChild variant="outline" size="sm">
            <a href={publicUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-4" />
              Voir la page publique
            </a>
          </Button>
        ) : undefined
      }
    >
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        {/* ---------------- Formulaire ---------------- */}
        <aside className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
          <Field label="Template">
            <div className="grid grid-cols-3 gap-2">
              {SALON_TEMPLATES.map((t) => {
                const active = draft.template === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    disabled={!t.available}
                    aria-pressed={active}
                    title={t.available ? t.description : "Bientôt disponible"}
                    onClick={() => patch({ template: t.key })}
                    className={`rounded-xl border-2 p-2 text-left text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
                      active ? "border-[#53745D]" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span
                      className="mb-1.5 block h-9 rounded-md"
                      style={{
                        background:
                          t.key === "BOLD"
                            ? `linear-gradient(180deg, #111, ${draft.primaryColor})`
                            : `linear-gradient(135deg, ${draft.primaryColor}, ${draft.secondaryColor})`,
                      }}
                    />
                    <span className="font-semibold text-slate-800">{t.label}</span>
                    {!t.available && <span className="block text-[10px] text-slate-500">Bientôt</span>}
                  </button>
                );
              })}
            </div>
          </Field>

          <ColorField
            id="primaryColor"
            label="Couleur principale"
            hint="Titres, bandeau, filtres."
            value={draft.primaryColor}
            presets={PRIMARY_PRESETS}
            onChange={(v) => patch({ primaryColor: v })}
          />
          <ColorField
            id="secondaryColor"
            label="Couleur secondaire"
            hint="Bouton Réserver, logo, étoiles."
            value={draft.secondaryColor}
            presets={SECONDARY_PRESETS}
            onChange={(v) => patch({ secondaryColor: v })}
          />

          <div
            className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs ${
              lowContrast ? "bg-amber-50 text-amber-900" : "bg-emerald-50 text-emerald-900"
            }`}
          >
            {lowContrast ? (
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
            ) : (
              <Check className="mt-0.5 size-3.5 shrink-0" />
            )}
            <span>
              {lowContrast
                ? `Contraste faible (bouton ${secondaryContrast.toFixed(1)}:1). Choisissez un accent plus foncé ou plus clair pour rester lisible.`
                : `Lisibilité OK — bouton ${secondaryContrast.toFixed(1)}:1, texte sur bandeau ${primaryOnWhiteContrast.toFixed(1)}:1.`}
            </span>
          </div>

          <Field label="Police des titres" htmlFor="font">
            <select
              id="font"
              value={draft.font}
              onChange={(e) => patch({ font: e.target.value as SalonSiteFontKey })}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              style={{ fontFamily: SALON_FONT_FAMILIES[draft.font] }}
            >
              {SALON_FONT_OPTIONS.map((f) => (
                <option key={f.key} value={f.key} style={{ fontFamily: SALON_FONT_FAMILIES[f.key] }}>
                  {f.label} · {f.mood}
                </option>
              ))}
            </select>
            <p
              className="mt-2 truncate rounded-lg bg-slate-50 px-3 py-2 text-2xl text-slate-800"
              style={{
                fontFamily: SALON_FONT_FAMILIES[draft.font],
                textTransform: SALON_FONT_OPTIONS.find((f) => f.key === draft.font)?.uppercase
                  ? "uppercase"
                  : "none",
              }}
            >
              {salon?.name || "Nom du salon"}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Le corps de texte reste en DM Sans ; la police ne change que le nom et les titres.
            </p>
          </Field>

          <Field label="Phrase d'accroche (optionnelle)" htmlFor="tagline">
            <Input
              id="tagline"
              maxLength={120}
              placeholder="Ex. Spécialistes des cheveux texturés depuis 2019"
              value={draft.tagline}
              onChange={(e) => patch({ tagline: e.target.value })}
            />
            <p className="mt-1 text-right text-[11px] tabular-nums text-slate-400">{draft.tagline.length}/120</p>
          </Field>

          <Field label="Logo">
            <div className="flex items-center gap-3">
              <div
                className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl text-xl font-semibold ring-2 ring-white shadow"
                style={{
                  background: `linear-gradient(135deg, ${draft.secondaryColor}, ${draft.primaryColor})`,
                  color: onColor(draft.secondaryColor),
                  fontFamily: SALON_FONT_FAMILIES[draft.font],
                }}
              >
                {savedSite?.logoUrl ? (
                  <Image src={savedSite.logoUrl} alt="Logo" width={64} height={64} className="size-full object-cover" />
                ) : (
                  initials || "?"
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <input
                  ref={fileInputRef}
                  id="logo"
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={(e) => {
                    onPickLogo(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={uploadLogo.isPending}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadLogo.isPending ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
                  {savedSite?.logoUrl ? "Remplacer" : "Importer un logo"}
                </Button>
                {savedSite?.logoUrl && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700"
                    disabled={deleteLogo.isPending}
                    onClick={() => deleteLogo.mutate({ salonId })}
                  >
                    <Trash2 className="size-4" />
                    Retirer (initiales)
                  </Button>
                )}
                <p className="text-[11px] text-slate-500">PNG ou JPG, carré, 2 Mo max. Sans logo : initiales « {initials} ».</p>
              </div>
            </div>
          </Field>

          <div className="flex gap-2 border-t border-slate-100 pt-4">
            <Button type="button" variant="outline" onClick={onReset} className="flex-1">
              <RotateCcw className="size-4" />
              Réinitialiser
            </Button>
            <Button
              type="button"
              onClick={onPublish}
              disabled={!dirty || updateSite.isPending}
              className="flex-1 bg-[#53745D] hover:bg-[#3a5a47]"
            >
              {updateSite.isPending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              Publier
            </Button>
          </div>
          {dirty && (
            <p className="text-center text-[11px] text-amber-700">Modifications non publiées : l'aperçu seul les montre.</p>
          )}
        </aside>

        {/* ---------------- Aperçu ---------------- */}
        <section className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm text-slate-600">Aperçu en direct de votre page publique.</p>
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
              <DeviceButton active={device === "desktop"} onClick={() => setDevice("desktop")} label="Ordinateur">
                <Monitor className="size-4" />
              </DeviceButton>
              <DeviceButton active={device === "mobile"} onClick={() => setDevice("mobile")} label="Mobile">
                <Smartphone className="size-4" />
              </DeviceButton>
            </div>
          </div>
          <div className="flex justify-center rounded-2xl border border-slate-200 bg-slate-100 p-3">
            <div
              className={`overflow-hidden rounded-xl bg-white shadow-lg transition-all ${
                device === "mobile" ? "w-[390px] max-w-full" : "w-full"
              }`}
              style={{ height: "min(78vh, 900px)" }}
            >
              {previewUrl && (
                <iframe
                  ref={iframeRef}
                  key={previewUrl}
                  src={previewUrl}
                  title="Aperçu du mini-site"
                  className="size-full"
                  onLoad={() => setIframeReady(true)}
                />
              )}
            </div>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}

function ColorField({
  id,
  label,
  hint,
  value,
  presets,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  value: string;
  presets: readonly string[];
  onChange: (hex: string) => void;
}) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  return (
    <Field label={label} htmlFor={id}>
      <div className="flex flex-wrap items-center gap-1.5">
        {presets.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={c}
            aria-pressed={c === value}
            onClick={() => onChange(c)}
            className={`size-7 rounded-full border-2 transition-transform hover:scale-110 ${
              c === value ? "border-slate-900" : "border-white shadow"
            }`}
            style={{ background: c }}
          />
        ))}
        <label
          className="relative size-7 cursor-pointer overflow-hidden rounded-full border border-dashed border-slate-400"
          title="Couleur personnalisée"
        >
          <input
            id={id}
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            className="absolute -inset-2 size-12 cursor-pointer opacity-0"
          />
          <span className="pointer-events-none absolute inset-0" style={{ background: `conic-gradient(red, yellow, lime, cyan, blue, magenta, red)` }} />
        </label>
        <Input
          aria-label={`${label} (hex)`}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            const hex = normalizeHex(e.target.value);
            if (hex) onChange(hex);
          }}
          className="h-8 w-24 font-mono text-xs uppercase"
        />
      </div>
      <p className="mt-1 text-[11px] text-slate-500">{hint}</p>
    </Field>
  );
}

function DeviceButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      onClick={onClick}
      className={`rounded-md p-1.5 transition-colors ${active ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"}`}
    >
      {children}
    </button>
  );
}
