'use client';

import React, { useEffect, useState } from 'react';
import { tenantAPI, Tenant } from '@/lib/api';

interface TenantSelectProps {
  value: string;
  onChange: (slug: string) => void;
  includeGlobalAdmin?: boolean;
}

export const TenantSelect: React.FC<TenantSelectProps> = ({ value, onChange, includeGlobalAdmin = false }) => {
  const [tenants, setTenants] = useState<Pick<Tenant, 'id' | 'name' | 'slug'>[]>([]);

  useEffect(() => {
    tenantAPI.getPublicList()
      .then((list) => {
        setTenants(list);
        if (!value && list.length > 0) {
          onChange(list[0].slug);
        }
      })
      .catch((error) => console.error('Error loading tenants:', error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <select id="tenant" value={value} onChange={(e) => onChange(e.target.value)} required>
      {tenants.map((tenant) => (
        <option key={tenant.id} value={tenant.slug}>
          {tenant.name}
        </option>
      ))}
      {includeGlobalAdmin && <option value="default">Administración general</option>}
    </select>
  );
};
