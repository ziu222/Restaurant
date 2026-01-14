import React, { useState, useEffect } from 'react';
import { View, FlatList, Alert, StyleSheet } from 'react-native';
import { Card, Text, Button, Badge, List } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, endpoints } from '../../utils/Apis';

const ChefOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("token");
            let res = await authApi(token).get(endpoints['orders']);
            setOrders(res.data.results || res.data);
        } catch (ex) {
            console.error(ex);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadOrders(); }, []);

    // Hàm đổi trạng thái
    const updateStatus = async (orderId, actionPath) => {
        try {
            const token = await AsyncStorage.getItem("token");
            // POST /orders/{id}/take-order/ hoặc /ready-order/
            await authApi(token).post(`${endpoints['orders']}${orderId}/${actionPath}/`);
            loadOrders(); // Tải lại danh sách sau khi đổi trạng thái
        } catch (ex) {
            Alert.alert("Lỗi", "Không thể cập nhật trạng thái.");
        }
    };

    const renderOrderItem = ({ item }) => (
        <Card style={styles.card}>
            <Card.Title 
                title={`Đơn hàng #${item.id} - Bàn ${item.table_name || item.table}`}
                subtitle={`Lúc: ${new Date(item.created_date).toLocaleTimeString()}`}
                right={() => <Badge style={styles.badge}>{item.status}</Badge>}
            />
            <Card.Content>
                {item.details.map((d, index) => (
                    <List.Item key={index} title={`${d.dish_name} x${d.quantity}`} />
                ))}
            </Card.Content>
            <Card.Actions>
                {item.status !== 'COOKING' && item.status !== 'READY' && (
                    <Button mode="contained" onPress={() => updateStatus(item.id, 'take-order')}>
                        TIẾP NHẬN
                    </Button>
                )}
                {item.status === 'COOKING' && (
                    <Button mode="contained" buttonColor="green" onPress={() => updateStatus(item.id, 'ready-order')}>
                        HOÀN THÀNH
                    </Button>
                )}
            </Card.Actions>
        </Card>
    );

    return (
        <View style={styles.container}>
            <FlatList data={orders} renderItem={renderOrderItem} keyExtractor={item => item.id.toString()}
                onRefresh={loadOrders} refreshing={loading} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10, backgroundColor: '#f0f2f5' },
    card: { marginBottom: 15, elevation: 4 },
    badge: { backgroundColor: 'orange', marginRight: 10 }
});

export default ChefOrders;