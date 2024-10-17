const socket = io();

const realTimeProducts = document.getElementById("realTimeProducts");

const renderProducts = (data) => {
    return data
        .map((element) => {
            return `<div><h2>${element.title}</h2><p>${element.description}</p><p>Código: ${element.code}</p><p>Precio: ${element.price}</p><p>Estado: ${element.status}</p><p>Stock: ${element.stock}</p><p>Categoría: ${element.category}</p></div><div>${element.thumbnails.map((ele) => `<img src="${ele}" alt="thumbnail">`).join("")}</div>
        <br><br><br>
    `;
        }).join(" ");
};



document.addEventListener("DOMContentLoaded", () => {
    socket.on("firstProducts", (products) => {
        realTimeProducts.innerHTML = renderProducts(products);
    });
});



socket.on("products", (element) => {
    if (!Array.isArray(element)) {
        return (realTimeProducts.innerHTML += renderProducts([element]));
    }
    realTimeProducts.innerHTML = renderProducts(element);
});

socket.on("newProducts", (element) => {
    realTimeProducts.innerHTML = renderProducts(element);
});
