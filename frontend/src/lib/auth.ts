import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Este archivo corre en el servidor: dentro de Docker el backend no está en localhost
const API_URL = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        tenant_slug: { label: "Inmobiliaria", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const tenantSlug = credentials.tenant_slug || 'demo';
          
          const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Tenant-Slug': tenantSlug,
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            return null;
          }

          const data = await response.json();
          
          // Guardar el token en localStorage inmediatamente
          if (typeof window !== 'undefined' && data.access_token) {
            localStorage.setItem('auth_token', data.access_token);
            // Guardar tenant_slug si está disponible
            if (data.tenant_slug) {
              localStorage.setItem('tenant_slug', data.tenant_slug);
            }
          }
          
          // Decodificar el token JWT para obtener los datos del usuario
          const tokenParts = data.access_token.split('.');
          const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
          
          return {
            id: payload.sub, // email como id temporal
            email: payload.sub,
            name: payload.sub.split('@')[0], // nombre del email
            role: payload.role,
            accessToken: data.access_token,
          };
        } catch (error) {
          console.error('Error en authorize:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      interface UserWithRole {
        role?: string;
        accessToken?: string;
      }
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = (user as UserWithRole).role;
        token.accessToken = (user as UserWithRole).accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      interface SessionUser {
        id?: string;
        email?: string;
        role?: string;
        accessToken?: string;
      }
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        (session.user as SessionUser).role = token.role as string;
        (session.user as SessionUser).accessToken = token.accessToken as string;
        
        // Asegurar que el token esté en localStorage cada vez que se actualiza la sesión
        if (typeof window !== 'undefined' && token.accessToken) {
          localStorage.setItem('auth_token', token.accessToken as string);
        }
      }
      return session;
    },
  },
}; 