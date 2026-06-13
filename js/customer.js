let products = [];

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
  return `${Number(value).toLocaleString("vi-VN")}đ`;
}

// Chuyển ký tự đặc biệt thành HTML entities để tránh lỗi hiển thị khi render chuỗi vào HTML.
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return entities[char];
  });
}

// Render danh sách sản phẩm ra khu vực "Sản phẩm nổi bật".
function renderProducts(list) {
  if (!list.length) {
    productGrid.innerHTML = `<p class="empty-state">Không có sản phẩm phù hợp.</p>`;
    return;
  }

  productGrid.innerHTML = list
    .map((product, index) => {
      const oldPrice = Math.round(Number(product.price) * 1.08);
      const badge = index === 0 ? `<span class="sale-badge">Giảm 5%</span>` : index === 3 ? `<span class="installment-badge">Trả góp 0%</span>` : "";

      return `
        <article class="product-card">
          ${badge}
          <div class="product-card__media">
            <img src="${escapeHTML(product.img)}" alt="${escapeHTML(product.name)}" />
          </div>
          <div class="product-card__body">
            <h3>${escapeHTML(product.name)}</h3>
            <strong>${formatMoney(product.price)}</strong>
            <del>${formatMoney(oldPrice)}</del>
            <p>${escapeHTML(product.desc)}</p>
            <div class="product-meta">
              <span>★ 4.${8 - (index % 3)} (${52 + index * 11})</span>
              <button class="cart-icon-btn" type="button" aria-label="Mua ngay ${escapeHTML(product.name)}">Mua ngay</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

// Lọc sản phẩm theo loại đang chọn trong dropdown rồi render lại danh sách.
function applyFilter() {
  const type = typeFilter.value;
  const filtered = type === "all" ? products : products.filter((product) => product.type === type);
  renderProducts(filtered);
}

// Giao diện giỏ hàng
function renderCart() {
  cartBody.innerHTML = `<tr><td colspan="4" class="empty-state">Giỏ hàng đang trống.</td></tr>`;
  cartTotal.textContent = formatMoney(0);
  cartCount.textContent = 0;
}

// Hiển thị slide banner theo index và cập nhật trạng thái active của dots.
function showHeroSlide(index) {
  if (!heroSlides.length) return;
  currentHeroSlide = (index + heroSlides.length) % heroSlides.length;
  heroSlides.forEach((slide, slideIndex) => {
    slide.classList.toggle("is-active", slideIndex === currentHeroSlide);
  });
  heroDots.forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === currentHeroSlide);
  });
}

// Bắt đầu carousel tự động chuyển slide sau mỗi 4.2 giây.
function startHeroCarousel() {
  if (heroSlides.length <= 1) return;
  heroTimer = setInterval(() => {
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
  productGrid.innerHTML = `<p class="empty-state">Đang tải sản phẩm...</p>`;

  const promise = axios({
    url: API_BASE_URL,
    method: "GET"
  });

  promise
    .then(function (result) {
      products = result.data.map(mapProduct);
      renderProducts(products);
      renderCart();
    })
    .catch(function (error) {
      console.log(error);
      productGrid.innerHTML = `<p class="empty-state">Không tải được sản phẩm từ MockAPI.</p>`;
      renderCart();
    });
}

typeFilter.addEventListener("change", applyFilter);
document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    typeFilter.value = button.dataset.filter;
    applyFilter();
    document.getElementById("products").scrollIntoView({ behavior: "smooth" });
  });
});
heroDots.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    showHeroSlide(index);
    restartHeroCarousel();
  });
});


getListProduct();
showHeroSlide(0);
startHeroCarousel();
