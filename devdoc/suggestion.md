# Suggestions d'amélioration pour l'application Yi Jing

Voici une synthèse des pistes d'amélioration pour rendre le code encore plus robuste et maintenable. La base actuelle est déjà excellente, avec un code très propre et bien structuré.

### 1. Découpler la logique (Modèle) de l'affichage (Vue)

La classe `Reading` (logique) ne devrait pas appeler directement des fonctions qui manipulent le DOM comme `updateCoinsDisplayAnimation`. Le rôle du "contrôleur" (`App`) est de faire le lien entre les deux.

**Suggestion :**
La méthode `readLine` devrait retourner le résultat du lancer de pièces. La classe `App` peut ensuite utiliser ce résultat pour déclencher l'animation.

**Exemple :**
```javascript
// Dans la classe Reading
readLine() {
    const tossResults = [this.tossCoin(), this.tossCoin(), this.tossCoin()];
    const sum = tossResults.reduce((acc, sum) => acc + sum, 0);

    const line = (() => {
        switch (sum) {
            case 6: return [Hexagram.YIN, Hexagram.MUTANT];
            case 7: return [Hexagram.YANG, Hexagram.FIXED];
            case 8: return [Hexagram.YIN, Hexagram.FIXED];
            case 9: return [Hexagram.YANG, Hexagram.MUTANT];
            default: throw new Error(`Invalid sum: ${sum}`);
        }
    })();
    
    return { line, tossResults }; // Retourner un objet complet
}

// Dans la classe App, la méthode qui gère le clic
onTossButtonClick() {
    // ...
    const result = this.reading.tossCoins(); // tossCoins appellera readLine
    if (result.success) {
        // Mettre à jour l'animation ici
        updateCoinsDisplayAnimation(result.tossResults);
        // ...
    }
    //...
}

// Et mettez à jour la méthode tossCoins de la classe Reading
// pour qu'elle retourne les résultats du lancer
tossCoins() {
    if (this.currentLine < 6) {
        const { line, tossResults } = this.readLine(); // Récupérer l'objet
        if (!this.hexagram) {
            this.hexagram = new Hexagram([]);
        }
        this.hexagram.lines.push(line);
        this.currentLine++;
        return { success: true, tossResults }; // Retourner les résultats
    }
    return { success: false };
}
```

### 2. Centraliser les gestionnaires d'événements

Les attributs `onclick="..."` dans le HTML mélangent la structure et le comportement. Il est préférable de déclarer tous les écouteurs d'événements en JavaScript.

**Suggestion :**
Retirez les `onclick` du HTML et ajoutez les `addEventListener` dans le constructeur de la classe `App`.

**Exemple :**
```html
<!-- Avant -->
<button id="new-reading" ... onclick="location.reload()">

<!-- Après -->
<button id="new-reading" ...>
```
```javascript
// Dans le constructeur de la classe App
this.newReadingButton = document.getElementById('new-reading');
this.newReadingButton.addEventListener('click', () => location.reload());

// Pour le bouton de changement de thème (voir index.html)
const themeToggleButton = document.querySelector('[aria-label="Toggle dark mode"]');
if (themeToggleButton) {
    themeToggleButton.addEventListener('click', () => document.dispatchEvent(new CustomEvent('basecoat:theme')));
}
```

### 3. Utiliser pleinement Tailwind CSS

Des classes CSS personnalisées comme `.yang` et `.yin` peuvent être remplacées par les classes utilitaires de Tailwind, ce qui réduit la quantité de CSS à maintenir.

**Suggestion :**
Dans `HexagramRenderer.renderHexagram`, assignez directement les classes Tailwind au lieu d'une classe custom.

```javascript
// Remplacer .yang par des classes Tailwind
yangLine.className = 'bg-black dark:bg-white w-full h-[10px]';

// Remplacer .yin par des classes Tailwind
yinLine.className = 'bg-black dark:bg-white w-[45%] h-[10px]';
```

### 4. Nettoyage du HTML et des dépendances

*   **Attribut Bootstrap inutile :** L'attribut `data-bs-toggle="tooltip"` sur le bouton `#btn-askai` peut être supprimé car le JavaScript de Bootstrap n'est pas utilisé.
*   **Dépendance `basecoat-css` :** Réfléchir à la nécessité de cette dépendance, car Tailwind gère déjà une grande partie des styles de base (reset). Si `basecoat-css` n'est utilisé que pour quelques utilitaires qui peuvent être reproduits avec Tailwind ou un petit peu de CSS custom, cela pourrait simplifier le projet.

### 5. Configuration du projet

Le nom du projet dans `package.json` est `"vitetest"`.

**Suggestion :**
Utilisez un nom plus descriptif.
```json
"name": "yijing-online-app",
```