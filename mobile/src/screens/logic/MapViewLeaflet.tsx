import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { buildMapHtml } from './mapHtml';
import { Location } from './types';
import { Talent } from '../../types';
import { exploreMapStyles as styles } from '../../styles/exploreMapStyles';

interface MapViewLeafletProps {
  userLocation: Location;
  radiusKm: number | null;
  talents: Talent[];
  focusTalent?: { id: string; lat: number; lng: number } | null;
  onTalentClick?: (id: string) => void;
}

export const MapViewLeaflet: React.FC<MapViewLeafletProps> = ({
  userLocation,
  radiusKm,
  talents,
  focusTalent,
  onTalentClick,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [isReady, setIsReady] = useState(false);

  const initialHtml = useMemo(
    () =>
      buildMapHtml({
        userLocation,
        radiusKm: radiusKm ?? 5,
        talents,
      }),
    []
  );

  const postMessage = (payload: unknown) => {
    if (!isReady || !webViewRef.current) return;
    webViewRef.current.postMessage(JSON.stringify(payload));
  };

  useEffect(() => {
    if (!isReady) return;
    postMessage({ type: 'updateRadius', radiusKm: radiusKm, talents });
  }, [isReady, radiusKm]);

  useEffect(() => {
    if (!isReady) return;
    postMessage({ type: 'updateLocation', location: userLocation, radiusKm: radiusKm });
  }, [isReady, userLocation]);

  useEffect(() => {
    if (!isReady) return;
    postMessage({ type: 'updateTalents', talents });
  }, [isReady, talents]);

  useEffect(() => {
    if (!isReady || !focusTalent) return;
    postMessage({ type: 'focusTalent', talentId: focusTalent.id, lat: focusTalent.lat, lng: focusTalent.lng });
  }, [isReady, focusTalent]);

  return (
    <View style={styles.mapContainer}>
      <WebView
        ref={webViewRef}
        source={{ html: initialHtml }}
        style={styles.map}
        onLoadEnd={() => setIsReady(true)}
        onMessage={(event) => {
          const data = JSON.parse(event.nativeEvent.data);
          if (data.type === 'talentClick' && onTalentClick) {
            onTalentClick(data.talentId);
          }
        }}
      />
    </View>
  );
};
