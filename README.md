<div align="center">
  <h1>Skillsy</h1>
  <h3>Deel je talenten, leer van je buren.</h3>
  
  <p>
    <img src="https://img.shields.io/badge/Mobile-React%20Native-blue?style=for-the-badge&logo=react" alt="React Native" />
    <img src="https://img.shields.io/badge/Language-TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Backend-Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
    <img src="https://img.shields.io/badge/AI-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
    <img src="https://img.shields.io/badge/Database-Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
  </p>
</div>

<br />

## Introductie en Visie

In een tijd waarin digitalisering ons vaak verder van elkaar verwijdert, wil Skillsy de lokale gemeenschap juist versterken. Veel mensen bezitten waardevolle vaardigheden die ze graag zouden willen delen, maar weten niet wie in hun directe omgeving interesse heeft. Aan de andere kant zoeken mensen vaak naar laagdrempelige manieren om iets nieuws te leren zonder direct dure cursussen te moeten volgen.

> **Skillsy lost dit probleem op door een brug te slaan tussen buurtbewoners.** 

Het platform maakt zichtbaar talent in de wijk vindbaar. Of het nu gaat om praktische vaardigheden zoals timmeren of tuinieren, creatieve expressie zoals gitaarspelen of schilderen, of technische kennis zoals programmeren; Skillsy faciliteert de connectie. Het doel is niet alleen kennisoverdracht, maar ook het bevorderen van sociale cohesie in de buurt.

---

## Project Architectuur

Het Skillsy ecosysteem is opgebouwd uit drie samenwerkende hoofdcomponenten die zorgen voor een naadloze ervaring van frontend tot intelligente backend.

1.  **Mobiele Applicatie (Frontend)**: De gebruikersinterface waarmee leden hun profiel beheren, skills ontdekken en communiceren.
2.  **Intelligence Service (Backend)**: Een geavanceerde AI-service die fungeert als het brein achter de zoek- en matchingsfunctionaliteit.
3.  **Firebase (Cloud Infrastructure)**: De ruggengraat voor data-opslag, gebruikersauthenticatie en real-time updates.

### Data Flow
Wanneer een gebruiker een skill invoert in de app, wordt deze eerst naar de Intelligence Service gestuurd. Deze service analyseert de tekst, verrijkt deze indien nodig met externe data, en classificeert de skill. Het geverifieerde resultaat wordt vervolgens opgeslagen in Firebase Firestore, waarna het direct beschikbaar is voor andere gebruikers in de app.

---

## Mappenstructuur en Organisatie

Hieronder een overzicht van de volledige projectstructuur, inclusief de AI-service en de mobiele broncode:

```text
Skillsy/
├── intelligence_service/       # Python backend (AI Logic)
│   ├── skill_service.py        # FastAPI server entry point
│   ├── requirements.txt        # Python afhankelijkheden
│   └── intelligence_log.txt    # Logs van AI beslissingen
├── mobile/                     # React Native Applicatie
│   └── src/
│       ├── components/         # Herbruikbare UI-blokken (Buttons, Cards)
│       ├── features/           # Complexe modules (Chat, Map interacties)
│       ├── navigation/         # App routing (Stacks, Tabs)
│       ├── screens/            # Alle applicatie schermen (25+)
│       │   ├── ExploreMapScreen.tsx # Map Logica & UI
│       │   ├── logic/          # Scherm-specifieke logica
│       │   └── ...
│       ├── services/           # API & Firebase communicatie
│       ├── styles/             # Centrale styling
│       ├── types/              # TypeScript definities
│       └── config/             # Configuraties (Firebase keys)
├── assets/                     # Afbeeldingen, fonts en iconen
├── App.tsx                     # Entry point van de mobiele app
├── index.ts                    # Register root component
├── app.json                    # Expo configuratie
├── package.json                # Node.js afhankelijkheden
└── tsconfig.json               # TypeScript instellingen
```

---

## Mobiele Applicatie (Deep Dive)

De mobiele applicatie bevindt zich in de map `mobile`. Het is een robuuste React Native applicatie die is geoptimaliseerd voor gebruiksvriendelijkheid en prestaties.

### Technische Stack
-   **Core**: React Native met Expo SDK 50+
-   **Taal**: TypeScript (Strict mode voor type-veiligheid)
-   **Navigatie**: React Navigation 7 (Native Stack & Bottom Tabs)
-   **Maps**: React Native Maps (voor locatie-gebaseerd zoeken)
-   **Media**: Expo AV (voor videoweergave in de feed)
-   **State Management**: React Context & Hooks

### Belangrijkste Feature Flows

#### 1. Profiel Creatie & Validatie
Een gebruiker doorloopt een wizard (Stap 1: Info, Stap 2: Skills, Stap 3: Video). Bij stap 2 communiceert de app direct met de Intelligence Service om ingevoerde skills te semantisch te valideren voordat deze worden opgeslagen.

#### 2. Match & Ruil Proces (Cruciaal)
Dit is het hart van de applicatie, waar vraag en aanbod samenkomen.
1.  **Ontdekking**: Gebruikers vinden elkaar via de interactieve kaart of de videofeed.
2.  **Aanvraag (Request)**: Een gebruiker start een match-verzoek. Hier kan gekozen worden voor twee routes:
    -   **Skill Swap**: "Ik leer jou Gitaar, jij leert mij Spaans". Dit is een ruil met gesloten beurzen.
    -   **Betaalde Les**: Er wordt een prijsvoorstel gedaan (bijv. €15/uur) als er geen directe ruil mogelijk is.
3.  **Onderhandeling**: Via de chatfunctie kunnen details besproken worden.
4.  **Bevestiging**: Beide partijen moeten de afspraak in de app bevestigen. Dit blokkeert de tijdsloten in hun agenda's en finaliseert de deal.

#### 3. Video Feed
Een TikTok-achtige ervaring waar gebruikers korte video's kunnen uploaden om hun skills te demonstreren. Dit verhoogt het vertrouwen en de betrokkenheid aanzienlijk vergeleken met alleen tekstuele profielen.

---

## Intelligence Service

De Intelligence Service (`intelligence_service/`) is een Python-applicatie die draait op het FastAPI framework. Het doel van deze service is om ongestructureerde tekstinvoer van gebruikers om te zetten naar gestructureerde, bruikbare data.

### Technische Stack
-   **FastAPI**: Gekozen voor asynchrone prestaties en automatische documentatie.
-   **Sentence Transformers (MiniLM-L12)**: Een lichtgewicht maar krachtig taalmodel dat teksten omzet naar vector-representaties (embeddings).
-   **FAISS (Facebook AI Similarity Search)**: Een bibliotheek voor extreem snelle zoekopdrachten in vectorruimtes.
-   **FuzzyWuzzy**: Voor patroonherkenning bij typefouten.

### De AI Pipeline
Wanneer een verzoek (bijv. "Ik geef gitaarles") binnenkomt, doorloopt het deze stappen:

1.  **Normalisatie & Cleaning**: De tekst wordt ontdaan van ruis en omgezet naar kleine letters.
2.  **Web Augmentatie**: Als de term onbekend is voor het systeem, raadpleegt de service real-time externe bronnen zoals DuckDuckGo en Wikipedia om context te vinden (bijv. "Wat is Regada?").
3.  **Vector Embedding**: De (verrijkte) tekst wordt door het MiniLM model gehaald en omgezet in een vector (een reeks getallen die de betekenis representeert).
4.  **Semantisch Zoeken**: FAISS vergelijkt deze vector met de database van bekende skill-categorieën.
5.  **Matching & Categorisatie**: Het systeem bepaalt of het een exacte match is (Auto-Map) of doet een suggestie (Nudge). Het wijst automatisch de hoofdcategorie toe (bijv. "Muziek").

---

## Installatiegids

Volg deze stappen om de ontwikkelomgeving op te zetten.

### Vereisten
-   Node.js (LTS)
-   Python 3.8+
-   Expo Go app op mobiel

### 1. Intelligence Service
Start hiermee, aangezien de mobiele app hiervan afhankelijk is.

```bash
cd intelligence_service
pip install -r requirements.txt
python skill_service.py
```
*De service start op poort 8000.*

### 2. Mobiele App

```bash
# In de root van het project (of mobile map)
npm install
```

### 3. Configuratie (Essentieel)
U moet de mobiele app vertellen waar de AI-service draait.
1.  Zoek uw lokale IP-adres (`ipconfig` op Windows / `ifconfig` op Mac).
2.  Open `mobile/src/services/skillIntelligenceService.ts`.
3.  Pas de variabele `LOCAL_PC_IP` aan:
    ```typescript
    const LOCAL_PC_IP = "UW.IP.ADRES.HIER"; // bijv. 192.168.1.15
    ```

### 4. Starten
Start de mobiele app in een nieuwe terminal:
```bash
npx expo start
```
Scan de QR-code met uw telefoon.

## Probleemoplossing
Als de app geen skills herkent, controleer dan of uw telefoon en computer op hetzelfde netwerk zitten en of het IP-adres in `skillIntelligenceService.ts` correct is.

---

## API Documentatie

Een overzicht van alle interne en externe API's die binnen het Skillsy ecosysteem worden gebruikt.

### 1. Skillsy Intelligence Service (Intern)
Onze eigen Python/FastAPI microservice die fungeert als het 'brein' voor skill-herkenning.
- **Base URL**: `http://<LOCAL_PC_IP>:8000`

| Methode | Endpoint | Beschrijving | Request Body |
| :--- | :--- | :--- | :--- |
| `POST` | `/resolve-skill` | Analyseert, normaliseert en categoriseert een skill. | `{ "text": "string", "locale": "nl" }` |
| `GET` | `/health` | Eenvoudige check of de service online is. | - |

### 2. Externe Services
Deze API's worden aangeroepen door de Intelligence Service voor data-verrijking of door de app voor assets.

| Service | Doel | Endpoint URL |
| :--- | :--- | :--- |
| **DuckDuckGo** | Context zoeken voor onbekende skills (Web Augmentatie). | `https://api.duckduckgo.com/?q={term}&format=json` |
| **Wikipedia** | Fallback definities ophalen (NL & EN). | `https://nl.wikipedia.org/api/rest_v1/page/summary/{term}` |
| **UI Avatars** | Genereren van standaard avatars o.b.v. naam. | `https://ui-avatars.com/api/?name={naam}` |
| **OpenStreetMap (Nominatim)** | Omzetten van adressen naar coördinaten (Geocoding). | `https://nominatim.openstreetmap.org/search` |
| **OpenStreetMap (Tiles)** | Kaartlagen tonen in de app. | `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` |

### 3. Firebase (BaaS)
Wij gebruiken Google Firebase als managed backend. Er is geen traditionele REST API voor deze onderdelen; de communicatie verloopt via de Firebase SDK.
- **Firestore**: Real-time NoSQL database.
- **Authentication**: Veilig inloggen en sessiebeheer.
- **Storage**: Opslag van gebruikersmedia (foto's/video's).

---

## Credits

| Project Team | Met begeleiding van |
| :--- | :--- |
| **Yassine Eddouks** | **Robin Bervoets** |
| **Iliès Mazouz** | **Ruben Dejonckheere** |
| **Safwane El Masaoudi** | **Steve Weemaels** |
| **Imad Ben Ali Idrissi** | |
| **Adam Yousfi** | |