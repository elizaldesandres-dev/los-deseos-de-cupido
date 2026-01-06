import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import axios from "axios";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID ?? "";
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET ?? "";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerGitHubOAuthRoutes(app: Express) {
  // Redirect to GitHub for authentication
  app.get("/api/oauth/github/login", (req: Request, res: Response) => {
    // Always use HTTPS in production
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : req.protocol;
    const redirectUri = `${protocol}://${req.get("host")}/api/oauth/callback`;
    const scope = "read:user user:email";
    
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
    
    res.redirect(githubAuthUrl);
  });

  // Handle GitHub OAuth callback
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const error = getQueryParam(req, "error");

    if (error) {
      console.error("[GitHub OAuth] Error:", error);
      res.redirect("/?error=oauth_denied");
      return;
    }

    if (!code) {
      res.status(400).json({ error: "code is required" });
      return;
    }

    try {
      // Exchange code for access token
      const tokenResponse = await axios.post(
        "https://github.com/login/oauth/access_token",
        {
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
        },
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      const accessToken = tokenResponse.data.access_token;

      if (!accessToken) {
        console.error("[GitHub OAuth] No access token received:", tokenResponse.data);
        res.status(400).json({ error: "Failed to get access token" });
        return;
      }

      // Get user info from GitHub
      const userResponse = await axios.get("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const githubUser = userResponse.data;

      // Get user email (may be private)
      let email = githubUser.email;
      if (!email) {
        try {
          const emailsResponse = await axios.get("https://api.github.com/user/emails", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          const primaryEmail = emailsResponse.data.find((e: any) => e.primary);
          email = primaryEmail?.email || emailsResponse.data[0]?.email;
        } catch (e) {
          console.warn("[GitHub OAuth] Could not fetch emails:", e);
        }
      }

      const openId = `github_${githubUser.id}`;
      const name = githubUser.name || githubUser.login;

      // Upsert user in database
      await db.upsertUser({
        openId,
        name: name || null,
        email: email ?? null,
        loginMethod: "github",
        lastSignedIn: new Date(),
      });

      // Create session token
      const sessionToken = await sdk.createSessionToken(openId, {
        name: name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // Redirect to admin panel after successful login
      res.redirect(302, "/admin");
    } catch (error) {
      console.error("[GitHub OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
