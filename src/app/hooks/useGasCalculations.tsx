import { useMemo } from "react";

const TPS_RATE = 0.05;
const TVQ_RATE = 0.09975;

interface GasCalculationResult {
  preTaxAmount: number;
  tps: number;
  tvq: number;
  total: number;
}

export const useGasCalculations = (
  totalAmountWithTaxes: number
): GasCalculationResult => {
  return useMemo(() => {
    // Prix avant taxes = Prix TTC / (1 + TPS + TVQ)
    const preTaxAmount = totalAmountWithTaxes / (1 + TPS_RATE + TVQ_RATE);

    // Calcul des taxes
    const tps = preTaxAmount * TPS_RATE;
    const tvq = preTaxAmount * TVQ_RATE;

    return {
      preTaxAmount: Number(preTaxAmount.toFixed(2)),
      tps: Number(tps.toFixed(2)),
      tvq: Number(tvq.toFixed(2)),
      total: Number(totalAmountWithTaxes.toFixed(2)),
    };
  }, [totalAmountWithTaxes]);
};
