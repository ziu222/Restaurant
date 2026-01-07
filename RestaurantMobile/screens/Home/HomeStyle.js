import { StyleSheet } from 'react-native';

const homeStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },

  // ===== HERO SECTION =====
  heroSection: {
    width: '100%',
    height: 450,
    position: 'relative',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 20,
    color: '#F0F0F0',
    textAlign: 'center',
    marginBottom: 28,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  heroButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 4,
    elevation: 8,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  heroButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  // ===== UP NEXT SECTION (Featured Dishes) =====
  upNextSection: {
    paddingVertical: 60,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  sectionHeader: {
    marginBottom: 40,
  },
  upNextLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF6B35',
    letterSpacing: 2,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  dishesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  dishCardModern: {
    width: '32%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    marginBottom: 8,
  },
  dishImageModern: {
    width: '100%',
    height: '65%',
    backgroundColor: '#F0F0F0',
  },
  dishDetailsModern: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'space-between',
  },
  dishNameModern: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  dishPriceModern: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FF6B35',
  },

  // ===== ABOUT US SECTIONS =====
  aboutUsSection: {
    paddingVertical: 60,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 20,
  },
  aboutLayout: {
    flexDirection: 'row',
    gap: 40,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aboutTextContainer: {
    flex: 1,
    gap: 16,
  },
  aboutUsTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  aboutUsText: {
    fontSize: 16,
    color: '#5A5A5A',
    lineHeight: 28,
    fontWeight: '500',
  },
  aboutUsImage: {
    flex: 1,
    height: 350,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  aboutUsButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 4,
    alignSelf: 'flex-start',
    elevation: 4,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  aboutUsButtonHover: {
    backgroundColor: '#E55A2B',
    elevation: 8,
    shadowColor: '#E55A2B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  aboutUsButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // ===== DELETE OLD PREMIUM AND SPECIAL OFFERS STYLES (Keeping for reference, not used) =====
});

export default homeStyles;
