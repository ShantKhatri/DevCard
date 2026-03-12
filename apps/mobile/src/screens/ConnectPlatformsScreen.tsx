import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as tokens from '../theme/tokens';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ConnectPlatforms'>;

interface ConnectedPlatform {
  platform: string;
  connectedAt: string;
  scopes: string;
}

export const ConnectPlatformsScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [connectedPlatforms, setConnectedPlatforms] = useState<ConnectedPlatform[]>([]);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const response = await api.get('/connect/status');
      setConnectedPlatforms(response.data.connectedPlatforms || []);
    } catch (err) {
      console.error('Failed to fetch connected platforms', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platform: string) => {
    if (platform === 'github') {
      const BACKEND_URL = 'http://10.0.2.2:3000'; // Or from env
      // Generate standard state for the connect request
      const sessionState = `mobile_${Date.now()}`;
      const authUrl = `${BACKEND_URL}/api/connect/github?state=${sessionState}`;
      
      try {
        await Linking.openURL(authUrl);
        // User will be redirected back to the app via deep link
        // A real app would listen to the Linking.addEventListener('url') here to refresh
        setTimeout(fetchConnections, 5000); // Polling fallback
      } catch (err) {
        Alert.alert('Error', 'Failed to open connection page');
      }
    } else {
      Alert.alert('Coming Soon', `OAuth connect for ${platform} is not yet available.`);
    }
  };

  const handleDisconnect = (platform: string) => {
    Alert.alert(
      'Disconnect Platform',
      `Are you sure you want to disconnect ${platform}? Features like Silent Follow will stop working.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
             try {
               await api.delete(`/connect/${platform}`);
               fetchConnections();
             } catch (err) {
               Alert.alert('Error', 'Failed to disconnect');
             }
          }
        }
      ]
    );
  };

  const renderPlatform = (platformId: string, name: string, icon: string, description: string) => {
    const isConnected = connectedPlatforms.some(p => p.platform === platformId);

    return (
      <View style={styles.platformCard} key={platformId}>
        <View style={styles.platformHeader}>
          <Icon name={icon} size={28} color={tokens.colors.textPrimary} />
          <View style={styles.platformInfo}>
            <Text style={styles.platformName}>{name}</Text>
            <Text style={styles.platformDesc}>{description}</Text>
          </View>
        </View>

        {isConnected ? (
          <View style={styles.connectedState}>
            <View style={styles.statusBadge}>
              <Icon name="check-circle" size={14} color={tokens.colors.success} />
              <Text style={styles.statusText}>Connected</Text>
            </View>
            <TouchableOpacity 
              style={styles.disconnectBtn}
              onPress={() => handleDisconnect(platformId)}
            >
              <Text style={styles.disconnectBtnText}>Disconnect</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.connectBtn}
            onPress={() => handleConnect(platformId)}
          >
            <Text style={styles.connectBtnText}>Connect {name}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={tokens.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>Silent Follow Integrations</Text>
        <Text style={styles.sectionDesc}>
          Connect your accounts to allow DevCard to perform actions like "Follow" or "Connect" on your behalf directly from the app.
        </Text>

        {renderPlatform(
          'github', 
          'GitHub API', 
          'github', 
          'Follow users silently without opening a web browser.'
        )}

        {renderPlatform(
          'twitter',
          'Twitter / X API',
          'twitter',
          'Follow profiles automatically. Requires write access.'
        )}
        
        {renderPlatform(
          'linkedin',
          'LinkedIn Partner API',
          'linkedin',
          'Send connection requests. (Enterprise only).'
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    padding: tokens.spacing.lg,
  },
  sectionTitle: {
    fontSize: tokens.typography.sizes.xl,
    fontWeight: tokens.typography.weights.bold as any,
    color: tokens.colors.textPrimary,
    marginBottom: tokens.spacing.xs,
  },
  sectionDesc: {
    fontSize: tokens.typography.sizes.sm,
    color: tokens.colors.textSecondary,
    marginBottom: tokens.spacing.xl,
    lineHeight: 20,
  },
  platformCard: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radii.lg,
    padding: tokens.spacing.lg,
    marginBottom: tokens.spacing.lg,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  platformHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.md,
  },
  platformInfo: {
    marginLeft: tokens.spacing.md,
    flex: 1,
  },
  platformName: {
    fontSize: tokens.typography.sizes.lg,
    fontWeight: tokens.typography.weights.semibold as any,
    color: tokens.colors.textPrimary,
  },
  platformDesc: {
    fontSize: tokens.typography.sizes.xs,
    color: tokens.colors.textTertiary,
    marginTop: 2,
  },
  connectedState: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: tokens.spacing.sm,
    paddingTop: tokens.spacing.md,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.borderLight,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radii.full,
  },
  statusText: {
    color: tokens.colors.success,
    fontSize: tokens.typography.sizes.xs,
    fontWeight: tokens.typography.weights.medium as any,
    marginLeft: 4,
  },
  disconnectBtn: {
    paddingVertical: tokens.spacing.xs,
    paddingHorizontal: tokens.spacing.sm,
  },
  disconnectBtnText: {
    color: tokens.colors.error,
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.medium as any,
  },
  connectBtn: {
    backgroundColor: tokens.colors.primary,
    borderRadius: tokens.radii.md,
    paddingVertical: tokens.spacing.sm,
    alignItems: 'center',
    marginTop: tokens.spacing.sm,
  },
  connectBtnText: {
    color: tokens.colors.textPrimary,
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.semibold as any,
  },
});
