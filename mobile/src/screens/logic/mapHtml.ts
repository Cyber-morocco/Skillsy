// @ts-nocheck
import { Location } from './types';
import { Talent } from '../../mockdummies/markers';

interface BuildMapHtmlArgs {
  userLocation: Location;
  radiusKm: number | null;
  talents: Talent[];
}

export const buildMapHtml = ({ userLocation, radiusKm, talents }: BuildMapHtmlArgs): string => {
  const safeRadius = radiusKm ?? 5;
  const initialTalents = JSON.stringify(talents);

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
            let radiusKm = ${safeRadius};
            let radiusCircle = null;
            let talentMarkers = {};
            
            const map = L.map('map').setView([centerLat, centerLng], 13);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap',
              maxZoom: 19
            }).addTo(map);

            const userMarker = L.circleMarker([centerLat, centerLng], {
              radius: 8,
              fillColor: '#10b981',
              color: 'white',
              weight: 3,
              opacity: 1,
              fillOpacity: 0.8
            }).addTo(map);
            userMarker.bindPopup('<strong>You</strong>');

            radiusCircle = L.circle([centerLat, centerLng], {
              radius: radiusKm * 1000,
              color: '#7c3aed',
              fillColor: '#7c3aed',
              fillOpacity: 0.05,
              weight: 2,
              dashArray: '5, 5'
            }).addTo(map);

            const addTalentMarkers = (talents) => {
              Object.values(talentMarkers).forEach(marker => {
                map.removeLayer(marker);
              });
              talentMarkers = {};

              const colors = ['#a78bfa', '#f472b6', '#60a5fa', '#fbbf24'];
              
              talents.forEach((talent, index) => {
                const color = colors[index % 4];
                const avatar = talent.avatar;
                const html =
                  '<div style="width: 50px; height: 50px; border-radius: 50%; border: 3px solid ' +
                  color +
                  '; overflow: hidden; display: flex; align-items: center; justify-content: center; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">' +
                  '<img src="' +
                  avatar +
                  '" style="width: 100%; height: 100%; border-radius: 50%;"/></div>';

                const customIcon = L.divIcon({
                  html,
                  iconSize: [50, 50],
                  className: 'custom-marker'
                });

                const marker = L.marker([talent.lat, talent.lng], { icon: customIcon }).addTo(map);
                
                const popupContent =
                  '<div style="font-family: Arial; padding: 10px; text-align: center; min-width: 150px;">' +
                  '<img src="' + avatar + '" style="width: 50px; height: 50px; border-radius: 50%; margin-bottom: 8px;"/>' +
                  '<strong style="display: block; margin-bottom: 4px;">' + talent.name + '</strong>' +
                  '<small style="color: #666;">' + talent.shortBio + '</small>' +
                  '</div>';
                
                marker.bindPopup(popupContent);
                marker.on('click', () => {
                  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'talentClick', talentId: talent.id }));
                });
                
                talentMarkers[talent.id] = marker;
              });
            };

            addTalentMarkers(${initialTalents});

            const updateRadius = (radius) => {
              const nextRadius = typeof radius === 'number' ? radius : ${safeRadius};
              radiusKm = nextRadius;
              if (radiusCircle) {
                map.removeLayer(radiusCircle);
              }
              radiusCircle = L.circle([centerLat, centerLng], {
                radius: nextRadius * 1000,
                color: '#7c3aed',
                fillColor: '#7c3aed',
                fillOpacity: 0.05,
                weight: 2,
                dashArray: '5, 5'
              }).addTo(map);
            };

            document.addEventListener('message', (event) => {
              try {
                const data = JSON.parse(event.data);
                if (data.type === 'updateRadius') {
                  updateRadius(data.radiusKm);
                  if (data.talents) {
                    addTalentMarkers(data.talents);
                  }
                }
                if (data.type === 'updateLocation') {
                  const { location, radiusKm: r, talents } = data;
                  centerLat = location.lat;
                  centerLng = location.lng;
                  map.setView([location.lat, location.lng], 13);
                  userMarker.setLatLng([location.lat, location.lng]);
                  updateRadius(r);
                  if (talents) {
                    addTalentMarkers(talents);
                  }
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
