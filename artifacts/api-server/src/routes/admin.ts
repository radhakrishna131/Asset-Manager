import { Router } from "express";
import { AdminLoginBody } from "@workspace/api-zod";

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

export default router;
