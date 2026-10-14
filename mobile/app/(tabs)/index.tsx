import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ImageBackground,
  RefreshControl,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { propertiesAPI, Property, removeAuthToken } from '@/lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PropertyCard } from '@/components/PropertyCard';
import { SearchBar } from '@/components/SearchBar';
import { useFavorites } from '@/hooks/useFavorites';
import { useRecommendations } from '@/hooks/useRecommendations';
import { useUserRole } from '@/hooks/useUserRole';
import { formatPrice } from '@/utils/formatUtils';

const ITEMS_PER_PAGE = 12;

export default function HomeScreen() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const favorites = useFavorites();
  const { isAdmin } = useUserRole();
  const recommendations = useRecommendations(properties, () => setSearchQuery(''));

  // Actualizar filtros cuando cambie la búsqueda
  useEffect(() => {
    recommendations.updateFilters({ searchQuery });
  }, [searchQuery]);

  useEffect(() => {
    loadProperties();
  }, [isAdmin]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      // Si es admin, cargar todas las propiedades de todos los tenants
      // Si es cliente, cargar solo las propiedades de su tenant
      const data = isAdmin 
        ? await propertiesAPI.getAllForAdmin(1, 1000) // Cargar todas para admin
        : await propertiesAPI.getAll();
      setProperties(data);
    } catch (error) {
      console.error('Error loading properties:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar propiedades';
      
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
    await loadProperties();
    favorites.refresh();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await removeAuthToken();
    router.replace('/(auth)/login');
  };

  const handlePropertyClick = (property: Property) => {
    router.push(`/(tabs)/property/${property.id}`);
  };

  // Propiedades paginadas
  const paginatedProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return recommendations.filteredProperties.slice(startIndex, endIndex);
  }, [recommendations.filteredProperties, currentPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(recommendations.filteredProperties.length / ITEMS_PER_PAGE);
  }, [recommendations.filteredProperties]);

  const renderProperty = ({ item }: { item: Property }) => (
    <PropertyCard
      property={item}
      isFavorite={favorites.isFavorite(item.id)}
      onToggleFavorite={favorites.toggleFavorite}
      onClick={handlePropertyClick}
    />
  );

  if (loading && properties.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1a1a1a" />
        <Text style={styles.loadingText}>Cargando propiedades...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={true}
      >
        {/* Header con imagen de fondo */}
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800' }}
          style={styles.header}
          imageStyle={styles.headerImage}
        >
          <View style={styles.headerOverlay}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Bienvenido a Habita</Text>
              <Text style={styles.subtitle}>
                Encuentra tu próximo hogar con recomendaciones personalizadas
              </Text>
            </View>
          </View>
        </ImageBackground>

        {/* Barra de búsqueda y filtros */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Buscar por título, ciudad, tipo..."
            />
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Text style={styles.filterButtonText}>🔽 Filtros</Text>
            {recommendations.hasActiveFilters && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>•</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Estadísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Total:</Text>
            <Text style={styles.statValue}>{recommendations.getFilterStats.total}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Filtradas:</Text>
            <Text style={styles.statValue}>{recommendations.getFilterStats.filtered}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Precio promedio:</Text>
            <Text style={styles.statValue}>
              {formatPrice(recommendations.getFilterStats.avgPrice)}
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Favoritos:</Text>
            <Text style={styles.statValue}>{favorites.getFavoritesCount()}</Text>
          </View>
        </View>

        {/* Recomendaciones */}
        {recommendations.recommendations.length > 0 && (
          <View style={styles.recommendationsSection}>
            <Text style={styles.sectionTitle}>Recomendaciones para ti</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recommendationsList}>
              {recommendations.recommendations.map((rec) => (
                <TouchableOpacity
                  key={rec.property.id}
                  style={styles.recommendationCard}
                  onPress={() => handlePropertyClick(rec.property)}
                >
                  <Text style={styles.recommendationTitle} numberOfLines={1}>
                    {rec.property.titulo}
                  </Text>
                  <Text style={styles.recommendationPrice}>
                    {formatPrice(rec.property.precio)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Lista de propiedades */}
        <View style={styles.propertiesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Propiedades disponibles
              {recommendations.hasActiveFilters && (
                <Text style={styles.filteredIndicator}>
                  {' '}({recommendations.getFilterStats.filtered} resultados)
                </Text>
              )}
            </Text>
            {recommendations.hasActiveFilters && (
              <TouchableOpacity
                onPress={recommendations.clearFilters}
                style={styles.clearFiltersButton}
              >
                <Text style={styles.clearFiltersText}>Limpiar filtros</Text>
              </TouchableOpacity>
            )}
          </View>

          {paginatedProperties.length > 0 ? (
            <>
              {paginatedProperties.map((item) => (
                <PropertyCard
                  key={item.id}
                  property={item}
                  isFavorite={favorites.isFavorite(item.id)}
                  onToggleFavorite={favorites.toggleFavorite}
                  onClick={handlePropertyClick}
                />
              ))}
              {/* Paginación simple */}
              {totalPages > 1 && (
                <View style={styles.pagination}>
                  <TouchableOpacity
                    onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
                  >
                    <Text style={styles.pageButtonText}>Anterior</Text>
                  </TouchableOpacity>
                  <Text style={styles.pageInfo}>
                    Página {currentPage} de {totalPages}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]}
                  >
                    <Text style={styles.pageButtonText}>Siguiente</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No se encontraron propiedades</Text>
              <Text style={styles.emptyStateText}>
                Intenta ajustar los filtros o la búsqueda
              </Text>
              <TouchableOpacity
                onPress={recommendations.clearFilters}
                style={styles.clearFiltersButton}
              >
                <Text style={styles.clearFiltersText}>Limpiar filtros</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal de Filtros */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Filtro por ciudad */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Ciudad</Text>
                <View style={styles.selectContainer}>
                  <Text style={styles.selectText}>
                    {recommendations.filters.ciudad || 'Todas las ciudades'}
                  </Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsList}>
                  <TouchableOpacity
                    style={[
                      styles.optionChip,
                      !recommendations.filters.ciudad && styles.optionChipActive
                    ]}
                    onPress={() => recommendations.updateFilters({ ciudad: undefined })}
                  >
                    <Text style={[
                      styles.optionChipText,
                      !recommendations.filters.ciudad && styles.optionChipActiveText
                    ]}>Todas</Text>
                  </TouchableOpacity>
                  {recommendations.getUniqueCities.map(ciudad => (
                    <TouchableOpacity
                      key={ciudad}
                      style={[
                        styles.optionChip,
                        recommendations.filters.ciudad === ciudad && styles.optionChipActive
                      ]}
                      onPress={() => recommendations.updateFilters({ ciudad })}
                    >
                      <Text style={[
                        styles.optionChipText,
                        recommendations.filters.ciudad === ciudad && styles.optionChipActiveText
                      ]}>{ciudad}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Filtro por tipo */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Tipo de propiedad</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsList}>
                  <TouchableOpacity
                    style={[
                      styles.optionChip,
                      !recommendations.filters.tipo && styles.optionChipActive
                    ]}
                    onPress={() => recommendations.updateFilters({ tipo: undefined })}
                  >
                    <Text style={[
                      styles.optionChipText,
                      !recommendations.filters.tipo && styles.optionChipActiveText
                    ]}>Todos</Text>
                  </TouchableOpacity>
                  {recommendations.getUniqueTypes.map(tipo => (
                    <TouchableOpacity
                      key={tipo}
                      style={[
                        styles.optionChip,
                        recommendations.filters.tipo === tipo && styles.optionChipActive
                      ]}
                      onPress={() => recommendations.updateFilters({ tipo })}
                    >
                      <Text style={[
                        styles.optionChipText,
                        recommendations.filters.tipo === tipo && styles.optionChipActiveText
                      ]}>{tipo}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Filtro por precio */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Rango de precio</Text>
                <View style={styles.priceRange}>
                  <View style={styles.priceInput}>
                    <Text style={styles.priceLabel}>Mínimo</Text>
                    <TextInput
                      style={styles.priceField}
                      placeholder="0"
                      keyboardType="numeric"
                      value={recommendations.filters.precioMin?.toString() || ''}
                      onChangeText={(text) => 
                        recommendations.updateFilters({ 
                          precioMin: text ? Number(text) : undefined 
                        })
                      }
                    />
                  </View>
                  <Text style={styles.priceSeparator}>-</Text>
                  <View style={styles.priceInput}>
                    <Text style={styles.priceLabel}>Máximo</Text>
                    <TextInput
                      style={styles.priceField}
                      placeholder="Sin límite"
                      keyboardType="numeric"
                      value={recommendations.filters.precioMax?.toString() || ''}
                      onChangeText={(text) => 
                        recommendations.updateFilters({ 
                          precioMax: text ? Number(text) : undefined 
                        })
                      }
                    />
                  </View>
                </View>
              </View>

              <TouchableOpacity
                onPress={recommendations.clearFilters}
                style={styles.clearAllButton}
              >
                <Text style={styles.clearAllButtonText}>Limpiar todos los filtros</Text>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyButtonText}>Aplicar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
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
    height: 250,
    width: '100%',
  },
  headerImage: {
    opacity: 0.9,
  },
  headerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  headerContent: {
    maxWidth: 600,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  searchSection: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchContainer: {
    marginBottom: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    position: 'relative',
  },
  filterButtonText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  filterBadge: {
    position: 'absolute',
    top: 8,
    right: 12,
  },
  filterBadgeText: {
    fontSize: 20,
    color: '#1a1a1a',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  stat: {
    width: '50%',
    paddingVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  recommendationsSection: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recommendationsList: {
    marginTop: 12,
  },
  recommendationCard: {
    padding: 12,
    marginRight: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    minWidth: 150,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  recommendationPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  propertiesSection: {
    flex: 1,
    paddingHorizontal: 0, // Sin padding horizontal para estilo Instagram
    paddingTop: 8,
    backgroundColor: '#fff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 12, // Padding solo para el header
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  filteredIndicator: {
    fontSize: 16,
    color: '#666',
    fontWeight: '400',
  },
  clearFiltersButton: {
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
  },
  clearFiltersText: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  list: {
    paddingBottom: 16,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 16,
  },
  pageButton: {
    padding: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 6,
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
  pageButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  pageInfo: {
    fontSize: 14,
    color: '#666',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  modalClose: {
    fontSize: 24,
    color: '#666',
  },
  modalBody: {
    padding: 20,
  },
  filterGroup: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  selectContainer: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 12,
  },
  selectText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  optionsList: {
    flexDirection: 'row',
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    marginRight: 8,
  },
  optionChipActive: {
    backgroundColor: '#1a1a1a',
  },
  optionChipText: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  optionChipActiveText: {
    color: '#fff',
  },
  priceRange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceInput: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  priceField: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    fontSize: 16,
    color: '#1a1a1a',
  },
  priceSeparator: {
    fontSize: 18,
    color: '#666',
    marginTop: 24,
  },
  clearAllButton: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  clearAllButtonText: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  applyButton: {
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    alignItems: 'center',
    margin: 20,
  },
  applyButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
