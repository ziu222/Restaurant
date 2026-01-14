import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { Card, Chip, Divider, List } from 'react-native-paper';
import moment from "moment";
import 'moment/locale/vi';
import Apis, { authApi, endpoints } from '../../utils/Apis';
import { MyUserContext } from '../../utils/MyContexts';
import AsyncStorage from "@react-native-async-storage/async-storage";

const OrderHistory = () => {
    // Khởi tạo là mảng rỗng [] để tránh lỗi undefined ban đầu
    const [orders, setOrders] = useState([]); 
    const [loading, setLoading] = useState(false);
    const [user] = useContext(MyUserContext);

    useEffect(() => {
        const loadOrders = async () => {
            setLoading(true);
            try {
                const token = await AsyncStorage.getItem("token");
                let res = await authApi(token).get(endpoints['order-history']);
                
                // 👇 DEBUG: Log dữ liệu ra xem server trả về cái gì
                console.log("Dữ liệu lịch sử đơn hàng:", res.data);

                // 👇 LOGIC FIX LỖI: Kiểm tra kỹ định dạng dữ liệu
                if (Array.isArray(res.data)) {
                    setOrders(res.data); // Trường hợp 1: Trả về mảng trực tiếp
                } else if (res.data && Array.isArray(res.data.results)) {
                    setOrders(res.data.results); // Trường hợp 2: Có phân trang (Django DRF mặc định)
                } else {
                    setOrders([]); // Trường hợp lỗi: Không có dữ liệu
                }

            } catch (ex) {
                console.error("Lỗi lấy danh sách đơn:", ex);
            } finally {
                setLoading(false);
            }
        }
        loadOrders();
    }, []);

    const getStatusColor = (status) => {
        switch(status) {
            case 'PENDING': return '#ff9800'; // Cam
            case 'CONFIRMED': return '#2196f3'; // Xanh dương
            case 'COOKING': return '#9c27b0'; // Tím
            case 'COMPLETED': return '#4caf50'; // Xanh lá
            default: return 'gray';
        }
    }

    if (loading) return <ActivityIndicator size="large" color="orange" style={{marginTop: 20}} />;

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
            {/* 👇 Kiểm tra orders tồn tại rồi mới check length */}
            {orders && orders.length === 0 && (
                <Text style={{ textAlign: 'center', marginTop: 20, color: 'gray' }}>Bạn chưa có đơn hàng nào.</Text>
            )}

            {orders && orders.map(o => (
                <Card key={o.id} style={{ margin: 10, backgroundColor: 'white' }}>
                    <Card.Title 
                        title={`Đơn hàng #${o.id}`} 
                        subtitle={moment(o.created_date).format("LLL")}
                        right={(props) => (
                            <Chip 
                                style={{ backgroundColor: getStatusColor(o.status), marginRight: 10 }} 
                                textStyle={{ color: 'white', fontSize: 12 }}
                            >
                                {o.status}
                            </Chip>
                        )}
                    />
                    <Divider />
                    <Card.Content style={{ marginTop: 10 }}>
                        <List.Accordion title="Chi tiết món ăn" style={{ backgroundColor: 'white', padding: 0 }}>
                            {o.details && o.details.map(d => (
                                <List.Item 
                                    key={d.id}
                                    title={`${d.dish_name} (x${d.quantity})`}
                                    description={`${parseFloat(d.unit_price).toLocaleString("vi-VN")} đ`} // Thêm parseFloat cho an toàn
                                    left={props => 
                                        d.dish_image 
                                        ? <Image source={{uri: d.dish_image}} style={{width: 40, height: 40, borderRadius: 5}} />
                                        : <List.Icon {...props} icon="food" />
                                    }
                                />
                            ))}
                        </List.Accordion>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
                            <Text style={{ fontWeight: 'bold' }}>Tổng tiền:</Text>
                            <Text style={{ fontWeight: 'bold', color: 'red', fontSize: 16 }}>
                                {o.total_amount ? o.total_amount.toLocaleString("vi-VN") : 0} VNĐ
                            </Text>
                        </View>
                    </Card.Content>
                </Card>
            ))}
        </ScrollView>
    );
};

export default OrderHistory;