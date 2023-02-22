function deleteProduct(button) {
  const [productId, csrfToken] = Array.from(
    button.parentNode.getElementsByTagName("input")
  ).map((element) => element.value);

  fetch(`/admin/delete/${productId}`, {
    method: "DELETE",
    headers: {
      "csrf-token": csrfToken,
    },
  })
    .then((result) => console.log(result))
    .catch((error) => console.log(error));
}
