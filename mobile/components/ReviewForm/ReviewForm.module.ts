import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  cancelButton: {
    padding: 4,
  },
  cancelText: {
    fontSize: 20,
    color: '#666',
  },
  content: {
    maxHeight: 400,
  },
  ratingSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  commentSection: {
    marginBottom: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1a1a1a',
    minHeight: 120,
    backgroundColor: '#f9f9f9',
  },
  photosSection: {
    marginBottom: 20,
  },
  photoNote: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonAction: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#1a1a1a',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});


