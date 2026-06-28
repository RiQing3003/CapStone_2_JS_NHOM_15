let adminProducts = [];

const productForm = document.getElementById("productForm");
const productId = document.getElementById("productId");
const formTitle = document.getElementById("formTitle");
const adminProductBody = document.getElementById("adminProductBody");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const deleteModal = document.getElementById("deleteModal");
const deleteProductName = document.getElementById("deleteProductName");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

const fields = ["name", "price", "screen", "backCamera", "frontCamera", "img", "desc", "type"];
let pendingDeleteId = null;

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

// Lấy giá trị của một input trong form và tự động bỏ khoảng trắng đầu/cuối.
function getFieldValue(id) {
  return document.getElementById(id).value.trim();
}

// Ghi hoặc xóa thông báo lỗi của một field trong form.
function setError(id, message) {
  if (!message) {
    message = "";
  }
  document.getElementById(id + "Error").textContent = message;
}

// Kiểm tra dữ liệu form trước khi thêm/cập nhật sản phẩm.
function validateProduct() {
  let isValid = true;

  for (let i = 0; i < fields.length; i++) {
    setError(fields[i], "");
  }

  if (getFieldValue("name") === "") {
    setError("name", "Vui lòng nhập tên sản phẩm.");
    isValid = false;
  }

  if (getFieldValue("price") === "" || Number(getFieldValue("price")) <= 0) {
    setError("price", "Giá phải lớn hơn 0.");
    isValid = false;
  }

  const requiredFields = ["screen", "backCamera", "frontCamera", "img", "desc"];
  for (let j = 0; j < requiredFields.length; j++) {
    if (getFieldValue(requiredFields[j]) === "") {
      setError(requiredFields[j], "Không được bỏ trống.");
      isValid = false;
    }
  }

  if (getFieldValue("type") === "") {
    setError("type", "Vui lòng chọn loại sản phẩm.");
    isValid = false;
  }

  try {
    new URL(getFieldValue("img"));
  } catch (error) {
    setError("img", "Vui lòng nhập đường dẫn hình ảnh hợp lệ.");
    isValid = false;
  }

  return isValid;
}

// Gom dữ liệu trong form thành object Product để gửi lên MockAPI.
function getFormProduct() {
  return new Product(
    productId.value,
    getFieldValue("name"),
    Number(getFieldValue("price")),
    getFieldValue("screen"),
    getFieldValue("backCamera"),
    getFieldValue("frontCamera"),
    getFieldValue("img"),
    getFieldValue("desc"),
    getFieldValue("type")
  );
}

// Xóa dữ liệu form và đưa form về trạng thái thêm sản phẩm mới.
function resetForm() {
  productForm.reset();
  productId.value = "";
  formTitle.textContent = "Thêm sản phẩm";

  for (let i = 0; i < fields.length; i++) {
    setError(fields[i], "");
  }
}

// Đổ dữ liệu sản phẩm lên form để admin chỉnh sửa.
function fillForm(product) {
  productId.value = product.id;
  formTitle.textContent = "Cập nhật sản phẩm";

  for (let i = 0; i < fields.length; i++) {
    document.getElementById(fields[i]).value = product[fields[i]];
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Lấy danh sách sản phẩm sau khi áp dụng tìm kiếm và sắp xếp.
function getVisibleProducts() {
  const keyword = searchInput.value.trim().toLowerCase();
  const sortValue = sortSelect.value;
  let result = [];

  for (let i = 0; i < adminProducts.length; i++) {
    const productName = adminProducts[i].name.toLowerCase();
    if (productName.indexOf(keyword) !== -1) {
      result.push(adminProducts[i]);
    }
  }

  if (sortValue === "asc") {
    result.sort(function (a, b) {
      return a.price - b.price;
    });
  }

  if (sortValue === "desc") {
    result.sort(function (a, b) {
      return b.price - a.price;
    });
  }

  return result;
}

// Render bảng sản phẩm trong trang quản trị.
function renderAdminProducts() {
  const list = getVisibleProducts();
  let content = "";

  if (list.length === 0) {
    adminProductBody.innerHTML = '<tr><td colspan="5" class="empty-state">Không có sản phẩm.</td></tr>';
    return;
  }

  for (let i = 0; i < list.length; i++) {
    const product = list[i];

    content +=
      "<tr>" +
      "<td>" +
      '<div class="admin-product">' +
      '<img src="' +
      escapeHTML(product.img) +
      '" alt="' +
      escapeHTML(product.name) +
      '" />' +
      "<div>" +
      "<strong>" +
      escapeHTML(product.name) +
      "</strong>" +
      "<p>" +
      escapeHTML(product.screen) +
      "</p>" +
      "</div>" +
      "</div>" +
      "</td>" +
      '<td><span class="type-pill">' +
      escapeHTML(product.type) +
      "</span></td>" +
      "<td><strong>" +
      formatMoney(product.price) +
      "</strong></td>" +
      "<td>" +
      escapeHTML(product.backCamera) +
      "</td>" +
      "<td>" +
      '<div class="row-actions">' +
      '<button class="secondary-btn" onclick="editProduct(\'' +
      product.id +
      "')\">Sửa</button>" +
      '<button class="danger-btn" onclick="deleteProduct(\'' +
      product.id +
      "')\">Xóa</button>" +
      "</div>" +
      "</td>" +
      "</tr>";
  }

  adminProductBody.innerHTML = content;
}

// Tải danh sách sản phẩm từ MockAPI rồi render lại bảng quản trị.
function loadProducts() {
  productService.getAll().then(function (data) {
    adminProducts = data;
    renderAdminProducts();
  });
}

// Tìm sản phẩm theo id trong mảng adminProducts.
function findAdminProductById(id) {
  for (let i = 0; i < adminProducts.length; i++) {
    if (adminProducts[i].id === id) {
      return adminProducts[i];
    }
  }
  return null;
}

// Tìm sản phẩm theo id và đưa dữ liệu lên form chỉnh sửa.
function editProduct(id) {
  const product = findAdminProductById(id);
  if (product) {
    fillForm(product);
  }
}

// Mở modal xác nhận xóa cho sản phẩm được chọn.
function deleteProduct(id) {
  const product = findAdminProductById(id);
  if (!product) {
    return;
  }

  pendingDeleteId = id;
  deleteProductName.textContent = product.name;
  deleteModal.classList.add("is-open");
  deleteModal.setAttribute("aria-hidden", "false");
}

// Đóng modal xác nhận xóa và xóa trạng thái sản phẩm đang chờ xóa.
function closeDeleteModal() {
  pendingDeleteId = null;
  deleteModal.classList.remove("is-open");
  deleteModal.setAttribute("aria-hidden", "true");
}

// Xác nhận xóa sản phẩm trên MockAPI rồi tải lại danh sách.
function confirmDeleteProduct() {
  if (!pendingDeleteId) {
    return;
  }

  confirmDeleteBtn.disabled = true;
  confirmDeleteBtn.textContent = "Đang xóa...";

  productService.delete(pendingDeleteId).then(function () {
    confirmDeleteBtn.disabled = false;
    confirmDeleteBtn.textContent = "Xóa sản phẩm";
    closeDeleteModal();
    loadProducts();
  });
}

productForm.addEventListener("submit", function (event) {
  event.preventDefault();

  if (!validateProduct()) {
    return;
  }

  const product = getFormProduct();
  let action;

  if (productId.value) {
    action = productService.update(productId.value, product);
  } else {
    action = productService.create(product);
  }

  action.then(function () {
    resetForm();
    loadProducts();
  });
});

document.getElementById("clearBtn").addEventListener("click", resetForm);
searchInput.addEventListener("input", renderAdminProducts);
sortSelect.addEventListener("change", renderAdminProducts);
cancelDeleteBtn.addEventListener("click", closeDeleteModal);
confirmDeleteBtn.addEventListener("click", confirmDeleteProduct);

deleteModal.addEventListener("click", function (event) {
  if (event.target === deleteModal) {
    closeDeleteModal();
  }
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && deleteModal.classList.contains("is-open")) {
    closeDeleteModal();
  }
});

loadProducts();


