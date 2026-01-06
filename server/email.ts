import nodemailer from "nodemailer";

// Configuración del correo de destino para las facturas
const OWNER_EMAIL = "angelajaramillo828@gmail.com";

// Credenciales SMTP de Gmail
const SMTP_CONFIG = {
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "angelajaramillo828@gmail.com",
    pass: "xzcqfmrsitltcaid", // Contraseña de aplicación de Gmail
  },
};

// Configuración del transporter de nodemailer
const transporter = nodemailer.createTransport(SMTP_CONFIG);

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface ShippingData {
  fullName: string;
  email: string;
  phone: string;
  document: string;
  address: string;
  city: string;
  postalCode?: string;
  additionalInfo?: string;
}

export interface OrderData {
  items: OrderItem[];
  shipping: ShippingData;
  totalPrice: number;
  orderNumber: string;
  orderDate: string;
}

function generateInvoiceHTML(order: OrderData): string {
  const itemsHTML = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toLocaleString("es-CO")}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toLocaleString("es-CO")}</td>
      </tr>
    `
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Factura de Pedido - Los Deseos de Cupido</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #631cce 0%, #8b5cf6 100%); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">💜 Los Deseos de Cupido</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Tu tienda de confianza</p>
    </div>
    
    <!-- Order Info -->
    <div style="padding: 30px;">
      <div style="background-color: #f8f4ff; border-radius: 10px; padding: 20px; margin-bottom: 25px;">
        <h2 style="color: #631cce; margin: 0 0 15px 0; font-size: 20px;">📦 Nuevo Pedido Recibido</h2>
        <p style="margin: 5px 0; color: #666;"><strong>Número de Pedido:</strong> ${order.orderNumber}</p>
        <p style="margin: 5px 0; color: #666;"><strong>Fecha:</strong> ${order.orderDate}</p>
      </div>
      
      <!-- Customer Info -->
      <div style="margin-bottom: 25px;">
        <h3 style="color: #333; border-bottom: 2px solid #631cce; padding-bottom: 10px; margin-bottom: 15px;">👤 Información del Cliente</h3>
        <table style="width: 100%; font-size: 14px; color: #555;">
          <tr><td style="padding: 5px 0;"><strong>Nombre:</strong></td><td>${order.shipping.fullName}</td></tr>
          <tr><td style="padding: 5px 0;"><strong>Email:</strong></td><td>${order.shipping.email}</td></tr>
          <tr><td style="padding: 5px 0;"><strong>Teléfono:</strong></td><td>${order.shipping.phone}</td></tr>
          <tr><td style="padding: 5px 0;"><strong>Documento:</strong></td><td>${order.shipping.document}</td></tr>
        </table>
      </div>
      
      <!-- Shipping Info -->
      <div style="margin-bottom: 25px;">
        <h3 style="color: #333; border-bottom: 2px solid #631cce; padding-bottom: 10px; margin-bottom: 15px;">📍 Dirección de Envío</h3>
        <table style="width: 100%; font-size: 14px; color: #555;">
          <tr><td style="padding: 5px 0;"><strong>Dirección:</strong></td><td>${order.shipping.address}</td></tr>
          <tr><td style="padding: 5px 0;"><strong>Ciudad:</strong></td><td>${order.shipping.city}</td></tr>
          ${order.shipping.postalCode ? `<tr><td style="padding: 5px 0;"><strong>Código Postal:</strong></td><td>${order.shipping.postalCode}</td></tr>` : ""}
          ${order.shipping.additionalInfo ? `<tr><td style="padding: 5px 0;"><strong>Notas:</strong></td><td>${order.shipping.additionalInfo}</td></tr>` : ""}
        </table>
      </div>
      
      <!-- Products Table -->
      <div style="margin-bottom: 25px;">
        <h3 style="color: #333; border-bottom: 2px solid #631cce; padding-bottom: 10px; margin-bottom: 15px;">🛒 Productos Ordenados</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="background-color: #f8f4ff;">
              <th style="padding: 12px; text-align: left; color: #631cce;">Producto</th>
              <th style="padding: 12px; text-align: center; color: #631cce;">Cant.</th>
              <th style="padding: 12px; text-align: right; color: #631cce;">Precio</th>
              <th style="padding: 12px; text-align: right; color: #631cce;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>
      </div>
      
      <!-- Total -->
      <div style="background: linear-gradient(135deg, #631cce 0%, #8b5cf6 100%); border-radius: 10px; padding: 20px; text-align: right;">
        <span style="color: white; font-size: 18px;">Total del Pedido: </span>
        <span style="color: white; font-size: 24px; font-weight: bold;">$${order.totalPrice.toLocaleString("es-CO")}</span>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f8f4ff; padding: 20px; text-align: center; border-top: 1px solid #eee;">
      <p style="color: #666; margin: 0; font-size: 12px;">
        Este correo fue enviado automáticamente desde Los Deseos de Cupido<br>
        © ${new Date().getFullYear()} Los Deseos de Cupido - Todos los derechos reservados
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

function generatePlainText(order: OrderData): string {
  const itemsList = order.items
    .map(
      (item) =>
        `- ${item.name} (x${item.quantity}): $${(item.price * item.quantity).toLocaleString("es-CO")}`
    )
    .join("\n");

  return `
NUEVO PEDIDO - LOS DESEOS DE CUPIDO
====================================

Número de Pedido: ${order.orderNumber}
Fecha: ${order.orderDate}

INFORMACIÓN DEL CLIENTE
-----------------------
Nombre: ${order.shipping.fullName}
Email: ${order.shipping.email}
Teléfono: ${order.shipping.phone}
Documento: ${order.shipping.document}

DIRECCIÓN DE ENVÍO
------------------
Dirección: ${order.shipping.address}
Ciudad: ${order.shipping.city}
${order.shipping.postalCode ? `Código Postal: ${order.shipping.postalCode}` : ""}
${order.shipping.additionalInfo ? `Notas: ${order.shipping.additionalInfo}` : ""}

PRODUCTOS ORDENADOS
-------------------
${itemsList}

TOTAL: $${order.totalPrice.toLocaleString("es-CO")}

====================================
Los Deseos de Cupido
  `.trim();
}

export async function sendOrderInvoice(order: OrderData): Promise<boolean> {
  try {
    const mailOptions = {
      from: `"Los Deseos de Cupido" <angelajaramillo828@gmail.com>`,
      to: OWNER_EMAIL,
      subject: `📦 Nuevo Pedido #${order.orderNumber} - ${order.shipping.fullName}`,
      text: generatePlainText(order),
      html: generateInvoiceHTML(order),
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Email] Invoice sent successfully for order ${order.orderNumber}`);
    return true;
  } catch (error) {
    console.error("[Email] Error sending invoice:", error);
    return false;
  }
}

// También enviar copia al cliente si tiene email
export async function sendCustomerConfirmation(order: OrderData): Promise<boolean> {
  try {
    if (!order.shipping.email) {
      return false;
    }

    const mailOptions = {
      from: `"Los Deseos de Cupido" <angelajaramillo828@gmail.com>`,
      to: order.shipping.email,
      subject: `💜 Confirmación de tu Pedido #${order.orderNumber} - Los Deseos de Cupido`,
      text: generatePlainText(order),
      html: generateInvoiceHTML(order),
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Email] Customer confirmation sent to ${order.shipping.email}`);
    return true;
  } catch (error) {
    console.error("[Email] Error sending customer confirmation:", error);
    return false;
  }
}
