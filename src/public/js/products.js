const socket = io();

document.querySelectorAll('.add-to-cart').forEach((button) => {
  button.addEventListener('click', async () => {
    const productId = button.getAttribute('data-id');

    await fetch(`/api/carts/${cartId}/product/${productId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  });
});
