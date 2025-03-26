let translationsData = {};


async function loadTranslations(lang) {
    try {
        const response = await fetch(`/static/translations.json`);
        if (!response.ok) {
            throw new Error(`Erreur de chargement des traductions: ${response.statusText}`);
        }
        const translations = await response.json();
        // console.log("Données chargées depuis JSON :", translations);
        return translations[lang] || {};
    } catch (error) {
        console.error("Erreur lors du chargement des traductions :", error);
        return {};
    }
}
//MAJ texte et selector
async function updateTexts(lang) {
    // console.log("Mise à jour du texte en:", lang);
    const translations = await loadTranslations(lang);
    // console.log("Traductions chargées :", translations);

	// Sauvegarde les traductions pour les erreurs
	translationsData = translations;

    document.querySelectorAll("[data-translate]").forEach(el => {
        const key = el.getAttribute("data-translate");
        // console.log(`Élément détecté:`, el, `Clé:`, key);
		if (!translations[key]) {
			console.error(`La clé "${key}" n'a pas de traduction disponible !`);
		}

        if (el.placeholder !== undefined) {
            el.placeholder = translations[key] || key;
        } else {
            const link = el.querySelector("a[data-translate]");
            if (link) {
                const linkKey = link.getAttribute("data-translate");
                link.textContent = translations[linkKey] || linkKey;

                // On remplace {link} par le code HTML du lien dans le texte principal
                el.innerHTML = (translations[key] || key).replace("{link}", link.outerHTML);
            } else {
				const existingIcon = el.querySelector("i");
				if (existingIcon) {
					// Trouver le premier nœud texte APRÈS l'icône
					let textNode = null;
					for (let node of el.childNodes) {
						if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== "") {
							textNode = node;
						}
					}

					if (textNode) {
						// console.log(`Ancien texte: "${textNode.textContent.trim()}" -> Nouveau texte: "${translations[key] || key}"`);
						textNode.textContent = " " + (translations[key] || key);
					} else {
						// Si aucun texte n'est trouvé, on l'ajoute après l'icône
						el.appendChild(document.createTextNode(" " + (translations[key] || key)));
					}
				}else {
                	// console.log(`Ancien texte: "${el.textContent}" -> Nouveau texte: "${translations[key] || key}"`);
                	el.textContent = translations[key] || key;
            	}
        	}
		}

    });

    // Met à jour le sélecteur
    const languageSelector = document.getElementById("languageSelector");
    if (languageSelector) {
        languageSelector.value = lang;
    }

	const performanceChart = document.getElementById('performanceChart');
    if (performanceChart && window.router && window.router.currentPage && window.router.currentPage.initializeCharts) {
        window.router.currentPage.initializeCharts();
    }
}


//Appliquer la langue sauvegardée au chargement de la page
document.addEventListener("DOMContentLoaded", async () => {
    const savedLang = localStorage.getItem("selectedLang") || "en";
    await updateTexts(savedLang);
});


