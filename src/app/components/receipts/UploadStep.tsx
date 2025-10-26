import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CameraOutlined, UploadOutlined } from "@ant-design/icons";
import { FileText, Image as ImageIcon, Upload } from "lucide-react";

export function UploadStep({
  handleFileChange,
}: {
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <Upload className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-lg font-medium">Téléchargez votre reçu</h3>
      </div>

      <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors">
        <div className="flex justify-center mb-4">
          <div className="bg-primary/10 p-4 rounded-full">
            <FileText className="h-8 w-8 text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Téléchargez une photo claire de votre reçu pour une meilleure
            analyse
          </p>

          <div className="flex justify-center mt-4">
            <label
              htmlFor="receipt-image"
              className="cursor-pointer bg-primary text-white rounded-md py-2 px-4 flex items-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <UploadOutlined />
              Parcourir
              <Input
                id="receipt-image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          <p className="text-xs text-gray-400 mt-3">
            Formats acceptés: JPG, PNG, PDF (max. 10 MB)
          </p>
        </div>
      </div>
    </div>
  );
}
