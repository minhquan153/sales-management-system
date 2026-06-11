import { apiRequest } from "./client.js";

export const getProducts = (search = "") => {
  const query = search
    ? `?search=${encodeURIComponent(search)}`
    : "";

  return apiRequest(`/products${query}`);
};

export const createProduct = (product) =>
  apiRequest("/products", {
    method: "POST",
    body: JSON.stringify(product),
  });

export const updateProduct = (id, product) =>
  apiRequest(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(product),
  });

export const deleteProduct = (id) =>
  apiRequest(`/products/${id}`, {
    method: "DELETE",
  });
