const socket = io();
const productsList = document.getElementById('cart-products');
const emptyCartBtn = document.getElementById('empty-cart');

socket.on('cartUpdated', ({ cid, cart }) => {
  if (cid !== cartId) return;

  productsList.innerHTML = '';

  cart.products.forEach((p) => {
    const li = document.createElement('li');
    li.id = `cart-prod-${p.product._id}`;
    li.innerHTML = `<b>${p.product.title}</b> - $${p.product.price} (Cantidad: ${p.quantity})`;
    productsList.appendChild(li);
  });
});

// Vaciar carrito
emptyCartBtn.addEventListener('click', async () => {
  await fetch(`/api/carts/${cartId}`, {
    method: 'DELETE',
  });
});
