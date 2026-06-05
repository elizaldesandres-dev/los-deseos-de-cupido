import { z } from "zod";
import { adminProcedure, publicProcedure, t } from "./_core/trpc";
import { db } from "./db";
import { 
  invitations, 
  wishes, 
  confirmations, 
  gallery, 
  analytics, 
  settings, 
  admins 
} from "../drizzle/schema";
import { eq, desc, sql } from "drizzle-orm";

export const appRouter = t.router({
  // Public procedures
  getInvitations: publicProcedure.query(async () => {
    return await db.select().from(invitations);
  }),

  getWishes: publicProcedure.query(async () => {
    return await db.select().from(wishes).orderBy(desc(wishes.createdAt));
  }),

  getGallery: publicProcedure.query(async () => {
    return await db.select().from(gallery).orderBy(desc(gallery.createdAt));
  }),

  getSettings: publicProcedure.query(async () => {
    const results = await db.select().from(settings);
    return results[0] || null;
  }),

  submitWish: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      return await db.insert(wishes).values({
        name: input.name,
        content: input.content,
      });
    }),

  submitConfirmation: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        attending: z.boolean(),
        guests: z.number().min(1),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await db.insert(confirmations).values({
        name: input.name,
        attending: input.attending,
        guests: input.guests,
        message: input.message,
      });
    }),

  recordVisit: publicProcedure
    .input(
      z.object({
        page: z.string(),
        referrer: z.string().optional(),
        device: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await db.insert(analytics).values({
        page: input.page,
        referrer: input.referrer,
        device: input.device,
      });
    }),

  // Admin procedures
  admin: t.router({
    getConfirmations: adminProcedure.query(async () => {
      return await db.select().from(confirmations).orderBy(desc(confirmations.createdAt));
    }),

    getAnalytics: adminProcedure.query(async () => {
      return await db.select().from(analytics).orderBy(desc(analytics.createdAt));
    }),

    updateSettings: adminProcedure
      .input(
        z.object({
          eventDate: z.string().optional(),
          eventLocation: z.string().optional(),
          welcomeMessage: z.string().optional(),
          contactEmail: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const existing = await db.select().from(settings).limit(1);
        if (existing.length > 0) {
          return await db
            .update(settings)
            .set(input)
            .where(eq(settings.id, existing[0].id));
        } else {
          return await db.insert(settings).values(input);
        }
      }),

    addGalleryItem: adminProcedure
      .input(
        z.object({
          url: z.string().url(),
          caption: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await db.insert(gallery).values({
          url: input.url,
          caption: input.caption,
        });
      }),

    deleteGalleryItem: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.delete(gallery).where(eq(gallery.id, input.id));
      }),

    addInvitation: adminProcedure
      .input(
        z.object({
          code: z.string().min(1),
          maxGuests: z.number().min(1),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await db.insert(invitations).values({
          code: input.code,
          maxGuests: input.maxGuests,
          notes: input.notes,
        });
      }),

    deleteInvitation: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.delete(invitations).where(eq(invitations.id, input.id));
      }),

    deleteWish: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.delete(wishes).where(eq(wishes.id, input.id));
      }),

    // Admin management
    getAdmins: adminProcedure.query(async () => {
      return await db.select().from(admins);
    }),

    deleteAdmin: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.delete(admins).where(eq(admins.id, input.id));
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
  }),
});

export type AppRouter = typeof appRouter;
