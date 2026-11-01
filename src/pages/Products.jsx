import { useEffect, useState } from "react";
import ProductList from "../components/ProductList";

import {
getProducts,
searchProducts,
getCategories,
getProductsByCategory,
createProduct,
updateProduct,
deleteProduct,
} from "../services/productService";

function Products() {
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [search, setSearch] = useState("");
const [categories, setCategories] = useState([]);
const [category, setCategory] = useState("");
const [editingId, setEditingId] = useState(null);
const [page, setPage] = useState(1);
const [total, setTotal] = useState(0);

const [form, setForm] = useState({
title: "",
price: "",
description: "",
});

const limit = 12;

useEffect(() => {
loadProducts();
loadCategories();
}, []);

async function loadProducts(pageNumber = 1) {
try {
setLoading(true);
setError("");

  const skip = (pageNumber - 1) * limit;
  const data = await getProducts(limit, skip);

  setProducts(data.products);
  setTotal(data.total);
} catch (error) {
  setError(error.message);
} finally {
  setLoading(false);
}

}

async function loadCategories() {
try {
const data = await getCategories();
setCategories(data);
} catch (error) {
console.error(error);
}
}

async function handleDelete(id) {
try {
await deleteProduct(id);

  setProducts((previousProducts) =>
    previousProducts.filter((product) => product.id !== id)
  );
} catch (error) {
  setError(error.message);
}

}

async function handleSearch(event) {
event.preventDefault();

try {
  setLoading(true);
  setError("");

  if (search.trim() === "") {
    setCategory("");
    setPage(1);
    await loadProducts(1);
    return;
  }

  const data = await searchProducts(search);

  setProducts(data.products);
  setTotal(data.total);
  setPage(1);
  setCategory("");
} catch (error) {
  setError(error.message);
} finally {
  setLoading(false);
}

}

async function handleCategory(event) {
const selectedCategory = event.target.value;

setCategory(selectedCategory);

try {
  setLoading(true);
  setError("");

  if (selectedCategory === "") {
    setPage(1);
    await loadProducts(1);
    return;
  }

  const data = await getProductsByCategory(selectedCategory);

  setProducts(data.products);
  setTotal(data.total);
  setPage(1);
  setSearch("");
} catch (error) {
  setError(error.message);
} finally {
  setLoading(false);
}

}

function nextPage() {
const totalPages = Math.ceil(total / limit);

if (page < totalPages) {
  const newPage = page + 1;
  setPage(newPage);
  loadProducts(newPage);
}

}

function previousPage() {
if (page > 1) {
const newPage = page - 1;
setPage(newPage);
loadProducts(newPage);
}
}

function handleEdit(product) {
setEditingId(product.id);

setForm({
  title: product.title,
  price: product.price,
  description: product.description,
});

}

function handleChange(event) {
const { name, value } = event.target;

setForm({
  ...form,
  [name]: value,
});

}

async function handleCreate(event) {
event.preventDefault();

try {
  setError("");

  const newProduct = await createProduct({
    ...form,
    price: Number(form.price),
  });

  setProducts((previousProducts) => [
    newProduct,
    ...previousProducts,
  ]);

  setTotal((previousTotal) => previousTotal + 1);

  setForm({
    title: "",
    price: "",
    description: "",
  });
} catch (error) {
  setError(error.message);
}

}

async function handleUpdate(event) {
event.preventDefault();

try {
  const updated = await updateProduct(editingId, {
    ...form,
    price: Number(form.price),
  });

  setProducts(
    products.map((product) =>
      product.id === editingId
        ? { ...product, ...updated }
        : product
    )
  );

  setEditingId(null);

  setForm({
    title: "",
    price: "",
    description: "",
  });
} catch (error) {
  setError(error.message);
}

}

if (loading) {
return <p>Cargando productos...</p>;
}

if (error) {
return <p>{error}</p>;
}

return (
<section>
<h1>Productos</h1>

  <form onSubmit={handleSearch} className="search-form">
    <input
      type="text"
      placeholder="Buscar producto..."
      value={search}
      onChange={(event) => setSearch(event.target.value)}
    />

    <button type="submit">Buscar</button>
  </form>

  <select value={category} onChange={handleCategory}>
    <option value="">Todas las categorías</option>

    {categories.map((item) => {
      const value = item.slug ?? item;
      const label = item.name ?? item;

      return (
        <option key={value} value={value}>
          {label}
        </option>
      );
    })}
  </select>

  <form
    onSubmit={editingId ? handleUpdate : handleCreate}
    className="product-form"
  >
    <h2>{editingId ? "Actualizar producto" : "Crear producto"}</h2>

    <input
      type="text"
      name="title"
      placeholder="Nombre"
      value={form.title}
      onChange={handleChange}
      required
    />

    <input
      type="number"
      name="price"
      placeholder="Precio"
      value={form.price}
      onChange={handleChange}
      required
    />

    <textarea
      name="description"
      placeholder="Descripción"
      value={form.description}
      onChange={handleChange}
    />

    <button type="submit">
      {editingId ? "Actualizar" : "Guardar"}
    </button>
  </form>

  <ProductList
    products={products}
    onEdit={handleEdit}
    onDelete={handleDelete}
  />

  {!search && !category && (
    <div className="pagination">
      <button onClick={previousPage} disabled={page === 1}>
        Anterior
      </button>

      <span>Página {page}</span>

      <button
        onClick={nextPage}
        disabled={page >= Math.ceil(total / limit)}
      >
        Siguiente
      </button>
    </div>
  )}
</section>

);
}

export default Products;