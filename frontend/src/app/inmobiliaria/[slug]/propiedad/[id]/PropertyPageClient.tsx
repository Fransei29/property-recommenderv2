'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Property, Tenant } from '@/lib/api';
import PropertyDetail from '@/components/PropertyDetail/PropertyDetail';
import { useFavorites } from '@/hooks/useFavorites';
import { getRecommendations } from '@/utils';

interface PropertyPageClientProps {
  slug: string;
  property: Property;
  properties: Property[];
  tenant: Tenant;
}

export default function PropertyPageClient({ slug, property, properties, tenant }: PropertyPageClientProps) {
  const router = useRouter();
  const favorites = useFavorites();
  const recommendations = useMemo(() => getRecommendations(property, properties, 3), [property, properties]);

  return (
    <PropertyDetail
      property={property}
      recommendations={recommendations}
      onPropertyClick={(selected) => router.push(`/inmobiliaria/${slug}/propiedad/${selected.id}`)}
      onBackClick={() => router.push(`/inmobiliaria/${slug}`)}
      isFavorite={favorites.isFavorite(property.id)}
      onToggleFavorite={favorites.toggleFavorite}
      tenant={tenant}
    />
  );
}
