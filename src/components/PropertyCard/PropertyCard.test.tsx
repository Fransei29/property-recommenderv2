/**
 * Test file for PropertyCard component
 * 
 * Required dependencies to install:
 * npm install --save-dev @testing-library/react @testing-library/jest-dom @types/jest jest jest-environment-jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PropertyCard } from './PropertyCard';
import { Property } from '../../types/types';

// Mock data for testing
const mockProperty: Property = {
  id: 1,
  titulo: 'Hermosa casa en el centro',
  ciudad: 'Madrid',
  tipo: 'Casa',
  precio: 250000,
  ambientes: 3,
  metros_cuadrados: 120,
  imagen: 'https://example.com/casa.jpg',
  descripcion: 'Una hermosa casa en el centro de Madrid',
  caracteristicas: ['Jardín', 'Garaje', 'Terraza']
};

// Mock functions
const mockOnToggleFavorite = jest.fn();
const mockOnClick = jest.fn();

describe('PropertyCard', () => {
  const defaultProps = {
    property: mockProperty,
    isFavorite: false,
    onToggleFavorite: mockOnToggleFavorite,
    onClick: mockOnClick,
    className: ''
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display the property title', () => {
    render(<PropertyCard {...defaultProps} />);
    
    expect(screen.getByText('Hermosa casa en el centro')).toBeInTheDocument();
  });

  it('should display the property city', () => {
    render(<PropertyCard {...defaultProps} />);
    
    expect(screen.getByText('Madrid')).toBeInTheDocument();
  });

  it('should display the property image with correct alt attribute', () => {
    render(<PropertyCard {...defaultProps} />);
    
    const image = screen.getByAltText('Hermosa casa en el centro');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/casa.jpg');
  });
}); 