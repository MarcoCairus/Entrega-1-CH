import { Router } from "express";
import fs from "fs";
import { uploader, verification } from "../utils.js";

const router = Router();

/*
MENSAJE IMPORTANTE.

- Se puede hacer el posteo desde el body con un un 'form-data' o un 'raw'.
En caso de hacerlo con 'form-data' descarga la imagen brindada en el campo 'thumbnail', y la agrega en la carpeta 'public/img'. 

*/

/*
-------------------------------
TREAR PRODUCTO
-------------------------------
*/

router.get("/", (req, res) => {
  const array = [];
  const queryLimit = req.query.limit;
  const productos = JSON.parse(fs.readFileSync("src/productos.json", "utf-8"));

  if (queryLimit && queryLimit < productos.length) {
    for (let i = 0; i < queryLimit; i++) {
      array.push(productos[i]);
    }
    return res.send(array);
  }

  res.send(productos);
});

/*
-------------------------------
TREAR PRODUCTO POR ID
-------------------------------
*/

router.get("/:pid", (req, res) => {
  const idProducts = req.params.pid;
  const productsFile = JSON.parse(
    fs.readFileSync("src/productos.json", "utf-8")
  );

  const products = productsFile.find((e) => e.id == idProducts);

  if (!products) {
    return res.status(400).send("Producto inexistente");
  }
  res.status(201).send(products);
});

/*
-------------------------------
CREAR PRODUCTO
-------------------------------
*/

router.post("/", uploader.array("thumbnails"), verification, (req, res) => {
  const io = req.io;

  if (req.files) {
    const thumbnails = req.files.map(
      (element) => `img/${element.originalname}`
    );
    req.body.thumbnails = thumbnails;
  } else if (req.body.thumbnails) {
    const { thumbnails } = req.body;

    if (!Array.isArray(thumbnails)) {
      return res.status(400).send("thumbnails tiene que ser un array");
    }
    if (!thumbnails.every((element) => typeof element === "string")) {
      return res.status(400).send("thumbnails tiene que contener 'strings'");
    }
  }

  const products = req.body;

  io.emit("products", products);

  if (!fs.existsSync("src/productos.json")) {
    fs.writeFileSync(
      "src/productos.json",
      JSON.stringify([{ ...products, id: 1 }])
    );
    return res.status(201).send("Producto creado con exito");
  }

  const productsFile = JSON.parse(
    fs.readFileSync("src/productos.json", "utf-8")
  );

  if (productsFile.length === 0) {
    fs.writeFileSync(
      "src/productos.json",
      JSON.stringify([{ ...products, id: 1 }])
    );
    return res.status(201).send("Producto creado con exito");
  }

  productsFile.push({
    ...products,
    id: productsFile[productsFile.length - 1].id + 1,
  });

  fs.writeFileSync("src/productos.json", JSON.stringify(productsFile));

  res.status(201).send("Producto creado con exito!");
});

/*
-------------------------------
ACTUALIZAR PRODUCTO
-------------------------------
*/

router.put("/:pid", uploader.array("thumbnails"), verification, (req, res) => {
  const io = req.io;
  const newProduct = req.body;
  const idProduct = req.params.pid;

  if (!fs.existsSync("src/productos.json")) {
    return res.status(400).send("No existen productos para actualizar");
  }

  let thumbnailsArray = [];

  if (req.files) {
    thumbnailsArray = req.files.map((e) => `img/${e.originalname}`);
    req.body.thumbnails = thumbnailsArray;
  } else if (req.body.thumbnails) {
    const { thumbnails } = req.body;
    if (!Array.isArray(thumbnails)) {
      return res.status(400).send("thumbnails tiene que ser un array");
    }
    if (!thumbnails.every((element) => typeof element === "string")) {
      return res.status(400).send("thumbnails tiene que contener 'strings'");
    }

    thumbnailsArray = thumbnails;
  }

  const products = req.body;

  products.thumbnails = thumbnailsArray;

  const productsFile = JSON.parse(
    fs.readFileSync("src/productos.json", "utf-8")
  );

  const product = productsFile.findIndex((e) => e.id == idProduct);

  if (product === -1) {
    return res.status(400).send("Producto inexistente");
  }

  productsFile[product] = { ...newProduct, id: productsFile[product].id };
  fs.writeFileSync("src/productos.json", JSON.stringify(productsFile));
  res.status(201).send(productsFile);

  io.emit("newProducts", productsFile);
});

/*
-------------------------------
BORRAR PRODUCTO
-------------------------------
*/

router.delete("/:pid", (req, res) => {
  const productId = req.params.pid;
  if (!fs.existsSync("src/productos.json")) {
    return res.status(400).send("No existen productos para eliminar");
  }
  const productsFile = JSON.parse(
    fs.readFileSync("src/productos.json", "utf-8")
  );

  const products = productsFile.filter((e) => e.id != productId);
  if (products.length === productsFile.length) {
    return res.status(400).send("No existe ese producto para eliminar");
  }

  const io = req.io;

  io.emit("products", products);

  fs.writeFileSync("src/productos.json", JSON.stringify(products));

  return res.status(200).json({ success: true, message: "Producto eliminado con éxito", products });});

export default router;
