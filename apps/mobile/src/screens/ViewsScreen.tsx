import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as tokens from '../theme/tokens';
import { api } from '../utils/api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Views'>;

export const ViewsScreen: React.FC<Props> = () => {
  const [loading, setLoading] = useState(true);
  const [views, setViews] = useState<any[]>([]);

  useEffect(() => {
    fetchViews();
  }, []);

  const fetchViews = async () => {
    try {
      const response = await api.get('/analytics/views');
      setViews(response.data.data);
    } catch (err) {
      console.error('Failed to fetch views analytics', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'qr': return 'qrcode';
      case 'link': return 'link-variant';
      case 'web': return 'web';
      default: return 'eye';
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isAnonymous = !item.viewer;
    
    return (
      <View style={styles.viewItem}>
        <View style={styles.avatarContainer}>
          {isAnonymous ? (
            <View style={[styles.avatar, styles.anonymousAvatar]}>
              <Icon name="incognito" size={24} color={tokens.colors.textSecondary} />
            </View>
          ) : item.viewer.avatarUrl ? (
            <Image source={{ uri: item.viewer.avatarUrl }} style={styles.avatar} />
          ) : (
             <View style={[styles.avatar, styles.placeholderAvatar]}>
              <Text style={styles.placeholderText}>{item.viewer.displayName.charAt(0)}</Text>
            </View>
          )}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.viewerName}>
            {isAnonymous ? 'Anonymous Viewer' : item.viewer.displayName}
          </Text>
          <Text style={styles.viewTarget}>
            {item.cardId ? `Viewed Card: ${item.card?.title || 'Unknown'}` : 'Viewed Main Profile'}
          </Text>
          <Text style={styles.timestamp}>{formatDate(item.createdAt)}</Text>
        </View>

        <View style={styles.sourceBadge}>
          <Icon name={getSourceIcon(item.source)} size={16} color={tokens.colors.primary} />
          <Text style={styles.sourceText}>{item.source.toUpperCase()}</Text>
        </View>
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
      {views.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="chart-bar" size={64} color={tokens.colors.textTertiary} />
          <Text style={styles.emptyTitle}>No Views Yet</Text>
          <Text style={styles.emptyDesc}>Share your card or QR code to start collecting analytics.</Text>
        </View>
      ) : (
        <FlatList
          data={views}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
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
  listContainer: {
    padding: tokens.spacing.md,
  },
  viewItem: {
    flexDirection: 'row',
    backgroundColor: tokens.colors.surface,
    padding: tokens.spacing.md,
    borderRadius: tokens.radii.lg,
    marginBottom: tokens.spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: tokens.colors.borderLight,
  },
  avatarContainer: {
    marginRight: tokens.spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: tokens.colors.surfaceHighlight,
  },
  anonymousAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: tokens.colors.surfaceHighlight,
  },
  placeholderAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: tokens.colors.primary,
  },
  placeholderText: {
    color: tokens.colors.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
  },
  viewerName: {
    color: tokens.colors.textPrimary,
    fontSize: tokens.typography.sizes.md,
    fontWeight: tokens.typography.weights.semibold as any,
  },
  viewTarget: {
    color: tokens.colors.textSecondary,
    fontSize: tokens.typography.sizes.sm,
    marginTop: 2,
  },
  timestamp: {
    color: tokens.colors.textTertiary,
    fontSize: tokens.typography.sizes.xs,
    marginTop: 4,
  },
  sourceBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: tokens.radii.md,
  },
  sourceText: {
    color: tokens.colors.primary,
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: tokens.spacing.xl,
  },
  emptyTitle: {
    color: tokens.colors.textPrimary,
    fontSize: tokens.typography.sizes.xl,
    fontWeight: 'bold',
    marginTop: tokens.spacing.md,
  },
  emptyDesc: {
    color: tokens.colors.textSecondary,
    fontSize: tokens.typography.sizes.md,
    textAlign: 'center',
    marginTop: tokens.spacing.sm,
  },
});
