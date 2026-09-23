# 🧠 Brian - Votre Base de Connaissances Personnelle
<img width="303" height="202" alt="Capture d'écran 2026-02-20 à 4 30 00 PM" src="https://github.com/user-attachments/assets/c5ac10bc-14ce-4113-b116-f40b379c1726" />

> Un jeu de mots avec "brain" (cerveau) - Brian est votre dépôt de connaissances intelligent avec recherche de similarité basée sur des vecteurs, visualisation graphique élégante et intégration transparente avec Goose. Parce que je ne sais pas épeler 9 fois sur 10 et que je fais cette erreur tout le temps, maintenant vous pouvez la faire aussi !
<img width="1528" height="1109" alt="Capture d'écran 2026-02-19 à 3 35 51 PM" src="https://github.com/user-attachments/assets/5c849425-6c69-4d44-bd11-e19d828272f5" />

<img width="1527" height="1110" alt="Capture d'écran 2026-02-19 à 3 36 05 PM" src="https://github.com/user-attachments/assets/6de1efb2-5059-49e7-81a9-6b1999f6f147" />



## ✨ Fonctionnalités

### Gestion des Connaissances de Base
- **📝 Éléments de Connaissance** : Stockez des liens, notes, extraits de code et articles
- **🔍 Recherche Intelligente** : Recherche en texte intégral avec FTS5 + similarité vectorielle TF-IDF
- **🏷️ Système de Tagging** : Organisez les éléments avec des tags pour un filtrage facile
- **🔗 Aperçus des Liens** : Extraction automatique des métadonnées à partir des URL
- **📅 Support Google Docs** : Intégration transparente avec les documents Google Drive

<img width="824" height="758" alt="Capture d'écran 2026-02-04 à 12 32 03 PM" src="https://github.com/user-attachments/assets/780881d8-84b3-43ef-8a84-2626302d8fbf" />


### Bases de Connaissances Multi-Projets
- **📂 Plusieurs Projets** : Organisez les connaissances dans des espaces de projet séparés

<img width="341" height="468" alt="Capture d'écran 2026-02-04 à 12 31 45 PM" src="https://github.com/user-attachments/assets/398433a8-21ed-40f9-b280-198bb0be0da7" />


### Visualisation Graphique
- **🔗 Graphe à Direction Forcée** : Visualisation interactive D3.js montrant les connexions
- **🎨 Mise en Évidence des Thèmes** : Survolez les tags pour voir les connexions thématiques avec des ombres colorées
- **🔍 Zoom Sémantique** : Transitions fluides entre les vues projet, région et élément
- **🌌 Univers des Connaissances** : Zoomez pour voir tous les projets comme des "galaxies" dans un espace unifié
- **📍 Régions de Connaissances** : Regroupez les éléments liés avec des frontières visuelles

<img width="1631" height="907" alt="Capture d'écran 2026-02-04 à 12 31 10 PM" src="https://github.com/user-attachments/assets/334cb713-1881-4a50-af62-28128d1dc9c8" />

### Zoom Hiérarchique (Univers des Connaissances)
- **📊 Vue Multi-Échelle** : Zoomez de manière fluide des éléments individuels à l'univers complet des connaissances
- **🪐 Enveloppes de Projet** : Frontières visuelles autour des groupes de projets lorsque vous êtes dézoomés
- **✨ Rendu Sémantique** : Les étiquettes, nœuds et liens s'adaptent en fonction du niveau de zoom
- **📏 Indicateur de Zoom** : Affichage en temps réel du niveau de zoom et de la vue sémantique actuelle


### Intégration IA
- **🦢 Intégration Goose** : Utilisez Brian directement depuis l'assistant IA Goose via MCP
- **🎭 Profils de Région** : Configurez le comportement de l'IA par région de connaissance
- **💡 Contexte Intelligent** : Obtenez un contexte de connaissance pertinent pour tout sujet

<img width="609" height="779" alt="Capture d'écran 2026-02-04 à 12 32 30 PM" src="https://github.com/user-attachments/assets/f89a48bd-c61f-4b53-bb4b-347ed6d612d3" />


## 🚀 Guide de Démarrage Rapide

### Prérequis

- **Python 3.8+** - [Télécharger](https://www.python.org/downloads/)
- **Node.js 16+** - [Télécharger](https://nodejs.org/)
- **pnpm** - [Installer](https://pnpm.io/installation) (`npm install -g pnpm`)
- **Goose** (optionnel) - Pour l'intégration de l'assistant IA - https://github.com/block/goose 

### Installation en Une Commande

```bash
# Cloner le dépôt
git clone https://github.com/yourusername/brian.git
cd brian

# Exécuter le script de configuration
./setup.sh
```

C'est tout ! Le script de configuration va :
- ✅ Installer toutes les dépendances Python
- ✅ Installer toutes les dépendances frontend
- ✅ Créer le répertoire de données Brian
- ✅ Configurer automatiquement l'extension Goose
- ✅ Créer des scripts pratiques de démarrage/arrêt

### Démarrer Brian

```bash
./start.sh
```

Cela démarre à la fois le serveur backend (port 8080) et frontend (port 5173).

Ouvrez votre navigateur à l'adresse : **http://localhost:5173**

### Arrêter Brian

```bash
./stop.sh
```

## 📖 Utilisation

### Ajout d'Éléments de Connaissance

**Via l'interface web :**
1. Ouvrez http://localhost:5173
2. Cliquez sur le bouton "+"
3. Choisissez le type d'élément (lien, note, extrait, article)
4. Remplissez les détails et ajoutez des tags
5. Enregistrez !

**Via Goose :**
```
Vous : Ajoutez ce lien à Brian : https://example.com avec les tags "ia, recherche"
Goose : ✓ Ajouté à votre base de connaissances !
```

### Gestion des Projets

**Créer un Projet :**
1. Cliquez sur le Sélecteur de Projet en haut au centre
2. Cliquez sur "Nouveau Projet"
3. Entrez le nom, la description, choisissez une icône et une couleur
4. Cliquez sur Créer

**Changer de Projet :**
- Cliquez sur le Sélecteur de Projet et choisissez un projet
- Sélectionnez "Tous les Projets" pour tout voir dans toutes les bases de connaissances

**Modifier les Projets :**
- Survolez un projet dans le sélecteur et cliquez sur l'icône d'édition (crayon)
- Changez le nom, la description, l'icône ou la couleur

### Visualisation Graphique

La vue graphique montre les connexions entre les éléments basées sur la similarité de contenu :

- **Couleurs des Nœuds** : Bleu (liens), Vert (notes), Ambre (extraits), Violet (articles)
- **Épaisseur des Lignes** : Indique la force de la similarité
- **Mise en Évidence des Thèmes** : Survolez les tags pour voir les connexions thématiques
- **Détails des Nœuds** : Cliquez sur n'importe quel nœud pour voir les détails complets dans une feuille inférieure
- **Zoom et Déplacement** : Faites défiler pour zoomer, glissez pour vous déplacer
- **Déplacer les Nœuds** : Repositionnez les nœuds en les glissant

### Univers des Connaissances (Zoom Hiérarchique)

Lors de la visualisation de "Tous les Projets", vous pouvez explorer votre univers complet de connaissances :

1. **Dézoomer** (échelle < 0,3) : Voir tous les projets comme des groupes distincts avec des frontières d'enveloppe
2. **Zoom Moyen** (échelle 0,3-0,5) : Voir les régions de connaissances dans les projets
3. **Zoomer** (échelle > 0,5) : Voir les éléments individuels avec des étiquettes complètes

L'indicateur de zoom en bas à gauche montre votre niveau de zoom actuel et la vue sémantique.

### Régions de Connaissances

Les régions aident à organiser les éléments liés dans un projet :

1. Cliquez sur le bouton Régions dans la barre d'outils
2. Créez une nouvelle région avec un nom et une couleur
3. Ajoutez des éléments aux régions en les sélectionnant dans le graphique
4. Les régions apparaissent comme des frontières visuelles dans la vue graphique

### Recherche

**Via l'interface web :**
- Utilisez la barre de recherche en haut
- Les résultats montrent à la fois les correspondances exactes et les éléments similaires
- Filtrez par type, tags ou projet

**Via Goose :**
```
Vous : Recherchez dans Brian "apprentissage automatique"
Goose : Trouvé 5 éléments liés à l'apprentissage automatique...
```

## ⚙️ Configuration

### Variables d'Environnement

Créez un fichier `.env` à la racine du projet :

```bash
# Emplacement de la base de données
BRIAN_DB_PATH=~/.brian/brian.db

# Serveur API
BRIAN_HOST=127.0.0.1
BRIAN_PORT=8080
BRIAN_DEBUG=false

# Frontend (optionnel)
VITE_PORT=5173           # Port du serveur de développement frontend (recherche automatique si occupé)
VITE_API_URL=http://127.0.0.1:8080  # URL de l'API backend pour le proxy
```

**Configuration Dynamique des Ports :**
- Si `VITE_PORT` est occupé, le frontend utilisera automatiquement le port disponible suivant
- Utile lors de l'exécution de plusieurs instances ou lorsque les ports sont occupés

### Intégration Goose

Le script de configuration configure automatiquement Goose. La configuration est ajoutée à `~/.config/goose/config.yaml` :

```yaml
extensions:
  brian:
    provider: mcp
    config:
      command: "/path/to/brian/venv/bin/python"
      args:
        - "-m"
        - "brian_mcp.server"
      env:
        BRIAN_DB_PATH: "~/.brian/brian.db"
```

**Après la configuration, redémarrez Goose pour charger l'extension Brian.**

## 🛠️ Développement

### Configuration Manuelle

Si vous préférez une installation manuelle :

```bash
# Configuration du backend
python3 -m venv venv
source venv/bin/activate
pip install -e .

# Configuration du frontend
cd frontend
pnpm install

# Démarrer le backend
python -m brian.main

# Démarrer le frontend (dans un autre terminal)
cd frontend
pnpm dev
```

### Structure du Projet

```
brian/
├── brian/                  # Package Python backend
│   ├── api/               # Routes FastAPI
│   ├── database/          # Couche de base de données SQLite
│   │   ├── migrations.py  # Migrations de la base de données
│   │   ├── repository.py  # Couche d'accès aux données
│   │   └── schema.py      # Schéma de la base de données
│   ├── models/            # Modèles de données
│   │   └── knowledge_item.py
│   └── services/          # Logique métier
│       ├── similarity.py  # Calculs de similarité
│       └── clustering.py  # Regroupement d'éléments
├── brian_mcp/             # Serveur MCP pour l'intégration Goose
├── frontend/              # Frontend React
│   └── src/
│       ├── components/    # Composants React
│       │   ├── SimilarityGraph.jsx    # Visualisation graphique principale
│       │   ├── ProjectSelector.jsx    # Interface de gestion des projets
│       │   ├── ProjectPill.jsx        # Composant indicateur de projet
│       │   ├── Timeline.jsx           # Vue chronologique
│       │   ├── InfinitePinboard.jsx   # Toile spatiale
│       │   └── RegionEditDialog.jsx   # Gestion des régions
│       ├── contexts/      # Contextes React
│       │   └── SettingsContext.jsx
│       ├── store/         # Gestion d'état
│       │   └── useStore.js  # Store Zustand
│       └── lib/           # Utilitaires
├── setup.sh               # Installation en une commande
├── start.sh               # Démarrer les deux serveurs
└── stop.sh                # Arrêter les deux serveurs
```

### Exécution des Tests

```bash
# Activer l'environnement virtuel
source venv/bin/activate

# Exécuter les tests Python
pytest

# Tester le serveur MCP
python test_mcp_simple.py

# Tester la fonctionnalité de recherche
python test_search_fix.py
```

## 🎨 Fonctionnalités de l'Interface Utilisateur

### Sélecteur de Projet
- Bouton en forme de pilule au centre en haut
- Affiche le projet actuel avec l'icône, le nom et le nombre d'éléments
- Le mode "Tous les Projets" affiche l'icône de l'univers avec les comptes totaux
- Menu déroulant avec tous les projets, créer un nouveau, et options d'édition
- Plus de 25 icônes Lucide parmi lesquelles choisir

### Vue Chronologique
- Affichage chronologique de tous les éléments
- Groupés par date
- Pilules de projet montrant l'origine de l'élément
- Lignes de thème reliant les éléments liés
- Animations fluides

### Vue Graphique
- Disposition à direction forcée avec D3.js
- Calculs de similarité en temps réel
- Sélection interactive des nœuds
- Filtrage basé sur les thèmes avec des ombres portées
- Feuille inférieure pour une vue détaillée avec des pilules de projet
- Animation pulsatile sur les nœuds sélectionnés
- **Zoom hiérarchique** avec rendu sémantique
- **Enveloppes de projet** lors de la visualisation de tous les projets
- **Indicateur de zoom** montrant le niveau actuel

### Navigation
- Boutons circulaires avec icônes correspondant aux motifs d'interface moderne
- Transitions fluides entre les vues
- Design réactif
- Raccourcis clavier (bientôt disponible)

## 📡 Outils MCP Goose

Lors de l'intégration avec Goose, Brian fournit ces outils :

### Gestion des Connaissances

#### `create_knowledge_item`
Ajoutez de nouveaux éléments à votre base de connaissances.
```
Paramètres :
- title: Titre de l'élément
- content: Contenu principal
- item_type: lien, note, extrait ou article
- url: URL optionnelle
- tags: Liste optionnelle de tags
- project_id: Projet optionnel auquel ajouter
```

#### `search_knowledge`
Recherchez dans votre base de connaissances avec recherche en texte intégral et similarité.
```
Paramètres :
- query: Requête de recherche
- limit: Nombre maximal de résultats (par défaut : 10)
- project_id: Filtre de projet optionnel
```

#### `find_similar_items`
Trouvez des éléments similaires à un élément donné.
```
Paramètres :
- item_id: UUID de l'élément de référence
- limit: Nombre maximal de résultats (par défaut : 5)
```

#### `get_item_details`
Obtenez les détails complets d'un élément spécifique.
```
Paramètres :
- item_id: UUID de l'élément
```

#### `update_knowledge_item`
Mettez à jour un élément de connaissance existant, son contenu, ses tags ou d'autres propriétés.
```
Paramètres :
- item_id: UUID de l'élément à mettre à jour
- title: Nouveau titre optionnel
- content: Nouveau contenu optionnel
- tags: Nouvelle liste de tags optionnelle
- url: Nouvelle URL optionnelle
```

#### `delete_knowledge_item`
Supprimez un élément de connaissance de la base de données. Cette action ne peut pas être annulée.
```
Paramètres :
- item_id: UUID de l'élément à supprimer
```

### Gestion des Projets

#### `list_projects`
Listez tous les projets de la base de connaissances.

#### `create_project`
Créez un nouveau projet de base de connaissances.
```
Paramètres :
- name: Nom du projet
- description: Description optionnelle
- icon: Icône emoji optionnelle
- color: Couleur hexadécimale optionnelle
```

#### `switch_project`
Changez le projet par défaut pour les nouveaux éléments.
```
Paramètres :
- project_id: UUID du projet
```

#### `get_project_context`
Obtenez le contexte de connaissance d'un projet spécifique.
```
Paramètres :
- project_id: UUID du projet optionnel
- query: Requête optionnelle pour filtrer les éléments
- limit: Nombre maximal d'éléments (par défaut : 20)
```

### Gestion des Régions

#### `list_regions`
Listez toutes les régions de connaissances.

#### `create_region`
Créez une nouvelle région de connaissances.
```
Paramètres :
- name: Nom de la région
- description: Description optionnelle
- color: Couleur hexadécimale optionnelle
- item_ids: Éléments optionnels à inclure
```

#### `get_region_context`
Obtenez le contexte de connaissance d'une région spécifique.
```
Paramètres :
- region_id: UUID de la région
- query: Requête optionnelle pour filtrer les éléments
```

### Contexte et Intelligence

#### `get_knowledge_context`
Obtenez des éléments de connaissance pertinents pour un sujet.
```
Paramètres :
- topic: Sujet pour lequel obtenir le contexte
- limit: Nombre maximal d'éléments (par défaut : 5)
```

#### `suggest_regions`
Suggérez des régions pertinentes pour une requête.
```
Paramètres :
- query: Requête pour trouver des régions pertinentes
- limit: Nombre maximal de régions (par défaut : 3)
```

#### `debug_item_connections`
Déboguez les connexions de similarité pour un élément.
```
Paramètres :
- item_id: UUID de l'élément à déboguer
```

### Gestion des Connexions

Connexions explicites entre les éléments de connaissance pour le graphique et le suivi des relations.

#### `create_connection`
Créez une connexion explicite entre deux éléments.
```
Paramètres :
- source_item_id: UUID de l'élément source
- target_item_id: UUID de l'élément cible
- connection_type: Optionnel - lié, références, extrait_de, inspiré_par, etc.
- strength: Optionnel - 0,0 à 1,0 (par défaut : 1,0)
- notes: Notes optionnelles sur la connexion
```

#### `get_item_connections`
Obtenez toutes les connexions explicites pour un élément.
```
Paramètres :
- item_id: UUID de l'élément
```

#### `update_connection`
Mettez à jour une connexion existante.
```
Paramètres :
- connection_id: ID de la connexion à mettre à jour
- connection_type: Nouveau type optionnel
- strength: Nouvelle force optionnelle 0,0-1,0
- notes: Nouvelles notes optionnelles
```

#### `delete_connection`
Supprimez une connexion explicite entre les éléments.
```
Paramètres :
- connection_id: ID de la connexion à supprimer
```

## 🔬 Algorithme de Similarité

Brian utilise une approche hybride pour trouver les connexions :

1. **Vectorisation TF-IDF** : Convertit le texte en vecteurs numériques
2. **Similarité Cosinus** : Mesure l'angle entre les vecteurs
3. **Filtrage par Seuil** : N'affiche que les connexions au-dessus de 0,15 de similarité
4. **Scores IDF Globaux** : Précalculés pour tous les documents
5. **Sensible au Projet** : Peut filtrer les connexions par projet

Cela crée des connexions significatives entre les éléments liés sans liaison manuelle.

## 🐛 Dépannage

### Le backend ne démarre pas
```bash
# Vérifier si le port 8080 est utilisé
lsof -i :8080

# Vérifier les logs
tail -f backend.log
```

### Le frontend ne démarre pas
```bash
# Vérifier si le port 5173 est utilisé
lsof -i :5173

# Vérifier les logs
tail -f frontend.log

# Réinstaller les dépendances
cd frontend && pnpm install
```

### Goose ne voit pas l'extension Brian
```bash
# Vérifier la configuration
cat ~/.config/goose/config.yaml

# Vérifier que le chemin Python est correct
which python  # Devrait être dans brian/venv/bin/

# Redémarrer Goose
```

### Problèmes de base de données
```bash
# Vérifier que la base de données existe
ls -la ~/.brian/brian.db

# Réinitialiser la base de données (ATTENTION : supprime toutes les données)
rm ~/.brian/brian.db
# Redémarrer le backend pour la recréer
```

### Le graphique n'affiche pas les enveloppes de projet
- Assurez-vous d'être en mode "Tous les Projets" (cliquez sur le Sélecteur de Projet → Tous les Projets)
- Dézoomez considérablement (échelle < 0,4) pour voir les frontières des projets
- Vérifiez que vous avez des éléments dans plusieurs projets

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à soumettre une Pull Request.

1. Forkez le dépôt
2. Créez votre branche de fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Validez vos modifications (`git commit -m 'Add some AmazingFeature'`)
4. Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📜 Licence

Ce projet est sous licence MIT - voir le fichier LICENSE pour plus de détails.

## 🙏 Remerciements

- Construit avec [FastAPI](https://fastapi.tiangolo.com/)
- Frontend alimenté par [React](https://react.dev/) et [Vite](https://vitejs.dev/)
- Visualisation graphique avec [D3.js](https://d3js.org/)
- Composants UI de [shadcn/ui](https://ui.shadcn.com/)
- Icônes de [Lucide](https://lucide.dev/)
- Gestion d'état avec [Zustand](https://zustand-demo.pmnd.rs/)
- Animations avec [Framer Motion](https://www.framer.com/motion/)
- Intégration Goose via [MCP](https://modelcontextprotocol.io/)

## 📚 Documentation

- [Guide de Démarrage Rapide](QUICKSTART.md)
- [Référence des Commandes](COMMANDS.md)
- [Intégration Google Drive](GOOGLE_DRIVE_INTEGRATION.md)
- [Guide de Visualisation Graphique](GRAPH_VISUALIZATION_EXPLAINED.md)
- [Filtrage par Thème](THEME_FILTERING.md)

## 🗺️ Feuille de Route

### Récemment Terminés
- ✅ Bases de connaissances multi-projets
- ✅ Sélecteur de projet avec icônes personnalisées
- ✅ Zoom hiérarchique (Univers des Connaissances)
- ✅ Enveloppes de projet et zoom sémantique
- ✅ Vue Tous les Projets
- ✅ Pilules de projet dans la Chronologie et le Graphe
- ✅ Configuration dynamique des ports (variables d'environnement VITE_PORT, VITE_API_URL)
- ✅ Attribution automatique de projet pour les nouvelles régions
- ✅ Problèmes de chargement initial du mode Univers corrigés
- ✅ Persistance des régions à travers les vues de projet

### À Venir
- 🎯 Contrôle du zoom par curseur
- 🎯 Boutons de zoom prédéfinis (Tout / Projet / Éléments)
- 🎯 Navigation par fil d'Ariane
- 🎯 Raccourcis clavier pour la navigation
- 🎯 Téléchargement d'images avec interprétation par LLM
- 🎯 Composants de carte standardisés

---

**Fait avec 🧠 et ❤️**

*Un jeu de mots avec "brain" (cerveau) - parce que vos connaissances méritent une maison intelligente.*
