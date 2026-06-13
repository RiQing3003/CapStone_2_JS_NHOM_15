// Chuẩn hóa loại sản phẩm để lọc theo iphone/samsung được ổn định hơn.
function normalizeType(type) {
  const value = String(type ?? "").trim().toLowerCase();
  if (value.includes("samsung")) return "samsung";
  if (value.includes("iphone")) return "iphone";
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



