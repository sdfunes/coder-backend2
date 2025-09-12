const socket = io();

socket.on('productAdded', (product) => {
  const list = document.getElementById('product-list');
  const li = document.createElement('li');
  li.textContent = `${product.title} - $${product.price}`;
  li.id = product._id;
  list.appendChild(li);
});

socket.on('productDeleted', (pid) => {
  const productEl = document.getElementById(pid);
  if (productEl) productEl.remove();
});

const form = document.getElementById('product-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const productData = Object.fromEntries(formData);

    socket.emit('createProduct', productData);

    form.reset();
  });
}

document.querySelectorAll('.add-to-cart').forEach((button) => {
  button.addEventListener('click', async () => {
    const productId = button.getAttribute('data-id');

    const response = await fetch(`/api/carts/${cartId}/product/${productId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      const updatedCart = await response.json();
      socket.emit('cartUpdated', updatedCart);
    }
  });
});
