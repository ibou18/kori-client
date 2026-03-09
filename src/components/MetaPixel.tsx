"use client";

import Script from "next/script";

const META_PIXEL_ID = "1791816544825246";

export function MetaPixel() {
  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

// Fonction utilitaire pour tracker des événements personnalisés Meta Pixel
export const trackMetaEvent = (
  eventName: string,
  eventData?: Record<string, any>,
) => {
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("track", eventName, eventData);
  }
};

// Fonction utilitaire pour tracker la conversion (inscription complétée)
export const trackMetaConversion = (email?: string, phone?: string) => {
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("track", "CompleteRegistration", {
      content_type: "prestataire_beaute",
      ...(email && { email }),
      ...(phone && { phone_number: phone }),
    });
  }
};
