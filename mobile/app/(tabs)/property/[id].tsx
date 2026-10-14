import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { propertiesAPI, Property, favoritesAPI, reviewsAPI, Review, ReviewStats } from '@/lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReviewList } from '@/components/ReviewList';
import { ReviewForm } from '@/components/ReviewForm';

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (id) {
      loadProperty();
      loadFavorites();
      checkAuth();
      loadReviews();
    }
  }, [id]);

  const checkAuth = async () => {
    const token = await AsyncStorage.getItem('auth_token');
    setIsAuthenticated(!!token);
  };

  const loadReviews = async () => {
    try {
      setLoadingReviews(true);
      const response = await reviewsAPI.getPropertyReviews(Number(id));
      setReviews(response.reviews);
      setReviewStats(response.stats);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleSubmitReview = async (rating: number, comment?: string) => {
    try {
      await reviewsAPI.createPropertyReview(Number(id), rating, comment);
      setShowReviewForm(false);
      loadReviews(); // Recargar reviews
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
            // Aquí implementarías la llamada a la API para reportar
            console.log('Reportando review:', reviewId);
            Alert.alert('Éxito', 'Review reportada. Gracias por tu feedback.');
          },
        },
      ]
    );
  };

  const loadProperty = async () => {
    try {
      setLoading(true);
      const data = await propertiesAPI.getById(Number(id));
      setProperty(data);
    } catch (error) {
      console.error('Error loading property:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) return;

      const data = await favoritesAPI.getAll();
      const favoriteIds = data.favorites.propertyIds || [];
      setFavorites(favoriteIds);
      setIsFavorite(favoriteIds.includes(Number(id)));
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const toggleFavorite = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        router.push('/(auth)/login');
        return;
      }

      if (isFavorite) {
        await favoritesAPI.remove(Number(id));
        setIsFavorite(false);
        setFavorites(favorites.filter(favId => favId !== Number(id)));
      } else {
        await favoritesAPI.add(Number(id));
        setIsFavorite(true);
        setFavorites([...favorites, Number(id)]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1a1a1a" />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Propiedad no encontrada</Text>
      </View>
    );
  }

  const imageUri = property.imagen 
    ? (property.imagen.startsWith('http') ? property.imagen : `http://localhost:8000${property.imagen}`)
    : 'https://via.placeholder.com/400x300?text=Sin+Imagen';

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: imageUri }} style={styles.image} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>{property.titulo}</Text>
            <Text style={styles.location}>{property.ciudad}</Text>
            <Text style={styles.type}>{property.tipo}</Text>
          </View>
          <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteButton}>
            <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.price}>${property.precio.toLocaleString()}</Text>

        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Ambientes</Text>
            <Text style={styles.detailValue}>{property.ambientes}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Metros²</Text>
            <Text style={styles.detailValue}>{property.metros_cuadrados}</Text>
          </View>
          {property.banos && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Baños</Text>
              <Text style={styles.detailValue}>{property.banos}</Text>
            </View>
          )}
        </View>

        {property.descripcion && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.description}>{property.descripcion}</Text>
          </View>
        )}

        {property.operacion && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Operación</Text>
            <Text style={styles.operation}>
              {property.operacion === 'venta' ? 'Venta' : 'Alquiler'}
            </Text>
          </View>
        )}

        {/* Reviews Section */}
        <View style={styles.reviewsSection}>
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
              propertyTitle={property.titulo}
              allowPhotos={true}
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
              emptyMessage={`Aún no hay reviews para esta propiedad. ¡Sé el primero en dejar una!`}
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 16,
    color: '#999',
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f0f0',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  type: {
    fontSize: 14,
    color: '#999',
  },
  favoriteButton: {
    padding: 8,
  },
  favoriteIcon: {
    fontSize: 24,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 24,
  },
  details: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  operation: {
    fontSize: 16,
    color: '#666',
  },
  reviewsSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#eee',
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
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
});

