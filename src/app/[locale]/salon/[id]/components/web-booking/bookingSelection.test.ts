/**
 * Tests unitaires — sélection de plusieurs prestations (web-booking)
 * Couvre : totaux, durée, déplacement unique (le plus élevé), règles d'ajout
 * (4 max, 12 h, doublon, lieu), payload `services` et formats.
 */
import { describe, expect, it } from "vitest";
import {
  buildBookingServicesPayload,
  canAddService,
  formatDurationMinutes,
  formatSelectionLabel,
  getBookingSubtotalDollars,
  getBookingTravelFeeDollars,
  getSelectionLocations,
  getServicesTotalDollars,
  getTotalDurationMinutes,
  lineFromService,
  servicesSignature,
} from "./bookingSelection";
import type { WebBookingServicePayload } from "./types";

const svc = (
  id: string,
  overrides: Partial<WebBookingServicePayload> = {},
): WebBookingServicePayload => ({
  id,
  name: `Service ${id}`,
  duration: 60,
  options: [{ id: `${id}-o1`, name: "Standard", price: 50 }],
  availableLocations: ["SALON_ONLY", "HOME_ONLY"],
  travelFees: 10,
  ...overrides,
});

const line = (service: WebBookingServicePayload, order = 1) =>
  lineFromService(service, service.options![0], order);

describe("totaux", () => {
  it("sums effective prices and durations", () => {
    const a = svc("a", { options: [{ id: "a1", name: "A", price: 50, discountPrice: 40 }] });
    const b = svc("b", { duration: 90 });
    const lines = [line(a, 1), line(b, 2)];
    expect(getServicesTotalDollars(lines)).toBe(90);
    expect(getTotalDurationMinutes(lines)).toBe(150);
  });
});

describe("déplacement", () => {
  it("charges the highest fee once, only for home service", () => {
    const lines = [line(svc("a", { travelFees: 15 }), 1), line(svc("b", { travelFees: 25 }), 2)];
    expect(getBookingTravelFeeDollars(lines, true)).toBe(25);
    expect(getBookingTravelFeeDollars(lines, false)).toBe(0);
    expect(getBookingSubtotalDollars(lines, true)).toBe(125);
  });

  it("has no default fee when a service declares none", () => {
    const lines = [line(svc("a", { travelFees: null }), 1)];
    expect(getBookingTravelFeeDollars(lines, true)).toBe(0);
    expect(getSelectionLocations(lines)).toEqual(["SALON_ONLY"]);
  });
});

describe("canAddService", () => {
  it("accepts a compatible service", () => {
    expect(canAddService([line(svc("a"))], svc("b"))).toEqual({ ok: true });
  });

  it("refuses beyond 4 services", () => {
    const lines = ["a", "b", "c", "d"].map((id, i) => line(svc(id), i + 1));
    expect(canAddService(lines).ok).toBe(false);
    expect(canAddService(lines, svc("e"))).toMatchObject({ reason: "MAX_SERVICES" });
  });

  it("refuses the same service twice", () => {
    expect(canAddService([line(svc("a"))], svc("a"))).toMatchObject({
      reason: "DUPLICATE",
    });
  });

  it("refuses a service with no common location", () => {
    const homeOnly = svc("a", { availableLocations: ["HOME_ONLY"] });
    const salonOnly = svc("b", { availableLocations: ["SALON_ONLY"] });
    expect(canAddService([line(homeOnly)], salonOnly)).toMatchObject({
      reason: "INCOMPATIBLE_LOCATION",
    });
  });

  it("refuses beyond 720 minutes in total", () => {
    const lines = [line(svc("a", { duration: 360 }), 1), line(svc("b", { duration: 240 }), 2)];
    expect(canAddService(lines, svc("c", { duration: 150 }))).toMatchObject({
      reason: "MAX_DURATION",
    });
    expect(canAddService(lines, svc("c", { duration: 120 }))).toEqual({ ok: true });
  });
});

describe("payload et empreinte", () => {
  it("sends one line per service, travel fee on the first only", () => {
    const lines = [line(svc("a", { travelFees: 15 }), 1), line(svc("b", { travelFees: 25 }), 2)];
    const payload = buildBookingServicesPayload(lines, true);
    expect(payload).toHaveLength(2);
    expect(payload[0]).toMatchObject({ serviceId: "a", optionId: "a-o1", travelFee: 25 });
    expect(payload[1]).not.toHaveProperty("travelFee");
    expect(buildBookingServicesPayload(lines, false)[0]).not.toHaveProperty("travelFee");
  });

  it("signature follows selection order", () => {
    const a = line(svc("a"), 1);
    const b = line(svc("b"), 2);
    expect(servicesSignature([a, b])).toBe("a:a-o1|b:b-o1");
    expect(servicesSignature([b, a])).toBe("a:a-o1|b:b-o1");
    expect(servicesSignature([{ ...b, order: 1 }, { ...a, order: 2 }])).toBe(
      "b:b-o1|a:a-o1",
    );
  });
});

describe("formats", () => {
  it("formats durations as hours and minutes", () => {
    expect(formatDurationMinutes(45)).toBe("45 min");
    expect(formatDurationMinutes(90)).toBe("1h30");
    expect(formatDurationMinutes(120)).toBe("2h");
  });

  it("labels the selection", () => {
    const lines = ["a", "b", "c"].map((id, i) => line(svc(id), i + 1));
    expect(formatSelectionLabel(lines.slice(0, 2))).toBe("Service a + Service b");
    expect(formatSelectionLabel(lines)).toBe("Service a + 2 autres");
    expect(formatSelectionLabel(lines, 3)).toBe("Service a + Service b + Service c");
  });
});
