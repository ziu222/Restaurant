import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { fetchDishes } from '../../store/dishesSlice';
import homeStyles from './HomeStyle';

const HomePage = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { dishes, loading } = useSelector((state) => state.dishes);
  const [hoveredButton, setHoveredButton] = useState(null);

  useEffect(() => {
    dispatch(fetchDishes());
  }, [dispatch]);

  const handleAboutUs = () => {
    navigation.navigate('AboutTab');
  };

  if (loading) {
    return (
      <View style={homeStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <View style={homeStyles.wrapper}>
      <ScrollView 
        style={homeStyles.container} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={homeStyles.scrollContent}
      >
        {/* ===== SECTION 1: HERO BANNER ===== */}
        <View style={homeStyles.heroSection}>
          <Image
            source={require('../../assets/home/home-1.avif')}
            style={homeStyles.heroImage}
            resizeMode="cover"
          />
          <View style={homeStyles.heroOverlay}>
            <Text style={homeStyles.heroTitle}>Welcome to Our Restaurant</Text>
            <Text style={homeStyles.heroSubtitle}>
              Experience culinary excellence with every bite
            </Text>
            <TouchableOpacity style={homeStyles.heroButton}>
              <Text style={homeStyles.heroButtonText}>Explore Menu</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ===== SECTION 2: FEATURED DISHES (UP NEXT) ===== */}
        <View style={homeStyles.upNextSection}>
          <View style={homeStyles.sectionHeader}>
            <Text style={homeStyles.upNextLabel}>UP NEXT</Text>
            <Text style={homeStyles.sectionTitle}>Featured Dishes</Text>
          </View>
          
          <View style={homeStyles.dishesGrid}>
            {dishes.slice(0, 9).map((dish, idx) => (
              <TouchableOpacity key={dish.id} style={homeStyles.dishCardModern}>
                <Image
                  source={{ uri: `http://127.0.0.1:8000${dish.image}` }}
                  style={homeStyles.dishImageModern}
                  resizeMode="cover"
                />
                <View style={homeStyles.dishDetailsModern}>
                  <Text style={homeStyles.dishNameModern}>{dish.name}</Text>
                  <Text style={homeStyles.dishPriceModern}>${dish.price.toFixed(2)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ===== SECTION 3: ABOUT US - LAYOUT 1 (TEXT LEFT, IMAGE RIGHT) ===== */}
        <View style={homeStyles.aboutUsSection}>
          <View style={homeStyles.aboutLayout}>
            <View style={homeStyles.aboutTextContainer}>
              <Text style={homeStyles.aboutUsTitle}>Our Story & Passion</Text>
              <Text style={homeStyles.aboutUsText}>
                For over a decade, we've been dedicated to crafting exceptional dining experiences. Our chefs source the finest, locally-sourced ingredients to create dishes that celebrate flavor and innovation. Every plate that leaves our kitchen tells a story of tradition, creativity, and passion for culinary excellence.
              </Text>
              <TouchableOpacity 
                style={[
                  homeStyles.aboutUsButton,
                  hoveredButton === 'about1' && homeStyles.aboutUsButtonHover
                ]}
                onPress={handleAboutUs}
                onMouseEnter={() => setHoveredButton('about1')}
                onMouseLeave={() => setHoveredButton(null)}
              >
                <Text style={homeStyles.aboutUsButtonText}>About Us</Text>
              </TouchableOpacity>
            </View>
            <Image
              source={require('../../assets/home/home-2.avif')}
              style={homeStyles.aboutUsImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* ===== SECTION 4: ABOUT US - LAYOUT 2 (IMAGE LEFT, TEXT RIGHT - REVERSED) ===== */}
        <View style={homeStyles.aboutUsSection}>
          <View style={[homeStyles.aboutLayout, { flexDirection: 'row-reverse' }]}>
            <View style={homeStyles.aboutTextContainer}>
              <Text style={homeStyles.aboutUsTitle}>Culinary Excellence</Text>
              <Text style={homeStyles.aboutUsText}>
                Our commitment to excellence goes beyond recipes. We believe in sustainable practices, supporting local farmers, and creating a community around great food. Every ingredient is carefully selected, every technique perfected, and every guest treated like family in our restaurant.
              </Text>
              <TouchableOpacity 
                style={[
                  homeStyles.aboutUsButton,
                  hoveredButton === 'about2' && homeStyles.aboutUsButtonHover
                ]}
                onPress={handleAboutUs}
                onMouseEnter={() => setHoveredButton('about2')}
                onMouseLeave={() => setHoveredButton(null)}
              >
                <Text style={homeStyles.aboutUsButtonText}>About Us</Text>
              </TouchableOpacity>
            </View>
            <Image
              source={require('../../assets/home/home-3.avif')}
              style={homeStyles.aboutUsImage}
              resizeMode="cover"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default HomePage;
