import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  reviewList: {
    flex: 1,
  },
  reviewStats: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statsContent: {
    alignItems: 'center',
  },
  avgRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  ratingValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  totalReviews: {
    fontSize: 14,
    color: '#666',
  },
  reviewsContainer: {
    flex: 1,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});


