import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card, IconButton, Chip } from 'react-native-paper'; 
import Apis, { endpoints } from '../utils/Apis';
import { MyUserContext, MyCartContext } from '../utils/MyContexts';

const Dishes = ({ cateId, keyword, ordering, toggleCompare, compareItems = [] }) => {
    const [dishes, setDishes] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [user] = useContext(MyUserContext);
    const [, dispatch] = useContext(MyCartContext);
    const navigation = useNavigation();

    useEffect(() => {
        const loadDishes = async () => {
            setLoading(true);
            try {
                let e = endpoints['dishes'];
                let queryParts = [];
                if (cateId) queryParts.push(`category_id=${cateId}`);
                if (keyword) queryParts.push(`q=${keyword}`);
                if (ordering) queryParts.push(`ordering=${ordering}`);
                
                if (queryParts.length > 0) e = `${e}?${queryParts.join("&")}`;

                let res = await Apis.get(e);
                setDishes(res.data.results);
            } catch (ex) {
                console.error(ex);
            } finally {
                setLoading(false);
            }
        }
        loadDishes();
    }, [cateId, keyword, ordering]);

    const quickAddToCart = (dish) => {
        if (!user) {
            Alert.alert("Thông báo", "Vui lòng đăng nhập để đặt món!");
            return;
        }
        dispatch({ type: "add", payload: dish });
        Alert.alert("Đã thêm", `Đã thêm ${dish.name} vào giỏ!`);
    }

    if (loading) return <ActivityIndicator size="large" color="orange" style={{marginTop: 20}} />;

    return (
        <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
            {dishes.length === 0 && <Text style={{textAlign: 'center', marginTop: 20}}>Không có món ăn nào.</Text>}
            
            {dishes.map(d => {
                const isComparing = compareItems.some(i => i.id === d.id);
                
                return (
                    <TouchableOpacity key={d.id} onPress={() => navigation.navigate("DishDetail", { dishId: d.id })}>
                        <Card style={styles.card}>
                            <Card.Cover source={{ uri: d.image }} />
                            
                            {/* Sửa lỗi hiển thị thời gian nấu (Thêm fallback nếu null) */}
                            <View style={styles.prepBadge}>
                                <IconButton icon="clock-outline" size={16} iconColor="white" style={{margin:0}} />
                                <Text style={styles.prepText}>
                                    {d.preparation ? d.preparation : "15"} phút
                                </Text>
                            </View>

                            <Card.Content style={{paddingTop: 10}}>
                                <View style={styles.rowBetween}>
                                    <View style={{flex: 1}}>
                                        <Text style={styles.dishName}>{d.name}</Text>
                                        <Text style={styles.dishPrice}>{d.price.toLocaleString("vi-VN")} đ</Text>
                                    </View>
                                    <View style={{flexDirection: 'row'}}>
                                        <IconButton 
                                            icon={isComparing ? "checkbox-marked-circle" : "compare"} 
                                            mode="contained" 
                                            containerColor={isComparing ? "#2196F3" : "#e0e0e0"} 
                                            iconColor={isComparing ? "white" : "black"}
                                            onPress={() => toggleCompare(d)}
                                        />
                                        <IconButton icon="cart-plus" mode="contained" containerColor="#ff9800" iconColor="white" onPress={() => quickAddToCart(d)} />
                                    </View>
                                </View>

                                {/* 👇 HIỂN THỊ TAGS: Loại bỏ chiều cao cố định để hiện đầy đủ */}
                                <View style={styles.tagContainer}>
                                    {d.tags && d.tags.map((tag, index) => (
                                        <Chip 
                                            key={index} 
                                            style={styles.tag} 
                                            textStyle={styles.tagText}
                                            icon="tag-outline"
                                            compact={true}
                                        >
                                            {tag.name}
                                        </Chip>
                                    ))}
                                </View>
                            </Card.Content>
                        </Card>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    card: { margin: 10, marginBottom: 5, overflow: 'hidden', backgroundColor: 'white' },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    dishName: { fontSize: 18, fontWeight: 'bold' },
    dishPrice: { fontSize: 16, fontWeight: 'bold', color: 'red' },
    prepBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 15,
        paddingRight: 10
    },
    prepText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
    tagContainer: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        marginTop: 10,
        paddingBottom: 5 
    },
    tag: { 
        marginRight: 6, 
        marginBottom: 6, 
        backgroundColor: '#e3f2fd', // Màu xanh nhạt cho tag chuyên nghiệp hơn
        borderRadius: 8
    },
    tagText: { 
        fontSize: 11, 
        color: '#1976d2', 
        fontWeight: 'bold',
        marginVertical: 2 // Tạo không gian cho chữ
    }
});

export default Dishes;