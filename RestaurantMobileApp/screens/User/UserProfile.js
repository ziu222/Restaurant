import React, { useContext } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
// 👇 1. NHỚ IMPORT THÊM 'List'
import { Button, Avatar, List } from "react-native-paper"; 
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import MyStyles from "../../styles/MyStyles"; 
import { MyUserContext } from "../../utils/MyContexts"; 

const UserProfile = () => {
    const [user, dispatch] = useContext(MyUserContext);
    const navigation = useNavigation();

    const logout = async () => {
        try {
            await AsyncStorage.removeItem("token");
            dispatch({ "type": "logout" });
            navigation.navigate("Login"); 
        } catch (error) {
            console.error("Lỗi đăng xuất:", error);
        }
    }

    if (user === null) {
        return (
            <View style={[MyStyles.container, { justifyContent: 'center', alignItems: 'center', flex: 1, backgroundColor: 'white' }]}>
                <Avatar.Icon size={80} icon="account-circle-outline" style={{ backgroundColor: '#e0e0e0' }} />
                <Text style={[MyStyles.subject, { marginVertical: 20, color: '#333' }]}>Chào Khách!</Text>
                <Text style={{ marginBottom: 20, color: 'gray', textAlign: 'center', paddingHorizontal: 20 }}>
                    Vui lòng đăng nhập để quản lý tài khoản và xem lịch sử đơn hàng.
                </Text>
                <Button mode="contained" onPress={() => navigation.navigate("Login")} style={{ width: "80%", marginBottom: 15 }}>
                    Đăng nhập
                </Button>
                <Button mode="outlined" onPress={() => navigation.navigate("Register")} style={{ width: "80%" }}>
                    Đăng ký tài khoản
                </Button>
            </View>
        );
    }

    // --- ĐÃ ĐĂNG NHẬP ---
    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', paddingTop: 50, backgroundColor: 'white' }}>
            {user.avatar ? (
                <Avatar.Image size={100} source={{ uri: user.avatar }} style={{ marginBottom: 20 }} />
            ) : (
                <Avatar.Text size={100} label={user.first_name ? user.first_name[0].toUpperCase() : "U"} style={{ marginBottom: 20, backgroundColor: "tomato" }} />
            )}
            
            <Text style={[MyStyles.subject, { fontSize: 24 }]}>{user.first_name} {user.last_name}</Text>
            <Text style={{ fontSize: 16, color: "gray", marginBottom: 30 }}>@{user.username}</Text>
            
            <View style={{ backgroundColor: '#f0f0f0', padding: 10, borderRadius: 10, marginBottom: 20 }}>
                <Text style={{ fontSize: 14, color: "#333", fontWeight: "bold" }}>
                    Vai trò: <Text style={{ color: "blue" }}>{user.role === 'CHEF' ? "Đầu bếp (Chef)" : "Khách hàng"}</Text>
                </Text>
            </View>
            
            <View style={{ width: "80%" }}>
                {/* Nút dành riêng cho Đầu bếp */}
                {user.role === 'CHEF' && (
                    <Button 
                        mode="contained" icon="chef-hat" 
                        style={{ marginBottom: 15, backgroundColor: "orange" }}
                        contentStyle={{ height: 50 }}
                        onPress={() => navigation.navigate("MyDishes")}
                    >
                        Quản lý thực đơn
                    </Button>
                )}

                {user && user.role === 'CHEF' && (
                    <List.Item
                        title="Khu vực Nhà bếp"
                        description="Xem các đơn hàng cần chế biến"
                        left={p => <List.Icon {...p} icon="chef-hat" />}
                        onPress={() => navigation.navigate("ChefOrders")}
                        style={{ backgroundColor: '#fff', marginTop: 10 }}
                    />
                )}

                {/* 👇 2. CHÈN NÚT LỊCH SỬ ĐƠN HÀNG Ở ĐÂY */}
                <List.Item
                    title="Lịch sử đơn hàng"
                    description="Xem lại các món đã đặt"
                    left={props => <List.Icon {...props} icon="history" color="blue" />}
                    onPress={() => navigation.navigate("OrderHistory")}
                    style={{ backgroundColor: '#f9f9f9', marginBottom: 15, borderRadius: 5, borderWidth: 1, borderColor: '#eee' }}
                />

                <Button 
                    mode="outlined" icon="logout" 
                    onPress={logout} 
                    style={{ borderColor: "red", marginTop: 10 }} 
                    textColor="red"
                    contentStyle={{ height: 50 }}
                >
                    Đăng xuất
                </Button>
            </View>
        </ScrollView>
    );
}

export default UserProfile;