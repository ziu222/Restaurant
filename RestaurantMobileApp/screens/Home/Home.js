import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Searchbar, Button, Menu, Divider, IconButton, Badge } from "react-native-paper";
import { MyCartContext } from '../../utils/MyContexts';
import Apis, { endpoints } from '../../utils/Apis';
import Categories from "../../components/Categories"; 
import Dishes from "../../components/Dishes";       
import MyStyles from "../../styles/MyStyles";

const Home = ({ navigation }) => {
    const [cateId, setCateId] = useState("");
    const [q, setQ] = useState(""); 
    
    // --- STATE CHO SẮP XẾP ---
    const [orderBy, setOrderBy] = useState("id"); 
    const [visible, setVisible] = useState(false); 
    const [sortLabel, setSortLabel] = useState("Mặc định");
    
    // Lấy giỏ hàng từ Context để tính số lượng
    const [cart] = useContext(MyCartContext);
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

    // --- STATE CHO SO SÁNH MÓN ĂN ---
    const [compareItems, setCompareItems] = useState([]); 

    const toggleCompare = (dish) => {
        if (compareItems.find(item => item.id === dish.id)) {
            // Nếu đã chọn rồi thì bỏ chọn
            setCompareItems(compareItems.filter(item => item.id !== dish.id));
        } else {
            // Chỉ cho phép chọn tối đa 3 món để bảng so sánh không bị quá dài
            if (compareItems.length < 3) {
                setCompareItems([...compareItems, dish]);
            } else {
                Alert.alert("Thông báo", "Bạn chỉ có thể so sánh tối đa 3 món cùng lúc.");
            }
        }
    };

    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);

    const handleSort = (value, label) => {
        closeMenu(); 
        setTimeout(() => {
            setOrderBy(value);
            setSortLabel(label);
        }, 100);
    };

    return (
        <View style={[MyStyles.container, { backgroundColor: 'white', flex: 1 }]}>
            
            {/* 1. Thanh tìm kiếm */}
            <View style={{ padding: 10 }}>
                <Searchbar 
                    placeholder="Tìm món ăn..." 
                    onChangeText={setQ} 
                    value={q}
                    elevation={1}
                    style={{ backgroundColor: '#f0f0f0' }}
                />
            </View>

            {/* 2. Thanh công cụ: Danh mục & Sắp xếp */}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 }}>
                <View style={{ flex: 1 }}>
                        <Categories setCateId={setCateId} />
                </View>

                <View>
                    <Menu
                        visible={visible}
                        onDismiss={closeMenu}
                        anchor={
                            <View collapsable={false}>
                                <Button icon="sort" mode="text" onPress={openMenu} labelStyle={{fontSize: 12}}>
                                    {sortLabel}
                                </Button>
                            </View>
                        }>
                        <Menu.Item onPress={() => handleSort("id", "Mặc định")} title="Mặc định" />
                        <Divider />
                        <Menu.Item onPress={() => handleSort("price", "Giá tăng dần")} title="Giá: Thấp -> Cao" />
                        <Menu.Item onPress={() => handleSort("-price", "Giá giảm dần")} title="Giá: Cao -> Thấp" />
                        <Divider />
                        <Menu.Item onPress={() => handleSort("name", "Tên A-Z")} title="Tên: A -> Z" />
                    </Menu>
                </View>
            </View>

            {/* 3. Danh sách món ăn - 👇 ĐÃ TRUYỀN THÊM PROPS CHO SO SÁNH */}
            <View style={{ flex: 1 }}>
                <Dishes 
                    cateId={cateId} 
                    keyword={q} 
                    ordering={orderBy} 
                    toggleCompare={toggleCompare} 
                    compareItems={compareItems} 
                />
            </View>

            {/* 👇 4. NÚT SO SÁNH NỔI (Hiện lên khi chọn từ 2 món) */}
            {compareItems.length >= 2 && (
                <TouchableOpacity 
                    style={styles.floatingCompare} 
                    onPress={() => navigation.navigate('CompareDishes', { dishes: compareItems })}
                >
                    <IconButton icon="compare" iconColor="white" size={25} />
                    <Text style={styles.compareText}>So sánh ({compareItems.length})</Text>
                </TouchableOpacity>
            )}

            {/* 👇 5. NÚT GIỎ HÀNG NỔI (Luôn hiển thị) */}
            <TouchableOpacity 
                style={styles.floatingCart} 
                onPress={() => navigation.navigate('Cart')}
            >
                <IconButton icon="cart" iconColor="white" size={30} />
                {cartCount > 0 && (
                    <Badge style={styles.badge} size={22}>{cartCount}</Badge>
                )}
            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({
    floatingCart: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#ff9800',
        borderRadius: 30,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        zIndex: 100
    },
    floatingCompare: {
        position: 'absolute',
        bottom: 90, // Nằm trên nút giỏ hàng
        right: 20,
        backgroundColor: '#2196F3', // Màu xanh dương cho so sánh
        borderRadius: 25,
        paddingHorizontal: 15,
        height: 50,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        zIndex: 100
    },
    compareText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: -5
    },
    badge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: 'red',
        fontWeight: 'bold',
        color: 'white',
        borderWidth: 1,
        borderColor: 'white'
    }
});

export default Home;