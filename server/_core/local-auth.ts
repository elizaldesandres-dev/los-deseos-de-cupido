import type { Request, Response } from "express";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import * as db from "../db";

// Fixed credentials
const ADMIN_USERNAME = "AngelaManager2026";
const ADMIN_PASSWORD = "Nose@metiche777*";

/**
 * Local authentication route handler
 * POST /api/auth/login - Authenticate with username and password
 */
export async function handleLocalLogin(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "Username and password are required",
      });
    }

    // Check credentials
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        error: "Invalid username or password",
      });
    }

    // Create a local openId for the admin user
    const localOpenId = "local_admin";
    const adminName = "Admin Manager";

    // Upsert user in database
    await db.upsertUser({
      openId: localOpenId,
      name: adminName,
      email: null,
      loginMethod: "local",
      role: "admin",
      lastSignedIn: new Date(),
    });

    // Create session token
    const sessionToken = await sdk.createSessionToken(localOpenId, {
      name: adminName,
    });

    // Set session cookie
    const cookieOptions = getSessionCookieOptions(req);
    res.cookie(COOKIE_NAME, sessionToken, cookieOptions);

    return res.json({
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    console.error("[Local Auth] Login error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

/**
 * Register local auth routes
 */
export function registerLocalAuthRoutes(app: any) {
  app.post("/api/auth/login", handleLocalLogin);
}
