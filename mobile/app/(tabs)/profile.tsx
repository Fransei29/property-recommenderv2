import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { favoritesAPI, propertiesAPI, Property, removeAuthToken } from '@/lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PropertyCard } from '@/components/PropertyCard';
import { formatPrice } from '@/utils/formatUtils';

export default function ProfileScreen() {
  const [favoriteProperties, setFavoriteProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      // Obtener información del usuario del token
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUserEmail(payload.email || '');
          setUserName(payload.username || payload.name || 'Usuario');
        } catch {
          setUserName('Usuario');
        }
      }

      // Cargar favoritos
      const favoritesData = await favoritesAPI.getAll();
      const favoriteIds = favoritesData.favorites.propertyIds || [];

      if (favoriteIds.length > 0) {
        // Cargar las propiedades favoritas
        const allProperties = await propertiesAPI.getAll();
        const favorites = allProperties.filter(p => favoriteIds.includes(p.id));
        setFavoriteProperties(favorites);
      } else {
        setFavoriteProperties([]);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar perfil';
      if (errorMessage.includes('sesión') || errorMessage.includes('401')) {
        await removeAuthToken();
        router.replace('/(auth)/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await removeAuthToken();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const handlePropertyClick = (property: Property) => {
    router.push(`/(tabs)/property/${property.id}`);
  };

  const handleToggleFavorite = async (propertyId: number) => {
    try {
      const isFavorite = favoriteProperties.some(p => p.id === propertyId);
      if (isFavorite) {
        await favoritesAPI.remove(propertyId);
        setFavoriteProperties(favoriteProperties.filter(p => p.id !== propertyId));
      } else {
        await favoritesAPI.add(propertyId);
        const property = await propertiesAPI.getById(propertyId);
        setFavoriteProperties([...favoriteProperties, property]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (loading && favoriteProperties.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1a1a1a" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userEmail}>{userEmail}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{favoriteProperties.length}</Text>
          <Text style={styles.statLabel}>Favoritos</Text>
        </View>
      </View>

      {/* Favorites Section */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Mis Propiedades Favoritas</Text>

        {favoriteProperties.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>❤️</Text>
            <Text style={styles.emptyTitle}>No tienes propiedades favoritas</Text>
            <Text style={styles.emptyDescription}>
              Cuando marques propiedades como favoritas, aparecerán aquí.
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => router.push('/(tabs)/')}
            >
              <Text style={styles.browseButtonText}>Explorar Propiedades</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.favoritesList}>
            {favoriteProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isFavorite={true}
                onToggleFavorite={handleToggleFavorite}
                onClick={handlePropertyClick}
              />
            ))}
          </View>
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  logoutText: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  statsContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  favoritesList: {
    gap: 16,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

