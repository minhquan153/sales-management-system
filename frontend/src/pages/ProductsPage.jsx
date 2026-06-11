import { useEffect, useState } from "react";
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from "../api/productApi.js";
import useAuth from "../hooks/useAuth.js";

const emptyForm = {
  name: "",
  category: "",
  price: "",
  stock: "",
  description: "",
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

function ProductsPage() {
  const { user } = useAuth();
  const isAdmin = user.role === "admin";
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadProducts = async (searchValue = "") => {
    setLoading(true);
    setError("");

    try {
      const response = await getProducts(searchValue);
      setProducts(response.data.products);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    getProducts()
      .then((response) => {
        if (!ignore) {
          setProducts(response.data.products);
        }
      })
      .catch((requestError) => {
        if (!ignore) {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    loadProducts(search.trim());
  };

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      description: product.description || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    const productData = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
    };

    try {
      if (editingId) {
        await updateProduct(editingId, productData);
      } else {
        await createProduct(productData);
      }

      resetForm();
      await loadProducts(search.trim());
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    const shouldDelete = window.confirm(
      `Delete "${product.name}"?`,
    );

    if (!shouldDelete) {
      return;
    }

    setError("");

    try {
      await deleteProduct(product._id);
      await loadProducts(search.trim());
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Inventory</p>
          <h2>Products</h2>
        </div>
      </header>

      {isAdmin && (
        <section className="panel form-panel">
          <div className="section-heading">
            <h3>{editingId ? "Edit product" : "Add product"}</h3>
            {editingId && (
              <button
                type="button"
                className="button secondary-button"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>

          <form className="product-form" onSubmit={handleSubmit}>
            <label>
              Name
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Category
              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Price
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Stock
              <input
                name="stock"
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={handleChange}
                required
              />
            </label>

            <label className="wide-field">
              Description
              <textarea
                name="description"
                rows="3"
                value={form.description}
                onChange={handleChange}
              />
            </label>

            <button
              type="submit"
              className="button primary-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update product"
                  : "Add product"}
            </button>
          </form>
        </section>
      )}

      <section className="panel table-panel">
        <div className="table-toolbar">
          <div>
            <h3>Product list</h3>
            <p className="muted">{products.length} product(s)</p>
          </div>

          <form className="search-form" onSubmit={handleSearch}>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name"
            />
            <button type="submit" className="button secondary-button">
              Search
            </button>
          </form>
        </div>

        {error && <p className="error-message">{error}</p>}

        {loading ? (
          <p className="muted">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="muted">No products found.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{formatCurrency(product.price)}</td>
                    <td>{product.stock}</td>
                    {isAdmin && (
                      <td className="actions">
                        <button
                          type="button"
                          className="text-button"
                          onClick={() => handleEdit(product)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="text-button danger-button"
                          onClick={() => handleDelete(product)}
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

export default ProductsPage;
