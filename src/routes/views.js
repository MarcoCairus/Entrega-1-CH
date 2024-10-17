import { Router } from "express";
import { productModel } from "../models/products.js";
import { cartModel } from "../models/carts.js";

const router = Router();

router.get("/", async (req, res) => {
  const { page = 1, limit = 5, sort = 'createAt', order, category, stock } = req.query;
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
    lean: true
  }

  try {
    const { docs, totalPages, hasPrevPage, hasNextPage, prevPage, nextPage } = await productModel.paginate(filter, paginateOptions)

    console.log(docs);

    res.render('home', { docs, hasPrevPage, hasNextPage, prevPage, nextPage, page, totalPages });

  } catch (error) {
    res.send("Cannot get users with mongoose:" + error);
  }

});

router.get('/products/:pid', async (req, res) => {
  const productId = req.params.pid
  try {
    const product = await productModel.findById(productId).lean();

    if (!product) {
      return res.status(404).send('Producto no encontrado');
    }
    res.render('productDetails', { product, productId });
  } catch (error) {
    res.send("Error fetching product details: " + error);
  }
});

//-----------------------------------------------

router.get('/carts/:cid', async (req, res) => {
  const cartId = req.params.cid;
  try {
    const cart = await cartModel.findById(cartId).populate('products.product').lean();
    if (!cart) {
      return res.status(404).send('Carrito no encontrado');
    }

    const total = cart.products.reduce((acc, product) => {
      console.log(product.quantity)
      return acc + (product.product.price * product.quantity)

    }, 0)


    res.render('cart', { cart, total }); // Renderiza la vista del carrito
  } catch (error) {
    res.send("Error fetching cart details: " + error);
  }
});

router.get("/realtimeproducts", (req, res) => {
  res.render("realTimeProducts", {});
});

export default router;
