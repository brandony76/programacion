"use strict";

// 1. Elementos HTML
const productList = document.getElementById("product-list");
const productCount = document.getElementById("product-count");
const statusMessage = document.getElementById("status-message");

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");

const cartButton = document.getElementById("cart-button");
const cartPanel = document.getElementById("cart-panel");
const closeCartButton = document.getElementById("close-cart");
const overlay = document.getElementById("overlay");

const cartItems = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartTotal = document.getElementById("cart-total");
const clearCartButton = document.getElementById("clear-cart");
const checkoutButton = document.getElementById("checkout-button");


const API_URL = "https://dummyjson.com/products/category/laptops";

let products = [];
let cart = [];


const currencyFormatter = new Intl.NumberFormat("es-UY", {
  style: "currency",
  currency: "UYU",
  maximumFractionDigits: 2
});

function formatPrice(price) {
  return currencyFormatter.format(price);
}

function getSpanishDescription(product) {
  const title = (product.title || "Laptop").toLowerCase();

  if (title.includes("macbook") || title.includes("apple")) {
    return "Laptop premium para trabajo profesional, creatividad y multitarea con gran autonomía.";
  }

  if (title.includes("surface") || title.includes("microsoft")) {
    return "Laptop versátil y elegante, ideal para estudio, trabajo y entretenimiento con buen rendimiento.";
  }

  if (title.includes("thinkpad") || title.includes("lenovo") || title.includes("ideapad")) {
    return "Laptop resistente y confiable para productividad diaria, reuniones y uso cotidiano.";
  }

  if (title.includes("gaming") || title.includes("omen") || title.includes("victus") || title.includes("predator")) {
    return "Laptop gamer con potencia para juegos, edición de video y multitarea intensa.";
  }

  if (title.includes("hp") || title.includes("pavilion") || title.includes("elite")) {
    return "Laptop diseñada para un rendimiento equilibrado entre trabajo, estudio y entretenimiento.";
  }

  if (title.includes("samsung") || title.includes("galaxy")) {
    return "Laptop moderna y ligera con buena autonomía para trabajo, estudio y navegación diaria.";
  }

  if (title.includes("infinix") || title.includes("asus") || title.includes("acer")) {
    return "Laptop accesible con buen rendimiento para uso diario, estudio y entretenimiento.";
  }

  return "Laptop moderna y funcional para trabajo, estudio y entretenimiento con excelente comodidad de uso.";
}

// 3. Obtener los productos desde la API
async function loadProducts() {
  statusMessage.textContent = "Cargando laptops...";

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("No se pudieron cargar los productos.");
    }

    const data = await response.json();
    products = data.products;

    renderProducts(products);
  } catch (error) {
    console.error("Error al cargar productos:", error);

    statusMessage.textContent =
      "No se pudieron cargar las laptops. " +
      "Comprueba tu conexión e inténtalo de nuevo.";

    productList.innerHTML = `
      <button type="button" class="add-button"
        id="retry-button">
        Intentar de nuevo
      </button>
    `;

    document.getElementById("retry-button")
      .addEventListener("click", loadProducts);
  }
}

// 4. Mostrar las tarjetas de productos
function renderProducts(list) {
  productList.innerHTML = "";
  productCount.textContent =
    `${list.length} producto${list.length === 1 ? "" : "s"}`;

  statusMessage.textContent = "";

  if (list.length === 0) {
    statusMessage.textContent =
      "No encontramos laptops con ese nombre.";
    return;
  }

  list.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";

    // Creamos los elementos sin insertar los datos
    // de la API directamente como HTML.
    const imageContainer = document.createElement("div");
    imageContainer.className = "product-image-container";

    const image = document.createElement("img");
    image.className = "product-image";
    image.src = product.thumbnail;
    image.alt = product.title;
    image.loading = "lazy";

    image.addEventListener("error", () => {
      image.alt = "Imagen no disponible";
      image.removeAttribute("src");
    }, { once: true });

    imageContainer.appendChild(image);

    const info = document.createElement("div");
    info.className = "product-info";

    const category = document.createElement("span");
    category.className = "product-category";
    category.textContent = product.brand || "Laptop";

    const title = document.createElement("h3");
    title.className = "product-title";
    title.textContent = product.title;

    const description = document.createElement("p");
    description.className = "product-description";
    description.textContent = getSpanishDescription(product);

    const bottom = document.createElement("div");
    bottom.className = "product-bottom";

    const price = document.createElement("span");
    price.className = "product-price";
    price.textContent = formatPrice(product.price);

    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.className = "add-button";
    addButton.textContent = "Agregar +";
    addButton.setAttribute(
      "aria-label",
      `Agregar ${product.title} al carrito`
    );

    addButton.addEventListener("click", () => {
      addToCart(product.id);
    });

    bottom.append(price, addButton);
    info.append(category, title, description, bottom);
    card.append(imageContainer, info);

    productList.appendChild(card);
  });
}


function searchProducts(event) {
  event.preventDefault();

  const searchTerm = searchInput.value
    .trim()
    .toLocaleLowerCase("es");

  const filteredProducts = products.filter((product) => {
    return product.title
      .toLocaleLowerCase("es")
      .includes(searchTerm);
  });

  renderProducts(filteredProducts);
}

searchForm.addEventListener("submit", searchProducts);


searchInput.addEventListener("input", () => {
  const searchTerm = searchInput.value
    .trim()
    .toLocaleLowerCase("es");

  const filteredProducts = products.filter((product) =>
    product.title.toLocaleLowerCase("es").includes(searchTerm)
  );

  renderProducts(filteredProducts);
});


function addToCart(productId) {
  const product = products.find((item) => item.id === productId);

  if (!product) return;

  const existingItem = cart.find(
    (item) => item.id === productId
  );

  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      thumbnail: product.thumbnail,
      quantity: 1
    });
  }

  renderCart();
}


function changeQuantity(productId, amount) {
  const item = cart.find((product) => product.id === productId);

  if (!item) return;

  item.quantity += amount;


  if (item.quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  renderCart();
}


function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  renderCart();
}


function renderCart() {
  cartItems.innerHTML = "";

  const totalQuantity = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  cartCount.textContent = totalQuantity;
  cartTotal.textContent = formatPrice(totalPrice);
  checkoutButton.disabled = cart.length === 0;

  if (cart.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "empty-cart";
    emptyMessage.textContent = "Tu carrito está vacío.";
    cartItems.appendChild(emptyMessage);
    return;
  }

  cart.forEach((item) => {
    const row = document.createElement("article");
    row.className = "cart-item";

    const image = document.createElement("img");
    image.className = "cart-item-image";
    image.src = item.thumbnail;
    image.alt = item.title;

    const info = document.createElement("div");
    info.className = "cart-item-info";

    const title = document.createElement("h3");
    title.textContent = item.title;

    const price = document.createElement("p");
    price.textContent = formatPrice(item.price * item.quantity);

    const controls = document.createElement("div");
    controls.className = "quantity-controls";

    const decreaseButton = document.createElement("button");
    decreaseButton.type = "button";
    decreaseButton.textContent = "−";
    decreaseButton.setAttribute(
      "aria-label",
      `Reducir cantidad de ${item.title}`
    );
    decreaseButton.addEventListener("click", () => {
      changeQuantity(item.id, -1);
    });

    const quantity = document.createElement("span");
    quantity.textContent = item.quantity;

    const increaseButton = document.createElement("button");
    increaseButton.type = "button";
    increaseButton.textContent = "+";
    increaseButton.setAttribute(
      "aria-label",
      `Aumentar cantidad de ${item.title}`
    );
    increaseButton.addEventListener("click", () => {
      changeQuantity(item.id, 1);
    });

    controls.append(
      decreaseButton,
      quantity,
      increaseButton
    );

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "remove-button";
    removeButton.textContent = "Eliminar";
    removeButton.addEventListener("click", () => {
      removeFromCart(item.id);
    });

    info.append(title, price, controls, removeButton);
    row.append(image, info);
    cartItems.appendChild(row);
  });
}

// 10. Abrir y cerrar el carrito
function openCart() {
  cartPanel.classList.add("open");
  cartPanel.setAttribute("aria-hidden", "false");
  cartPanel.removeAttribute("inert");

  overlay.hidden = false;
  document.body.classList.add("cart-open");
  cartButton.setAttribute("aria-expanded", "true");
  closeCartButton.focus();
}

function closeCart() {
  cartPanel.classList.remove("open");
  cartPanel.setAttribute("aria-hidden", "true");
  cartPanel.setAttribute("inert", "");

  overlay.hidden = true;
  document.body.classList.remove("cart-open");
  cartButton.setAttribute("aria-expanded", "false");
  cartButton.focus();
}

cartButton.addEventListener("click", openCart);
closeCartButton.addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && cartPanel.classList.contains("open")) {
    closeCart();
  }
});

// 11. Vaciar el carrito
clearCartButton.addEventListener("click", () => {
  cart = [];
  renderCart();
});

checkoutButton.addEventListener("click", () => {
  if (cart.length === 0) return;

  window.alert(
    "Compra realizada."
  );
  cart = [];
  renderCart();
  closeCart();
});


renderCart();
loadProducts();