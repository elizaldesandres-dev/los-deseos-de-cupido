import { Button } from "@/components/ui/button";
import { Share2, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ShareButtonsProps {
  productName: string;
  productId: number;
  productPrice: number;
}

export default function ShareButtons({ productName, productId, productPrice }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const productUrl = `${window.location.origin}/producto/${productId}`;
  const shareText = `Mira este producto: ${productName} - $${productPrice.toLocaleString('es-CO')} en Los Deseos De Cupido`;

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + productUrl)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleInstagramShare = () => {
    // Instagram no permite compartir directamente desde web, abrimos el perfil
    const instagramUrl = "https://instagram.com";
    window.open(instagramUrl, "_blank");
    toast.info("Abre Instagram y comparte el enlace del producto", {
      description: "Puedes copiar el enlace y pegarlo en tu historia o mensaje directo"
    });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      toast.success("Enlace copiado al portapapeles", {
        description: "Ya puedes compartirlo donde quieras"
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("No se pudo copiar el enlace");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Share2 className="w-5 h-5 text-neutral-600" />
        <span className="text-sm font-medium text-neutral-700">Compartir producto</span>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {/* WhatsApp Button */}
        <Button
          onClick={handleWhatsAppShare}
          variant="outline"
          className="flex-1 sm:flex-none gap-2 border-green-200 hover:border-green-400 text-green-700 hover:text-green-800 hover:bg-green-50"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.255.949c-1.238.503-2.335 1.236-3.356 2.259-1.02 1.023-1.756 2.12-2.259 3.359a9.9 9.9 0 00-.937 4.255c0 5.745 4.684 10.425 10.425 10.425 1.156 0 2.305-.203 3.412-.6 1.13-.41 2.17-.963 3.112-1.905.94-.94 1.495-1.982 1.905-3.112.396-1.107.6-2.256.6-3.412 0-5.741-4.68-10.425-10.425-10.425" />
          </svg>
          WhatsApp
        </Button>

        {/* Instagram Button */}
        <Button
          onClick={handleInstagramShare}
          variant="outline"
          className="flex-1 sm:flex-none gap-2 border-pink-200 hover:border-pink-400 text-pink-700 hover:text-pink-800 hover:bg-pink-50"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.322a1.44 1.44 0 110-2.881 1.44 1.44 0 010 2.881z" />
          </svg>
          Instagram
        </Button>

        {/* Copy Link Button */}
        <Button
          onClick={handleCopyLink}
          variant="outline"
          className="flex-1 sm:flex-none gap-2 border-blue-200 hover:border-blue-400 text-blue-700 hover:text-blue-800 hover:bg-blue-50"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copiar enlace
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
