# Skillsy

**Deel je talenten, leer van je buren.**

Skillsy is een mobiel platform dat buurtbewoners met elkaar verbindt om vaardigheden te delen en te ruilen. Of je nu wilt leren koken, programmeren of timmeren, Skillsy maakt lokaal leren toegankelijk en leuk.

## 🚀 Features

-   **Geavanceerde Welkomstervaring**: Een interactieve `PrePagina` die functioneert als splash screen en nieuwe gebruikers verwelkomt.
-   **Authenticatie**: Veilig inloggen en registreren met Email/Wachtwoord (powered by Firebase).
-   **Profielen Ontdekken**: Vind mensen in je buurt met specifieke skills via een interactieve kaart of lijst.
-   **Vaardigheden Ruilen**: Bied je eigen skills aan en ruil ze met anderen.
-   **Beschikbaarheid Beheren**:
    -   Stel je algemene beschikbaarheid in per week.
    -   Specifieke datums toevoegen met een aangepaste DatePicker UI.
-   **Chat & Matches**: Stuur matchverzoeken en chat met je connecties.

## 🛠 Tech Stack

Dit project is gebouwd met moderne mobile web technologieën:

-   **Framework**: [React Native](https://reactnative.dev/) met [Expo](https://expo.dev/)
-   **Taal**: [TypeScript](https://www.typescriptlang.org/)
-   **Backend / Auth**: [Firebase](https://firebase.google.com/) (Auth & Firestore)
-   **Navigatie**: React Navigation (Stack & Bottom Tabs)
-   **Styling**: Custom StyleSheet (Geen external UI lib dependency heavy approach)
-   **Icons**: Expo Vector Icons

## 📱 Aan de slag

Volg deze stappen om het project lokaal te draaien:

### 1. Vereisten
Zorg dat je het volgende geïnstalleerd hebt:
-   Node.js (LTS versie aanbevolen)
-   npm of yarn
-   Expo Go app op je telefoon (of een Android/iOS emulator)

### 2. Installatie

Clone de repository en installeer de dependencies:

```bash
git clone https://github.com/Cyber-morocco/Skillsy.git
cd Skillsy
npm install
```

### 3. Start de App

Start de development server:

```bash
npx expo start
```

Scan de QR-code met je telefoon (via de Expo Go app) of druk op `a` voor Android / `i` voor iOS emulator.

## 📂 Project Structuur

De belangrijkste code bevindt zich in de `mobile/src` map:

-   `mobile/src/components`: Herbruikbare UI componenten (knoppen, inputs, cards).
-   `mobile/src/navigation`: Navigatie configuratie (`AuthStack`, `ChatStack`, `BottomNavBar`).
-   `mobile/src/screens`: Alle applicatieschermen (Login, Home, Profile, Availability, etc.).
-   `mobile/src/config`: Firebase configuratie.
-   `mobile/src/styles`: Gedeelde stijlen en thema's.
-   `App.tsx`: Het startpunt van de applicatie, inclusief splash logic en global state.

## 📝 Aantekeningen

-   De **PrePagina** is ingesteld als het verplichte startscherm.
-   Specifieke datums kunnen worden beheerd via `Availability_SpecificDates.tsx`, die een aangepaste UI heeft voor betere gebruiksvriendelijkheid.
