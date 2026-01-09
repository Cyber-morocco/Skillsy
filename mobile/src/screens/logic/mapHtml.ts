// @ts-nocheck
import { Location } from './types';
import { Talent } from '../../types';

interface BuildMapHtmlArgs {
  userLocation: Location;
  radiusKm: number | null;
  talents: Talent[];
}

export const buildMapHtml = ({ userLocation, radiusKm, talents }: BuildMapHtmlArgs): string => {
  const initialTalents = JSON.stringify(talents);
  const initialRadius = radiusKm !== null ? radiusKm : 'null';

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
            let radiusCircle = null;
            let talentMarkers = {};
            
            const getZoomForRadius = (radiusKm) => {
              if (!radiusKm || radiusKm === null) return 13; // Default zoom when no filter
              
              // Calculate zoom to fit circle with ~10% padding
              // At equator: zoom level n shows approximately 40000 / (2^n) km width
              // We need diameter (2 * radius) + padding to fit in viewport
              const diameter = radiusKm * 2;
              const neededWidth = diameter * 1.1; // 10% padding around circle
              
              // Calculate zoom: width = 40000 / (2^zoom)
              // So: zoom = log2(40000 / width)
              const zoom = Math.log2(40000 / neededWidth);
              
              // Clamp between reasonable values and round down for safety
              return Math.max(6, Math.min(15, Math.floor(zoom)));
            };
            
            const initialZoom = getZoomForRadius(radiusKm);
            const map = L.map('map').setView([centerLat, centerLng], initialZoom);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap',
              maxZoom: 19
            }).addTo(map);

            let talentCount = ${initialTalents}.length;
            let userMarker = null;
            
            const createUserMarker = (count, showCount) => {
              if (userMarker) {
                map.removeLayer(userMarker);
              }
              
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
                'cursor: pointer; ' +
                'transition: transform 0.2s;' +
                '">' + innerContent + '</div>';
              
              const icon = L.divIcon({
                html: html,
                iconSize: [size, size],
                className: 'talent-count-marker'
              });
              
              userMarker = L.marker([centerLat, centerLng], { icon: icon }).addTo(map);
              userMarker.on('click', () => {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'switchToList' }));
              });
            };
            
            createUserMarker(talentCount, radiusKm !== null);

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

            const addTalentMarkers = (talents) => {
              // Don't show markers on map, just update count
              talentCount = talents.length;
              createUserMarker(talentCount, radiusKm !== null);
            };

            addTalentMarkers(${initialTalents});

            const updateCircle = (radius, centerLat, centerLng) => {
              if (radiusCircle) {
                map.removeLayer(radiusCircle);
                radiusCircle = null;
              }
              
              if (radius && radius !== null) {
                radiusKm = radius;
                radiusCircle = L.circle([centerLat, centerLng], {
                  radius: radius * 1000,
                  color: '#7c3aed',
                  fillColor: '#7c3aed',
                  fillOpacity: 0.15,
                  weight: 2,
                  dashArray: '5, 5'
                }).addTo(map);
              }
            };

            const updateRadius = (radius) => {
              updateCircle(radius, centerLat, centerLng);
              createUserMarker(talentCount, radius !== null);
              const zoom = getZoomForRadius(radius);
              map.setView([centerLat, centerLng], zoom, { animate: true });
            };

            document.addEventListener('message', (event) => {
              try {
                const data = JSON.parse(event.data);
                if (data.type === 'updateRadius') {
                  const nextRadius = data.radiusKm;
                  updateRadius(nextRadius);
                }
                if (data.type === 'updateTalents') {
                  if (data.talents) {
                    addTalentMarkers(data.talents);
                  }
                }
                if (data.type === 'updateLocation') {
                  const { location, radiusKm: r } = data;
                  centerLat = location.lat;
                  centerLng = location.lng;
                  if (userMarker) {
                    userMarker.setLatLng([centerLat, centerLng]);
                  }
                  if (radiusCircle) {
                    updateCircle(r, centerLat, centerLng);
                  }
                  map.setView([centerLat, centerLng], map.getZoom(), { animate: true });
                }
                if (data.type === 'focusTalent') {
                  const { talentId, lat, lng } = data;
                  map.setView([lat, lng], 14);
                  if (talentMarkers[talentId]) {
                    talentMarkers[talentId].openPopup();
                  }
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
