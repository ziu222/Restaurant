import React from 'react';
import { View, Text } from 'react-native';

const UserScreen = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}>Profile</Text>
      <Text style={{ fontSize: 14, color: '#666', marginTop: 10 }}>Coming soon...</Text>
    </View>
  );
};

export default UserScreen;
