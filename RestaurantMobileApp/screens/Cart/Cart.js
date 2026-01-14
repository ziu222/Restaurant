import React, { useContext, useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, Image, StyleSheet } from 'react-native';
import { Button, Card, IconButton, Menu, List, Divider, Badge } from 'react-native-paper';
import { MyCartContext, MyUserContext } from '../../utils/MyContexts';
import Apis, { authApi, endpoints } from '../../utils/Apis';
import AsyncStorage from "@react-native-async-storage/async-storage";

const Cart = ({ navigation }) => {
    const [cart, cartDispatch] = useContext(MyCartContext);
    const [user] = useContext(MyUserContext);
    
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [currentOrder, setCurrentOrder] = useState(null); 
    const [activeOrderId, setActiveOrderId] = useState(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    // 1. Tải dữ liệu ban đầu (Tách biệt logic để tránh lỗi 404 làm sập App)
    const loadInitialData = async () => {
        const token = await AsyncStorage.getItem("token");
        const savedOrderId = await AsyncStorage.getItem("active_order_id");
    
        if (savedOrderId) {
            try {
                setActiveOrderId(savedOrderId);
                let orderRes = await authApi(token).get(`${endpoints['orders']}${savedOrderId}/`);
                
                // 👇 CHỈ XÓA ID NẾU ĐƠN ĐÃ THANH TOÁN HOẶC BỊ HỦY
                if (orderRes.data.status === 'COMPLETED' || orderRes.data.status === 'CANCELLED') {
                    await AsyncStorage.removeItem("active_order_id");
                    setActiveOrderId(null);
                    setCurrentOrder(null);
                } else {
                    setCurrentOrder(orderRes.data);
                    if (orderRes.data.table) {
                        setSelectedTable({
                            id: orderRes.data.table, 
                            name: orderRes.data.table_name || `Bàn số ${orderRes.data.table}` 
                        });
                    }
                }
            } catch (ex) {
                if (ex.response?.status === 404) {
                    await AsyncStorage.removeItem("active_order_id");
                    setActiveOrderId(null);
                }
            }
        }
    
        // --- PHẦN 2: Tải danh sách bàn (Luôn chạy để hiện danh sách chọn)
        try {
            let res = await Apis.get(endpoints['tables']);
            const tableData = res.data.results || res.data;
            setTables(tableData);
        } catch (ex) {
            console.error("Lỗi tải danh sách bàn:", ex);
        }
    };

    useEffect(() => {
        loadInitialData();
    }, [activeOrderId]);

    // Tính toán tiền bạc
    const cartTotalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const grandTotal = (currentOrder?.total_amount || 0) + cartTotalPrice;

    // 2. Xử lý logic Đặt món / Cập nhật / Đổi bàn
    const processOrder = async (isChangeTable = false, newTable = null) => {
        if (!user) {
            Alert.alert("Thông báo", "Vui lòng đăng nhập!");
            return;
        }

        const tableToUse = newTable || selectedTable;
        if (!activeOrderId && !tableToUse) {
            Alert.alert("Lỗi", "Vui lòng chọn bàn!");
            return;
        }

        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("token");
            let res;

            if (activeOrderId) {
                // TRƯỜNG HỢP: CẬP NHẬT (PATCH)
                const patchData = {};
                if (cart.length > 0) {
                    patchData["items"] = cart.map(item => ({ "dish": item.id, "quantity": item.quantity }));
                }
                if (isChangeTable && newTable) {
                    patchData["table"] = newTable.id;
                }

                res = await authApi(token).patch(`${endpoints['orders']}${activeOrderId}/update-order/`, patchData);
            } else {
                // TRƯỜNG HỢP: TẠO MỚI (POST)
                res = await authApi(token).post(endpoints['orders'], {
                    "items": cart.map(item => ({ "dish": item.id, "quantity": item.quantity })),
                    "table": tableToUse.id,
                    "num_guests": 1,
                    "checkin_time": new Date().toISOString()
                });

                if (res.status === 201) {
                    await AsyncStorage.setItem("active_order_id", res.data.id.toString());
                    setActiveOrderId(res.data.id.toString());
                }
            }

            if (res.status === 200 || res.status === 201) {
                cartDispatch({ type: "clear" });
                loadInitialData();
                Alert.alert("Thành công", isChangeTable ? `Đã chuyển sang ${newTable.name}` : "Đã gửi yêu cầu tới bếp!");
            }
        } catch (ex) {
            // Hiện thông báo lỗi chi tiết từ backend (như trùng giờ đặt bàn)
            let errorMsg = "Thao tác thất bại.";
            if (ex.response?.data?.table) errorMsg = ex.response.data.table;
            Alert.alert("Lỗi", Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // 3. Thanh toán đơn hàng
    const handlePayment = async () => {
        Alert.alert("Xác nhận", "Bạn muốn thanh toán hóa đơn này?", [
            { text: "Hủy", style: "cancel" },
            { text: "Thanh toán", onPress: async () => {
                try {
                    const token = await AsyncStorage.getItem("token");
                    await authApi(token).post(`${endpoints['orders']}${activeOrderId}/pay/`, { "payment_method": "CASH" });
                    
                    await AsyncStorage.removeItem("active_order_id");
                    setActiveOrderId(null);
                    setCurrentOrder(null);
                    setSelectedTable(null);
                    navigation.navigate("Main");
                } catch (ex) {
                    Alert.alert("Lỗi", "Thanh toán không thành công.");
                }
            }}
        ]);
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
                {/* --- KHU VỰC VỊ TRÍ NGỒI --- */}
                <Card style={[styles.card, activeOrderId ? styles.activeTableCard : {}]}>
                    <List.Item
                        title={activeOrderId ? "VỊ TRÍ BẠN ĐANG NGỒI" : "Chọn vị trí ngồi"}
                        titleStyle={[styles.bold, activeOrderId ? {color: '#1976d2'} : {}]}
                        description={selectedTable ? `Bàn: ${selectedTable.name}` : "Chưa chọn bàn"}
                        left={p => <List.Icon {...p} icon="table-furniture" color={activeOrderId ? '#1976d2' : 'gray'} />}
                        right={() => (
                            <Menu visible={menuVisible} onDismiss={() => setMenuVisible(false)}
                                anchor={<Button mode="contained" onPress={() => setMenuVisible(true)}>
                                    {activeOrderId ? "ĐỔI BÀN" : "CHỌN"}
                                </Button>}
                            >
                                {tables.map(t => {
                                    const isMyTable = selectedTable && selectedTable.id === t.id;
                                    return (
                                        <Menu.Item key={t.id} 
                                            title={`${t.name} (${t.capacity} chỗ) ${isMyTable ? "⭐ BẠN ĐANG NGỒI" : (t.is_busy ? "🔴" : "🟢")}`}
                                            disabled={t.is_busy && !isMyTable}
                                            onPress={() => {
                                                setMenuVisible(false);
                                                if (isMyTable) return;
                                                if (activeOrderId) {
                                                    Alert.alert("Đổi bàn", `Chuyển từ ${selectedTable.name} sang ${t.name}?`, [
                                                        { text: "Hủy" },
                                                        { text: "Đồng ý", onPress: () => processOrder(true, t) }
                                                    ]);
                                                } else {
                                                    setSelectedTable(t);
                                                }
                                            }} 
                                        />
                                    );
                                })}
                            </Menu>
                        )}
                    />
                </Card>

                {currentOrder && (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 10, alignItems: 'center' }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Trạng thái đơn hàng:</Text>
                        <Badge 
                            size={30} 
                            style={{ 
                                backgroundColor: currentOrder.status === 'READY' ? '#2e7d32' : '#f57c00', // Xanh cho READY, Cam cho COOKING/PENDING
                                color: 'white',
                                paddingHorizontal: 10
                            }}
                        >
                            {currentOrder.status === 'READY' ? 'MÓN ĐÃ XONG' : 
                            currentOrder.status === 'COOKING' ? 'ĐANG CHẾ BIẾN' : 'ĐANG CHỜ BẾP'}
                        </Badge>
                    </View>
                )}

                {/* --- DANH SÁCH MÓN ĐÃ ĐẶT (Lấy từ Server) --- */}
                {currentOrder && currentOrder.details?.length > 0 && (
                    <Card style={[styles.card, styles.orderedCard]}>
                        <List.Subheader style={styles.orderedHeader}>CHI TIẾT MÓN ĐÃ ĐẶT</List.Subheader>
                        {currentOrder.details.map((d, index) => (
                            <List.Item
                                key={index}
                                title={d.dish_name} // Đảm bảo serializer đã trả về dish_name
                                description={`SL: ${d.quantity} | ${d.unit_price.toLocaleString()}đ`}
                                left={p => <List.Icon {...p} icon="check-circle" color="#2e7d32" />}
                                right={() => <Text style={styles.itemTotal}>{(d.quantity * d.unit_price).toLocaleString()}đ</Text>}
                            />
                        ))}
                    </Card>
                )}

                {/* --- GIỎ HÀNG (Món mới đang chọn) --- */}
                <List.Subheader>MÓN MỚI ĐANG CHỌN</List.Subheader>
                {cart.length === 0 ? (
                    <Text style={styles.emptyText}>Chưa có món mới nào được chọn.</Text>
                ) : (
                    cart.map(item => (
                        <Card key={item.id} style={styles.itemCard}>
                            <View style={styles.row}>
                                <Image source={{ uri: item.image }} style={styles.img} />
                                <View style={{ flex: 1, marginLeft: 10 }}>
                                    <Text style={styles.bold}>{item.name}</Text>
                                    <Text style={styles.price}>{item.price.toLocaleString()}đ</Text>
                                </View>
                                <View style={styles.qtyBox}>
                                    <IconButton icon="minus-circle-outline" onPress={() => cartDispatch({type:'dec', payload:item.id})} />
                                    <Text style={styles.qtyText}>{item.quantity}</Text>
                                    <IconButton icon="plus-circle-outline" onPress={() => cartDispatch({type:'inc', payload:item.id})} />
                                </View>
                            </View>
                        </Card>
                    ))
                )}
            </ScrollView>

            {/* --- FOOTER TỔNG TIỀN --- */}
            <View style={styles.footer}>
                <View style={styles.summaryRow}>
                    <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
                    <Text style={styles.totalValue}>{grandTotal.toLocaleString()}đ</Text>
                </View>
                <View style={styles.btnRow}>
                    <Button mode="contained" onPress={() => processOrder(false)} loading={loading}
                        disabled={cart.length === 0 && !activeOrderId} style={{ flex: 2 }}>
                        {activeOrderId ? "GỬI THÊM MÓN" : "ĐẶT BÀN & MÓN"}
                    </Button>
                    {activeOrderId && (
                        <Button mode="outlined" onPress={handlePayment} style={{ flex: 1 }} textColor="red">
                            THANH TOÁN
                        </Button>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    card: { margin: 8, elevation: 2 },
    activeTableCard: { backgroundColor: '#e3f2fd', borderWidth: 1, borderColor: '#2196f3' },
    orderedCard: { backgroundColor: '#f1f8e9' },
    orderedHeader: { color: '#2e7d32', fontWeight: 'bold' },
    itemCard: { marginHorizontal: 8, marginBottom: 6, padding: 8 },
    row: { flexDirection: 'row', alignItems: 'center' },
    img: { width: 50, height: 50, borderRadius: 6 },
    bold: { fontWeight: 'bold' },
    price: { color: '#d32f2f' },
    qtyBox: { flexDirection: 'row', alignItems: 'center' },
    qtyText: { fontWeight: 'bold', fontSize: 16 },
    itemTotal: { alignSelf: 'center', fontWeight: 'bold' },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 15, backgroundColor: 'white', borderTopWidth: 1, borderColor: '#eee' },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    totalLabel: { fontSize: 16 },
    totalValue: { fontSize: 22, fontWeight: 'bold', color: '#d32f2f' },
    btnRow: { flexDirection: 'row', gap: 8 },
    emptyText: { textAlign: 'center', color: 'gray', marginTop: 10 }
});

export default Cart;