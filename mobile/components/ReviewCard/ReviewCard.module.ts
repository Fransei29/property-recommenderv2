import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  reviewerDetails: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  reviewMeta: {
    alignItems: 'flex-end',
  },
  verifiedBadge: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#e8f5e9',
    borderRadius: 4,
  },
  verifiedText: {
    fontSize: 10,
    color: '#4caf50',
    fontWeight: '600',
  },
  reviewComment: {
    marginTop: 8,
    marginBottom: 8,
  },
  commentText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  reviewPhotos: {
    marginTop: 8,
    marginBottom: 8,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  reviewActions: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  reportButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  reportButtonText: {
    fontSize: 12,
    color: '#999',
  },
});


