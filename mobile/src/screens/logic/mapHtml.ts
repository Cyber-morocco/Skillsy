// @ts-nocheck
import { Location } from './types';
import { Talent } from '../../types';

interface BuildMapHtmlArgs {
  userLocation: Location;
  radiusKm: number | null;
  talents: Talent[];
  filtersActive: boolean;
}

export const buildMapHtml = ({ userLocation, radiusKm, talents, filtersActive }: BuildMapHtmlArgs): string => {
  const initialTalents = JSON.stringify(talents);
  const initialRadius = radiusKm !== null ? radiusKm : 'null';
  const initialFiltersActive = filtersActive ? 'true' : 'false';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
        <style>
          body, html { margin: 0; padding: 0; width: 100%; height: 100%; }
          #map { width: 100%; height: 100%; }
          .custom-marker { 
            width: 50px; 
            height: 50px; 
            border-radius: 50%; 
            border: 3px solid #7c3aed;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          }
          .custom-marker img { 
            width: 100%; 
            height: 100%; 
            border-radius: 50%;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          try {
            let centerLat = ${userLocation.lat};
            let centerLng = ${userLocation.lng};
            let radiusKm = ${initialRadius};
            let filtersActive = ${initialFiltersActive};
            let allTalents = ${initialTalents};
            
            let radiusCircle = null;
            let talentMarkers = {};
            let clusterLayers = [];
            let userMarker = null;
            
            const getZoomForRadius = (radiusKm) => {
              if (!radiusKm || radiusKm === null) return 13; 
              const diameter = radiusKm * 2;
              const neededWidth = diameter * 1.1; 
              const zoom = Math.log2(40000 / neededWidth);
              return Math.max(6, Math.min(15, Math.floor(zoom)));
            };
            
            const initialZoom = getZoomForRadius(radiusKm);
            const map = L.map('map', { zoomControl: false }).setView([centerLat, centerLng], initialZoom);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap',
              maxZoom: 19
            }).addTo(map);

            // Utils
            const calculateDistance = (lat1, lon1, lat2, lon2) => {
              const R = 6371; // km
              const dLat = (lat2 - lat1) * Math.PI / 180;
              const dLon = (lon2 - lon1) * Math.PI / 180;
              const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                        Math.sin(dLon/2) * Math.sin(dLon/2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
              return R * c;
            };

            const createUserMarker = (count, showCount) => {
              if (userMarker) {
                map.removeLayer(userMarker);
              }
              
              const isClickable = showCount && count > 0;

              const size = 44;
              const innerContent = showCount 
                ? '<span style="color: white; font-size: 18px; font-weight: 700; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">' + count + '</span>'
                : '<div style="width: 12px; height: 12px; background: white; border-radius: 50%; box-shadow: 0 0 0 2px rgba(255,255,255,0.3);"></div>';
              
              const html = '<div style="' +
                'width: ' + size + 'px; ' +
                'height: ' + size + 'px; ' +
                'border-radius: 50%; ' +
                'background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); ' +
                'border: 3px solid white; ' +
                'display: flex; ' +
                'align-items: center; ' +
                'justify-content: center; ' +
                'box-shadow: 0 2px 8px rgba(124, 58, 237, 0.4), 0 4px 16px rgba(0, 0, 0, 0.2); ' +
                'cursor: ' + (isClickable ? 'pointer' : 'default') + '; ' +
                'transition: transform 0.2s;' +
                '">' + innerContent + '</div>';
              
              const icon = L.divIcon({
                html: html,
                iconSize: [size, size],
                className: 'talent-count-marker'
              });
              
              userMarker = L.marker([centerLat, centerLng], { icon: icon }).addTo(map);
              
              if (isClickable) {
                userMarker.on('click', () => {
                  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'switchToList' }));
                });
              }
            };

            const updateClusters = () => {
              // Clear existing clusters
              clusterLayers.forEach(l => map.removeLayer(l));
              clusterLayers = [];

              if (!allTalents || allTalents.length === 0) return;

              // Filter talents
              // 1. Must be within 50km
              // 2. Must NOT be inside the active filter radius (if set)
              const validTalents = allTalents.filter(t => {
                  if (!t.location || !t.location.lat) return false;
                  const dist = calculateDistance(centerLat, centerLng, t.location.lat, t.location.lng);
                  
                  if (dist > 50) return false;
                  if (radiusKm !== null && dist <= radiusKm) return false;
                  
                  return true;
              });

              // Simple greedy clustering
              const processed = new Set();
              const clusters = [];
              const CLUSTER_DIAMETER_KM = 3; // ~visual target
              
              for (let i = 0; i < validTalents.length; i++) {
                if (processed.has(validTalents[i].id)) continue;

                const t1 = validTalents[i];
                const currentCluster = [t1];
                processed.add(t1.id);

                for (let j = i + 1; j < validTalents.length; j++) {
                  if (processed.has(validTalents[j].id)) continue;
                  const t2 = validTalents[j];
                  const dist = calculateDistance(t1.location.lat, t1.location.lng, t2.location.lat, t2.location.lng);
                  
                  // Combine if close enough (using somewhat arbitrary cluster distance to form groups)
                  if (dist <= CLUSTER_DIAMETER_KM) {
                     currentCluster.push(t2);
                     processed.add(t2.id);
                  }
                }

                if (currentCluster.length >= 2) {
                  clusters.push(currentCluster);
                }
              }

              // Render clusters
              clusters.forEach(cluster => {
                 // Calculate center
                 const latSum = cluster.reduce((sum, t) => sum + t.location.lat, 0);
                 const lngSum = cluster.reduce((sum, t) => sum + t.location.lng, 0);
                 const cLat = latSum / cluster.length;
                 const cLng = lngSum / cluster.length;

                 // Visual Radius check for overlap with active filter
                 // The cluster circle radius is ~1-2km (diameter 2-4km)
                 const visualRadiusKm = 1.5; 
                 const distToUser = calculateDistance(centerLat, centerLng, cLat, cLng);

                 // Overlap check: Distance < (UserRadius + ClusterRadius)
                 if (radiusKm !== null && distToUser < (radiusKm + visualRadiusKm)) {
                    return; 
                 }

                 // Draw Circle
                 const circle = L.circle([cLat, cLng], {
                    radius: visualRadiusKm * 1000,
                    color: '#7c3aed',
                    fillColor: '#7c3aed',
                    fillOpacity: 0.15,
                    weight: 2,
                    dashArray: '5, 5'
                 }).addTo(map);
                 clusterLayers.push(circle);

                 // Draw Marker
                 const size = 44;
                 const count = cluster.length;
                 const html = '<div style="' +
                    'width: ' + size + 'px; ' +
                    'height: ' + size + 'px; ' +
                    'border-radius: 50%; ' +
                    'background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); ' +
                    'border: 3px solid white; ' +
                    'display: flex; ' +
                    'align-items: center; ' +
                    'justify-content: center; ' +
                    'box-shadow: 0 2px 8px rgba(124, 58, 237, 0.4); ' +
                    'cursor: pointer; color: white; font-weight: bold; font-family: sans-serif; font-size: 16px;">' + count + '</div>';

                 const icon = L.divIcon({ html, iconSize: [size, size], className: 'cluster-marker' });
                 const marker = L.marker([cLat, cLng], { icon }).addTo(map);
                 
                 marker.on('click', () => {
                     const talentData = cluster.map(t => ({ 
                       id: t.id, 
                       name: t.name || t.displayName, 
                       avatar: t.avatar || t.photoURL 
                     }));
                     window.ReactNativeWebView.postMessage(JSON.stringify({ 
                        type: 'clusterClick', 
                        talents: talentData 
                     }));
                 });
                 clusterLayers.push(marker);
              });
            };
            
            // Initialization
            createUserMarker(allTalents.length, filtersActive);
            updateClusters();

            if (radiusKm !== null) {
              radiusCircle = L.circle([centerLat, centerLng], {
                radius: radiusKm * 1000,
                color: '#7c3aed',
                fillColor: '#7c3aed',
                fillOpacity: 0.15,
                weight: 2,
                dashArray: '5, 5'
              }).addTo(map);
            }

            const updateCircle = (radius, lat, lng) => {
              if (radiusCircle) {
                map.removeLayer(radiusCircle);
                radiusCircle = null;
              }
              
              if (radius && radius !== null) {
                radiusKm = radius;
                radiusCircle = L.circle([lat, lng], {
                  radius: radius * 1000,
                  color: '#7c3aed',
                  fillColor: '#7c3aed',
                  fillOpacity: 0.15,
                  weight: 2,
                  dashArray: '5, 5'
                }).addTo(map);
              } else {
                radiusKm = null;
              }
            };

            const updateMapState = (newRadius) => {
               updateCircle(newRadius, centerLat, centerLng);
               createUserMarker(allTalents.length, filtersActive); // Update center marker count
               updateClusters(); 
               if (newRadius) {
                 const zoom = getZoomForRadius(newRadius);
                 map.setView([centerLat, centerLng], zoom, { animate: true });
               }
            };

            // Event Listeners
            document.addEventListener('message', (event) => {
              try {
                const data = JSON.parse(event.data);
                
                if (data.type === 'updateRadius') {
                  updateMapState(data.radiusKm);
                }
                
                if (data.type === 'updateTalents') {
                  if (data.talents) {
                    allTalents = data.talents;
                    // Also update user marker count
                    createUserMarker(allTalents.length, filtersActive);
                    updateClusters();
                  }
                }
                
                if (data.type === 'updateFiltersActive') {
                  filtersActive = !!data.filtersActive;
                  createUserMarker(allTalents.length, filtersActive);
                  updateClusters();
                }
                
                if (data.type === 'updateLocation') {
                  const { location, radiusKm: r } = data;
                  centerLat = location.lat;
                  centerLng = location.lng;
                  if (userMarker) {
                    userMarker.setLatLng([centerLat, centerLng]);
                  }
                  updateMapState(r);
                  map.setView([centerLat, centerLng], map.getZoom(), { animate: true });
                }
                
                if (data.type === 'focusTalent') {
                   // ... existing focus logic (if clusters are clickable, maybe focus logic needs adjustment?)
                   // Leaving focus logic as is for now
                }
              } catch (e) {
                console.error('Error handling message:', e);
              }
            });
            
          } catch (error) {
            document.body.innerHTML = '<div style="padding: 20px; color: red;">' + error.message + '</div>';
          }
        </script>
      </body>
    </html>
  `;
};
