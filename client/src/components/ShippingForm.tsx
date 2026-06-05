import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Mail, Phone, User, MapPin, FileText, MapPinned, ShoppingBag, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";

interface ShippingFormData {
  fullName: string;
  email: string;
  phone: string;
  document: string;
  address: string;
  city: string;
  postalCode: string;
  additionalInfo: string;
}

const WHATSAPP_NUMBER = "573156272088";

export default function ShippingForm() {
  const { items, totalPrice, clearCart } = useCart();
  const [formData, setFormData] = useState<ShippingFormData>({
    fullName: "",
    email: "",
    phone: "",
    document: "",
    address: "",
    city: "",
    postalCode: "",
    additionalInfo: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{ orderNumber: string; orderDate: string } | null>(null);

  // tRPC mutation for submitting order
  const submitOrderMutation = trpc.orders.submit.useMutation({
    onSuccess: (data) => {
      setOrderSuccess({
        orderNumber: data.orderNumber,
        orderDate: data.orderDate,
      });
      
      if (data.emailSent) {
        toast.success("¡Pedido enviado correctamente!", {
          description: "Se ha enviado una factura por correo electrónico.",
        });
      } else {
        toast.success("¡Pedido registrado!", {
          description: "Tu pedido ha sido procesado correctamente.",
        });
      }
    },
    onError: (error) => {
      console.error("Error submitting order:", error);
      toast.error("Error al procesar el pedido", {
        description: "Por favor intenta nuevamente o contacta por WhatsApp.",
      });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.fullName.trim()) {
      toast.error("Por favor ingresa tu nombre completo");
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      toast.error("Por favor ingresa un email válido");
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error("Por favor ingresa tu teléfono");
      return false;
    }
    if (!formData.document.trim()) {
      toast.error("Por favor ingresa tu documento de identidad");
      return false;
    }
    if (!formData.address.trim()) {
      toast.error("Por favor ingresa tu dirección");
      return false;
    }
    if (!formData.city.trim()) {
      toast.error("Por favor ingresa tu ciudad");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Preparar datos para el servidor
      const orderItems = items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      }));

      // Enviar pedido al servidor (esto enviará el email)
      await submitOrderMutation.mutateAsync({
        items: orderItems,
        shipping: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          document: formData.document,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode || undefined,
          additionalInfo: formData.additionalInfo || undefined,
        },
        totalPrice,
      });

      // Construir lista de productos para WhatsApp
      const itemsList = items.map(item => 
        `• ${item.name} (x${item.quantity}): $${(item.price * item.quantity).toLocaleString('es-CO')}`
      ).join('\n');

      // Construir el mensaje para WhatsApp
      const message = `
*📦 NUEVO PEDIDO - DATOS DE ENVÍO*

*📋 PRODUCTOS ORDENADOS:*
${itemsList}

*💰 Total del Pedido: $${totalPrice.toLocaleString('es-CO')}*

---

*👤 Información del Cliente:*
Nombre: ${formData.fullName}
📧 Email: ${formData.email}
📱 Teléfono: ${formData.phone}
🆔 Documento: ${formData.document}

*📍 Dirección de Envío:*
Dirección: ${formData.address}
🏙️ Ciudad: ${formData.city}
📮 Código Postal: ${formData.postalCode || "No especificado"}

${formData.additionalInfo ? `📝 Notas adicionales: ${formData.additionalInfo}` : ""}

---
✨ Mensaje enviado desde Los Deseos De Cupido
      `.trim();

      // Codificar el mensaje para URL
      const encodedMessage = encodeURIComponent(message);

      // Abrir WhatsApp con el mensaje
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
      window.open(whatsappUrl, "_blank");

      // Limpiar formulario
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        document: "",
        address: "",
        city: "",
        postalCode: "",
        additionalInfo: "",
      });

      // Limpiar carrito después de enviar
      clearCart();

    } catch (error) {
      // El error ya se maneja en onError del mutation
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mostrar pantalla de éxito si el pedido fue exitoso
  if (orderSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-green-200 bg-green-50/50 backdrop-blur">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">¡Pedido Enviado!</h2>
            <p className="text-green-700 mb-4">Tu pedido ha sido procesado correctamente.</p>
            
            <div className="bg-white rounded-lg p-4 mb-4 border border-green-200">
              <p className="text-sm text-neutral-600 mb-1">Número de Pedido:</p>
              <p className="text-lg font-bold text-primary">{orderSuccess.orderNumber}</p>
              <p className="text-xs text-neutral-500 mt-2">{orderSuccess.orderDate}</p>
            </div>
            
            <div className="space-y-2 text-sm text-neutral-600">
              <p>📧 Se ha enviado una copia de la factura a tu correo electrónico.</p>
              <p>📱 También puedes confirmar tu pedido por WhatsApp.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-primary/20 bg-white/50 backdrop-blur">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Datos de Envío</CardTitle>
              <CardDescription>
                Completa tus datos para procesar tu pedido
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Resumen de Productos */}
          {items.length > 0 && (
            <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <ShoppingBag className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm text-neutral-700">Resumen de Pedido</h3>
              </div>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm text-neutral-600">
                    <span>{item.name} (x{item.quantity})</span>
                    <span className="font-medium">${(item.price * item.quantity).toLocaleString('es-CO')}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-primary/20 mt-3 pt-3 flex justify-between font-bold text-neutral-800">
                <span>Total:</span>
                <span className="text-primary">${totalPrice.toLocaleString('es-CO')}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre Completo */}
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Nombre Completo *
              </label>
              <Input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Juan Pérez García"
                className="border-neutral-300 focus:border-primary"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email *
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="juan@example.com"
                className="border-neutral-300 focus:border-primary"
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Teléfono *
              </label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+57 315 1234567"
                className="border-neutral-300 focus:border-primary"
              />
            </div>

            {/* Documento */}
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documento de Identidad *
              </label>
              <Input
                type="text"
                name="document"
                value={formData.document}
                onChange={handleChange}
                placeholder="1234567890"
                className="border-neutral-300 focus:border-primary"
              />
            </div>

            {/* Dirección */}
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Dirección *
              </label>
              <Input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Calle 123 #45-67, Apartamento 8B"
                className="border-neutral-300 focus:border-primary"
              />
            </div>

            {/* Ciudad */}
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
                <MapPinned className="h-4 w-4" />
                Ciudad *
              </label>
              <Input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Bogotá"
                className="border-neutral-300 focus:border-primary"
              />
            </div>

            {/* Código Postal */}
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2">
                Código Postal (Opcional)
              </label>
              <Input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="110111"
                className="border-neutral-300 focus:border-primary"
              />
            </div>

            {/* Información Adicional */}
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2">
                Información Adicional (Opcional)
              </label>
              <textarea
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleChange}
                placeholder="Instrucciones especiales de entrega, referencias, etc."
                rows={3}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>

            {/* Botón de Envío */}
            <Button
              type="submit"
              disabled={isLoading || submitOrderMutation.isPending}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white font-semibold py-3 rounded-lg transition-all"
            >
              {isLoading || submitOrderMutation.isPending ? "Procesando..." : "Enviar Pedido"}
            </Button>

            <p className="text-xs text-neutral-500 text-center mt-3">
              * Campos obligatorios. Se enviará una factura a tu correo y los datos serán enviados a nuestro WhatsApp para procesar tu pedido.
            </p>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
