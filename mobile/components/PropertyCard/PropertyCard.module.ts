import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 0, // Sin bordes redondeados, más estilo Instagram
    overflow: 'hidden',
    marginBottom: 1, // Espaciado mínimo entre cards
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  imageContainer: {
    width: '100%',
    height: 350, // Imagen más grande, estilo Instagram
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  typeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteActive: {
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
  favoriteIcon: {
    fontSize: 20,
  },
  content: {
    padding: 12, // Padding más pequeño
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 14, // Título más pequeño
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8,
  },
  price: {
    fontSize: 15, // Precio más pequeño
    fontWeight: '700',
    color: '#1a1a1a',
  },
  description: {
    fontSize: 13, // Descripción más pequeña
    color: '#666',
    lineHeight: 18,
    marginBottom: 6,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  detailText: {
    fontSize: 12, // Detalles más pequeños
    color: '#999',
  },
  separator: {
    fontSize: 12,
    color: '#999',
    marginHorizontal: 6,
  },
});

