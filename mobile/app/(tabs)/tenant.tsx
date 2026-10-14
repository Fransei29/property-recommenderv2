import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { tenantAPI, TenantInfo, Property, reviewsAPI, Review, ReviewStats } from '@/lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PropertyCard } from '@/components/PropertyCard';
import { ReviewList } from '@/components/ReviewList';
import { ReviewForm } from '@/components/ReviewForm';
import { useFavorites } from '@/hooks/useFavorites';
import { formatPrice } from '@/utils/formatUtils';

export default function TenantScreen() {
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const favorites = useFavorites();

  useEffect(() => {
    loadTenantInfo();
    checkAuth();
  }, []);

  useEffect(() => {
    if (tenantInfo?.tenant?.id) {
      loadReviews();
    }
  }, [tenantInfo?.tenant?.id]);

  const checkAuth = async () => {
    const token = await AsyncStorage.getItem('auth_token');
    setIsAuthenticated(!!token);
  };

  const loadTenantInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      // Obtener el slug del tenant desde el token o AsyncStorage
      const token = await AsyncStorage.getItem('auth_token');
      let slug = 'demo'; // default
      
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.tenant_slug) {
            slug = payload.tenant_slug;
          }
        } catch {
          const storedSlug = await AsyncStorage.getItem('tenant_slug');
          if (storedSlug) {
            slug = storedSlug;
          }
        }
      }

      const info = await tenantAPI.getInfo(slug);
      setTenantInfo(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar información');
      console.error('Error loading tenant info:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    if (!tenantInfo?.tenant?.id) return;
    
    try {
      setLoadingReviews(true);
      const response = await reviewsAPI.getTenantReviews(tenantInfo.tenant.id);
      setReviews(response.reviews);
      setReviewStats(response.stats);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTenantInfo();
    setRefreshing(false);
  };

  const handlePropertyClick = (property: Property) => {
    router.push(`/(tabs)/property/${property.id}`);
  };

  const handleSubmitReview = async (rating: number, comment?: string) => {
    if (!tenantInfo?.tenant?.id) return;
    
    try {
      await reviewsAPI.createTenantReview(tenantInfo.tenant.id, rating, comment);
      setShowReviewForm(false);
      loadReviews();
    } catch (error) {
      throw error;
    }
  };

  const handleReport = async (reviewId: number) => {
    Alert.alert(
      'Reportar Review',
      '¿Estás seguro de que quieres reportar esta review?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reportar',
          style: 'destructive',
          onPress: () => {
            console.log('Reportando review:', reviewId);
            Alert.alert('Éxito', 'Review reportada. Gracias por tu feedback.');
          },
        },
      ]
    );
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Error opening link:', err));
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1a1a1a" />
        <Text style={styles.loadingText}>Cargando información...</Text>
      </View>
    );
  }

  if (error || !tenantInfo || !tenantInfo.tenant) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Inmobiliaria no encontrada'}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/(tabs)/')}
        >
          <Text style={styles.backButtonText}>Volver al inicio</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
  const logoUri = tenantInfo?.tenant?.logo_url
    ? (tenantInfo.tenant.logo_url.startsWith('http') 
        ? tenantInfo.tenant.logo_url 
        : `${API_URL}${tenantInfo.tenant.logo_url}`)
    : null;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        {logoUri ? (
          <Image source={{ uri: logoUri }} style={styles.logo} resizeMode="contain" />
        ) : (
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoPlaceholderText}>
              {tenantInfo?.tenant?.name?.charAt(0).toUpperCase() || 'I'}
            </Text>
          </View>
        )}
        <Text style={styles.tenantName}>{tenantInfo?.tenant?.name || 'Inmobiliaria'}</Text>
        {tenantInfo?.tenant?.description && (
          <Text style={styles.description}>{tenantInfo.tenant.description}</Text>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🏠</Text>
          <Text style={styles.statValue}>{tenantInfo?.stats?.total_properties || 0}</Text>
          <Text style={styles.statLabel}>Propiedades</Text>
        </View>
        {tenantInfo?.stats?.total_cities !== undefined && (
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📍</Text>
            <Text style={styles.statValue}>{tenantInfo.stats.total_cities}</Text>
            <Text style={styles.statLabel}>Ciudades</Text>
          </View>
        )}
        {tenantInfo?.stats?.avg_price !== null && tenantInfo?.stats?.avg_price !== undefined && (
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>💰</Text>
            <Text style={styles.statValue}>
              {formatPrice(tenantInfo.stats.avg_price)}
            </Text>
            <Text style={styles.statLabel}>Precio Promedio</Text>
          </View>
        )}
      </View>

      {/* Contact Info */}
      {(tenantInfo?.tenant?.phone || tenantInfo?.tenant?.contact_phone || tenantInfo?.tenant?.address) && (
        <View style={styles.contactSection}>
          {tenantInfo?.tenant?.phone && (
            <View style={styles.contactItem}>
              <Text style={styles.contactIcon}>📞</Text>
              <Text style={styles.contactText}>{tenantInfo.tenant.phone}</Text>
            </View>
          )}
          {tenantInfo?.tenant?.address && (
            <View style={styles.contactItem}>
              <Text style={styles.contactIcon}>📍</Text>
              <Text style={styles.contactText}>{tenantInfo.tenant.address}</Text>
            </View>
          )}
        </View>
      )}

      {/* Social Media */}
      {tenantInfo?.tenant?.social_media && (
        <View style={styles.socialSection}>
          {tenantInfo.tenant.social_media?.facebook && (
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => openLink(tenantInfo.tenant.social_media!.facebook!)}
            >
              <Text style={styles.socialText}>Facebook</Text>
            </TouchableOpacity>
          )}
          {tenantInfo.tenant.social_media?.instagram && (
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => openLink(tenantInfo.tenant.social_media!.instagram!)}
            >
              <Text style={styles.socialText}>Instagram</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Properties */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Propiedades</Text>
        {!tenantInfo?.properties || tenantInfo.properties.length === 0 ? (
          <Text style={styles.emptyText}>No hay propiedades disponibles</Text>
        ) : (
          <View style={styles.propertiesList}>
            {tenantInfo.properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isFavorite={favorites.isFavorite(property.id)}
                onToggleFavorite={favorites.toggleFavorite}
                onClick={handlePropertyClick}
              />
            ))}
          </View>
        )}
      </View>

      {/* Reviews */}
      <View style={styles.section}>
        <View style={styles.reviewsHeader}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          {isAuthenticated && !showReviewForm && (
            <TouchableOpacity
              style={styles.addReviewButton}
              onPress={() => setShowReviewForm(true)}
            >
              <Text style={styles.addReviewButtonText}>Dejar Review</Text>
            </TouchableOpacity>
          )}
        </View>

        {showReviewForm && (
          <ReviewForm
            onSubmit={handleSubmitReview}
            onCancel={() => setShowReviewForm(false)}
            tenantName={tenantInfo?.tenant?.name || 'Inmobiliaria'}
            allowPhotos={false}
          />
        )}

        {loadingReviews ? (
          <View style={styles.loadingReviews}>
            <ActivityIndicator size="small" color="#1a1a1a" />
            <Text style={styles.loadingText}>Cargando reviews...</Text>
          </View>
        ) : (
          <ReviewList
            reviews={reviews}
            stats={reviewStats || undefined}
            showForm={isAuthenticated}
            onReport={handleReport}
            emptyMessage={`Aún no hay reviews para ${tenantInfo?.tenant?.name || 'esta inmobiliaria'}. ¡Sé el primero en dejar una!`}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 16,
    textAlign: 'center',
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoPlaceholderText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '600',
  },
  tenantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statCard: {
    width: '33.33%',
    alignItems: 'center',
    paddingVertical: 16,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  contactSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  socialSection: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 12,
  },
  socialButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  socialText: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  section: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  propertiesList: {
    gap: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addReviewButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
  },
  addReviewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingReviews: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

