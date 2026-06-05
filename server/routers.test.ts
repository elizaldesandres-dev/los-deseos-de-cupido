import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { createProduct, deleteProduct, getAllProducts } from "./db";

// Mock context for testing
const createMockContext = (isAdmin: boolean = false): TrpcContext => {
  return {
    req: {} as any,
    res: {} as any,
    user: isAdmin
      ? {
          id: 1,
          openId: "test-admin",
          name: "Admin User",
          email: "admin@test.com",
          loginMethod: "email",
          role: "admin" as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        }
      : undefined,
  };
};

describe("Products Router", () => {
  let testProductId: number;

  beforeAll(async () => {
    // Create a test product
    testProductId = await createProduct({
      name: "Test Product",
      category: "toys",
      price: 1000,
      rating: 5,
      reviews: 0,
      image: "test-image.jpg",
      stock: 10,
      active: 1,
    });
  });

  afterAll(async () => {
    // Clean up test product
    try {
      await deleteProduct(testProductId);
    } catch (error) {
      // Ignore if already deleted
    }
  });

  describe("products.list (public)", () => {
    it("should return active products for public users", async () => {
      const caller = appRouter.createCaller(createMockContext(false));
      const result = await caller.products.list();

      expect(Array.isArray(result)).toBe(true);
      // All returned products should be active
      result.forEach((product) => {
        expect(product.active).toBe(1);
      });
    });
  });

  describe("products.listAll (admin only)", () => {
    it("should return all products for admin users", async () => {
      const caller = appRouter.createCaller(createMockContext(true));
      const result = await caller.products.listAll();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("should throw error for non-admin users", async () => {
      const caller = appRouter.createCaller(createMockContext(false));

      await expect(caller.products.listAll()).rejects.toThrow();
    });
  });

  describe("products.getById (admin only)", () => {
    it("should return product by id for admin", async () => {
      const caller = appRouter.createCaller(createMockContext(true));
      const result = await caller.products.getById({ id: testProductId });

      expect(result).toBeDefined();
      expect(result?.id).toBe(testProductId);
      expect(result?.name).toBe("Test Product");
    });

    it("should throw error for non-admin users", async () => {
      const caller = appRouter.createCaller(createMockContext(false));

      await expect(caller.products.getById({ id: testProductId })).rejects.toThrow();
    });
  });

  describe("products.create (admin only)", () => {
    it("should create new product for admin", async () => {
      const caller = appRouter.createCaller(createMockContext(true));
      const result = await caller.products.create({
        name: "New Test Product",
        category: "lingerie",
        price: 1500,
        rating: 5,
        reviews: 0,
        image: "new-test-image.jpg",
        stock: 5,
        active: 1,
      });

      expect(result.success).toBe(true);
      expect(result.id).toBeDefined();

      // Clean up
      await deleteProduct(result.id);
    });

    it("should throw error for non-admin users", async () => {
      const caller = appRouter.createCaller(createMockContext(false));

      await expect(
        caller.products.create({
          name: "Unauthorized Product",
          category: "toys",
          price: 1000,
          rating: 5,
          reviews: 0,
          image: "test.jpg",
          stock: 10,
          active: 1,
        })
      ).rejects.toThrow();
    });
  });

  describe("products.update (admin only)", () => {
    it("should update existing product for admin", async () => {
      const caller = appRouter.createCaller(createMockContext(true));
      const result = await caller.products.update({
        id: testProductId,
        name: "Updated Test Product",
        price: 1200,
      });

      expect(result.success).toBe(true);

      // Verify update
      const updated = await caller.products.getById({ id: testProductId });
      expect(updated?.name).toBe("Updated Test Product");
      expect(updated?.price).toBe(1200);
    });

    it("should throw error for non-admin users", async () => {
      const caller = appRouter.createCaller(createMockContext(false));

      await expect(
        caller.products.update({
          id: testProductId,
          name: "Unauthorized Update",
        })
      ).rejects.toThrow();
    });
  });

  describe("products.delete (admin only)", () => {
    it("should delete product for admin", async () => {
      // Create a product to delete
      const tempId = await createProduct({
        name: "To Delete",
        category: "oils",
        price: 500,
        rating: 5,
        reviews: 0,
        image: "delete-test.jpg",
        stock: 1,
        active: 1,
      });

      const caller = appRouter.createCaller(createMockContext(true));
      const result = await caller.products.delete({ id: tempId });

      expect(result.success).toBe(true);

      // Verify deletion
      const allProducts = await getAllProducts();
      const found = allProducts.find((p) => p.id === tempId);
      expect(found).toBeUndefined();
    });

    it("should throw error for non-admin users", async () => {
      const caller = appRouter.createCaller(createMockContext(false));

      await expect(caller.products.delete({ id: testProductId })).rejects.toThrow();
    });
  });

  describe("products.uploadImage (admin only)", () => {
    it("should upload image for admin", async () => {
      const caller = appRouter.createCaller(createMockContext(true));
      
      // Create a simple base64 test image (1x1 transparent PNG)
      const testImageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

      const result = await caller.products.uploadImage({
        fileName: "test-upload.png",
        fileData: testImageBase64,
        mimeType: "image/png",
      });

      expect(result.url).toBeDefined();
      expect(result.key).toBeDefined();
      expect(result.key).toContain("products/");
    });

    it("should throw error for non-admin users", async () => {
      const caller = appRouter.createCaller(createMockContext(false));

      await expect(
        caller.products.uploadImage({
          fileName: "unauthorized.jpg",
          fileData: "base64data",
          mimeType: "image/jpeg",
        })
      ).rejects.toThrow();
    });
  });
});
