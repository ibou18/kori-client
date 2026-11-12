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
import { Switch } from "@/components/ui/switch";
import {
  contrastRatio,
  CUSTOM_ACCENT_PRESETS,
  CUSTOM_SURFACE_PRESETS,
  FEATURED_FONT_OPTIONS,
  getFontOption,
  normalizeHex,
  resolvePalette,
  resolveSalonTheme,
  SALON_COLOR_THEMES,
  SALON_PRESET_PALETTES,
  SALON_TEMPLATES,
  SALON_SITE_PREVIEW_MESSAGE,
  SALON_SITE_PREVIEW_READY,
  salonInitials,
  type SalonPalette,
  type SalonSiteColorTheme,
  type SalonSiteDto,
  type SalonSiteFontKey,
  type SalonSiteTemplate,
} from "@/app/[locale]/salon/[id]/theme/salonTheme";
import { SALON_FONT_FAMILIES } from "@/app/[locale]/salon/[id]/theme/fonts";
import { cn } from "@/lib/utils";
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
  showLogo: boolean;
  colorTheme: SalonSiteColorTheme;
  primaryColor: string;
  secondaryColor: string;
  font: SalonSiteFontKey;
  tagline: string;
}

const draftFromSite = (site: SalonSiteDto | null | undefined): Draft => {
  const t = resolveSalonTheme(site);
  return {
    template: t.template,
    showLogo: t.showLogo,
    colorTheme: t.colorTheme,
    primaryColor: t.primaryColor,
    secondaryColor: t.secondaryColor,
    font: t.font,
    tagline: t.tagline ?? "",
  };
};

const LOGO_MAX_BYTES = 2 * 1024 * 1024;

/**
 * Éditeur du mini-site (KAN-16) : gabarit d'entête, logo (avec ou sans), thème
 * de couleurs prédéfini ou personnalisé, police, accroche. Formulaire à gauche,
 * vraie page salon en aperçu à droite (iframe `?preview=1`). Chaque réglage est
 * poussé à l'iframe par `postMessage` ; rien n'est enregistré avant « Publier ».
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
  const [device, setDevice] = useState<"desktop" | "mobile">("mobile");
  const [iframeReady, setIframeReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Charger le brouillon depuis la version publiée, une seule fois. Après
  // « Publier », le brouillon est resynchronisé depuis la réponse du serveur.
  const initializedRef = useRef(false);
  useEffect(() => {
    if (isLoading || initializedRef.current) return;
    initializedRef.current = true;
    setDraft(draftFromSite(savedSite));
  }, [savedSite, isLoading]);

  const previewSite: SalonSiteDto = useMemo(
    () => ({
      template: draft.template,
      showLogo: draft.showLogo,
      colorTheme: draft.colorTheme,
      primaryColor: draft.primaryColor,
      secondaryColor: draft.secondaryColor,
      font: draft.font,
      tagline: draft.tagline || null,
      logoUrl: savedSite?.logoUrl ?? null,
    }),
    [draft, savedSite?.logoUrl],
  );

  const palette = useMemo(
    () => resolvePalette(draft.colorTheme, draft.primaryColor, draft.secondaryColor),
    [draft.colorTheme, draft.primaryColor, draft.secondaryColor],
  );

  // Toujours envoyer le dernier brouillon, même si l'iframe signale « prêt »
  // après un message déjà parti (hydratation plus tardive que `onLoad`).
  const previewSiteRef = useRef(previewSite);
  previewSiteRef.current = previewSite;
  const postPreview = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: SALON_SITE_PREVIEW_MESSAGE, site: previewSiteRef.current },
      window.location.origin,
    );
  }, []);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if ((e.data as { type?: string })?.type === SALON_SITE_PREVIEW_READY) {
        setIframeReady(true);
        postPreview();
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [postPreview]);

  useEffect(() => {
    if (iframeReady) postPreview();
  }, [iframeReady, previewSite, postPreview]);

  const patch = (p: Partial<Draft>) => {
    setDraft((d) => ({ ...d, ...p }));
    setDirty(true);
  };

  /** Passer en thème personnalisé : on part des couleurs du thème prédéfini courant. */
  const pickColorTheme = (key: SalonSiteColorTheme) => {
    if (key === "CUSTOM" && draft.colorTheme !== "CUSTOM") {
      const from = SALON_PRESET_PALETTES[draft.colorTheme as Exclude<SalonSiteColorTheme, "CUSTOM">];
      patch({ colorTheme: key, primaryColor: from.accent, secondaryColor: from.surface });
      return;
    }
    patch({ colorTheme: key });
  };

  // Lisibilité du thème personnalisé : texte sur le bouton, bouton sur le fond doux.
  const ctaContrast = contrastRatio(palette.accent, palette.onAccent);
  const accentOnSurface = contrastRatio(palette.accent, palette.surface);
  const lowContrast = draft.colorTheme === "CUSTOM" && (ctaContrast < 4.5 || accentOnSurface < 3);

  const onPublish = () => {
    updateSite.mutate(
      {
        salonId,
        data: {
          template: draft.template,
          showLogo: draft.showLogo,
          colorTheme: draft.colorTheme,
          primaryColor: draft.primaryColor,
          secondaryColor: draft.secondaryColor,
          font: draft.font,
          tagline: draft.tagline.trim() || null,
        },
      },
      {
        onSuccess: (res) => {
          setDraft(draftFromSite((res?.data as SalonSiteDto) ?? savedSite));
          setDirty(false);
        },
      },
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
  const initials = salonInitials(salon?.name) || "?";

  // Police historique (P1) encore enregistrée : on la garde sélectionnable.
  const fontChoices = useMemo(() => {
    const current = getFontOption(draft.font);
    return current.featured ? FEATURED_FONT_OPTIONS : [...FEATURED_FONT_OPTIONS, current];
  }, [draft.font]);

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
      description="Gabarit, logo, couleurs, police : votre page de réservation à votre image."
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
      <div className="grid gap-6 lg:grid-cols-[480px_1fr] xl:grid-cols-[560px_1fr]">
        {/* ---------------- Formulaire ---------------- */}
        <aside className="space-y-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto">
          {/* Gabarit */}
          <Field label="Gabarit d'entête" hint="La différence se joue sur l'entête ; le reste de la page est identique.">
            <div className="grid grid-cols-3 gap-2">
              {SALON_TEMPLATES.map((t) => {
                const active = draft.template === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    aria-pressed={active}
                    title={t.description}
                    onClick={() => patch({ template: t.key })}
                    className={cn(
                      "rounded-xl border-2 p-2 text-left text-xs transition-colors",
                      active ? "border-slate-900" : "border-slate-200 hover:border-slate-300",
                    )}
                  >
                    <TemplateSketch template={t.key} palette={palette} showLogo={draft.showLogo} />
                    <span className="mt-1.5 block font-semibold text-slate-800">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </Field>

          {/* Logo */}
          <Field label="Logo">
            <div className="flex items-center gap-3">
              <div
                className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-full text-xl font-bold shadow ring-4 ring-white"
                style={{
                  background: palette.accent,
                  color: palette.onAccent,
                  fontFamily: SALON_FONT_FAMILIES[draft.font],
                  opacity: draft.showLogo ? 1 : 0.4,
                }}
              >
                {savedSite?.logoUrl ? (
                  <Image src={savedSite.logoUrl} alt="Logo" width={64} height={64} className="size-full object-cover" />
                ) : (
                  initials
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
                  {savedSite?.logoUrl ? "Remplacer" : "Importer un logo ou une photo"}
                </Button>
                {savedSite?.logoUrl && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="justify-start text-red-600 hover:text-red-700"
                    disabled={deleteLogo.isPending}
                    onClick={() => deleteLogo.mutate({ salonId })}
                  >
                    <Trash2 className="size-4" />
                    Retirer (initiales « {initials} »)
                  </Button>
                )}
                <p className="text-[11px] text-slate-500">PNG ou JPG, carré, 2 Mo max.</p>
              </div>
            </div>
            <label className="mt-3 flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
              <span>
                <span className="font-medium text-slate-800">Afficher le logo sur la page</span>
                <span className="block text-[11px] text-slate-500">
                  Désactivé : entête sans logo ni initiales, seulement votre nom.
                </span>
              </span>
              <Switch checked={draft.showLogo} onChange={(v) => patch({ showLogo: v })} aria-label="Afficher le logo" className="shrink-0" />
            </label>
          </Field>

          {/* Thème de couleurs */}
          <Field label="Thème de couleurs">
            <div className="grid grid-cols-2 gap-2">
              {SALON_COLOR_THEMES.map((t) => {
                const active = draft.colorTheme === t.key;
                const p = t.key === "CUSTOM" ? (active ? palette : null) : SALON_PRESET_PALETTES[t.key];
                return (
                  <button
                    key={t.key}
                    type="button"
                    aria-pressed={active}
                    title={t.description}
                    onClick={() => pickColorTheme(t.key)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl border-2 p-2.5 text-left transition-colors",
                      active ? "border-slate-900" : "border-slate-200 hover:border-slate-300",
                    )}
                  >
                    <span className="flex shrink-0 -space-x-1.5">
                      {p ? (
                        [p.surface, p.accent, p.fg].map((c, i) => (
                          <span key={i} className="size-6 rounded-full border-2 border-white shadow-sm" style={{ background: c }} />
                        ))
                      ) : (
                        <span
                          className="size-6 rounded-full border-2 border-white shadow-sm"
                          style={{ background: "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)" }}
                        />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-slate-800">{t.label}</span>
                      <span className="block text-[11px] leading-snug text-slate-500">{t.description}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {draft.colorTheme === "CUSTOM" && (
              <div className="mt-3 space-y-4 rounded-xl bg-slate-50 p-3">
                <ColorField
                  id="primaryColor"
                  label="Couleur d'accent"
                  hint="Boutons Réserver, filtres, barre de progression, liens."
                  value={draft.primaryColor}
                  presets={CUSTOM_ACCENT_PRESETS}
                  onChange={(v) => patch({ primaryColor: v })}
                />
                <ColorField
                  id="secondaryColor"
                  label="Fond doux"
                  hint="Bande sous l'entête, pied de page, boutons retour."
                  value={draft.secondaryColor}
                  presets={CUSTOM_SURFACE_PRESETS}
                  onChange={(v) => patch({ secondaryColor: v })}
                />
                <div
                  className={cn(
                    "flex items-start gap-2 rounded-lg px-3 py-2 text-xs",
                    lowContrast ? "bg-amber-50 text-amber-900" : "bg-emerald-50 text-emerald-900",
                  )}
                >
                  {lowContrast ? <AlertTriangle className="mt-0.5 size-3.5 shrink-0" /> : <Check className="mt-0.5 size-3.5 shrink-0" />}
                  <span>
                    {lowContrast
                      ? `Contraste faible (bouton ${ctaContrast.toFixed(1)}:1, accent sur fond ${accentOnSurface.toFixed(1)}:1). Choisissez un accent plus foncé ou un fond plus clair.`
                      : `Lisibilité OK — bouton ${ctaContrast.toFixed(1)}:1, accent sur fond ${accentOnSurface.toFixed(1)}:1.`}
                  </span>
                </div>
              </div>
            )}
          </Field>

          {/* Police */}
          <Field label="Police" hint="Trois paires titres + texte. La police ne change pas la mise en page.">
            <div className="grid grid-cols-3 gap-2">
              {fontChoices.map((f) => {
                const active = draft.font === f.key;
                return (
                  <button
                    key={f.key}
                    type="button"
                    aria-pressed={active}
                    title={f.mood}
                    onClick={() => patch({ font: f.key })}
                    className={cn(
                      "flex flex-col items-start rounded-xl border-2 px-2.5 py-2 text-left transition-colors",
                      active ? "border-slate-900" : "border-slate-200 hover:border-slate-300",
                    )}
                  >
                    <span
                      className="text-2xl leading-none text-slate-900"
                      style={{ fontFamily: SALON_FONT_FAMILIES[f.key], textTransform: f.uppercase ? "uppercase" : "none" }}
                    >
                      Aa
                    </span>
                    <span className="mt-1.5 w-full text-xs font-semibold leading-tight text-slate-800">{f.label}</span>
                    <span className="w-full min-w-0 text-[10px] leading-snug text-slate-500">{f.mood}</span>
                  </button>
                );
              })}
            </div>
            <p
              className="mt-2 truncate rounded-lg bg-slate-50 px-3 py-2 text-2xl text-slate-800"
              style={{
                fontFamily: SALON_FONT_FAMILIES[draft.font],
                textTransform: getFontOption(draft.font).uppercase ? "uppercase" : "none",
              }}
            >
              {salon?.name || "Nom du salon"}
            </p>
          </Field>

          {/* Accroche */}
          <Field label="Phrase d'accroche (optionnelle)" htmlFor="tagline" hint="Remplace la liste de vos spécialités sous l'entête.">
            <Input
              id="tagline"
              maxLength={120}
              placeholder="Ex. Coiffeuse afro · Tresses · Locs · Tissage"
              value={draft.tagline}
              onChange={(e) => patch({ tagline: e.target.value })}
            />
            <p className="mt-1 text-right text-[11px] tabular-nums text-slate-400">{draft.tagline.length}/120</p>
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
              className="flex-1 bg-slate-900 hover:bg-slate-800"
            >
              {updateSite.isPending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              Publier
            </Button>
          </div>
          {dirty && (
            <p className="text-center text-[11px] text-amber-700">Modifications non publiées : l&apos;aperçu seul les montre.</p>
          )}
        </aside>

        {/* ---------------- Aperçu ---------------- */}
        <section className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm text-slate-600">Aperçu en direct de votre page publique.</p>
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
              <DeviceButton active={device === "mobile"} onClick={() => setDevice("mobile")} label="Mobile">
                <Smartphone className="size-4" />
              </DeviceButton>
              <DeviceButton active={device === "desktop"} onClick={() => setDevice("desktop")} label="Ordinateur">
                <Monitor className="size-4" />
              </DeviceButton>
            </div>
          </div>
          <div className="flex justify-center rounded-2xl border border-slate-200 bg-slate-100 p-3">
            <div
              className={cn(
                "overflow-hidden rounded-xl bg-white shadow-lg transition-all",
                device === "mobile" ? "w-[390px] max-w-full" : "w-full",
              )}
              style={{ height: "min(80vh, 900px)" }}
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

/** Croquis miniature d'un gabarit, aux couleurs du thème en cours. */
function TemplateSketch({
  template,
  palette,
  showLogo,
}: {
  template: SalonSiteTemplate;
  palette: SalonPalette;
  showLogo: boolean;
}) {
  const dot = showLogo ? (
    <span className="size-3 rounded-full border border-white" style={{ background: palette.accent }} />
  ) : null;
  const lines = (
    <>
      <span className="h-1 w-8 rounded" style={{ background: palette.fg }} />
      <span className="h-0.5 w-5 rounded" style={{ background: palette.muted }} />
    </>
  );
  if (template === "COMPACT") {
    return (
      <span className="flex h-14 flex-col gap-1.5 rounded-md p-1.5" style={{ background: palette.bg, border: `1px solid ${palette.border}` }}>
        <span className="flex items-center gap-1">
          {dot}
          <span className="h-1 w-8 rounded" style={{ background: palette.fg }} />
        </span>
        <span className="flex-1 rounded-md" style={{ background: palette.media }} />
      </span>
    );
  }
  return (
    <span className="flex h-14 flex-col overflow-hidden rounded-md" style={{ border: `1px solid ${palette.border}` }}>
      <span className={template === "BANNER" ? "h-4" : "h-6"} style={{ background: palette.media }} />
      <span className="flex flex-1 flex-col items-center gap-0.5 pt-0.5" style={{ background: palette.surface }}>
        {dot && <span className="-mt-2">{dot}</span>}
        {lines}
      </span>
    </span>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
        {label}
      </label>
      {children}
      {hint && <p className="mt-2 text-[11px] text-slate-500">{hint}</p>}
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
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-slate-700">
        {label}
      </label>
      <div className="flex flex-wrap items-center gap-1.5">
        {presets.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={c}
            aria-pressed={c === value}
            onClick={() => onChange(c)}
            className={cn(
              "size-7 rounded-full border-2 transition-transform hover:scale-110",
              c === value ? "border-slate-900" : "border-white shadow",
            )}
            style={{ background: c }}
          />
        ))}
        <label className="relative size-7 cursor-pointer overflow-hidden rounded-full border border-dashed border-slate-400" title="Couleur personnalisée">
          <input
            id={id}
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            className="absolute -inset-2 size-12 cursor-pointer opacity-0"
          />
          <span
            className="pointer-events-none absolute inset-0"
            style={{ background: "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)" }}
          />
        </label>
        <Input
          aria-label={`${label} (hex)`}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            const hex = normalizeHex(e.target.value);
            if (hex) onChange(hex);
          }}
          className="h-8 w-24 bg-white font-mono text-xs uppercase"
        />
      </div>
      <p className="mt-1 text-[11px] text-slate-500">{hint}</p>
    </div>
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
      className={cn("rounded-md p-1.5 transition-colors", active ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100")}
    >
      {children}
    </button>
  );
}
