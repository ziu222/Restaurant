const MyCartReducer = (currentState, action) => {
    switch (action.type) {
        case "add":
            // Kiểm tra xem món này có trong giỏ chưa
            if (currentState.find(item => item.id === action.payload.id))
                return currentState; // Có rồi thì thôi không thêm nữa (hoặc bạn có thể cho tăng số lượng)
            
            // Nếu chưa có, thêm vào với số lượng mặc định là 1
            return [...currentState, { ...action.payload, quantity: 1 }];

        case "remove":
            // Lọc bỏ món có id trùng với payload
            return currentState.filter(item => item.id !== action.payload);

        case "inc": // Tăng số lượng
            return currentState.map(item => 
                item.id === action.payload 
                ? { ...item, quantity: item.quantity + 1 } 
                : item
            );

        case "dec": // Giảm số lượng
            return currentState.map(item => {
                if (item.id === action.payload) {
                    return { ...item, quantity: item.quantity > 1 ? item.quantity - 1 : 1 };
                }
                return item;
            });

        case "clear": // Xóa sạch giỏ (sau khi thanh toán xong)
            return [];

        default:
            return currentState;
    }
}

export default MyCartReducer;