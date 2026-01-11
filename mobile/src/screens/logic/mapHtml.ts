// @ts-nocheck
import { Location } from './types';
import { Talent } from '../../types';
import { Cluster } from './clustering';

interface BuildMapHtmlArgs {
  userLocation: Location;
  radiusKm: number | null;
  talents: Talent[];
  clusters: Cluster[];
  filtersActive: boolean;
}

export const buildMapHtml = ({ userLocation, radiusKm, talents, clusters, filtersActive }: BuildMapHtmlArgs): string => {
  const initialTalents = JSON.stringify(talents);
  const initialClusters = JSON.stringify(clusters);
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
          .cluster-marker {
            background: transparent;
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
            let mapClusters = ${initialClusters};
            
            let radiusCircle = null;
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

            // Updates the central user/count marker
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
                className: 'talent-count-marker' // Reusing class for consistency
              });
              
              userMarker = L.marker([centerLat, centerLng], { icon: icon, zIndexOffset: 1000 }).addTo(map);
              
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

              if (!mapClusters || mapClusters.length === 0) return;

              mapClusters.forEach(cluster => {
                 // Privacy Logic: Hide if overlapping with distance filter OR fully inside
                 // User Requirement 1: "Any cluster whose circle overlaps or touches the filter circle must be hidden"
                 // User Requirement 2: "Als een cluster volledig binnen de afstandsfilter zit moet die ook verborgen zijn"
                 // Combined: Hide if NOT fully outside.
                 if (radiusKm !== null) {
                    const distToCenter = calculateDistance(centerLat, centerLng, cluster.lat, cluster.lng);
                    const innerDist = distToCenter - cluster.radius;
                    
                    // If inner edge is within the radius, it is either Inside or Overlapping/Touching. -> HIDE
                    if (innerDist <= radiusKm) {
                       return;
                    }
                 }

                 // Draw Cluster Circle
                 // "Purple, Dashed stroke, Semi-transparent"
                 const circle = L.circle([cluster.lat, cluster.lng], {
                    radius: cluster.radius * 1000, // km to m
                    color: '#7c3aed',
                    fillColor: '#7c3aed',
                    fillOpacity: 0.15,
                    weight: 2,
                    dashArray: '5, 5'
                 }).addTo(map);
                 clusterLayers.push(circle);

                 // Draw Cluster Badge with Count
                 const size = 40;
                 const count = cluster.talents.length;
                 const html = '<div style="' +
                    'width: ' + size + 'px; ' +
                    'height: ' + size + 'px; ' +
                    'border-radius: 50%; ' +
                    'background: #7c3aed; ' + // Solid purple bubble
                    'border: 2px solid white; ' +
                    'display: flex; ' +
                    'align-items: center; ' +
                    'justify-content: center; ' +
                    'box-shadow: 0 2px 4px rgba(0,0,0,0.2); ' +
                    'cursor: pointer; ' +
                    'color: white; font-weight: bold; font-family: sans-serif; font-size: 16px;">' + count + '</div>';

                 const icon = L.divIcon({ 
                    html, 
                    iconSize: [size, size], 
                    className: 'cluster-marker' 
                 });
                 
                 const marker = L.marker([cluster.lat, cluster.lng], { icon }).addTo(map);
                 
                 marker.on('click', () => {
                     const talentData = cluster.talents.map(t => ({ 
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
                fillOpacity: 0.05, // Lighter fill for filter circle to distinguish from clusters
                weight: 1,
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
                  fillOpacity: 0.05,
                  weight: 1,
                  dashArray: '5, 5'
                }).addTo(map);
              } else {
                radiusKm = null;
              }
            };

            const updateMapState = (newRadius) => {
               updateCircle(newRadius, centerLat, centerLng);
               createUserMarker(allTalents.length, filtersActive); 
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
                  // data.clusters might be updated too
                  if (data.clusters) mapClusters = data.clusters;
                  if (data.talents) allTalents = data.talents;
                  updateMapState(data.radiusKm);
                }
                
                if (data.type === 'updateTalents') {
                  if (data.talents) allTalents = data.talents;
                  if (data.clusters) mapClusters = data.clusters;
                  
                  createUserMarker(allTalents.length, filtersActive);
                  updateClusters();
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
