import { Router } from "express";
import fs from "fs";

const router = Router();

/*
-------------------------------
CREAR CARRITO
-------------------------------
*/

router.post("/", (req, res) => {
  const cartProducts = req.body;

  const { products } = cartProducts;

  if (!Array.isArray(products)) {
    return res.status(400).send("products tiene que ser un array");
  }

  if (!fs.existsSync("src/carrito.json")) {
    fs.writeFileSync(
      "src/carrito.json",
      JSON.stringify([{ ...cartProducts, id: 1 }])
    );
    return res.status(201).send("Carrito creado con exito!");
  }
  const cartFile = JSON.parse(fs.readFileSync("src/carrito.json", "utf-8"));

  cartFile.push({ ...cartProducts, id: cartFile[cartFile.length - 1].id + 1 });

  fs.writeFileSync("src/carrito.json", JSON.stringify(cartFile));
  res.status(201).send("Carrito creado con exito!");
});

/*
-------------------------------
TRAER PRODUCTOS DE UN CARRITO
-------------------------------
*/

router.get("/:cid", (req, res) => {
  if (!fs.existsSync("src/carrito.json")) {
    return res.status(400).send("No existen productos");
  }

  const cartId = req.params.cid;
  const cartFile = JSON.parse(fs.readFileSync("src/carrito.json", "utf-8"));
  const validationCart = cartFile.findIndex((e) => e.id == cartId);

  if (validationCart === -1) {
    return res.status(400).send("No existe este carrito");
  }

  if (cartFile[validationCart].products.length === 0) {
    return res.status(400).send("Este carrito no tiene productos");
  }

  res.status(201).send(cartFile[validationCart]);
});

/*
-------------------------------
AGREGAR PRODUCTO AL CARRITO
-------------------------------
*/

router.post("/:cid/product/:pid", (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;
  if (
    !fs.existsSync("src/carrito.json") ||
    !fs.existsSync("src/productos.json")
  ) {
    return res.status(400).send("No existen productos");
  }

  const cartFile = JSON.parse(fs.readFileSync("src/carrito.json", "utf-8"));
  const productFile = JSON.parse(
    fs.readFileSync("src/productos.json", "utf-8")
  );

  const cart = cartFile.findIndex((e) => e.id == cartId);

  const currentProduct = productFile.find((e) => e.id == productId);

  if (cart === -1) {
    return res.status(400).send("No existe este carrito");
  }
  if (currentProduct === undefined) {
    return res.status(400).send("No existe este producto");
  }

  const productInCart = cartFile[cart].products.findIndex(
    (e) => e.product == currentProduct.id
  );

  const addProducts = {
    product: currentProduct.id,
    quantity: (cartFile[cart].products[productInCart]?.quantity ?? 0) + 1,
  };

  if (productInCart != -1) {
    cartFile[cart].products.splice(productInCart, 1, addProducts);
  } else {
    cartFile[cart].products.push(addProducts);
  }

  fs.writeFileSync("src/carrito.json", JSON.stringify(cartFile));

  res.status(201).send("Producto agregado con exito");
});

export default router;
