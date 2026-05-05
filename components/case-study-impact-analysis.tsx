import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import type { ImpactedAsset } from '@/lib/case-study-data';

interface CaseStudyImpactAnalysisProps {
  assets: ImpactedAsset[];
}

export function CaseStudyImpactAnalysis({ assets }: CaseStudyImpactAnalysisProps) {
  const colors = useColors();

  const positiveAssets = assets.filter((a) => a.impact === 'positive');
  const negativeAssets = assets.filter((a) => a.impact === 'negative');

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      stock: '📈 주식',
      bond: '📄 채권',
      currency: '💱 환율',
      commodity: '🏆 원자재',
      real_estate: '🏠 부동산',
    };
    return labels[category] || category;
  };

  const renderAssetCard = (asset: ImpactedAsset) => (
    <View
      key={asset.name}
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: asset.impact === 'positive' ? '#10B981' : '#EF4444',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 2 }}>
            {asset.emoji} {asset.name}
          </Text>
          <Text style={{ fontSize: 11, color: colors.muted }}>
            {getCategoryLabel(asset.category)}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: asset.impact === 'positive' ? '#D1FAE5' : '#FEE2E2',
            borderRadius: 8,
            paddingHorizontal: 10,
            paddingVertical: 6,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: '700',
              color: asset.impact === 'positive' ? '#059669' : '#DC2626',
            }}
          >
            {asset.impact === 'positive' ? '+' : ''}
            {asset.changePercent}%
          </Text>
        </View>
      </View>

      <Text
        style={{
          fontSize: 12,
          color: colors.foreground,
          lineHeight: 18,
        }}
      >
        {asset.explanation}
      </Text>
    </View>
  );

  return (
    <View style={{ backgroundColor: colors.background }}>
      {/* 헤더 */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>
          💰 자산별 영향도 분석
        </Text>
      </View>

      {/* 긍정적 영향 */}
      {positiveAssets.length > 0 && (
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <View
            style={{
              backgroundColor: '#F0FDF4',
              borderRadius: 12,
              padding: 12,
              marginBottom: 12,
              borderLeftWidth: 4,
              borderLeftColor: '#10B981',
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#059669', marginBottom: 8 }}>
              ✅ 이득을 본 자산 ({positiveAssets.length}개)
            </Text>
            <Text style={{ fontSize: 12, color: '#047857', lineHeight: 18 }}>
              위기 상황에서도 특정 자산은 가치가 상승했습니다. 안전자산이나 위기 수혜 자산이 주로 해당됩니다.
            </Text>
          </View>

          {positiveAssets.map((asset) => renderAssetCard(asset))}
        </View>
      )}

      {/* 부정적 영향 */}
      {negativeAssets.length > 0 && (
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <View
            style={{
              backgroundColor: '#FEF2F2',
              borderRadius: 12,
              padding: 12,
              marginBottom: 12,
              borderLeftWidth: 4,
              borderLeftColor: '#EF4444',
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#DC2626', marginBottom: 8 }}>
              ❌ 피해를 본 자산 ({negativeAssets.length}개)
            </Text>
            <Text style={{ fontSize: 12, color: '#991B1B', lineHeight: 18 }}>
              위기로 인해 가치가 급락한 자산들입니다. 금융기관, 경기 민감 산업이 주로 해당됩니다.
            </Text>
          </View>

          {negativeAssets.map((asset) => renderAssetCard(asset))}
        </View>
      )}

      {/* 인사이트 */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 16,
          marginHorizontal: 16,
          marginBottom: 16,
          borderLeftWidth: 4,
          borderLeftColor: colors.primary,
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>
          💡 핵심 인사이트
        </Text>
        <Text style={{ fontSize: 12, color: colors.foreground, lineHeight: 18 }}>
          위기 상황에서는 자산 간 상관관계가 역전됩니다. 일반적으로 위험자산(주식)은 급락하고, 안전자산(국채, 달러, 금)은 상승합니다. 이를 통해 포트폴리오 분산 투자의 중요성을 알 수 있습니다.
        </Text>
      </View>
    </View>
  );
}
