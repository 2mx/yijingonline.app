class Hexagram {
  static YIN = 0;
  static YANG = 1;
  static FIXED = 'fixed';
  static MUTANT = 'mutant';

  constructor(lines) {
    this.lines = lines;
  }

  static mutateHexagram(hexagram) {
    const mutatedLines = hexagram.lines.map(line => {
      if (line[1] === Hexagram.MUTANT) {
        return [line[0] === Hexagram.YANG ? Hexagram.YIN : Hexagram.YANG,
        Hexagram.FIXED];
      }
      return line;
    });
    return new Hexagram(mutatedLines);
  }

  getBinaryString() {
    return this.lines.map(line => line[0]).join('');
  }

  hasMutantLines() {
    return this.lines.some(line => line[1] === Hexagram.MUTANT);
  }

  getMutantLineIndices() {
    return this.lines.reduce((indices, line, index) => {
      if (line[1] === Hexagram.MUTANT) {
        indices.push(index + 1); // Numéro de ligne 1-indexé
      }
      return indices;
    },
      []);
  }

  getString() {
    return this.lines.map(line => {
      if (line[0] === Hexagram.YIN && line[1] === Hexagram.MUTANT) {
        return '6';
      } else if (line[0] === Hexagram.YANG && line[1] === Hexagram.MUTANT) {
        return '9';
      } else if (line[0] === Hexagram.YANG && line[1] === Hexagram.FIXED) {
        return '7';
      } else if (line[0] === Hexagram.YIN && line[1] === Hexagram.FIXED) {
        return '8';
      }
    }).join('');
  }

  // Méthode pour obtenir la chaîne binaire avec les indices des lignes mutantes
  getBinaryStringWithMutantLine() {
    const binaryString = this.getBinaryString();
    const mutantIndices = this.getMutantLineIndices().join('');
    return mutantIndices ? `${binaryString}-${mutantIndices}` : binaryString;
  }
}


class Reading {
  constructor() {
    this.hexagram = null;
    this.currentLine = 0;
  }

  tossCoin() {
    return Math.random() < 0.5 ? 2 : 3;
  }

  readLine() {

    const tossResults = [this.tossCoin(),
    this.tossCoin(),
    this.tossCoin()];
    updateCoinsDisplayAnimation(tossResults);

    const sum = tossResults.reduce((acc, sum) => acc + sum,
      0);


    switch (sum) {
      case 6: return [Hexagram.YIN, Hexagram.MUTANT];
      case 7: return [Hexagram.YANG, Hexagram.FIXED];
      case 8: return [Hexagram.YIN, Hexagram.FIXED];
      case 9: return [Hexagram.YANG, Hexagram.MUTANT];
      default: throw new Error(`Invalid sum: ${sum}`);
    }
  }

  startDivination() {
    this.hexagram = null;
    this.currentLine = 0;
  }

  tossCoins() {
    if (this.currentLine < 6) {
      const line = this.readLine();
      if (!this.hexagram) {
        this.hexagram = new Hexagram([]);
      }
      this.hexagram.lines.push(line);
      this.currentLine++;
      return true;
    }
    return false;
  }

  isComplete() {
    return this.currentLine === 6;
  }

  getHexagram() {
    return this.hexagram;
  }
}

class HexagramRenderer {
  static renderHexagram(hexagram, elementId) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    hexagram.lines.forEach(line => {
      const lineDiv = document.createElement('div');
      lineDiv.className = `hexagram-line position-relative`;

      if (line[0] === Hexagram.YANG) {
        const yangLine = document.createElement('div');
        yangLine.className = 'yang';
        lineDiv.appendChild(yangLine);
      } else {
        const yinLine1 = document.createElement('div');
        const yinLine2 = document.createElement('div');
        yinLine1.className = 'yin';
        yinLine2.className = 'yin';
        lineDiv.appendChild(yinLine1);
        lineDiv.appendChild(yinLine2);
      }

      if (line[1] === Hexagram.MUTANT) {
        lineDiv.classList.add('mutant');
      }
      container.prepend(lineDiv);
    });
  }
}

function updateCoinsDisplay(results) {
  const coinContainerIds = ['coin-1', 'coin-2', 'coin-3'];
  results.forEach((result, index) => {
    const coinContainer = document.getElementById(coinContainerIds[index]);
    const side = result === 2 ? 'yang' : 'ying'; // 2 pour pile, 3 pour face
    coinContainer.innerHTML = `<img src="coin-${side}.svg" alt="${side}" />`;
  });
}

function updateCoinsDisplayAnimation(results) {
  const coinContainerIds = ['coin-1', 'coin-2', 'coin-3'];

  // Ajouter la classe d'animation "coin-flipping" temporairement
  coinContainerIds.forEach(id => {
    const container = document.getElementById(id);
    container.classList.add('coin-flipping');
  });

  // Mettre à jour les pièces après une animation (0.8s)
  setTimeout(() => {
    coinContainerIds.forEach((id, index) => {
      const container = document.getElementById(id);
      const side = results[index] === 2 ? 'yang' : 'ying'; // 2 pour Ying, 3 pour Yang

      // Remplacer le contenu par l'image SVG
      container.innerHTML = `<img src="coin-${side}.svg" alt="${side}" />`;

      // Supprimer la classe d'animation
      container.classList.remove('coin-flipping');
    });
  },
    700); // Durée de l'animation définie dans la CSS
}

class App {
  constructor() {
    this.reading = new Reading();
    this.tossButton = document.getElementById('toss-coin');
    this.questionInput = document.getElementById('question');
    this.loadingSpinner = document.getElementById('loading-spinner');

    this.hexagramData = null;
    this.detailLevels = {
      short: {
        label: "Courte",
        description: "Fournis un résumé très court avec l'essentiel du message."
      },
      medium: {
        label: "Moyenne",
        description: "Fournis un résumé de longueur moyenne en expliquant les points principaux."
      },
      detailed: {
        label: "Détaillée",
        description: "Décris l'hexagramme principal pour donner des conseils pertinents."
      }
    };
    this.aiOptions = {
      chatgpt: {
        label: "Chat GPT",
        url: "https://chat.openai.com/"
      },
      mistral: {
        label: "Mistral AI",
        url: "https://chat.mistral.ai/chat/"
      },
      claude: {
        label: "Claude",
        url: "https://claude.ai/new"
      },
      gemini: {
        label: "Gemini",
        url: "https://gemini.google.com/app"
      }

    };


    this.tossButton.addEventListener('click',
      () => this.onTossButtonClick());
    this.initDetailLevelSelect();
    this.initAISelect();
  }

  async start() {
    await this.loadData();
    this.reading.startDivination();
    this.loadingSpinner.style.display = 'none';
    this.tossButton.disabled = false;
    document.getElementById('original-hexagram').innerHTML = '';
    document.getElementById('mutated-hexagram').innerHTML = '';
    document.getElementById('original-info').innerHTML = '';
    document.getElementById('mutated-info').innerHTML = '';

    // Initialiser l'affichage avec 3 pièces Ying
    updateCoinsDisplay([3,
      3,
      3]); // 2 correspond au côté Ying


    const aiChoice = document.getElementById('ai-choice');
    const btnAskAI = document.getElementById('btn-askai');

    const updateButtonText = () => {
      const selectedAI = aiChoice.options[aiChoice.selectedIndex].text;
      btnAskAI.textContent = `Faire interpréter par ${selectedAI}`;
    };

    aiChoice.addEventListener('change',
      updateButtonText);
    updateButtonText();
  }

  initDetailLevelSelect() {
    const detailLevelSelect = document.getElementById('detailLevel');
    for (const [value, {
      label
    }] of Object.entries(this.detailLevels)) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      detailLevelSelect.appendChild(option);
    }
    // select default option
    detailLevelSelect.selectedIndex = 1;
  }

  initAISelect() {
    const aiSelect = document.getElementById('ai-choice');
    for (const [value, {
      label
    }] of Object.entries(this.aiOptions)) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      aiSelect.appendChild(option);
    }
  }


  async loadData() {
    const response = await fetch('hexagrams.json');
    const data = await response.json();
    this.hexagramData = data.hexagrams;
  }

  onTossButtonClick() {
    this.questionInput.disabled = true;

    if (!this.reading.isComplete()) {
      if (this.reading.tossCoins()) {
        HexagramRenderer.renderHexagram(this.reading.getHexagram(), 'original-hexagram');
        if (this.reading.isComplete()) {
          this.finalizeDivination();
        }
      }
    }
  }

  async finalizeDivination() {


    _paq.push(['trackGoal', 1]);


    const originalHexagram = this.reading.getHexagram();

    if (originalHexagram.hasMutantLines()) {
      const mutatedHexagram = Hexagram.mutateHexagram(originalHexagram);
      HexagramRenderer.renderHexagram(mutatedHexagram, 'mutated-hexagram');

      await this.renderHexagramInfo(mutatedHexagram, 'title-mutated-hexagram');

    } else {
      document.getElementById('title-mutated-hexagram').innerHTML = 'Pas de mutation';
    }

    await this.renderHexagramInfo(originalHexagram, 'title-original-hexagram');

    //this.tossButton.disabled = true;
    document.getElementById('toss-coin-wrapper').style.display = 'none';
    //this.tossButton.style.display = 'none';
    document.getElementById('new-reading').classList.remove("d-none");;
    document.getElementById('askai').style.display = 'block';

    document.getElementById('btn-askai').addEventListener('click', () => this.onAskAIClick(originalHexagram));
  }

  async renderHexagramInfo(hexagram, elementId) {
    const infoElement = document.getElementById(elementId);
    const data = this.hexagramData[hexagram.getBinaryString()];
    if (data) {
      infoElement.innerHTML = `
      <strong>${data.number}.</strong> <strong>${data.name}</strong> (${data.ideogram})`;
    } else {
      infoElement.innerHTML = "Informations non disponibles";
    }
  }



  onAskAIClick(originalHexagram) {
    const aiChoice = document.getElementById('ai-choice').value;
    const detailLevelValue = document.getElementById('detailLevel').value;
    const detailLevel = this.detailLevels[detailLevelValue].description;

    _paq.push(['trackGoal', 2]);


    const number = this.hexagramData[originalHexagram.getBinaryString()].number;

    let question = this.questionInput.value.trim();
    if (question && !question.endsWith(' ?')) {
      question += '?';
    }

    if (question) {
      question = `Question : ${question}, `;
    }

    let prompt = `Interprète un tirage du Yi Jing en fonction des informations suivantes : ${question} Hexagramme principal : ${number}. ${detailLevel}`;

    if (originalHexagram.hasMutantLines()) {
      const mutatedHexagram = Hexagram.mutateHexagram(originalHexagram);
      const mutatedNumber = this.hexagramData[mutatedHexagram.getBinaryString()].number;
      const mutateLines = originalHexagram.getMutantLineIndices().join(', ');
      prompt = `Interprète un tirage du Yi Jing en fonction des informations suivantes : ${question} Hexagramme principal : ${number}, Lignes mutantes : ${mutateLines}, Hexagramme muté : ${mutatedNumber}. ${detailLevel}`;
    }

    const encodedPrompt = encodeURIComponent(prompt);

    let url = this.aiOptions[aiChoice].url + `?q=${encodedPrompt}`;
    window.open(url, '_blank');
  }

}

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', async () => {
  const app = new App();
  await app.start();
});