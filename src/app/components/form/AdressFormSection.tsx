import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTRIES } from "@/shared/constantes";

export default function AdressFormSection({
  formData,
  handleChange,
}: {
  formData: any;
  handleChange: (field: string, value: string) => void;
}) {
  return (
    <>
      {/* Adresses de ramassage */}
      <h3 className="text-lg font-semibold mb-4">Adresse de ramassage</h3>
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <Label htmlFor="pickupAddressNumber">Numéro</Label>
          <Input
            type="number"
            id="pickupAddressNumber"
            value={formData.pickupAddressNumber}
            onChange={(e) =>
              handleChange("pickupAddressNumber", e.target.value)
            }
            placeholder="Numéro"
          />
        </div>
        <div>
          <Label htmlFor="pickupAddress">Adresse</Label>
          <Input
            id="pickupAddress"
            value={formData.pickupAddress}
            onChange={(e) => handleChange("pickupAddress", e.target.value)}
            placeholder="Rue"
          />
        </div>
        <div>
          <Label htmlFor="pickupCity">Ville</Label>
          <Input
            id="pickupCity"
            value={formData.pickupCity}
            onChange={(e) => handleChange("pickupCity", e.target.value)}
            placeholder="Ville"
          />
        </div>
        <div>
          <Label htmlFor="pickupPostalCode">Code postal</Label>
          <Input
            id="pickupPostalCode"
            value={formData.pickupPostalCode}
            onChange={(e) => handleChange("pickupPostalCode", e.target.value)}
            placeholder="Code postal"
          />
        </div>
        <div>
          <Label htmlFor="pickupCountry">Pays</Label>
          {/* <Input
            id="pickupCountry"
            value={formData.pickupCountry}
            onChange={(e) => handleChange("pickupCountry", e.target.value)}
            placeholder="Pays"
          /> */}

          <Select
            value={formData.pickupCountry}
            onValueChange={(value) => handleChange("pickupCountry", value)}
          >
            <SelectTrigger id="pickupCountry">
              <SelectValue placeholder="Sélectionnez un pays" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country.value} value={country.value}>
                  {country.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="pickupAddressComplement">Complément</Label>
          <Input
            id="pickupAddressComplement"
            value={formData.pickupAddressComplement}
            onChange={(e) =>
              handleChange("pickupAddressComplement", e.target.value)
            }
            placeholder="Appartement, Bureau, etc."
          />
        </div>
      </div>

      {/* Adresses de livraison */}
      <h3 className="text-lg font-semibold mb-4">Adresse de livraison</h3>
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <Label htmlFor="deliveryAddressNumber">Numéro</Label>
          <Input
            type="number"
            id="deliveryAddressNumber"
            value={formData.deliveryAddressNumber}
            onChange={(e) =>
              handleChange("deliveryAddressNumber", e.target.value)
            }
            placeholder="Numéro"
          />
        </div>
        <div>
          <Label htmlFor="deliveryAddress">Adresse</Label>
          <Input
            id="deliveryAddress"
            value={formData.deliveryAddress}
            onChange={(e) => handleChange("deliveryAddress", e.target.value)}
            placeholder="Rue"
          />
        </div>
        <div>
          <Label htmlFor="deliveryCity">Ville</Label>
          <Input
            id="deliveryCity"
            value={formData.deliveryCity}
            onChange={(e) => handleChange("deliveryCity", e.target.value)}
            placeholder="Ville"
          />
        </div>
        <div>
          <Label htmlFor="deliveryPostalCode">Code postal</Label>
          <Input
            id="deliveryPostalCode"
            value={formData.deliveryPostalCode}
            onChange={(e) => handleChange("deliveryPostalCode", e.target.value)}
            placeholder="Code postal"
          />
        </div>
        <div>
          <Label htmlFor="deliveryCountry">Pays</Label>

          <Select
            value={formData.deliveryAddressComplement}
            onValueChange={(value) =>
              handleChange("deliveryAddressComplement", value)
            }
          >
            <SelectTrigger id="deliveryAddressComplement">
              <SelectValue placeholder="Sélectionnez un pays" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country.value} value={country.value}>
                  {country.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="deliveryAddressComplement">Complément</Label>
          <Input
            id="deliveryAddressComplement"
            value={formData.deliveryAddressComplement}
            onChange={(e) =>
              handleChange("deliveryAddressComplement", e.target.value)
            }
            placeholder="Appartement, Bureau, etc."
          />
        </div>
      </div>
    </>
  );
}
