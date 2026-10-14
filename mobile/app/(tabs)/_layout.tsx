import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useUserRole } from '@/hooks/useUserRole';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isAdmin, loading } = useUserRole();

  // Mostrar loading mientras se detecta el rol
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="property"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      {/* Perfil: Solo para clientes */}
      {!isAdmin && (
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
          }}
        />
      )}
      {/* Inmobiliaria: Solo para admins */}
      {isAdmin && (
        <Tabs.Screen
          name="tenant"
          options={{
            title: 'Inmobiliaria',
            tabBarIcon: ({ color }) => <TabBarIcon name="building" color={color} />,
          }}
        />
      )}
    </Tabs>
  );
}
