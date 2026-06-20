import { Router } from "express";
import { AdminLoginBody } from "@workspace/api-zod";
import { syncProduct, syncAllProducts, isSyncInProgress, setSyncInProgress } from "../lib/price-sync";

const router = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

router.post("/admin/login", (req, res) => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Password required" });
    return;
  }

  const { password } = parsed.data;

  if (password !== ADMIN_PASSWORD) {
    res.status(401).json({ success: false, message: "Invalid password" });
    return;
  }

  (req as any).session.adminAuthenticated = true;
  res.json({ success: true, message: "Logged in successfully" });
});

router.post("/admin/logout", (req, res) => {
  (req as any).session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});

router.get("/admin/me", (req, res) => {
  const session = (req as any).session;
  if (!session?.adminAuthenticated) {
    res.status(401).json({ authenticated: false });
    return;
  }
  res.json({ authenticated: true });
});

router.get("/admin/sync-status", (req, res) => {
  const session = (req as any).session;
  if (!session?.adminAuthenticated) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  res.json({ inProgress: isSyncInProgress() });
});

router.post("/admin/sync-prices", async (req, res) => {
  const session = (req as any).session;
  if (!session?.adminAuthenticated) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (isSyncInProgress()) {
    res.status(409).json({ error: "Sync already in progress" });
    return;
  }

  setSyncInProgress(true);
  res.json({ message: "Sync started in background" });

  syncAllProducts().finally(() => setSyncInProgress(false));
});

router.post("/admin/sync-prices/:id", async (req, res) => {
  const session = (req as any).session;
  if (!session?.adminAuthenticated) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const id = parseInt(req.params["id"] ?? "", 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid product ID" });
    return;
  }

  const result = await syncProduct(id);
  if (result.success) {
    res.json({ success: true, message: "Product synced" });
  } else {
    res.status(400).json({ success: false, error: result.error });
  }
});

export default router;
