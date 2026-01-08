import os
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from sentence_transformers import SentenceTransformer, util
import faiss
import numpy as np
from fuzzywuzzy import fuzz

# Initialize FastAPI
app = FastAPI(title="Skillsy Intelligence Service (NL)")

# 1. Load Multilingual Model (supports Dutch)
print("Loading LLM model (MiniLM-L12)...")
model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

# 2. Defined Canonical Skills (Baseline for normalization)
# This should ideally be synced with Firestore 'skillConcepts'
canonical_skills = [
    {"id": "c1", "label": "Elektrische gitaar", "rootId": "muziek", "usage": 150},
    {"id": "c2", "label": "Akoestische gitaar", "rootId": "muziek", "usage": 90},
    {"id": "c3", "label": "Piano", "rootId": "muziek", "usage": 70},
    {"id": "c4", "label": "Zang", "rootId": "muziek", "usage": 80},
    {"id": "c5", "label": "Regada (Marokkaanse dans)", "rootId": "muziek", "usage": 60},
    {"id": "c6", "label": "Fitness coaching", "rootId": "sport", "usage": 200},
    {"id": "c7", "label": "Yoga", "rootId": "sport", "usage": 120},
    {"id": "c8", "label": "Python programmeren", "rootId": "tech", "usage": 180},
    {"id": "c9", "label": "HTML & CSS", "rootId": "tech", "usage": 160},
    {"id": "c10", "label": "JavaScript / React", "rootId": "tech", "usage": 160},
    {"id": "c11", "label": "Schilderen", "rootId": "creatief", "usage": 50},
    {"id": "c12", "label": "Frans praten", "rootId": "talen", "usage": 80},
    {"id": "c13", "label": "Engels bijles", "rootId": "talen", "usage": 110},
]

labels = [s["label"] for s in canonical_skills]
embeddings = model.encode(labels)

# 3. Create FAISS index for vector search
dim = embeddings.shape[1]
index = faiss.IndexFlatL2(dim)
index.add(embeddings.astype('float32'))

class ResolveRequest(BaseModel):
    text: str
    locale: str = "nl"

@app.get("/")
async def root():
    return {
        "message": "Skillsy Intelligence Service is Online!",
        "endpoints": {
            "POST /resolve-skill": "Resolve and normalize skills",
            "GET /health": "Check service health"
        }
    }

@app.post("/resolve-skill")
async def resolve_skill(request: ResolveRequest):
    input_text = request.text.strip().lower()
    
    LOG_FILE = "intelligence_log.txt"
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(f"\n--- NEW REQUEST: '{request.text}' ---\n")
        f.write(f"Input Text: {input_text}\n")

    # 1. Exact match check (Still keep this for performance/known IDs)
    for skill in canonical_skills:
        if input_text == skill["label"].lower() or input_text == skill["id"].lower():
            with open(LOG_FILE, "a", encoding="utf-8") as f:
                f.write("Result: EXACT MATCH FOUND\n")
            return {"type": "auto_map", "match": {"concept": skill, "score": 1.0}}
            
    # Hardcoded tech redirects for precision
    tech_shortcuts = ["css", "html", "sql", "java", "php", "cpp", "js", "react", "node", "docker", "typescript"]
    if input_text in tech_shortcuts:
        input_text = f"{input_text} programming coding technology"
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(f"Action: Tech Shortcut applied -> {input_text}\n")

    # 2. Force Web-Augmented Research for every non-exact match
    import requests
    discovery_text = input_text
    is_web_augmented = False
    
    print(f"🔍 Always-on Web Discovery for: '{input_text}'")
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        search_url = f"https://api.duckduckgo.com/?q={input_text}&format=json&no_html=1"
        response = requests.get(search_url, headers=headers, timeout=3)
        
        if response.status_code == 200:
            try:
                data = response.json()
                if data.get("AbstractText"):
                    discovery_text = data["AbstractText"]
                    is_web_augmented = True
                    print(f"🌐 Web result: {discovery_text[:100]}...")
            except ValueError:
                print(f"⚠️ Non-JSON from web for '{input_text}'")
    except Exception as e:
        print(f"⚠️ Web search failed: {e}")

    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(f"Web Augmented: {is_web_augmented}\n")
        f.write(f"Enriched Text: {discovery_text[:200]}...\n")

    # 3. Semantic Search using the ENRICHED text (from web or input)
    input_vector = model.encode([discovery_text]).astype('float32')
    distances, indices = index.search(input_vector, 3)
    
    candidates = []
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write("Calculation Details (Top 3 Candidates):\n")
        
    for i, idx in enumerate(indices[0]):
        concept = canonical_skills[idx]
        semantic_score = float(1 / (1 + distances[0][i]))
        fuzzy_score = fuzz.partial_ratio(input_text, concept["label"].lower()) / 100
        pop_score = concept["usage"] / 250
        total_score = (0.55 * semantic_score) + (0.30 * fuzzy_score) + (0.15 * pop_score)
        
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(f"  - [{concept['label']}] Total: {total_score:.4f} (Sem: {semantic_score:.4f}, Fuz: {fuzzy_score:.4f}, Pop: {pop_score:.4f})\n")

        candidates.append({
            "concept": concept,
            "score": total_score
        })

    candidates = sorted(candidates, key=lambda x: x["score"], reverse=True)
    best_match = candidates[0] if candidates else None

    # Threshold check
    if best_match and best_match["score"] >= 0.88:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(f"Final Decision: AUTO_MAP to '{best_match['concept']['label']}'\n")
        return {"type": "auto_map", "match": best_match, "isWebAugmented": is_web_augmented}
    elif best_match and best_match["score"] >= 0.75:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(f"Final Decision: NUDGE (Score: {best_match['score']:.4f})\n")
        return {"type": "nudge", "suggestions": candidates, "isWebAugmented": is_web_augmented}

    # 4. If no high-confidence match, use AI Categorization from Web Text
    root_categories = [
        {"id": "muziek", "label": "muziek, instrumenten, dans, ritme, zang, cultuur, music, dance, singing, instrument, guitar, piano, drums"},
        {"id": "sport", "label": "sport, fitness, training, beweging, coaching, atletiek, exercise, gym, football, basketball, yoga, running, workout"},
        {"id": "talen", "label": "talen, spreken, schrijven, vertalen, grammatica, languages, speaking, writing, translation, english, french, spanish, dutch, german, italian"},
        {"id": "tech", "label": "technology, programmeren, software, coding, computers, website, html, css, development, data, ai, network, hardware, programming, app development"},
        {"id": "creatief", "label": "creatief, design, kunst, tekenen, schilderen, knutselen, visual arts, craft, drawing, painting, handmade"},
        {"id": "academisch", "label": "academisch, studie, wiskunde, wetenschap, huiswerk, school, education, science, math, history, geography, biology, physics, study, tutor"},
        {"id": "design", "label": "design, multimedia, grafisch, logo, ui, ux, animation, digital design, photoshop, illustrator, creative media"},
        {"id": "koken", "label": "koken, culinaire, eten, recepten, keuken, kookles, cooking, culinary, food, chef, recipes, baking, restaurant, nutrition, meal prep"},
        {"id": "business", "label": "business, marketing, management, sales, finance, entrepreneurship, zakelijk, economie, accounting, strategy, startup"},
        {"id": "zorg", "label": "gezondheid, zorg, EHBO, medisch, verpleging, health, care, medical, nursing, first aid, wellness, therapy"},
        {"id": "ambacht", "label": "ambacht, DIY, klussen, houtbewerking, reparatie, hammer, screwdriver, repair, woodworking, construction, building"},
        {"id": "fotografie", "label": "fotografie, video, film, montage, camera, photography, videography, editing, lens, photoshoot"},
        {"id": "overig", "label": "overig, divers, extra, other, miscellaneous"},
    ]
    
    root_labels = [r["label"] for r in root_categories]
    root_embeddings = model.encode(root_labels)
    root_similarities = util.cos_sim(input_vector, root_embeddings)[0]
    
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write("Discovery Category Similarities:\n")
        for idx, cat in enumerate(root_categories):
            f.write(f"  - {cat['id']}: {root_similarities[idx]:.4f}\n")
            
    best_root_idx = np.argmax(root_similarities)
    best_root = root_categories[best_root_idx]
    
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(f"Final Decision: DISCOVERY in Category '{best_root['id']}'\n")

    return {
        "type": "discovery",
        "proposed": {
            "label": request.text.strip().capitalize(),
            "rootId": best_root["id"],
            "rootLabel": best_root["label"].split(',')[0].strip().capitalize()
        },
        "isWebAugmented": is_web_augmented
    }

@app.get("/health")
async def health():
    return {"status": "ok", "message": "Skillsy Intelligence is running locally."}

if __name__ == "__main__":
    # Get local IP for convenience
    import socket
    hostname = socket.gethostname()
    local_ip = socket.gethostbyname(hostname)
    print(f"\n🚀 Service starting on http://{local_ip}:8000")
    print(f"👉 Use this IP in your React Native 'skillIntelligenceService.ts'\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)
