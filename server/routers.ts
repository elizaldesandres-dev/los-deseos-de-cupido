import { z } from "zod";
import { router, publicProcedure, adminProcedure } from "./_core/trpc";
import {
  getAllProducts,
  getActiveProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "./db";

export const appRouter = router({
  products: router({
    list: publicProcedure.query(async () => {
      return await getActiveProducts();
    }),

    listAll: adminProcedure.query(async () => {
      return await getAllProducts();
    }),

    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const product = await getProductById(input.id);
        if (!product) {
          throw new Error("Product not found");
        }
        return product;
      }),

    create: adminProcedure
      .input(
        z.object({
          name: z.string().min(1),
          category: z.enum(["toys", "lingerie", "oils", "kits"]),
          price: z.number().min(0),
          rating: z.number().min(1).max(5).default(5),
          reviews: z.number().min(0).default(0),
          image: z.string().optional(),
          images: z.array(z.string()).optional(),
          tag: z.string().nullable().optional(),
          description: z.string().nullable().optional(),
          stock: z.number().min(0).default(0),
          active: z.number().default(1),
        })
      )
      .mutation(async ({ input }) => {
        let finalImages = "";
        if (input.images) {
          finalImages = JSON.stringify(input.images);
        } else if (input.image) {
          finalImages = JSON.stringify([input.image]);
        } else {
          finalImages = JSON.stringify([]);
        }

        const id = await createProduct({
          name: input.name,
          category: input.category,
          price: input.price,
          rating: input.rating,
          reviews: input.reviews,
          images: finalImages,
          tag: input.tag ?? null,
          description: input.description ?? null,
          stock: input.stock,
          active: input.active,
        });

        return { success: true, id };
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          category: z.enum(["toys", "lingerie", "oils", "kits"]).optional(),
          price: z.number().min(0).optional(),
          rating: z.number().min(1).max(5).optional(),
          reviews: z.number().min(0).optional(),
          image: z.string().optional(),
          images: z.array(z.string()).optional(),
          tag: z.string().nullable().optional(),
          description: z.string().nullable().optional(),
          stock: z.number().min(0).optional(),
          active: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const updateData: any = { ...input };
        delete updateData.id;

        if (input.images) {
          updateData.images = JSON.stringify(input.images);
        } else if (input.image) {
          updateData.images = JSON.stringify([input.image]);
        }
        delete updateData.image;

        await updateProduct(input.id, updateData);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteProduct(input.id);
        return { success: true };
      }),

    uploadImage: adminProcedure
      .input(
        z.object({
          fileName: z.string(),
          fileData: z.string(), // Base64 encoded
          mimeType: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const dataUrl = `data:${input.mimeType};base64,${input.fileData}`;
        return { url: dataUrl, key: `products/${input.fileName}` };
      }),
  }),
});

export type AppRouter = typeof appRouter;
