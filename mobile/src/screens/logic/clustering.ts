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
        let radius = 0.5; // Start with 0.5km base radius

        // 1. Check strict 0.5km local cluster
        for (let j = i + 1; j < activeTalents.length; j++) {
            // logic: we don't skip processed here strictly because a user *could* theoretically be closer to this one,
            // but for a greedy simple clustering we usually skip processed. 
            // However, to strictly follow "User belongs to at most one cluster", we must skip processed.
            if (processed.has(activeTalents[j].id)) continue;

            const t2 = activeTalents[j];
            const dist = getDistance(t1.lat, t1.lng, t2.lat, t2.lng);

            if (dist <= 0.5) {
                potentialCluster.push(t2);
            }
        }

        // If we found a group in 0.5km
        if (potentialCluster.length >= 2) {
            // Create cluster
            // Mark all as processed
            potentialCluster.forEach(t => processed.add(t.id));

            // Calculate center
            const latSum = potentialCluster.reduce((acc, t) => acc + t.lat, 0);
            const lngSum = potentialCluster.reduce((acc, t) => acc + t.lng, 0);

            clusters.push({
                id: `c-${t1.id}`,
                lat: latSum / potentialCluster.length,
                lng: lngSum / potentialCluster.length,
                radius: 0.5,
                talents: potentialCluster
            });
            continue;
        }

        // 2. If no group in 0.5km, try to find a nearest neighbor up to 2km (Expanding logic)
        // We only need ONE neighbor to satisfy "min 2 users"
        let nearestNeighbor: Talent | null = null;
        let minDist = Infinity;

        for (let j = i + 1; j < activeTalents.length; j++) {
            if (processed.has(activeTalents[j].id)) continue;
            const t2 = activeTalents[j];
            const dist = getDistance(t1.lat, t1.lng, t2.lat, t2.lng);

            if (dist <= 2.0 && dist > 0.5 && dist < minDist) {
                minDist = dist;
                nearestNeighbor = t2;
            }
        }

        if (nearestNeighbor) {
            processed.add(t1.id);
            processed.add(nearestNeighbor.id);

            const group = [t1, nearestNeighbor];
            const latSum = group.reduce((acc, t) => acc + t.lat, 0);
            const lngSum = group.reduce((acc, t) => acc + t.lng, 0);

            // Radius should cover them. Distance between them is `minDist`. 
            // Cluster Diameter is at least `minDist`. Radius ~ minDist/2, but for visibility let's use minDist as diameter roughly?
            // Requirement: "Dynamic radius between 0.5km and 2km".
            // Let's set radius to roughly encompass them. 
            // If we are at the center, the radius to encompass both is distance/2. 
            // Safe upper bound: use the actual distance as diameter, so radius = distance / 2.
            // But we want to ensure visibility. 
            // Let's use `Math.max(0.5, minDist / 1.5)` to keep it visible but tight? 
            // The requirement says "Expand cluster radius gradually up to 2km max".
            // Let's just use the distance as the defining factor. Radius = distance. 
            // Wait, if radius is 2km, diameter is 4km. That matches "max diameter 4km".
            // So Radius = minDist is OK if centered on one, but we center on centroid.
            // So Radius = minDist / 2 + margin. 
            // Let's use `Math.max(0.5, minDist / 1.8)` to be safe.

            clusters.push({
                id: `c-${t1.id}`,
                lat: latSum / 2,
                lng: lngSum / 2,
                radius: Math.max(0.5, minDist / 1.8), // Ensure min 0.5
                talents: group
            });
        } else {
            // Single user, no neighbors within 2km.
            // Privacy Rule: "Users not belonging to a cluster are not shown at all"
            // So we do NOT add to clusters.
            // We assume this user is hidden.
            processed.add(t1.id); // Mark as processed so we don't try to group them again
        }
    }

    return clusters;
};
