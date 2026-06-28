// Chuẩn hóa loại sản phẩm để lọc theo iphone/samsung được ổn định hơn.
function normalizeType(type) {
  const value = String(type || "").trim().toLowerCase();

  if (value.indexOf("samsung") !== -1) {
    return "samsung";
  }
  if (value.indexOf("iphone") !== -1) {
    return "iphone";
  }
  return value;
}

// Chuyển dữ liệu thô từ MockAPI thành object Product dùng chung trong toàn dự án.
function mapProduct(item) {
  return new Product(
    item.id,
    item.name,
    item.price,
    item.screen,
    item.backCamera,
    item.frontCamera,
    item.img,
    item.desc,
    normalizeType(item.type)
  );
}

// Kiểm tra trước khi gọi API: cần có endpoint và thư viện Axios.
function assertApiReady() {
  if (!API_BASE_URL || !window.axios) {
    throw new Error("MockAPI endpoint hoặc Axios chưa được cấu hình.");
  }
}

const productService = {
  // Lấy toàn bộ danh sách sản phẩm từ MockAPI.
  getAll: function () {
    assertApiReady();

    return axios({
      url: API_BASE_URL,
      method: "GET"
    }).then(function (response) {
      let result = [];
      for (let i = 0; i < response.data.length; i++) {
        result.push(mapProduct(response.data[i]));
      }
      return result;
    });
  },

  // Tạo sản phẩm mới trên MockAPI.
  create: function (product) {
    assertApiReady();

    return axios({
      url: API_BASE_URL,
      method: "POST",
      data: product
    }).then(function (response) {
      return mapProduct(response.data);
    });
  },

  // Cập nhật một sản phẩm trên MockAPI theo id.
  update: function (id, product) {
    assertApiReady();

    return axios({
      url: API_BASE_URL + "/" + id,
      method: "PUT",
      data: product
    }).then(function (response) {
      return mapProduct(response.data);
    });
  },

  // Xóa một sản phẩm trên MockAPI theo id.
  delete: function (id) {
    assertApiReady();

    return axios({
      url: API_BASE_URL + "/" + id,
      method: "DELETE"
    });
  }
};


