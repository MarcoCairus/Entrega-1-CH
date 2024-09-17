import { Router } from "express";
import fs from "fs";

const router = Router();

router.get("/", (req, res) => {
  let products = [];

  if (fs.existsSync("src/productos.json")) {
    products = JSON.parse(fs.readFileSync("src/productos.json", "utf-8"));
  }
  res.render("home", {
    products,
  });
});

router.get("/realtimeproducts", (req, res) => {
  res.render("realTimeProducts", {});
});

export default router;
