import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { TenantInfo } from '@/lib/api';
import { formatPropertyPrice, getOperacionLabel, resolveImageUrl } from '@/utils';
import PropertyPageClient from './PropertyPageClient';

// Se renderiza en el servidor: dentro de Docker el backend no está en localhost
const API_URL = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type Params = Promise<{ slug: string; id: string }>;

const getTenantInfo = cache(async (slug: string): Promise<TenantInfo | null> => {
  const response = await fetch(`${API_URL}/tenants/${encodeURIComponent(slug)}/info`, { cache: 'no-store' });
  if (!response.ok) return null;
  return response.json();
});

const findProperty = async (slug: string, id: string) => {
  const info = await getTenantInfo(slug);
  const property = info?.properties.find(p => p.id === Number(id));
  return info && property ? { info, property } : null;
};

// Título, descripción y foto para la vista previa al compartir el link (WhatsApp, redes, etc.)
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug, id } = await params;
  const found = await findProperty(slug, id);
  if (!found) {
    return { title: 'Propiedad no encontrada' };
  }

  const { info, property } = found;
  const title = `${property.titulo} - ${formatPropertyPrice(property)}`;
  const description = `${getOperacionLabel(property.operacion)} · ${property.tipo} en ${property.ciudad} · ${property.ambientes} ambientes · ${property.metros_cuadrados} m². ${info.tenant.name}.`;
  const image = resolveImageUrl(property.imagen);

  return {
    title,
    description,
    openGraph: { title, description, images: [image], type: 'website', siteName: info.tenant.name },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

export default async function PropertyPage({ params }: { params: Params }) {
  const { slug, id } = await params;
  const found = await findProperty(slug, id);
  if (!found) {
    notFound();
  }

  return (
    <PropertyPageClient
      slug={slug}
      property={found.property}
      properties={found.info.properties}
      tenant={found.info.tenant}
    />
  );
}
