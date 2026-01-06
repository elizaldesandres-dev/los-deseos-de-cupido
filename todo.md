# Project TODO

## Panel de Administración
- [x] Definir schema de productos en base de datos
- [x] Crear helpers de base de datos para productos
- [x] Crear procedimientos tRPC para CRUD de productos
- [x] Crear componente AdminProductList
- [x] Crear componente AdminProductForm con subida de imágenes
- [x] Crear página Admin.tsx con protección de ruta
- [x] Actualizar Shop.tsx para cargar productos desde BD
- [x] Escribir tests unitarios para procedimientos de productos

## Páginas de Detalle de Producto
- [x] Crear página ProductDetail.tsx con vista completa del producto
- [x] Hacer clickeable toda la tarjeta del producto en Shop.tsx
- [x] Añadir ruta de detalle de producto en App.tsx

## Ajustes de UI
- [x] Eliminar botón 'Agregar a Favoritos' de ProductDetail.tsx
## Formato de Moneda y Mejoras de UI
- [x] Actualizar formato de precios a pesos colombianos (COP) en Shop.tsx
- [x] Actualizar formato de precios a pesos colombianos (COP) en ProductDetail.tsx
- [x] Actualizar formato de precios a pesos colombianos (COP) en CartSheet.tsx
- [x] Mejorar estilos de pestañas de categorías para mejor contraste

## Correcciones de Moneda y Rediseño de UI
- [x] Cambiar etiqueta 'Precio (USD)' a 'Precio (COP)' en AdminProductForm.tsx
- [x] Rediseñar barra de búsqueda con colores elegantes (morado-gris, rosa suave)
- [x] Rediseñar pestañas de categorías con nuevos colores (morado activo, gris oscuro inactivo)

## Galería de Múltiples Imágenes por Producto
- [x] Actualizar schema de base de datos para soportar array de URLs de imágenes
- [x] Ejecutar migración de base de datos (pnpm db:push)
- [x] Modificar AdminProductForm para permitir subir hasta 5 imágenes
- [x] Actualizar procedimientos tRPC para manejar múltiples imágenes
- [x] Implementar galería interactiva con miniaturas en ProductDetail.tsx
- [x] Actualizar Shop.tsx para usar la primera imagen del array
- [x] Probar flujo completo: subir múltiples imágenes → ver en detalle

## Bug Fixes
- [x] Corregir error en AdminProductList.tsx al intentar acceder a product.image en lugar de product.images

## Cambios de Diseño - Colores
- [x] Cambiar fondo de página Shop de negro a color pastel suave (similar a la imagen de referencia)

## Funcionalidad de Ordenamiento en Tienda
- [x] Crear dropdown de ordenamiento en lugar de modal
- [x] Implementar ordenamiento por precio (menor-mayor, mayor-menor)
- [x] Implementar ordenamiento por calificación (mayor a menor)
- [x] Implementar ordenamiento por fecha (más nuevos)
- [x] Implementar ordenamiento por popularidad (más reseñas)
- [x] Conectar botón de filtros con dropdown de ordenamiento
- [x] Aplicar ordenamiento a la lista de productos en tiempo real

## Navegación y UX
- [x] Agregar botón de "Volver" en página de detalle del producto

## Compartir en Redes Sociales
- [x] Crear componente de botones de compartir
- [x] Implementar compartir en WhatsApp
- [x] Implementar compartir en Instagram
- [x] Implementar copiar enlace al portapapeles
- [x] Integrar botones en ProductDetail.tsx
- [x] Mostrar notificación de éxito al copiar enlace

## Navegación Tienda
- [x] Agregar botón de volver a inicio desde la tienda

## Formulario de Envío Manual
- [x] Crear componente de formulario con campos: nombre, email, teléfono, documento, dirección, ciudad, etc.
- [x] Implementar validación de campos
- [x] Crear función para enviar datos a WhatsApp automáticamente
- [x] Integrar formulario en el carrito/checkout
- [x] Mostrar confirmación después de enviar datos
- [x] Guardar datos en base de datos para registro interno

## Mejoras al Formulario de Envío
- [x] Incluir productos del carrito en el mensaje de WhatsApp
- [x] Mostrar resumen de productos en el formulario
- [x] Calcular total con productos en el mensaje

## UX - Formulario de Envío
- [x] Hacer formulario scrollable para acceder al botón de envío

## Optimización de Código
- [x] Auditar y limpiar componentes principales
- [x] Optimizar contextos, hooks y utilidades
- [x] Limpiar páginas y eliminar código muerto
- [x] Verificar que todo funciona correctamente

## Carrito de Compras - Scrollable
- [x] Hacer carrito scrollable cuando hay más de 4 productos

## Acceso al Carrito desde Tienda
- [x] Agregar botón de Ver Carrito en la página de tienda
