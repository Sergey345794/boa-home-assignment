import express, { Request, Response, RequestHandler } from "express";
import dotenv from "dotenv";
import { shopifyApp } from "@shopify/shopify-app-express";
import { LATEST_API_VERSION, LogSeverity } from "@shopify/shopify-api";
import { MySQLSessionStorage } from "@shopify/shopify-app-session-storage-mysql";
import { prisma } from './libs/prisma/index.js';
import { z } from "zod";

// Theme Settings Schema
const themeSettingsSchema = z.object({
  text: z.string().min(1, "Text is required"),
  textColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color code"),
  backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color code"),
});

dotenv.config({ path: "./.env" });
const app = express();

app.use(express.json());

console.log("Loaded DATABASE_URL:", process.env.DATABASE_URL);



const shopify = shopifyApp({
  api: {
    apiVersion: LATEST_API_VERSION,
    logger: {
      level: LogSeverity.Error,
    },
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
  },
  webhooks: {
    path: "/api/webhooks",
  },
  sessionStorage: new MySQLSessionStorage(process.env.DATABASE_URL || ""),
});


// Get Customer ID
app.get(
  "/customer",
  shopify.validateAuthenticatedSession(),
  async (req, res) => {
    try {
      const session = res.locals.shopify.session;
      if (!session || !session.shop) {
         res.status(401).json({ error: "Unauthorized" });
      }

      const customerId = session.customer?.id; 
      if (!customerId) {
         res.status(404).json({ error: "Customer not found" });
      }

      res.status(200).json({ customerId });
    } catch (error) {
      console.error("Error fetching customer ID:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);
// Create or Update Theme Settings
app.patch("/theme-settings", async (req, res) => {
  try {
    const validatedData = themeSettingsSchema.parse(req.body);
    const updatedSettings = await prisma.themeSettings.upsert({
      where: { id: req.body.id || 1 },
      update: validatedData,
      create: validatedData,
    });
    res.status(200).json({ success: true, data: updatedSettings });
  } catch (error) {
    console.error("Error updating theme settings:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});
// Get Theme Settings
app.get(
  "/theme-settings",
  shopify.validateAuthenticatedSession(),
  async (req, res ) => {
    
    try {
      const themeSettings = await prisma.themeSettings.findFirst({
        select: {
          id: true,
          text: true,
          textColor: true,
          backgroundColor: true,
        },
      });

      if (!themeSettings) {
         res.status(404).json({ error: "Theme settings not found" });
      } else { 
        res.status(200).json(themeSettings);
      }

    } catch (error) {
      console.error("[Theme Settings Error]:", JSON.stringify(error, null, 2));
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: "Internal server error", details: errorMessage });
    }
  }
);
// Save Cart
app.post(
  "/saved-cart",
  shopify.validateAuthenticatedSession(),
  async (req, res) => {
    const { id } = req.body;

    try {
      const savedCart = await prisma.savedCart.findUnique({
        where: { id },
      });

      if (savedCart) {
        res.json(savedCart);
      } else {
        res.status(404).json({ error: "No saved cart found." });
      }
    } catch (error) {
      console.error("Error retrieving saved cart:", error);
      res.status(500).send({ error: "Failed to retrieve saved cart." });
    }
  }
);


const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default shopify;
export { app };
