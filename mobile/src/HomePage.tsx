import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";

const HomePage = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Skillsy</Text>
          <View style={styles.badge}></View>
        </View>

        {/* Hero / Intro */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Ontdek & deel skills in jouw buurt</Text>
          <Text style={styles.heroSubtitle}>
            Vind mensen met talent, leer nieuwe dingen of bied jouw eigen skills aan.
          </Text>
        </View>

        {/* Actie knoppen */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>🔎 Vind skill</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>📅 Afspraken</Text>
          </TouchableOpacity>
        </View>

        {/* Sectie kaarten */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wat wil je doen?</Text>

          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardTitle}>🗺️ Ontdekken</Text>
            <Text style={styles.cardDescription}>
              Zie direct wie er in de buurt skills aanbiedt waar jij naar zoekt.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardTitle}>📧 Berichten</Text>
            <Text style={styles.cardDescription}>
              Ontvang en stuur berichten met anderen die je interesseren.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardTitle}>👤 Profiel</Text>
            <Text style={styles.cardDescription}>
              Beheer je skills, beschrijving en beschikbaarheid zodat anderen je kunnen vinden.
            </Text>
          </TouchableOpacity>
        </View>
        

        {/* Bottom info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Maak verbinding via skills, niet alleen via likes. ✨
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0F172A", // donkerblauwe achtergrond
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  logo: {
    fontSize: 26,
    fontWeight: "800",
    color: "#F9FAFB",
    letterSpacing: 0.5,
  },
  badge: {
    backgroundColor: "rgba(248, 250, 252, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    color: "#E5E7EB",
    fontSize: 12,
    fontWeight: "600",
  },

  hero: {
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.4)",
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#F9FAFB",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    lineHeight: 20,
  },

  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 28,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#38BDF8",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#38BDF8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 3,
  },
  primaryButtonText: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.8)",
  },
  secondaryButtonText: {
    color: "#E5E7EB",
    fontSize: 15,
    fontWeight: "600",
  },

  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#E5E7EB",
    marginBottom: 14,
  },

  card: {
    backgroundColor: "#020617",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(30, 64, 175, 0.7)",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F9FAFB",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: "#9CA3AF",
    lineHeight: 18,
  },

  footer: {
    marginTop: 8,
  },
  footerText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
});

export default HomePage;
