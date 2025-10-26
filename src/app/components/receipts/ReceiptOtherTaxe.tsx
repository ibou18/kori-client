"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

import { InfoIcon } from "lucide-react";

import { Textarea } from "@/components/ui/textarea";

export default function ReceiptOtherTaxe({
  tps,
  tvq,
  tpsRate,
  tvqRate,
  handleChangeTPS,
  handleChangeTVQ,
  handleDescription,
  description,
  total,
  totalAmountReceipt,
  setTotalAmountReceipt,
  tips,
  setTips,
  category,
}: {
  tps: any;
  tvq: any;
  tpsRate: any;
  tvqRate: any;
  handleChangeTPS: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleChangeTVQ: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDescription: (value: string) => void;
  description: string;
  total: number;
  totalAmountReceipt: number;
  setTotalAmountReceipt: (value: any) => void;
  tips: number;
  setTips: (value: number) => void;
  category: string;
}) {
  return (
    <div className="space-y-6">
      {/* Section Montants */}
      <div className="grid lg:grid-cols-1 gap-6">
        {/* Montant Principal */}
        <div className="space-y-3 bg-slate-50 p-4 rounded-lg ">
          <div>
            <Label className="flex items-center gap-x-2 text-xl font-bold ">
              Total Avec Taxes
              <Popover>
                <PopoverTrigger asChild>
                  <InfoIcon size={15} className="text-slate-500" />
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="text-sm text-slate-600">
                    Saisissez le montant total AVEC les taxes (TPS/TVQ)
                  </div>
                </PopoverContent>
              </Popover>
            </Label>
          </div>

          <Input
            type="number"
            className="h-14 font-mono text-right bg-white"
            style={{ fontSize: "2rem" }}
            placeholder="0.00"
            value={totalAmountReceipt}
            min={0}
            onChange={(e) => setTotalAmountReceipt(e.target.value)}
          />
        </div>
        {/* Tips */}
        {category !== "ESSENCE" && (
          <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
            <Label className="text-xl font-bold">Pourboire</Label>
            <Input
              type="number"
              className="h-10 font-mono text-right bg-white"
              style={{ fontSize: "2rem" }}
              placeholder="0.00"
              value={tips}
              onChange={(e) => setTips(Number(e.target.value))}
            />
          </div>
        )}
      </div>

      {/* Taxes et Total */}
      <div className="bg-slate-50 p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-bold mb-4">Taxe resume : </h3>

        <div className="grid lg:grid-cols-2 gap-4 mb-6">
          {/* TPS */}
          <div className="space-y-2">
            <Label>TPS (%)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={tpsRate}
                onChange={handleChangeTPS}
                className="text-right bg-white"
                placeholder="5"
                inputMode="decimal"
                min={0}
              />
              <span className="font-bold w-24 text-right">
                {Number(tps).toFixed(2)} $
              </span>
            </div>
          </div>

          {/* TVQ */}
          <div className="space-y-2">
            <Label>TVQ (%)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={tvqRate}
                onChange={handleChangeTVQ}
                className="text-right bg-white"
                placeholder="9.975"
                inputMode="decimal"
                min={0}
              />
              <span className="font-bold w-24 text-right">
                {Number(tvq).toFixed(2)} $
              </span>
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold">Total :</span>
            <span className="text-3xl font-bold font-mono">
              {Number(total).toFixed(2)} $
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-slate-50 p-4 rounded-lg">
        <Label className="block mb-2 ">Descriptions / Comments</Label>
        <Textarea
          placeholder="Add a description or comments ..."
          value={description}
          onChange={(e) => handleDescription(e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );
}
