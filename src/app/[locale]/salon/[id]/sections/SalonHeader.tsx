"use client";

import { MapPin, Star } from "lucide-react";
import { useSalonTheme } from "../theme/SalonThemeProvider";
import { getSalonTypeLabel, type PublicSalon } from "../types";
import { SalonAvatar } from "./SalonAvatar";
import { SalonPhotoCarousel, type CarouselPhoto } from "./SalonPhotoCarousel";

interface SalonHeaderProps {
  salon: PublicSalon;
  isEn: boolean;
  /** Ouvre l'onglet Avis (clic sur la note). */
  onShowReviews?: () => void;
}

/** Données d'identité communes aux trois gabarits. */
function useIdentity(salon: PublicSalon, isEn: boolean) {
  const theme = useSalonTheme();
  const types = (salon.salonTypes ?? []).slice(0, 3).map(getSalonTypeLabel);
  const overline = theme.tagline ?? types.join(" · ");
  const location = salon.address
    ? [salon.address.city, salon.address.province].filter(Boolean).join(", ")
    : "";
  const hasRating = (salon.reviewCount ?? 0) > 0 && salon.rating !== undefined;
  const ratingLabel = hasRating ? salon.rating!.toFixed(1).replace(".", isEn ? "." : ",") : "";
  const reviewsLabel = hasRating
    ? `${salon.reviewCount} ${isEn ? (salon.reviewCount === 1 ? "review" : "reviews") : "avis"}`
    : "";
  const photos: CarouselPhoto[] = (salon.photos ?? [])
    .filter((p) => p.url)
    .sort((a, b) => Number(b.isMain ?? false) - Number(a.isMain ?? false) || (a.order ?? 0) - (b.order ?? 0))
    .slice(0, 10);
  return { theme, overline, location, hasRating, ratingLabel, reviewsLabel, photos };
}

function RatingButton({
  ratingLabel,
  reviewsLabel,
  onClick,
  className = "",
}: {
  ratingLabel: string;
  reviewsLabel: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${ratingLabel} / 5, ${reviewsLabel}`}
      className={`flex min-h-9 items-center gap-1.5 text-site-fg ${className}`}
    >
      <Star className="size-[18px] fill-site-star text-site-star" />
      <strong className="font-semibold tabular-nums">{ratingLabel}</strong>
      <span className="text-site-muted">·</span>
      <span className="text-site-fg-2 underline underline-offset-[3px]">{reviewsLabel}</span>
    </button>
  );
}

/**
 * Bloc identité centré des gabarits Carrousel et Bannière : logo optionnel à
 * cheval sur l'image, surtitre (accroche ou spécialités), nom, note, ville.
 */
function CenteredIdentity({
  salon,
  isEn,
  onShowReviews,
  avatarSize,
}: SalonHeaderProps & { avatarSize: number }) {
  const { theme, overline, location, hasRating, ratingLabel, reviewsLabel } = useIdentity(salon, isEn);
  return (
    <section className="flex flex-col items-center gap-2.5 bg-site-surface px-5 pb-7 text-center">
      {theme.showLogo ? (
        <SalonAvatar name={salon.name} size={avatarSize} className="-mt-14" />
      ) : (
        <span aria-hidden className="h-1" />
      )}
      {overline && (
        <p className="mt-1 text-xs font-semibold uppercase tracking-[1px] text-site-muted">{overline}</p>
      )}
      <h1
        className="font-site-display text-[32px] font-bold leading-[1.1] tracking-[-0.5px] md:text-[40px]"
        style={{
          textTransform: "var(--site-display-transform)" as never,
          fontSize: "calc(clamp(2rem, 4vw, 2.5rem) * var(--site-display-scale))",
        }}
      >
        {salon.name}
      </h1>
      {hasRating && (
        <RatingButton ratingLabel={ratingLabel} reviewsLabel={reviewsLabel} onClick={onShowReviews} className="text-base" />
      )}
      {location && (
        <span className="flex items-center gap-1.5 text-sm text-site-fg-2">
          <MapPin className="size-[15px]" />
          {location}
        </span>
      )}
    </section>
  );
}

/** Gabarit 1 · Carrousel : les réalisations défilent en haut, puis l'identité centrée. */
function CarouselHeader(props: SalonHeaderProps) {
  const { theme, photos } = useIdentity(props.salon, props.isEn);
  return (
    <>
      <SalonPhotoCarousel
        photos={photos}
        altBase={props.isEn ? `${props.salon.name} work` : `Réalisations de ${props.salon.name}`}
        className={photos.length ? "h-[284px] md:h-[380px]" : "h-[150px] md:h-[200px]"}
        fadeTo="var(--site-surface)"
        dotsOffsetClass={theme.showLogo ? "bottom-[66px]" : "bottom-[38px]"}
        priority
        emptyLabel={props.isEn ? "Photos of your work" : "Photos de réalisations"}
        emptyHint={props.isEn ? "Add photos from the korí app" : "Ajoutez des photos depuis l'app korí"}
      />
      <CenteredIdentity {...props} avatarSize={68} />
    </>
  );
}

/** Gabarit 2 · Bannière : une photo fixe du salon en bandeau, puis l'identité centrée. */
function BannerHeader(props: SalonHeaderProps) {
  const { photos } = useIdentity(props.salon, props.isEn);
  const banner = photos[0];
  return (
    <>
      <SalonPhotoCarousel
        photos={banner ? [banner] : []}
        altBase={props.isEn ? `${props.salon.name} banner` : `Bannière de ${props.salon.name}`}
        className={banner ? "h-[200px] md:h-[300px]" : "h-[150px] md:h-[200px]"}
        fadeTo="var(--site-surface)"
        priority
        emptyLabel={props.isEn ? "Banner image" : "Image de bannière"}
        emptyHint={props.isEn ? "Salon photo · landscape, 1200 × 600 px" : "Photo du salon · format paysage, 1200 × 600 px"}
      />
      <CenteredIdentity {...props} avatarSize={72} />
    </>
  );
}

/** Gabarit 3 · Compact : logo et nom en ligne, puis un carrousel arrondi et des pastilles. */
function CompactHeader({ salon, isEn, onShowReviews }: SalonHeaderProps) {
  const { theme, overline, location, hasRating, ratingLabel, reviewsLabel, photos } = useIdentity(salon, isEn);
  return (
    <>
      <header className="flex items-center gap-3 px-5 pb-4 pt-5">
        {theme.showLogo && <SalonAvatar name={salon.name} size={52} ring={false} />}
        <div className="min-w-0">
          <h1
            className="font-site-display font-bold leading-[1.1] tracking-[-0.5px]"
            style={{
              textTransform: "var(--site-display-transform)" as never,
              fontSize: "calc(clamp(1.625rem, 3.5vw, 2rem) * var(--site-display-scale))",
            }}
          >
            {salon.name}
          </h1>
          {overline && <p className="mt-0.5 text-sm text-site-muted">{overline}</p>}
        </div>
      </header>
      <div className="px-5">
        <SalonPhotoCarousel
          photos={photos}
          altBase={isEn ? `${salon.name} work` : `Réalisations de ${salon.name}`}
          className="h-[300px] md:h-[400px]"
          rounded
          dotsOffsetClass="bottom-2"
          priority
          sizes="(min-width: 1024px) 960px, 100vw"
          emptyLabel={isEn ? "Photos of your work" : "Photos de réalisations"}
          emptyHint={isEn ? "Landscape or square · up to 10 photos" : "Format paysage ou carré · jusqu'à 10 photos"}
        />
      </div>
      <section className="flex flex-wrap gap-2 px-5 pb-5 pt-4">
        {hasRating && (
          <RatingButton
            ratingLabel={ratingLabel}
            reviewsLabel={reviewsLabel}
            onClick={onShowReviews}
            className="min-h-10 rounded-full border border-site-border bg-site-bg px-3.5 text-sm"
          />
        )}
        {location && (
          <span className="flex min-h-10 items-center gap-1.5 rounded-full bg-site-surface px-3.5 text-sm text-site-fg">
            <MapPin className="size-[15px]" />
            {location}
          </span>
        )}
      </section>
    </>
  );
}

/**
 * En-tête du mini-site : l'un des trois gabarits (KAN-16), chacun avec ou sans
 * logo selon `theme.showLogo`. Le reste de la page est commun aux gabarits.
 */
export function SalonHeader(props: SalonHeaderProps) {
  const theme = useSalonTheme();
  if (theme.template === "BANNER") return <BannerHeader {...props} />;
  if (theme.template === "COMPACT") return <CompactHeader {...props} />;
  return <CarouselHeader {...props} />;
}
