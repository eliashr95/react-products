function ProductCard({ product, onEdit, onDelete }) {
return (
<article className="product-card">
<img src={product.thumbnail} alt={product.title} />

  <h3>{product.title}</h3>

  <p>{product.description}</p>

  <p>Precio: ${product.price}</p>

  <p>Stock: {product.stock}</p>

  <button onClick={() => onEdit(product)}>
    Editar
  </button>

  <button onClick={() => onDelete(product.id)}>
    Eliminar
  </button>
</article>

);
}

export default ProductCard;