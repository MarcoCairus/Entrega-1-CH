const socket = io();

const realTimeProducts = document.getElementById("realTimeProducts");

const renderProducts = (data) => {
  return data
    .map((element) => {
      return `${element.title}</br>${element.description}</br>${element.code}</br>${element.price}</br>${element.status}</br>${element.stock}</br>${element.category}</br>${element.thumbnails.map((ele) => `<img src="${ele}" alt="thumbnail">`).join("")}
        <button onclick="deleteProduct(${element.id})">Eliminar</button>
        <br><br><br>
      `;
    }).join(" ");
};

const deleteProduct = (id) => {

  fetch(`/api/products/${id}`, { 
    method: 'DELETE'
  })
  .then(response => {
    return response.json(); 
  })
  .then(data => {
    if (data.success) {
      console.log('Producto Borrado');
    } else {
      alert("Error al eliminar el producto: ");
    }
  })
}


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
