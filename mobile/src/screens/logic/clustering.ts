import { Talent, Location } from '../../types';

export interface Cluster {
    id: string;
    lat: number;
    lng: number;
    radius: number; // km
    talents: Talent[];
}

// Haversine formula for distance in km
export const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export const calculateClusters = (talents: Talent[], center: Location): Cluster[] => {
    const clusters: Cluster[] = [];
    const processed = new Set<string>();
    const MAX_DISTANCE_FROM_CENTER_KM = 30;

    // Filter talents within 30km of active center
    const activeTalents = talents.filter((t) => {
        if (!t.lat || !t.lng) return false;
        const dist = getDistance(center.lat, center.lng, t.lat, t.lng);
        return dist <= MAX_DISTANCE_FROM_CENTER_KM;
    });

    for (let i = 0; i < activeTalents.length; i++) {
        const t1 = activeTalents[i];
        if (processed.has(t1.id)) continue;

        const potentialCluster: Talent[] = [t1];

        // Greedy Strategy: Try to include EVERYONE within the allowable max radius (2km from seed)
        // This prioritizes visibility (not leaving anyone alone) over compactness.

        for (let j = i + 1; j < activeTalents.length; j++) {
            if (processed.has(activeTalents[j].id)) continue;

            const t2 = activeTalents[j];
            const dist = getDistance(t1.lat, t1.lng, t2.lat, t2.lng);

            if (dist <= 2.0) {
                potentialCluster.push(t2);
            }
        }

        // If we found a group (seed + at least 1 neighbor)
        if (potentialCluster.length >= 2) {
            // Mark all as processed
            potentialCluster.forEach(t => processed.add(t.id));

            // Calculate centroid
            const latSum = potentialCluster.reduce((acc, t) => acc + t.lat, 0);
            const lngSum = potentialCluster.reduce((acc, t) => acc + t.lng, 0);
            const centerLat = latSum / potentialCluster.length;
            const centerLng = lngSum / potentialCluster.length;

            // Calculate Radius to encompass all points (Visual Radius)
            // We want the circle to actually cover the users so they are "inside"
            let maxDist = 0;
            potentialCluster.forEach(t => {
                const d = getDistance(centerLat, centerLng, t.lat, t.lng);
                if (d > maxDist) maxDist = d;
            });

            // Ensure min radius 0.5km for visibility/privacy
            // Ensure max radius 2.0km (hard cap, though logic shouldn't exceed approx 2km much)
            const finalRadius = Math.min(Math.max(0.5, maxDist + 0.1), 2.0);

            clusters.push({
                id: `c-${t1.id}`,
                lat: centerLat,
                lng: centerLng,
                radius: finalRadius,
                talents: potentialCluster
            });
        } else {
            // Single user. 
            // Mark as processed (Hidden)
            processed.add(t1.id);
        }
    }

    return clusters;
};
