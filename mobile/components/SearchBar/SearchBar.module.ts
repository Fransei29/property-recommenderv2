import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    height: 48,
  },
  icon: {
    marginRight: 8,
  },
  iconText: {
    fontSize: 18,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  clearButton: {
    padding: 4,
  },
  clearIcon: {
    fontSize: 18,
    color: '#999',
  },
});


