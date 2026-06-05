export const WHATSAPP_NUMBER = "573156272088"; // Número de Colombia
export const DEFAULT_MESSAGE = "Hola, quiero asesoría discreta para elegir un producto 💗";

// Definición de tipos para window.gtag
declare global {
  interface Window {
    gtag: (
      command: 'event', 
      action: string, 
      params?: { 
        event_category?: string; 
        event_label?: string; 
        value?: number;
        [key: string]: any;
      }
    ) => void;
  }
}

export function getWhatsAppLink(message: string = DEFAULT_MESSAGE) {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
}

export function openWhatsApp(message?: string, source: string = 'general') {
  // Track event in Google Analytics if available
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'click_whatsapp', {
      'event_category': 'contact',
      'event_label': source
    });
  }
  
  window.open(getWhatsAppLink(message), "_blank");
}
