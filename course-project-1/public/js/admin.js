function deleteProduct(button) {
  const [productId, csrfToken] = Array.from(
    button.parentNode.getElementsByTagName("input")
  ).map((element) => element.value);
  const productElement = button.closest("article");

  fetch(`/admin/delete/${productId}`, {
    method: "DELETE",
    headers: {
      "csrf-token": csrfToken,
    },
  })
    .then((result) => result.json())
    .then(() => productElement.remove())
    .catch((error) => console.log(error));
}
