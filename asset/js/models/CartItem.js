// Model lưu một dòng sản phẩm trong giỏ hàng, gồm sản phẩm và số lượng mua.
class CartItem {
  // Khởi tạo item trong giỏ hàng, mặc định số lượng là 1.
  constructor(product, quantity = 1) {
    this.product = product;
    this.quantity = quantity;
  }

  // Tính thành tiền của dòng giỏ hàng này.
  getTotal() {
    return this.product.price * this.quantity;
  }
}
