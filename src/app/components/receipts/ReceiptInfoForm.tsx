import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  OPTIONS_CATEGORIES,
  PAIMENTS_METHOD,
  VERIFICATION_STATUS,
} from "@/shared/constantes";
import {
  CalendarIcon,
  CreditCard,
  DollarSign,
  MessageSquare,
  ReceiptText,
  Store,
  Tag,
  CircleDollarSign,
} from "lucide-react";

interface ReceiptInfoFormProps {
  formData: any;
  handleInputChange: any;
  handleSelectChange: (name: string, value: string) => void;
  calculateSubtotal: () => string;
}

export function ReceiptInfoForm({
  formData,
  handleInputChange,
  handleSelectChange,
  calculateSubtotal,
}: ReceiptInfoFormProps) {
  return (
    <div className="bg-white rounded-lg  shadow-sm border border-gray-100 space-y-6">
      {/* <h3 className="text-lg font-medium border-b pb-3">
        Informations du reçu
      </h3> */}

      <div className="space-y-4">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="storeName" className="flex items-center gap-2">
              <Store className="h-4 w-4 text-gray-500" />
              Nom du commerce
            </Label>
            <Input
              id="storeName"
              name="storeName"
              value={formData.storeName}
              onChange={handleInputChange}
              placeholder="Ex: IGA, Canadian Tire..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-gray-500" />
              Date
            </Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="receiptNumber" className="flex items-center gap-2">
              <ReceiptText className="h-4 w-4 text-gray-500" />
              Numéro de reçu
            </Label>
            <Input
              id="receiptNumber"
              name="receiptNumber"
              value={formData.receiptNumber}
              onChange={handleInputChange}
              placeholder="Numéro du reçu (facultatif)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-gray-500" />
              Catégorie
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleSelectChange("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une catégorie" />
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

        <div className="border-t pt-4 mt-4">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-500" />
            Montants et taxes
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 col-span-3">
              <Label htmlFor="totalAmount">Montant total</Label>
              <Input
                id="totalAmount"
                name="totalAmount"
                value={formData.totalAmount}
                onChange={handleInputChange}
                type="number"
                step="0.01"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tps">TPS</Label>
              <Input
                id="tps"
                name="tps"
                value={formData.tps}
                onChange={handleInputChange}
                type="number"
                step="0.01"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tvq">TVQ</Label>
              <Input
                id="tvq"
                name="tvq"
                value={formData.tvq}
                onChange={handleInputChange}
                type="number"
                step="0.01"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="tips">Pourboire</Label>
              <Input
                id="tips"
                name="tips"
                value={formData.tips}
                onChange={handleInputChange}
                type="number"
                step="0.01"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2 col-span-3">
              <Label htmlFor="subtotal">Sous-total (calculé)</Label>
              <Input
                id="subtotal"
                value={calculateSubtotal()}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 border-t pt-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="paymentMethod" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-gray-500" />
              Méthode de paiement
            </Label>
            <Select
              value={formData.paymentMethod}
              onValueChange={(value) =>
                handleSelectChange("paymentMethod", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une méthode" />
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

          <div className="space-y-2">
            <Label
              htmlFor="verificationStatus"
              className="flex items-center gap-2"
            >
              <CircleDollarSign className="h-4 w-4 text-gray-500" />
              Statut de vérification
            </Label>
            <Select
              value={formData.verificationStatus}
              onValueChange={(value) =>
                handleSelectChange("verificationStatus", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un statut" />
              </SelectTrigger>
              <SelectContent>
                {VERIFICATION_STATUS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2 border-t pt-4 mt-4">
          <Label htmlFor="description" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-gray-500" />
            Commentaires
          </Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Ajoutez des notes ou commentaires sur ce reçu..."
            className="resize-none"
          />
        </div>
      </div>
    </div>
  );
}
