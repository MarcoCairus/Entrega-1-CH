const buttonCart = document.getElementById('cart');


function search() {
    const sort = document.getElementById('sortOrder').value
    const sortCategory = document.getElementById('query').value
    const sortStock = document.getElementById('query2').value
    if (sortCategory && sortStock && sort) {
        location.href = location.origin + '/?category=' + sortCategory + '&stock=' + sortStock + '&sort=price&order=' + sort
    }
    else if (sortCategory && sort) {
        location.href = location.origin + '/?category=' + sortCategory + '&sort=price&order=' + sort
    }
    else if (sortCategory) {
        location.href = location.origin + '/?category=' + sortCategory
    }
    else if (sortStock) {
        location.href = location.origin + '/?stock=' + sortStock
    }
    else if (sort) {
        location.href = location.origin + '/?sort=price&order=' + sort
    }

}


async function button(id) {
    const myCart = localStorage.getItem('cartId')
    try {
        if (myCart) {
            await fetch(`/api/carts/${myCart}/products/${id}`, {
                method: 'POST',
                body: JSON.stringify()
            })
        }
        else {
            const firstCart = await fetch('/api/carts', {
                method: 'POST'
            })
            const cart = await firstCart.json();
            console.log(cart.payload._id);
            localStorage.setItem('cartId', cart.payload._id)
            await fetch(`/api/carts/${cart.payload._id}/products/${id}`, {
                method: 'POST',
                body: JSON.stringify()
            })
        }
        buttonCart.style.display = 'inline'
    } catch (error) {
        console.log(error);
    }

}
async function removeFromCart(idProducto) {
    console.log(idProducto);

    try {
        const myCart = localStorage.getItem('cartId')
        const response = await fetch(`/api/carts/${myCart}/products/${idProducto}`, {
            method: 'DELETE',
        })
        const removeProduct = response.json()
        console.log(removeProduct);

        if (removeProduct) {

        }

    } catch (error) {

    }
}

document.addEventListener('DOMContentLoaded', () => {
    const myCart = localStorage.getItem('cartId')
    if (myCart) {
        buttonCart.style.display = 'inline'
    }
    else {
        buttonCart.style.display = 'none'
    }
})

buttonCart.addEventListener('click', () => {
    const myCart = localStorage.getItem('cartId')
    location.href = location.origin + '/carts/' + myCart

})

