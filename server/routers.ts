import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, adminProcedure } from "./_core/trpc";
import { getAllProducts, getActiveProducts, getProductById, createProduct, updateProduct, deleteProduct } from "./db";
import { storagePut } from "./storage";
import { sendOrderInvoice, sendCustomerConfirmation, type OrderData } from "./email";
import { z } from "zod";
import { nanoid } from "nanoid";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Orders router for handling checkout and invoice emails
  orders: router({
    // Public: Submit order and send invoice email
    submit: publicProcedure
      .input(
        z.object({
          items: z.array(
            z.object({
              name: z.string(),
              quantity: z.number().int().positive(),
              price: z.number().positive(),
            })
          ).min(1),
          shipping: z.object({
            fullName: z.string().min(1),
            email: z.string().email(),
            phone: z.string().min(1),
            document: z.string().min(1),
            address: z.string().min(1),
            city: z.string().min(1),
            postalCode: z.string().optional(),
            additionalInfo: z.string().optional(),
          }),
          totalPrice: z.number().positive(),
        })
      )
      .mutation(async ({ input }) => {
        // Generate order number
        const orderNumber = `CUP-${Date.now().toString(36).toUpperCase()}-${nanoid(4).toUpperCase()}`;
        
        // Format date
        const orderDate = new Date().toLocaleString("es-CO", {
          dateStyle: "full",
          timeStyle: "short",
          timeZone: "America/Bogota",
        });

        const orderData: OrderData = {
          items: input.items,
          shipping: input.shipping,
          totalPrice: input.totalPrice,
          orderNumber,
          orderDate,
        };

        // Send invoice to owner email (angelajaramillo828@gmail.com)
        const ownerEmailSent = await sendOrderInvoice(orderData);
        
        // Send confirmation to customer
        const customerEmailSent = await sendCustomerConfirmation(orderData);

        console.log(`[Orders] Order ${orderNumber} processed. Owner email: ${ownerEmailSent}, Customer email: ${customerEmailSent}`);

        return {
          success: true,
          orderNumber,
          orderDate,
          emailSent: ownerEmailSent,
          customerEmailSent,
        };
      }),
  }),

  products: router({
    // Public: Get all active products for shop
    list: publicProcedure.query(async () => {
      return await getActiveProducts();
    }),

    // Admin: Get all products (including inactive)
    listAll: adminProcedure.query(async () => {
      return await getAllProducts();
    }),

    // Admin: Get single product by ID
    getById: adminProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return await getProductById(input.id);
    }),

    // Admin: Create new product
    create: adminProcedure
      .input(
        z.object({
          name: z.string().min(1),
          category: z.enum(["toys", "lingerie", "oils", "kits"]),
          price: z.number().int().positive(),
          rating: z.number().int().min(1).max(5).default(5),
          reviews: z.number().int().min(0).default(0),
          images: z.array(z.string().min(1)).min(1),
          tag: z.string().nullable().optional(),
          description: z.string().nullable().optional(),
          stock: z.number().int().min(0).default(0),
          active: z.number().int().min(0).max(1).default(1),
        })
      )
      .mutation(async ({ input }) => {
        const productData = {
          ...input,
          images: JSON.stringify(input.images),
        };
        const productId = await createProduct(productData);
        return { id: productId, success: true };
      }),

    // Admin: Update existing product
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).optional(),
          category: z.enum(["toys", "lingerie", "oils", "kits"]).optional(),
          price: z.number().int().positive().optional(),
          rating: z.number().int().min(1).max(5).optional(),
          reviews: z.number().int().min(0).optional(),
          images: z.array(z.string().min(1)).min(1).optional(),
          tag: z.string().nullable().optional(),
          description: z.string().nullable().optional(),
          stock: z.number().int().min(0).optional(),
          active: z.number().int().min(0).max(1).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const processedData = {
          ...data,
          images: data.images ? JSON.stringify(data.images) : undefined,
        };
        await updateProduct(id, processedData);
        return { success: true };
      }),

    // Admin: Delete product
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await deleteProduct(input.id);
      return { success: true };
    }),

    // Admin: Upload image (returns base64 data URL)
    uploadImage: adminProcedure
      .input(
        z.object({
          fileName: z.string(),
          fileData: z.string(), // Base64 encoded
          mimeType: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        // For now, we'll just return the data URL to be stored in the database
        // This avoids dependency on external storage like S3
        const dataUrl = `data:${input.mimeType};base64,${input.fileData}`;
        return { url: dataUrl, key: input.fileName };
      }),