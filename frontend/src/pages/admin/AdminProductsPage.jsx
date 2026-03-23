import { useEffect, useState } from "react";
import client from "../../api/client";
import Seo from "../../components/ui/Seo";

const initialProduct = {
  _id: "",
  name: "",
  slug: "",
  description: "",
  price: "",
  discountPrice: "",
  category: "",
  featured: false,
  newArrival: false,
  bestSeller: false,
  images: ["", ""],
  sizeStock: [
    { size: "S", stock: 0 },
    { size: "M", stock: 0 },
    { size: "L", stock: 0 },
    { size: "XL", stock: 0 }
  ]
};

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialProduct);

  const fetchProducts = async () => {
    const { data } = await client.get("/products");
    setProducts(data.products);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const saveProduct = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      discountPrice: Number(form.discountPrice),
      images: form.images.filter(Boolean)
    };

    if (form._id) {
      await client.put(`/products/${form._id}`, payload);
    } else {
      await client.post("/products", payload);
    }

    setForm(initialProduct);
    await fetchProducts();
  };

  const removeProduct = async (id) => {
    await client.delete(`/products/${id}`);
    await fetchProducts();
  };

  const startEdit = (product) => {
    setForm({
      ...product,
      price: product.price || "",
      discountPrice: product.discountPrice || "",
      images: [...product.images, ""].slice(0, 2)
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container-shell py-10">
      <Seo title="Admin Products" description="Add, update, and remove store products." />
      <div className="grid gap-8 xl:grid-cols-[400px_1fr]">
        <form onSubmit={saveProduct} className="surface h-fit space-y-4 p-6">
          <h1 className="text-2xl font-semibold">{form._id ? "Edit product" : "Add product"}</h1>
          <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input" placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <textarea className="input min-h-28" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <input className="input" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <input className="input" placeholder="Discount price" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} />
          </div>
          <input className="input" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          {form.sizeStock.map((entry, index) => (
            <div key={entry.size} className="flex items-center gap-3">
              <span className="w-8 text-sm">{entry.size}</span>
              <input
                className="input"
                placeholder="Stock"
                value={entry.stock}
                onChange={(e) =>
                  setForm({
                    ...form,
                    sizeStock: form.sizeStock.map((item, stockIndex) =>
                      stockIndex === index ? { ...item, stock: Number(e.target.value) } : item
                    )
                  })
                }
              />
            </div>
          ))}
          {form.images.map((image, index) => (
            <input
              key={index}
              className="input"
              placeholder={`Image URL ${index + 1}`}
              value={image}
              onChange={(e) =>
                setForm({
                  ...form,
                  images: form.images.map((item, imageIndex) => (imageIndex === index ? e.target.value : item))
                })
              }
            />
          ))}
          <div className="flex flex-wrap gap-4 text-sm text-stone-500">
            {["featured", "newArrival", "bestSeller"].map((field) => (
              <label key={field} className="flex items-center gap-2">
                <input type="checkbox" checked={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.checked })} />
                {field}
              </label>
            ))}
          </div>
          <button type="submit" className="btn-primary w-full">
            {form._id ? "Update product" : "Save product"}
          </button>
          {form._id && (
            <button type="button" onClick={() => setForm(initialProduct)} className="btn-secondary w-full">
              Cancel edit
            </button>
          )}
        </form>

        <section className="surface p-6">
          <h2 className="text-2xl font-semibold">Products</h2>
          <div className="mt-6 space-y-4">
            {products.map((product) => (
              <article key={product._id} className="flex flex-col gap-4 rounded-[24px] border border-stone-200 p-4 md:flex-row md:items-center">
                <img src={product.images[0]} alt={product.name} className="h-24 w-24 rounded-2xl object-cover" />
                <div className="flex-1">
                  <p className="font-medium">{product.name}</p>
                  <p className="mt-1 text-sm text-stone-500">
                    {product.category} • Rs {product.discountPrice || product.price}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => startEdit(product)} className="btn-secondary">
                    Edit
                  </button>
                  <button type="button" onClick={() => removeProduct(product._id)} className="btn-secondary">
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminProductsPage;
