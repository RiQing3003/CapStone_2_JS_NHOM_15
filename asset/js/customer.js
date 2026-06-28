const CART_STORAGE_KEY = "capstone_cart";

let products = [];
let cart = loadCart();

const productGrid = document.getElementById("productGrid");
const typeFilter = document.getElementById("typeFilter");
const cartPanel = document.getElementById("cartPanel");
const overlay = document.getElementById("overlay");
const cartBody = document.getElementById("cartBody");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");
const heroSlides = document.querySelectorAll(".hero-slide");
const heroDots = document.querySelectorAll("#heroDots button");

let currentHeroSlide = 0;
let heroTimer = null;

// Định dạng số tiền sang kiểu Việt Nam, ví dụ: 34990000 -> 34.990.000đ.
function formatMoney(value) {
  return Number(value).toLocaleString("vi-VN") + "đ";
}

// Chuyển ký tự đặc biệt thành HTML entities để tránh lỗi hiển thị khi render chuỗi vào HTML.
function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Lấy giỏ hàng từ localStorage và chuyển dữ liệu lưu trữ thành các CartItem.
function loadCart() {
  const stored = localStorage.getItem(CART_STORAGE_KEY);
  let result = [];

  if (!stored) {
    return result;
  }

  const savedCart = JSON.parse(stored);
  for (let i = 0; i < savedCart.length; i++) {
    const product = mapProduct(savedCart[i].product);
    const quantity = savedCart[i].quantity;
    result.push(new CartItem(product, quantity));
  }

  return result;
}

// Lưu giỏ hàng hiện tại xuống localStorage để reload trang vẫn giữ dữ liệu.
function saveCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

// Render danh sách sản phẩm ra khu vực "Sản phẩm nổi bật".
function renderProducts(list) {
  let content = "";

  if (list.length === 0) {
    productGrid.innerHTML = '<p class="empty-state">Không có sản phẩm phù hợp.</p>';
    return;
  }

  for (let i = 0; i < list.length; i++) {
    const product = list[i];
    const oldPrice = Math.round(Number(product.price) * 1.08);
    let badge = "";

    if (i === 0) {
      badge = '<span class="sale-badge">Giảm 5%</span>';
    }
    if (i === 3) {
      badge = '<span class="installment-badge">Trả góp 0%</span>';
    }

    content +=
      '<article class="product-card">' +
      badge +
      '<div class="product-card__media">' +
      '<img src="' +
      escapeHTML(product.img) +
      '" alt="' +
      escapeHTML(product.name) +
      '" />' +
      "</div>" +
      '<div class="product-card__body">' +
      "<h3>" +
      escapeHTML(product.name) +
      "</h3>" +
      "<strong>" +
      formatMoney(product.price) +
      "</strong>" +
      "<del>" +
      formatMoney(oldPrice) +
      "</del>" +
      "<p>" +
      escapeHTML(product.desc) +
      "</p>" +
      '<div class="product-meta">' +
      "<span>★ 4." +
      (8 - (i % 3)) +
      " (" +
      (52 + i * 11) +
      ")</span>" +
      '<div class="product-actions">' +
      '<button class="buy-now-btn" onclick="buyNow(\'' +
      product.id +
      '\')" aria-label="Mua ngay ' +
      escapeHTML(product.name) +
      '">Mua ngay</button>' +
      '<button class="cart-icon-btn" onclick="addToCart(\'' +
      product.id +
      '\')" aria-label="Bỏ vào giỏ ' +
      escapeHTML(product.name) +
      '">Bỏ vào giỏ</button>' +
      "</div>" +
      "</div>" +
      "</div>" +
      "</article>";
  }

  productGrid.innerHTML = content;
}

// Lọc sản phẩm theo loại đang chọn trong dropdown rồi render lại danh sách.
function applyFilter() {
  const type = typeFilter.value;
  let filtered = [];

  if (type === "all") {
    filtered = products;
  } else {
    for (let i = 0; i < products.length; i++) {
      if (products[i].type === type) {
        filtered.push(products[i]);
      }
    }
  }

  renderProducts(filtered);
}

// Tìm sản phẩm trong mảng products theo id.
function findProductById(id) {
  for (let i = 0; i < products.length; i++) {
    if (products[i].id === id) {
      return products[i];
    }
  }
  return null;
}

// Tìm item trong giỏ hàng theo product id.
function findCartItemByProductId(id) {
  for (let i = 0; i < cart.length; i++) {
    if (cart[i].product.id === id) {
      return cart[i];
    }
  }
  return null;
}

// Thêm sản phẩm vào giỏ hàng; nếu đã tồn tại thì tăng số lượng.
function addToCart(id) {
  const product = findProductById(id);
  if (!product) {
    return;
  }

  const existed = findCartItemByProductId(id);
  if (existed) {
    existed.quantity += 1;
  } else {
    cart.push(new CartItem(product, 1));
  }

  saveCart();
  renderCart();
}

// Thêm sản phẩm vào giỏ hàng rồi mở panel giỏ hàng để người dùng xem nhanh.
function buyNow(id) {
  addToCart(id);
  openCart();
}

// Tăng hoặc giảm số lượng một sản phẩm trong giỏ hàng.
function changeQuantity(id, amount) {
  const item = findCartItemByProductId(id);
  if (!item) {
    return;
  }

  item.quantity += amount;
  if (item.quantity <= 0) {
    removeCartItem(id);
    return;
  }

  saveCart();
  renderCart();
}

// Xóa một sản phẩm khỏi giỏ hàng theo id.
function removeCartItem(id) {
  const newCart = [];

  for (let i = 0; i < cart.length; i++) {
    if (cart[i].product.id !== id) {
      newCart.push(cart[i]);
    }
  }

  cart = newCart;
  saveCart();
  renderCart();
}

// Render bảng giỏ hàng, tổng tiền và số lượng hiển thị trên nút giỏ hàng.
function renderCart() {
  let content = "";
  let total = 0;
  let count = 0;

  if (cart.length === 0) {
    cartBody.innerHTML = '<tr><td colspan="4" class="empty-state">Giỏ hàng đang trống.</td></tr>';
  } else {
    for (let i = 0; i < cart.length; i++) {
      const item = cart[i];
      total += item.getTotal();
      count += item.quantity;

      content +=
        "<tr>" +
        "<td>" +
        '<div class="cart-product">' +
        '<img src="' +
        escapeHTML(item.product.img) +
        '" alt="' +
        escapeHTML(item.product.name) +
        '" />' +
        "<span>" +
        escapeHTML(item.product.name) +
        "</span>" +
        "</div>" +
        "</td>" +
        "<td>" +
        '<div class="quantity">' +
        '<button onclick="changeQuantity(\'' +
        item.product.id +
        "', -1)\">-</button>" +
        "<span>" +
        item.quantity +
        "</span>" +
        '<button onclick="changeQuantity(\'' +
        item.product.id +
        "', 1)\">+</button>" +
        "</div>" +
        "</td>" +
        "<td>" +
        formatMoney(item.getTotal()) +
        "</td>" +
        '<td><button class="danger-btn" onclick="removeCartItem(\'' +
        item.product.id +
        "')\">Xóa</button></td>" +
        "</tr>";
    }

    cartBody.innerHTML = content;
  }

  cartTotal.textContent = formatMoney(total);
  cartCount.textContent = count;
}

// Hiển thị slide banner theo index và cập nhật trạng thái active của dots.
function showHeroSlide(index) {
  if (heroSlides.length === 0) {
    return;
  }

  currentHeroSlide = (index + heroSlides.length) % heroSlides.length;

  for (let i = 0; i < heroSlides.length; i++) {
    if (i === currentHeroSlide) {
      heroSlides[i].classList.add("is-active");
    } else {
      heroSlides[i].classList.remove("is-active");
    }
  }

  for (let j = 0; j < heroDots.length; j++) {
    if (j === currentHeroSlide) {
      heroDots[j].classList.add("is-active");
    } else {
      heroDots[j].classList.remove("is-active");
    }
  }
}

// Bắt đầu carousel tự động chuyển slide sau mỗi 4.2 giây.
function startHeroCarousel() {
  if (heroSlides.length <= 1) {
    return;
  }

  heroTimer = setInterval(function () {
    showHeroSlide(currentHeroSlide + 1);
  }, 4200);
}

// Khởi động lại carousel sau khi người dùng bấm chọn một dot.
function restartHeroCarousel() {
  clearInterval(heroTimer);
  startHeroCarousel();
}

// Mở panel giỏ hàng và bật overlay nền.
function openCart() {
  cartPanel.classList.add("is-open");
  overlay.classList.add("is-open");
  cartPanel.setAttribute("aria-hidden", "false");
}

// Đóng panel giỏ hàng và tắt overlay nền.
function closeCart() {
  cartPanel.classList.remove("is-open");
  overlay.classList.remove("is-open");
  cartPanel.setAttribute("aria-hidden", "true");
}

// Gọi MockAPI bằng Axios, lấy danh sách sản phẩm rồi render ra giao diện bán hàng.
function getListProduct() {
  productGrid.innerHTML = '<p class="empty-state">Đang tải sản phẩm...</p>';

  axios({
    url: API_BASE_URL,
    method: "GET"
  })
    .then(function (result) {
      products = [];
      for (let i = 0; i < result.data.length; i++) {
        products.push(mapProduct(result.data[i]));
      }

      renderProducts(products);
      renderCart();
    })
    .catch(function () {
      productGrid.innerHTML = '<p class="empty-state">Không tải được sản phẩm từ MockAPI.</p>';
      renderCart();
    });
}

typeFilter.addEventListener("change", applyFilter);

const categoryButtons = document.querySelectorAll("[data-filter]");
for (let i = 0; i < categoryButtons.length; i++) {
  categoryButtons[i].addEventListener("click", function () {
    typeFilter.value = this.getAttribute("data-filter");
    applyFilter();
    document.getElementById("products").scrollIntoView({ behavior: "smooth" });
  });
}

for (let j = 0; j < heroDots.length; j++) {
  heroDots[j].setAttribute("data-index", j);
  heroDots[j].addEventListener("click", function () {
    const index = Number(this.getAttribute("data-index"));
    showHeroSlide(index);
    restartHeroCarousel();
  });
}

document.getElementById("cartToggle").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);
document.getElementById("checkoutBtn").addEventListener("click", function () {
  cart = [];
  saveCart();
  renderCart();
  closeCart();
});

getListProduct();
showHeroSlide(0);
startHeroCarousel();


