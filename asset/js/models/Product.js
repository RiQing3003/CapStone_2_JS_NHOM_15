// Model lưu thông tin một sản phẩm điện thoại dùng chung cho trang bán hàng và admin.
class Product {
  // Khởi tạo object Product từ dữ liệu API hoặc dữ liệu nhập từ form admin.
  constructor(id, name, price, screen, backCamera, frontCamera, img, desc, type) {
    this.id = id;
    this.name = name;
    this.price = Number(price);
    this.screen = screen;
    this.backCamera = backCamera;
    this.frontCamera = frontCamera;
    this.img = img;
    this.desc = desc;
    this.type = type;
  }
}
