import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PAIMENTS_METHOD,
  OPTIONS_CATEGORIES,
  VERIFICATION_STATUS,
} from "@/shared/constantes";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface ReceiptHeaderProps {
  formData: any;
  setFormData: (data: any) => void;
  isEditing: boolean;
  category: string;
  setCategory: (category: string) => void;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  verificationStatus: string;
  setVerificationStatus: (status: string) => void;
}

export function ReceiptHeader({
  formData,
  setFormData,
  category,
  setCategory,
  paymentMethod,
  setPaymentMethod,
  currentDate,
  setCurrentDate,
  verificationStatus,
  setVerificationStatus,
}: ReceiptHeaderProps) {
  // console.log("category", category);
  return (
    <>
      <div className="justify-between space-y-4 lg:space-y-0">
        <div className="">
          <Label># Receipt</Label>
          <Input
            value={formData.receiptNumber}
            onChange={(e) =>
              setFormData({
                ...formData,
                receiptNumber: e.target.value,
              })
            }
          />
        </div>
        <div className="">
          <Label>Payment Method</Label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAIMENTS_METHOD.map((method) => (
                <SelectItem key={method.value} value={method.value}>
                  {method.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="">
          <Label>Payement Status</Label>
          <Select
            value={verificationStatus}
            onValueChange={setVerificationStatus}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VERIFICATION_STATUS.map((method) => (
                <SelectItem key={method.value} value={method.value}>
                  {method.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="justify-between space-y-4 ">
        <div className="lg:w-full">
          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OPTIONS_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="lg:w-full">
          <Label>Store Name</Label>
          <Input
            value={formData.storeName}
            onChange={(e) =>
              setFormData({
                ...formData,
                storeName: e.target.value,
              })
            }
            placeholder="Nom du commerce"
          />
        </div>
      </div>
      {/* Date */}
      <div className="space-x-4">
        <Label>Date : </Label>

        <Popover>
          <PopoverTrigger asChild>
            <Button className="w-3/4 lg:w-2/5" variant="outline">
              {format(currentDate, "dd/MM/yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <Calendar
              mode="single"
              selected={currentDate}
              onSelect={(date) => date && setCurrentDate(date)}
            />
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}
