import { Router } from "express";
import { cartModel } from "../models/carts.js";
import { productModel } from "../models/products.js";

const router = Router();

/*
-------------------------------
CREAR CARRITO
-------------------------------
*/

router.post("/", async (req, res) => {
  const cartProducts = req.body;
  const { products } = cartProducts;

  try {
    const result = await cartModel.create({
      products,
    })
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
TRAER PRODUCTOS DE UN CARRITO
-------------------------------
*/

router.get("/:cid", async (req, res) => {
  const cartId = req.params.cid;
  try {
    const result = await cartModel.findById(cartId).populate('products.product');

    if (result) {
      return res.send({ status: 'success', payload: result });
    }
    else {
      return res.status(404).send({ message: 'Carrito no encontrado' });
    }

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
AGREGAR PRODUCTO AL CARRITO
-------------------------------
*/

router.post("/:cid/products/:pid", async (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;

  try {

    const cart = await cartModel.findById(cartId)
    const product = await productModel.findById(productId)

    if (!cart) {
      return res.status(404).send({ message: 'Carrito no encontrado' });
    }

    if (!product) {
      return res.status(404).send({ message: 'Producto no encontrado' });
    }

    const existingProduct = cart.products.find(element => element.product.toString() === productId);

    console.log(existingProduct);

    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.products.push({ product: productId, quantity: 1 });
    }
    console.log();
    productId
    await cart.save();
    res.send({ status: 'success', payload: cart });

  } catch (error) {
    console.error('Error al agregar el producto al carrito:', error);
    res.status(500).send({ message: 'Error al agregar el producto al carrito', error });
  }


});

/*
-------------------------------
BORRAR PRODUCTO DEL CARRITO
-------------------------------
*/

router.delete('/:cid/products/:pid', async (req, res) => {
  console.log('hola');
  
  const cartId = req.params.cid;
  const productId = req.params.pid;

  try {
    const cart = await cartModel.findById(cartId);
    let result = cart.products.findIndex(element => element.product.toString() === productId);


    console.log(result);
    if (result === -1) {
      return res.status(404).send({ message: 'Producto no encontrado' });
    }

    if (cart.products[result].quantity > 1) {
      cart.products[result].quantity -= 1
    }
    else {
      cart.products.splice(result, 1);
    }
    await cart.save();
    res.send({ status: 'success', payload: cart.products });

  } catch (error) {
    console.error('Error al agregar el producto al carrito:', error);
    res.status(500).send({ message: 'Error al agregar el producto al carrito', error });
  }
})

/*
-------------------------------
BORRAR TODOS LOS PRODUCTO DEL CARRITO
-------------------------------
*/

router.delete('/:cid', async (req, res) => {
  const cartId = req.params.cid;

  try {
    const cart = await cartModel.findById(cartId);
    cart.products.splice(0, cart.products.length)
    await cart.save()
    res.send({ status: 'success', payload: cart.products });

  } catch (error) {
    console.error('Error al agregar el producto al carrito:', error);
    res.status(500).send({ message: 'Error al agregar el producto al carrito', error });
  }
})

/*
---------------------------------
ACTUALIZAR CANTIDAD DE PRODUCTOS 
---------------------------------
*/

router.put('/:cid/products/:pid', async (req, res) => {
  const cartId = req.params.cid
  const productId = req.params.pid
  const { quantity } = req.body
  const cart = await cartModel.findById(cartId)
  

  if (typeof quantity !== 'number' || quantity < 0) {
    return res.status(400).send({ message: 'La cantidad debe ser un número positivo.' });
  }

  try {
    if (!cart) {
      return res.status(400).send({ message: 'Carrito no encontrado.' });
    }
    if (!productId) {
      return res.status(400).send({ message: 'Producto no encontrado.' });
    }

    const result = cart.products.findIndex(element => {
      return element.product.toString() === productId
    })

    if (result === -1) {
      return res.status(404).send({ message: 'Producto no encontrado en el carrito' });
    }

    cart.products[result].quantity = quantity

    await cart.save();
    res.send({ status: 'success', payload: cart });

  } catch (error) {
    console.error('Error al actualizar la cantidad del producto:', error);
    res.status(500).send({ message: 'Error al actualizar la cantidad del producto', error });
  }

})

export default router;
