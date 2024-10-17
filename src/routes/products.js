import { Router } from "express";
import { uploader, } from "../utils.js";
import { productModel } from "../models/products.js";

const router = Router();

/*
MENSAJE IMPORTANTE.

- Se puede hacer el posteo desde el body con un 'form-data' o un 'raw'.
En caso de hacerlo con 'form-data' descarga la imagen brindada en el campo 'thumbnail', y la agrega en la carpeta 'public/img'. 

*/

/*
-------------------------------
TREAR PRODUCTO
-------------------------------
*/

router.get("/", async (req, res) => {
  const { page = 1, limit = 10, sort = 'createAt', order, category, stock } = req.query;
  const sortOrder = order === 'desc' ? -1 :
    (order === 'asc' ? 1 : undefined);
  const sortOption = sortOrder ? { [sort]: sortOrder } : {};
  const filter = {};

  if (category) {
    filter.category = category
  }
  if (stock) {
    filter.stock = stock
  }

  const paginateOptions = {
    limit,
    page,
    sort: sortOption,
  }

  try {
    const { docs, totalPages, hasPrevPage, hasNextPage, prevPage, nextPage } = await productModel.paginate(filter, paginateOptions)

    console.log(docs);


    const prevLink = hasPrevPage ? `${req.protocol}://${req.get('host')}/api/products?limit=${limit}&page=${prevPage}` : null;

    const nextLink = hasNextPage ? `${req.protocol}://${req.get('host')}/api/products?limit=${limit}&page=${nextPage}` : null;

    res.send({ result: "success", payload: docs, totalPages, prevPage, nextPage, page, hasPrevPage, hasNextPage, prevLink, nextLink })

  } catch (error) {
    res.send("Cannot get users with mongoose:" + error);

  }

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

router.post("/", uploader.array("thumbnails"), async (req, res) => {

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

  try {
    const products = req.body
    const { title, description, code, price, status, stock, category, thumbnails } = req.body;

    const result = await productModel.create({
      title,
      description,
      code,
      price,
      status,
      stock,
      category,
      thumbnails,
    })
    console.log(products);

    io.emit("products", products);
    res.send({ status: "success", payload: result })

  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

});

/*
-------------------------------
ACTUALIZAR PRODUCTO
-------------------------------
*/

router.put("/:pid", uploader.array("thumbnails"), async(req, res) => {
  const io = req.io;
  const newProduct = req.body;
  const idProduct = req.params.pid;


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

  const product = await productModel.findById(idProduct);

  product.thumbnails = thumbnailsArray;

    await newProduct.save();
    res.status(201).send(productsFile);

  io.emit("newProducts", productsFile);
});

/*
-------------------------------
BORRAR PRODUCTO
-------------------------------
*/

router.delete("/:pid", async(req, res) => {
  const productId = req.params.pid;

  const product = await productModel.findById(productId);
  const deleteProduct = await productModel.deleteOne({_id: productId});

  if (!product) {
    return res.status(400).send("No existe ese producto para eliminar");
  }


  return res.status(200).json({ success: true, message: "Producto eliminado con éxito", deleteProduct });
});

export default router;
