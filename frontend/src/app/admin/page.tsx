'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { propertiesAPI, adminAPI, Property, PropertyImage, Moneda, tenantAPI } from '@/lib/api';
import { formatPropertyPrice, resolveImageUrl } from '@/utils';
import { compressImage, compressImages } from '@/utils/imageUtils';
import AdminNavbar from '@/components/AdminNavbar/AdminNavbar';
import { isTokenExpired, clearExpiredToken } from '@/utils/tokenUtils';
import styles from './page.module.scss';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showTenantForm, setShowTenantForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  interface AdminStats {
    totalProperties: number;
    totalUsers: number;
    propertiesByType: Array<{ tipo: string; count: number }>;
    topCities: Array<{ ciudad: string; count: number }>;
    contactsLast30Days: number;
    topContacted: Array<{ id: number; titulo: string; count: number }>;
  }
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [tenantSlug, setTenantSlug] = useState('');
  const [existingImages, setExistingImages] = useState<PropertyImage[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    titulo: '',
    ciudad: '',
    tipo: '',
    operacion: 'venta' as 'venta' | 'alquiler',
    moneda: 'USD' as Moneda,
    precio: '',
    ambientes: '',
    metros_cuadrados: '',
    descripcion: '',
    imagen: null as File | null,
    imagenUrl: '' as string | File | null,
    nuevasImagenes: [] as File[]
  });

  const [tenantFormData, setTenantFormData] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    address: '',
    description: '',
    history: '',
    mission: '',
    vision: '',
    team_info: '',
    office_hours: '',
    services: '' as string | string[],
    values: '' as string | string[],
    social_media: {
      facebook: '',
      instagram: '',
      linkedin: '',
      twitter: ''
    },
    logo_url: '',
    logo: null as File | null,
    featured_image: '',
    featured_image_file: null as File | null,
    gallery: [] as string[]
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      interface UserWithRole {
        role?: string;
        accessToken?: string;
      }
      const userRole = (session?.user as UserWithRole)?.role;
      const accessToken = (session?.user as UserWithRole)?.accessToken;
      
      // Permitir acceso a admin global o tenant_admin
      if (userRole !== 'admin' && userRole !== 'tenant_admin') {
        router.push('/');
        return;
      }
      
      // Guardar el token en localStorage si está disponible
      if (accessToken) {
        // Verificar que el token no esté expirado antes de guardarlo
        if (!isTokenExpired(accessToken)) {
          localStorage.setItem('auth_token', accessToken);
          console.log('Token guardado en localStorage');
        } else {
          console.warn('Token recibido está expirado');
          signOut({ callbackUrl: '/auth/signin' });
          return;
        }
      } else {
        // Si no hay token en la sesión, intentar obtenerlo de localStorage
        const storedToken = localStorage.getItem('auth_token');
        if (!storedToken) {
          console.warn('No se encontró token de autenticación. Redirigiendo al login...');
          signOut({ callbackUrl: '/auth/signin' });
          return;
        } else {
          // Verificar si el token está expirado
          if (isTokenExpired(storedToken)) {
            console.warn('Token expirado. Limpiando y redirigiendo al login...');
            clearExpiredToken();
            signOut({ callbackUrl: '/auth/signin' });
            return;
          }
        }
      }
      
      // Limpiar tokens expirados al cargar
      clearExpiredToken();
      
      loadProperties();
      loadStats();
      loadTenantInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session, router]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getProperties(page, 20);
      setProperties(response.properties);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await adminAPI.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadTenantInfo = async () => {
    try {
      const tenant = await tenantAPI.getCurrent();
      setTenantSlug(tenant.slug);
      
      // Parsear servicios y valores si son strings JSON
      const services = typeof tenant.services === 'string' 
        ? (tenant.services.startsWith('[') ? JSON.parse(tenant.services) : tenant.services.split(',').map(s => s.trim()))
        : (Array.isArray(tenant.services) ? tenant.services : []);
      
      const values = typeof tenant.values === 'string'
        ? (tenant.values.startsWith('[') ? JSON.parse(tenant.values) : tenant.values.split(',').map(v => v.trim()))
        : (Array.isArray(tenant.values) ? tenant.values : []);

      setTenantFormData({
        name: tenant.name || '',
        email: tenant.email || '',
        phone: tenant.phone || '',
        whatsapp: tenant.whatsapp || '',
        address: tenant.address || '',
        description: tenant.description || '',
        history: tenant.history || '',
        mission: tenant.mission || '',
        vision: tenant.vision || '',
        team_info: tenant.team_info || '',
        office_hours: tenant.office_hours || '',
        services: services,
        values: values,
        social_media: {
          facebook: tenant.social_media?.facebook || '',
          instagram: tenant.social_media?.instagram || '',
          linkedin: tenant.social_media?.linkedin || '',
          twitter: tenant.social_media?.twitter || ''
        },
        logo_url: tenant.logo_url || '',
        logo: null,
        featured_image: tenant.featured_image || '',
        featured_image_file: null,
        gallery: Array.isArray(tenant.gallery) ? tenant.gallery : []
      });
    } catch (error) {
      console.error('Error loading tenant info:', error);
    }
  };

  const handleTenantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await tenantAPI.update({
        ...tenantFormData,
        logo: tenantFormData.logo || undefined,
        featured_image: tenantFormData.featured_image_file || tenantFormData.featured_image || undefined,
      });
      alert('Información de la inmobiliaria actualizada correctamente');
      setShowTenantForm(false);
      loadTenantInfo();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar la información';
      alert('Error: ' + errorMessage);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTenantFormData({
        ...tenantFormData,
        logo: e.target.files[0]
      });
    }
  };

  const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTenantFormData({
        ...tenantFormData,
        featured_image_file: e.target.files[0]
      });
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      loadProperties();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const baseData = {
        titulo: formData.titulo,
        ciudad: formData.ciudad,
        tipo: formData.tipo,
        operacion: formData.operacion,
        moneda: formData.moneda,
        precio: parseFloat(formData.precio),
        ambientes: parseInt(formData.ambientes),
        metros_cuadrados: parseFloat(formData.metros_cuadrados),
        descripcion: formData.descripcion || undefined
      };

      // Si hay un archivo, usar el archivo, sino usar la URL si existe
      let imagen: string | File | undefined;
      if (formData.imagen) {
        imagen = await compressImage(formData.imagen);
      } else if (formData.imagenUrl && typeof formData.imagenUrl === 'string') {
        imagen = formData.imagenUrl;
      }

      const propertyData = {
        ...baseData,
        ...(imagen && { imagen }),
        nuevasImagenes: await compressImages(formData.nuevasImagenes)
      };

      if (editingProperty) {
        await propertiesAPI.update(editingProperty.id, propertyData);
      } else {
        await propertiesAPI.create(propertyData);
      }

      resetForm();
      loadProperties();
      loadStats();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar la propiedad';
      alert('Error: ' + errorMessage);
      
      // Si el error es de autenticación, redirigir al login
      if (errorMessage.includes('sesión') || errorMessage.includes('token')) {
        setTimeout(() => {
          router.push('/auth/signin');
        }, 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!editingProperty) return;
    try {
      await adminAPI.deleteImage(editingProperty.id, imageId);
      setExistingImages(images => images.filter(image => image.id !== imageId));
      loadProperties();
    } catch (error) {
      alert('Error: ' + (error instanceof Error ? error.message : 'No se pudo quitar la foto'));
    }
  };

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setFormData({
      titulo: property.titulo,
      ciudad: property.ciudad,
      tipo: property.tipo,
      operacion: property.operacion || 'venta',
      moneda: property.moneda || 'USD',
      precio: property.precio.toString(),
      ambientes: property.ambientes.toString(),
      metros_cuadrados: property.metros_cuadrados.toString(),
      descripcion: property.descripcion || '',
      imagen: null,
      imagenUrl: property.imagen || '',
      nuevasImagenes: []
    });
    setExistingImages(property.imagenes || []);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta propiedad?')) {
      return;
    }

    try {
      await propertiesAPI.delete(id);
      loadProperties();
      loadStats();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar la propiedad';
      alert('Error: ' + errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      ciudad: '',
      tipo: '',
      operacion: 'venta',
      moneda: 'USD',
      precio: '',
      ambientes: '',
      metros_cuadrados: '',
      descripcion: '',
      imagen: null,
      imagenUrl: '',
      nuevasImagenes: []
    });
    setExistingImages([]);
    setEditingProperty(null);
    setShowForm(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        imagen: e.target.files[0],
        imagenUrl: e.target.files[0]
      });
    }
  };

  if (status === 'loading') {
    return (
      <div className={styles.loading}>
        <p>Cargando...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className={styles.loading}>
        <p>Redirigiendo al login...</p>
      </div>
    );
  }

  interface UserWithRole {
    role?: string;
    tenant_id?: number;
  }
  const userRole = (session?.user as UserWithRole)?.role;
  // Permitir acceso a admin global o tenant_admin
  if (userRole !== 'admin' && userRole !== 'tenant_admin') {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          <h2>Acceso Denegado</h2>
          <p>No tienes permisos de administrador para acceder a esta página.</p>
          <p>Tu rol actual: <strong>{userRole || 'No asignado'}</strong></p>
          <p>Necesitas iniciar sesión con una cuenta de administrador o tenant_admin.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AdminNavbar 
        userName={session?.user?.name || undefined}
        userEmail={session?.user?.email || undefined}
      />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Panel de Administración</h1>
          <div className={styles.headerButtons}>
            {tenantSlug && tenantSlug !== 'default' && (
              <a href={`/inmobiliaria/${tenantSlug}`} target="_blank" rel="noopener noreferrer" className={styles.tenantButton}>
                🌐 Ver mi sitio
              </a>
            )}
            <button onClick={() => setShowTenantForm(!showTenantForm)} className={styles.tenantButton}>
              {showTenantForm ? 'Cancelar' : '📝 Editar Inmobiliaria'}
            </button>
            <button onClick={() => setShowForm(!showForm)} className={styles.addButton}>
              {showForm ? 'Cancelar' : '+ Nueva Propiedad'}
            </button>
          </div>
        </div>

      {stats && (
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <h3>Total Propiedades</h3>
            <p>{stats.totalProperties}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Total Usuarios</h3>
            <p>{stats.totalUsers}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Consultas por WhatsApp (30 días)</h3>
            <p>{stats.contactsLast30Days}</p>
          </div>
          {stats.topContacted.length > 0 && (
            <div className={styles.statCard}>
              <h3>Más consultadas (30 días)</h3>
              <ol className={styles.topList}>
                {stats.topContacted.map((item) => (
                  <li key={item.id}>
                    {item.titulo} <strong>({item.count})</strong>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className={styles.formContainer}>
          <h2>{editingProperty ? 'Editar Propiedad' : 'Nueva Propiedad'}</h2>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label>Título *</label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formField}>
                <label>Ciudad *</label>
                <input
                  type="text"
                  value={formData.ciudad}
                  onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label>Tipo *</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  required
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="Casa">Casa</option>
                  <option value="Departamento">Departamento</option>
                  <option value="Condominio">Condominio</option>
                  <option value="Casa adosada">Casa adosada</option>
                  <option value="Terreno">Terreno</option>
                </select>
              </div>
              <div className={styles.formField}>
                <label>Operación *</label>
                <select
                  value={formData.operacion}
                  onChange={(e) => setFormData({ ...formData, operacion: e.target.value as 'venta' | 'alquiler' })}
                  required
                >
                  <option value="venta">Venta</option>
                  <option value="alquiler">Alquiler</option>
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label>Precio *{formData.operacion === 'alquiler' ? ' (por mes)' : ''}</label>
                <div className={styles.priceWithCurrency}>
                  <select
                    value={formData.moneda}
                    onChange={(e) => setFormData({ ...formData, moneda: e.target.value as Moneda })}
                    aria-label="Moneda"
                  >
                    <option value="USD">US$</option>
                    <option value="ARS">$ (pesos)</option>
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className={styles.formField}>
                <label>Ambientes *</label>
                <input
                  type="number"
                  value={formData.ambientes}
                  onChange={(e) => setFormData({ ...formData, ambientes: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label>Metros Cuadrados *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.metros_cuadrados}
                  onChange={(e) => setFormData({ ...formData, metros_cuadrados: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className={styles.formField}>
              <label>Descripción</label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                rows={4}
              />
            </div>

            <div className={styles.formField}>
              <label>Foto principal (URL o archivo)</label>
              <input
                type="text"
                value={typeof formData.imagenUrl === 'string' ? formData.imagenUrl : ''}
                onChange={(e) => setFormData({ ...formData, imagenUrl: e.target.value })}
                placeholder="URL de la imagen"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className={styles.fileInput}
              />
            </div>

            <div className={styles.formField}>
              <label>Fotos adicionales (podés elegir varias)</label>
              {existingImages.length > 0 && (
                <div className={styles.imageGrid}>
                  {existingImages.map((image) => (
                    <div key={image.id} className={styles.imageThumb}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={resolveImageUrl(image.url)} alt="" />
                      <button type="button" onClick={() => handleDeleteImage(image.id)} aria-label="Quitar foto">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setFormData({ ...formData, nuevasImagenes: Array.from(e.target.files || []) })}
                className={styles.fileInput}
              />
              {formData.nuevasImagenes.length > 0 && (
                <small>{formData.nuevasImagenes.length} foto(s) nueva(s) para subir</small>
              )}
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.submitButton} disabled={saving}>
                {saving ? 'Guardando...' : editingProperty ? 'Actualizar' : 'Crear'}
              </button>
              <button type="button" onClick={resetForm} className={styles.cancelButton}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {showTenantForm && (
        <div className={styles.formContainer}>
          <h2>Editar Información de la Inmobiliaria</h2>
          <form onSubmit={handleTenantSubmit} className={styles.form}>
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label>Nombre de la Inmobiliaria *</label>
                <input
                  type="text"
                  value={tenantFormData.name}
                  onChange={(e) => setTenantFormData({ ...tenantFormData, name: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formField}>
                <label>Email *</label>
                <input
                  type="email"
                  value={tenantFormData.email}
                  onChange={(e) => setTenantFormData({ ...tenantFormData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label>Teléfono</label>
                <input
                  type="text"
                  value={tenantFormData.phone}
                  onChange={(e) => setTenantFormData({ ...tenantFormData, phone: e.target.value })}
                />
              </div>
              <div className={styles.formField}>
                <label>WhatsApp para consultas</label>
                <input
                  type="tel"
                  value={tenantFormData.whatsapp}
                  onChange={(e) => setTenantFormData({ ...tenantFormData, whatsapp: e.target.value })}
                  placeholder="Ej: 54 9 11 1234-5678 (con código de país)"
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label>Dirección</label>
                <input
                  type="text"
                  value={tenantFormData.address}
                  onChange={(e) => setTenantFormData({ ...tenantFormData, address: e.target.value })}
                />
              </div>
            </div>

            <div className={styles.formField}>
              <label>Descripción</label>
              <textarea
                value={tenantFormData.description}
                onChange={(e) => setTenantFormData({ ...tenantFormData, description: e.target.value })}
                rows={3}
                placeholder="Descripción general de la inmobiliaria"
              />
            </div>

            <div className={styles.formField}>
              <label>Historia</label>
              <textarea
                value={tenantFormData.history}
                onChange={(e) => setTenantFormData({ ...tenantFormData, history: e.target.value })}
                rows={4}
                placeholder="Historia de la empresa"
              />
            </div>

            <div className={styles.formField}>
              <label>Misión</label>
              <textarea
                value={tenantFormData.mission}
                onChange={(e) => setTenantFormData({ ...tenantFormData, mission: e.target.value })}
                rows={3}
                placeholder="Misión de la empresa"
              />
            </div>

            <div className={styles.formField}>
              <label>Visión</label>
              <textarea
                value={tenantFormData.vision}
                onChange={(e) => setTenantFormData({ ...tenantFormData, vision: e.target.value })}
                rows={3}
                placeholder="Visión de la empresa"
              />
            </div>

            <div className={styles.formField}>
              <label>Información del Equipo</label>
              <textarea
                value={tenantFormData.team_info}
                onChange={(e) => setTenantFormData({ ...tenantFormData, team_info: e.target.value })}
                rows={4}
                placeholder="Información sobre el equipo"
              />
            </div>

            <div className={styles.formField}>
              <label>Horarios de Atención</label>
              <input
                type="text"
                value={tenantFormData.office_hours}
                onChange={(e) => setTenantFormData({ ...tenantFormData, office_hours: e.target.value })}
                placeholder="Ej: Lunes a Viernes 9:00 - 18:00"
              />
            </div>

            <div className={styles.formField}>
              <label>Servicios (separados por comas)</label>
              <input
                type="text"
                value={Array.isArray(tenantFormData.services) ? tenantFormData.services.join(', ') : tenantFormData.services}
                onChange={(e) => {
                  const services = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                  setTenantFormData({ ...tenantFormData, services });
                }}
                placeholder="Ej: Venta, Alquiler, Tasaciones"
              />
            </div>

            <div className={styles.formField}>
              <label>Valores (separados por comas)</label>
              <input
                type="text"
                value={Array.isArray(tenantFormData.values) ? tenantFormData.values.join(', ') : tenantFormData.values}
                onChange={(e) => {
                  const values = e.target.value.split(',').map(v => v.trim()).filter(v => v);
                  setTenantFormData({ ...tenantFormData, values });
                }}
                placeholder="Ej: Transparencia, Compromiso, Excelencia"
              />
            </div>

            <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Redes Sociales</h3>
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label>Facebook</label>
                <input
                  type="url"
                  value={tenantFormData.social_media.facebook || ''}
                  onChange={(e) => setTenantFormData({
                    ...tenantFormData,
                    social_media: { ...tenantFormData.social_media, facebook: e.target.value }
                  })}
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div className={styles.formField}>
                <label>Instagram</label>
                <input
                  type="url"
                  value={tenantFormData.social_media.instagram || ''}
                  onChange={(e) => setTenantFormData({
                    ...tenantFormData,
                    social_media: { ...tenantFormData.social_media, instagram: e.target.value }
                  })}
                  placeholder="https://instagram.com/..."
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label>LinkedIn</label>
                <input
                  type="url"
                  value={tenantFormData.social_media.linkedin || ''}
                  onChange={(e) => setTenantFormData({
                    ...tenantFormData,
                    social_media: { ...tenantFormData.social_media, linkedin: e.target.value }
                  })}
                  placeholder="https://linkedin.com/..."
                />
              </div>
              <div className={styles.formField}>
                <label>Twitter</label>
                <input
                  type="url"
                  value={tenantFormData.social_media.twitter || ''}
                  onChange={(e) => setTenantFormData({
                    ...tenantFormData,
                    social_media: { ...tenantFormData.social_media, twitter: e.target.value }
                  })}
                  placeholder="https://twitter.com/..."
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label>Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className={styles.fileInput}
                />
                {tenantFormData.logo && (
                  <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
                    Archivo seleccionado: {tenantFormData.logo.name}
                  </p>
                )}
                {tenantFormData.logo_url && !tenantFormData.logo && (
                  <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
                    Logo actual: <a href={`http://localhost:8000${tenantFormData.logo_url}`} target="_blank" rel="noopener noreferrer">Ver</a>
                  </p>
                )}
                <input
                  type="url"
                  value={tenantFormData.logo_url}
                  onChange={(e) => setTenantFormData({ ...tenantFormData, logo_url: e.target.value })}
                  placeholder="O ingresa una URL del logo"
                  style={{ marginTop: '0.5rem' }}
                />
              </div>
              <div className={styles.formField}>
                <label>Imagen Destacada</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFeaturedImageChange}
                  className={styles.fileInput}
                />
                {tenantFormData.featured_image_file && (
                  <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
                    Archivo seleccionado: {tenantFormData.featured_image_file.name}
                  </p>
                )}
                {tenantFormData.featured_image && !tenantFormData.featured_image_file && (
                  <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
                    Imagen actual: <a href={`http://localhost:8000${tenantFormData.featured_image}`} target="_blank" rel="noopener noreferrer">Ver</a>
                  </p>
                )}
                <input
                  type="url"
                  value={typeof tenantFormData.featured_image === 'string' ? tenantFormData.featured_image : ''}
                  onChange={(e) => setTenantFormData({ ...tenantFormData, featured_image: e.target.value })}
                  placeholder="O ingresa una URL de la imagen"
                  style={{ marginTop: '0.5rem' }}
                />
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.submitButton}>
                Guardar Cambios
              </button>
              <button type="button" onClick={() => setShowTenantForm(false)} className={styles.cancelButton}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.propertiesList}>
        <h2>Propiedades ({properties.length})</h2>
        {loading ? (
          <div className={styles.loading}>Cargando propiedades...</div>
        ) : properties.length === 0 ? (
          <p>No hay propiedades</p>
        ) : (
          <>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Título</th>
                    <th>Ciudad</th>
                    <th>Tipo</th>
                    <th>Operación</th>
                    <th>Precio</th>
                    <th>Ambientes</th>
                    <th>m²</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((property) => (
                    <tr key={property.id}>
                      <td>{property.id}</td>
                      <td>{property.titulo}</td>
                      <td>{property.ciudad}</td>
                      <td>{property.tipo}</td>
                      <td>
                        <span className={property.operacion === 'venta' ? styles.badgeVenta : styles.badgeAlquiler}>
                          {property.operacion === 'venta' ? 'Venta' : 'Alquiler'}
                        </span>
                      </td>
                      <td>{formatPropertyPrice(property)}</td>
                      <td>{property.ambientes}</td>
                      <td>{property.metros_cuadrados}</td>
                      <td>
                        {tenantSlug && (
                          <a
                            href={`/inmobiliaria/${tenantSlug}/propiedad/${property.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.editButton}
                          >
                            Ver
                          </a>
                        )}
                        <button
                          onClick={() => handleEdit(property)}
                          className={styles.editButton}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(property.id)}
                          className={styles.deleteButton}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </button>
                <span>Página {page} de {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </>
  );
}

