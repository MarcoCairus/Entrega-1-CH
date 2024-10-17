import express from "express";
import products from "./routes/products.js";
import carts from "./routes/cart.js";
import __dirname from "./utils.js";
import handlebars from "express-handlebars";
import viewsRouter from "./routes/views.js";
import mongoose from 'mongoose';
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { productModel } from "./models/products.js";

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server);

app.use(express.static(__dirname + "/public"));
// app.engine("handlebars", handlebars.engine());

app.engine('handlebars', handlebars.engine({
  helpers: {
      multiply: (a, b) => a * b
  }
}))


app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/api/products", products);
app.use("/api/carts", carts);

app.use("/", viewsRouter);
app.use("/realtimeproducts", viewsRouter);

const conection = mongoose.connect('mongodb+srv://Comision70200:comision70200@chproject.mk8ag.mongodb.net/Proyecto-Final').then(() => console.log("Conectado a MongoDB")).catch(err => console.error("Error de conexión a MongoDB:", err));

server.listen(8080, () => {
  console.log("Servidor Levantado!");
});

/*
-----------------------------
SERVIDOR SOCKET CONFIGURADO
-----------------------------
*/

io.on("connection", async (socket) => {
  console.log("Nuevo cliente conectado");

  const products = await productModel.find();
  socket.emit("firstProducts", products);
});
