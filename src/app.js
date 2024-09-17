import express from "express";
import products from "./routes/products.js";
import carts from "./routes/cart.js";
import __dirname from "./utils.js";
import handlebars from "express-handlebars";
import viewsRouter from "./routes/views.js";
import fs from "fs";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server);

app.use(express.static(__dirname + "/public"));
app.engine("handlebars", handlebars.engine());
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

server.listen(8080, () => {
  console.log("Servidor Levantado!");
});

/*
-----------------------------
SERVIDOR SOCKET CONFIGURADO
-----------------------------
*/

io.on("connection", (socket) => {
  let products = [];
  console.log("Nuevo cliente conectado");

  if (fs.existsSync("src/productos.json")) {
    products = JSON.parse(fs.readFileSync("src/productos.json", "utf-8"));
  }

  socket.emit("firstProducts", products);
});
