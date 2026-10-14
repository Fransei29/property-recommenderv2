import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Property } from '@/lib/api';
import { formatPrice, getPropertyTypeLabel } from '@/utils/formatUtils';
import { styles } from './PropertyCard.module';

interface PropertyCardProps {
  property: Property;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
  onClick: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  isFavorite,
  onToggleFavorite,
  onClick,
}) => {
  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
  const imageUri = property.imagen 
    ? (property.imagen.startsWith('http') ? property.imagen : `${API_URL}${property.imagen}`)
    : 'https://via.placeholder.com/400x300?text=Sin+Imagen';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onClick(property)}
      activeOpacity={0.9}
    >
      {/* Imagen */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={styles.image} />
        
        {/* Badge de tipo */}
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>
            {getPropertyTypeLabel(property.tipo)}
          </Text>
        </View>
        
        {/* Botón de favorito */}
        <TouchableOpacity
          style={[styles.favoriteButton, isFavorite && styles.favoriteActive]}
          onPress={(e) => {
            e.stopPropagation();
            onToggleFavorite(property.id);
          }}
        >
          <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      {/* Contenido - Estilo Instagram */}
      <View style={styles.content}>
        {/* Título y precio en una línea */}
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>{property.titulo}</Text>
          <Text style={styles.price}>{formatPrice(property.precio)}</Text>
        </View>

        {/* Descripción compacta */}
        {property.descripcion && (
          <Text style={styles.description} numberOfLines={2}>
            {property.descripcion.length > 80 
              ? `${property.descripcion.substring(0, 80)}...` 
              : property.descripcion
            }
          </Text>
        )}

        {/* Detalles pequeños en una línea */}
        <View style={styles.detailsRow}>
          <Text style={styles.detailText}>{property.ciudad}</Text>
          <Text style={styles.separator}>•</Text>
          <Text style={styles.detailText}>{property.ambientes} amb.</Text>
          <Text style={styles.separator}>•</Text>
          <Text style={styles.detailText}>{property.metros_cuadrados}m²</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

