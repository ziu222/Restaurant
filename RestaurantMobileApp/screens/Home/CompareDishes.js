import React from 'react';
import { View, ScrollView, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { DataTable, Text, IconButton, Divider, Button } from 'react-native-paper';

const CompareDishes = ({ route, navigation }) => {
    // 1. Kiểm tra dữ liệu: Nếu tắt app mở lại, params sẽ mất -> cần chọn lại món
    const dishes = route.params?.dishes || []; 

    if (dishes.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <IconButton icon="alert-circle-outline" size={80} iconColor="#ccc" />
                <Text style={styles.emptyText}>Dữ liệu bị xóa sau khi restart. Vui lòng quay lại chọn món!</Text>
                <Button mode="contained" onPress={() => navigation.navigate("Home")} style={{ marginTop: 20 }}>
                    QUAY LẠI TRANG CHỦ
                </Button>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* 2. THANH TIÊU ĐỀ & NÚT QUAY LẠI */}
            <View style={styles.headerBar}>
                <IconButton icon="arrow-left" size={24} onPress={() => navigation.goBack()} />
                <Text style={styles.headerTitle}>So sánh chi tiết</Text>
            </View>
            <Divider />

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.tableWrapper}>
                    {/* 👇 CHÌA KHÓA: Tăng độ rộng cột lên 200 để tên món có chỗ hiện */}
                    <View style={{ width: dishes.length * 200 + 120 }}>
                        
                        {/* --- HÀNG TÊN MÓN ĂN (Dùng View thay vì Title để KHÔNG bị "...") --- */}
                        <View style={styles.customHeaderRow}>
                            <View style={styles.labelCol}>
                                <Text style={styles.boldLabel}>Món ăn</Text>
                            </View>
                            {dishes.map(d => (
                                <View key={d.id} style={styles.dataColFixed}>
                                    <Image source={{ uri: d.image }} style={styles.dishImg} />
                                    <View style={styles.nameWrapper}>
                                        <Text style={styles.dishNameFull}>
                                            {d.name}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>

                        <DataTable>
                            {/* --- HÀNG GIÁ --- */}
                            <DataTable.Row style={styles.row}>
                                <DataTable.Cell style={styles.labelCol}>
                                    <Text style={styles.boldText}>Giá</Text>
                                </DataTable.Cell>
                                {dishes.map(d => (
                                    <DataTable.Cell key={d.id} style={styles.dataColFixed}>
                                        <Text style={styles.priceValue}>{d.price?.toLocaleString()}đ</Text>
                                    </DataTable.Cell>
                                ))}
                            </DataTable.Row>

                            {/* --- HÀNG PHỤC VỤ (Preparation) --- */}
                            <DataTable.Row style={styles.row}>
                                <DataTable.Cell style={styles.labelCol}>
                                    <Text style={styles.boldText}>Phục vụ</Text>
                                </DataTable.Cell>
                                {dishes.map(d => (
                                    <DataTable.Cell key={d.id} style={styles.dataColFixed}>
                                        <Text style={styles.normalText}>{d.preparation || "15"} phút</Text>
                                    </DataTable.Cell>
                                ))}
                            </DataTable.Row>

                            {/* --- HÀNG ĐÁNH GIÁ --- */}
                            <DataTable.Row style={styles.row}>
                                <DataTable.Cell style={styles.labelCol}>
                                    <Text style={styles.boldText}>Đánh giá</Text>
                                </DataTable.Cell>
                                {dishes.map(d => (
                                    <DataTable.Cell key={d.id} style={styles.dataColFixed}>
                                        <Text style={styles.ratingText}>⭐ {d.rating || "5.0"}</Text>
                                    </DataTable.Cell>
                                ))}
                            </DataTable.Row>

                            {/* --- HÀNG NGUYÊN LIỆU (Dùng dữ liệu từ ảnh Khoa gửi) --- */}
                            <DataTable.Row style={styles.ingredientsRow}>
                                <DataTable.Cell style={styles.labelCol}>
                                    <Text style={styles.boldText}>Nguyên liệu</Text>
                                </DataTable.Cell>
                                {dishes.map(d => (
                                    <DataTable.Cell key={d.id} style={styles.dataColFixed}>
                                        <Text style={styles.ingContent}>
                                            {d.ingredients || "Nhiều thành phần"}
                                        </Text>
                                    </DataTable.Cell>
                                ))}
                            </DataTable.Row>
                        </DataTable>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    emptyText: { textAlign: 'center', fontSize: 16, color: '#666', fontWeight: 'bold' },
    headerBar: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    tableWrapper: { paddingHorizontal: 15, paddingVertical: 10 },
    
    // Header tùy chỉnh để hiện tên đầy đủ
    customHeaderRow: { flexDirection: 'row', paddingVertical: 15, borderBottomWidth: 1, borderColor: '#eee' },
    
    labelCol: { width: 100, justifyContent: 'center' },
    dataColFixed: { width: 200, alignItems: 'center', justifyContent: 'center' }, // Tăng lên 200px
    
    dishImg: { width: 75, height: 75, borderRadius: 12 },
    nameWrapper: { width: 180, marginTop: 10 }, // Wrapper rộng 180px để ép xuống dòng
    dishNameFull: { 
        fontSize: 14, 
        fontWeight: 'bold', 
        textAlign: 'center', 
        color: '#1976d2', 
        lineHeight: 20 
    },
    
    row: { height: 70, borderBottomWidth: 0.5, borderColor: '#eee' },
    ingredientsRow: { height: 180 },
    boldLabel: { fontWeight: 'bold', fontSize: 16, color: '#000' },
    boldText: { fontWeight: 'bold', color: '#555', fontSize: 14 },
    normalText: { fontSize: 14, color: '#333' },
    priceValue: { color: '#d32f2f', fontWeight: 'bold', fontSize: 15 },
    ratingText: { color: '#fbc02d', fontWeight: 'bold' },
    ingContent: { fontSize: 11, color: '#666', lineHeight: 18, textAlign: 'center' }
});

export default CompareDishes;