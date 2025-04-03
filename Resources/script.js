const popularSubstances = [
    "LSD", "MDMA", "Psilocybin", "DMT", "Ketamine", 
    "Cannabis", "Mescaline", "2C-B", "Cocaine",
    "Caffeine", "Salvia", "Nitrous", "Kratom", "Modafinil"
];

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('substance-search');
    const searchButton = document.getElementById('search-button');
    const resultsContainer = document.getElementById('results');
    const loadingIndicator = document.getElementById('loading');
    const errorMessage = document.getElementById('error-message');

    // Select random substance on page load
    function getRandomSubstance() {
        const randomIndex = Math.floor(Math.random() * popularSubstances.length);
        return popularSubstances[randomIndex];
    }
    
    // Set a random substance as default
    searchInput.value = getRandomSubstance();
    
    // Function to fetch data from the API
    async function fetchSubstanceData(substanceName) {
        try {
            showLoading(true);
            hideError();
            
            // Modify the images section of your GraphQL query
            const query = `
            {
                substances(query: "${substanceName}") {
                    name
                    url
                    featured
                    summary
                    addictionPotential
                    toxicity
                    crossTolerances
                    commonNames
                    systematicName
                    class {
                        chemical
                        psychoactive
                    }
                    tolerance {
                        full
                        half
                        zero
                    }
                    roas {
                        name
                        dose {
                            units
                            threshold
                            heavy
                            common { min max }
                            light { min max }
                            strong { min max }
                        }
                        duration {
                            afterglow { min max units }
                            comeup { min max units }
                            duration { min max units }
                            offset { min max units }
                            onset { min max units }
                            peak { min max units }
                            total { min max units }
                        }
                        bioavailability {
                            min max
                        }
                    }
                    effects {
                        name
                        url
                    }
                    images {
                        image
                        thumb
                        # Remove the 'caption' field as it doesn't exist in the API schema
                    }
                    uncertainInteractions {
                        name
                    }
                    unsafeInteractions {
                        name
                    }
                    dangerousInteractions {
                        name
                    }
                }
            }`;
            
            const response = await fetch('https://api.psychonautwiki.org/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: query
                })
            });
            

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error:', errorText);
                throw new Error(`Network response was not ok: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.errors) {
                throw new Error(data.errors[0].message || 'Error fetching data');
            }
            
            if (!data.data.substances || data.data.substances.length === 0) {
                throw new Error('No substances found with that name');
            }
            
            return data.data.substances[0];
        } catch (error) {
            showError(error.message);
            return null;
        } finally {
            showLoading(false);
        }
    }
    
    function showLoading(show) {
        loadingIndicator.style.display = show ? 'block' : 'none';
    }
    
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
    
    function hideError() {
        errorMessage.style.display = 'none';
    }
    
    // Function to render substance data
    function renderSubstanceData(substance) {
        resultsContainer.innerHTML = '';
        
        if (!substance) return;
        
        const card = document.createElement('div');
        card.className = 'card';
        
        const cardHeader = document.createElement('div');
        cardHeader.className = 'card-header';
        
        let headerContent = `<h2>${substance.name}</h2>`;
        if (substance.featured) {
            headerContent += `<span class="featured-badge">Featured</span>`;
        }
        cardHeader.innerHTML = headerContent;
        
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';
        
        // Add summary if available
        if (substance.summary) {
            const summaryDiv = document.createElement('div');
            summaryDiv.className = 'substance-summary';
            summaryDiv.innerHTML = `<p>${substance.summary}</p>`;
            cardBody.appendChild(summaryDiv);
        }
        
        // Add meta information
        const metaDiv = document.createElement('div');
        metaDiv.className = 'substance-meta';
        
        // Common names
        if (substance.commonNames && substance.commonNames.length > 0) {
            const commonNamesDiv = document.createElement('div');
            commonNamesDiv.className = 'meta-item';
            commonNamesDiv.innerHTML = `
                <h4>Common Names</h4>
                <p>${substance.commonNames.join(', ')}</p>
            `;
            metaDiv.appendChild(commonNamesDiv);
        }
        
        // Class information
        if (substance.class) {
            const classDiv = document.createElement('div');
            classDiv.className = 'meta-item';
            let classContent = '<h4>Class</h4>';
            
            if (substance.class.chemical) {
                classContent += `<p><strong>Chemical:</strong> ${substance.class.chemical}</p>`;
            }
            
            if (substance.class.psychoactive) {
                classContent += `<p><strong>Psychoactive:</strong> ${substance.class.psychoactive}</p>`;
            }
            
            classDiv.innerHTML = classContent;
            metaDiv.appendChild(classDiv);
        }
        
        // Addiction potential
        if (substance.addictionPotential) {
            const addictionDiv = document.createElement('div');
            addictionDiv.className = 'meta-item';
            addictionDiv.innerHTML = `
                <h4>Addiction Potential</h4>
                <p>${substance.addictionPotential}</p>
            `;
            metaDiv.appendChild(addictionDiv);
        }
        
        // Tolerance
        if (substance.tolerance) {
            const toleranceDiv = document.createElement('div');
            toleranceDiv.className = 'meta-item';
            let toleranceContent = '<h4>Tolerance</h4>';
            
            if (substance.tolerance.full) {
                toleranceContent += `<p><strong>Full:</strong> ${substance.tolerance.full}</p>`;
            }
            
            if (substance.tolerance.half) {
                toleranceContent += `<p><strong>Half:</strong> ${substance.tolerance.half}</p>`;
            }
            
            if (substance.tolerance.zero) {
                toleranceContent += `<p><strong>Zero:</strong> ${substance.tolerance.zero}</p>`;
            }
            
            toleranceDiv.innerHTML = toleranceContent;
            metaDiv.appendChild(toleranceDiv);
        }
        
        // Cross-tolerances
        if (substance.crossTolerances && substance.crossTolerances.length > 0) {
            const crossTolerancesDiv = document.createElement('div');
            crossTolerancesDiv.className = 'meta-item';
            crossTolerancesDiv.innerHTML = `
                <h4>Cross-Tolerances</h4>
                <p>${substance.crossTolerances.join(', ')}</p>
            `;
            metaDiv.appendChild(crossTolerancesDiv);
        }
        
        // Systematic name
        if (substance.systematicName) {
            const systematicNameDiv = document.createElement('div');
            systematicNameDiv.className = 'meta-item';
            systematicNameDiv.innerHTML = `
                <h4>Systematic Name</h4>
                <p>${substance.systematicName}</p>
            `;
            metaDiv.appendChild(systematicNameDiv);
        }
        
        cardBody.appendChild(metaDiv);
        
        // Create tabs
        const tabs = document.createElement('div');
        tabs.className = 'tabs';
        
        const tabNames = [
            { id: 'dosage', name: 'Dosage' },
            { id: 'duration', name: 'Duration' },
            { id: 'effects', name: 'Effects' },
            { id: 'interactions', name: 'Interactions' },
            { id: 'toxicity', name: 'Toxicity' },
            { id: 'images', name: 'Images' }
        ];
        
        tabNames.forEach((tab, index) => {
            const tabElement = document.createElement('div');
            tabElement.className = `tab ${index === 0 ? 'active' : ''}`;
            tabElement.dataset.tab = tab.id;
            tabElement.textContent = tab.name;
            tabElement.addEventListener('click', function() {
                // Remove active class from all tabs
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                // Add active class to clicked tab
                this.classList.add('active');
                // Hide all tab content
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                // Show clicked tab content
                document.getElementById(`${tab.id}-content`).classList.add('active');
            });
            tabs.appendChild(tabElement);
        });
        
        // Create tab content containers
        const dosageContent = document.createElement('div');
        dosageContent.className = 'tab-content active';
        dosageContent.id = 'dosage-content';
        
        const durationContent = document.createElement('div');
        durationContent.className = 'tab-content';
        durationContent.id = 'duration-content';
        
        const effectsContent = document.createElement('div');
        effectsContent.className = 'tab-content';
        effectsContent.id = 'effects-content';
        
        const interactionsContent = document.createElement('div');
        interactionsContent.className = 'tab-content';
        interactionsContent.id = 'interactions-content';
        
        const toxicityContent = document.createElement('div');
        toxicityContent.className = 'tab-content';
        toxicityContent.id = 'toxicity-content';
        
        const imagesContent = document.createElement('div');
        imagesContent.className = 'tab-content';
        imagesContent.id = 'images-content';
        
        // Populate dosage tab
        if (substance.roas && substance.roas.length > 0) {
            const roasTable = document.createElement('table');
            
            let tableHTML = `
                <tr>
                    <th>ROA</th>
                    <th>Threshold</th>
                    <th>Light</th>
                    <th>Common</th>
                    <th>Strong</th>
                    <th>Heavy</th>
                    <th>Units</th>
                </tr>
            `;
            
            substance.roas.forEach(roa => {
                if (roa.dose) {
                    const units = roa.dose.units || '';
                    const threshold = roa.dose.threshold !== null ? roa.dose.threshold : '-';
                    const light = roa.dose.light ? `${roa.dose.light.min}-${roa.dose.light.max}` : '-';
                    const common = roa.dose.common ? `${roa.dose.common.min}-${roa.dose.common.max}` : '-';
                    const strong = roa.dose.strong ? `${roa.dose.strong.min}-${roa.dose.strong.max}` : '-';
                    const heavy = roa.dose.heavy !== null ? `>${roa.dose.heavy}` : '-';
                    
                    tableHTML += `
                        <tr>
                            <td>${roa.name}</td>
                            <td>${threshold}</td>
                            <td>${light}</td>
                            <td>${common}</td>
                            <td>${strong}</td>
                            <td>${heavy}</td>
                            <td>${units}</td>
                        </tr>
                    `;
                }
            });
            
            roasTable.innerHTML = tableHTML;
            dosageContent.appendChild(roasTable);
        } else {
            dosageContent.innerHTML = '<p>No dosage information available.</p>';
        }
        
        // Populate duration tab
        if (substance.roas && substance.roas.length > 0) {
            substance.roas.forEach(roa => {
                if (roa.duration) {
                    const roaTitle = document.createElement('h3');
                    roaTitle.textContent = `${roa.name}`;
                    durationContent.appendChild(roaTitle);
                    
                    const durationTable = document.createElement('table');
                    
                    let tableHTML = `
                        <tr>
                            <th>Phase</th>
                            <th>Duration</th>
                        </tr>
                    `;
                    
                    const phases = {
                        'onset': 'Onset',
                        'comeup': 'Come up',
                        'peak': 'Peak',
                        'offset': 'Offset',
                        'afterglow': 'Afterglow',
                        'total': 'Total'
                    };
                    
                    Object.entries(phases).forEach(([key, label]) => {
                        if (roa.duration[key]) {
                            const min = roa.duration[key].min;
                            const max = roa.duration[key].max;
                            const units = roa.duration[key].units;
                            
                            if (min !== null && max !== null) {
                                tableHTML += `
                                    <tr>
                                        <td>${label}</td>
                                        <td>${min}-${max} ${units}</td>
                                    </tr>
                                `;
                            }
                        }
                    });
                    
                    durationTable.innerHTML = tableHTML;
                    durationContent.appendChild(durationTable);
                    
                    // Add bioavailability if available
                    if (roa.bioavailability && (roa.bioavailability.min !== null || roa.bioavailability.max !== null)) {
                        const bioTitle = document.createElement('h4');
                        bioTitle.textContent = 'Bioavailability';
                        durationContent.appendChild(bioTitle);
                        
                        const bioText = document.createElement('p');
                        if (roa.bioavailability.min !== null && roa.bioavailability.max !== null) {
                            bioText.textContent = `${roa.bioavailability.min}% - ${roa.bioavailability.max}%`;
                        } else if (roa.bioavailability.min !== null) {
                            bioText.textContent = `≥ ${roa.bioavailability.min}%`;
                        } else if (roa.bioavailability.max !== null) {
                            bioText.textContent = `≤ ${roa.bioavailability.max}%`;
                        }
                        durationContent.appendChild(bioText);
                    }
                }
            });
        } else {
            durationContent.innerHTML = '<p>No duration information available.</p>';
        }
        
        // Populate effects tab
        if (substance.effects && substance.effects.length > 0) {
            const effectsList = document.createElement('div');
            effectsList.className = 'effects-list';
            
            substance.effects.forEach(effect => {
                const badge = document.createElement('div');
                badge.className = 'badge badge-primary';
                
                if (effect.url) {
                    const link = document.createElement('a');
                    link.href = effect.url;
                    link.target = '_blank';
                    link.style.color = 'white';
                    link.style.textDecoration = 'none';
                    link.textContent = effect.name;
                    badge.appendChild(link);
                } else {
                    badge.textContent = effect.name;
                }
                
                effectsList.appendChild(badge);
            });
            
            effectsContent.appendChild(effectsList);
        } else {
            effectsContent.innerHTML = '<p>No effects information available.</p>';
        }
        
        // Populate interactions tab
        const interactionsDiv = document.createElement('div');
        interactionsDiv.className = 'interactions';
        
        // Uncertain interactions
        const uncertainColumn = document.createElement('div');
        uncertainColumn.className = 'interaction-column uncertain';
        uncertainColumn.innerHTML = '<h4>Uncertain Interactions</h4>';
        
        if (substance.uncertainInteractions && substance.uncertainInteractions.length > 0) {
            const uncertainList = document.createElement('div');
            uncertainList.className = 'interactions-list';
            
            substance.uncertainInteractions.forEach(interaction => {
                const badge = document.createElement('div');
                badge.className = 'badge badge-warning';
                badge.textContent = interaction.name;
                uncertainList.appendChild(badge);
            });
            
            uncertainColumn.appendChild(uncertainList);
        } else {
            uncertainColumn.innerHTML += '<p>No uncertain interactions listed.</p>';
        }
        
        // Unsafe interactions
        const unsafeColumn = document.createElement('div');
        unsafeColumn.className = 'interaction-column unsafe';
        unsafeColumn.innerHTML = '<h4>Unsafe Interactions</h4>';
        
        if (substance.unsafeInteractions && substance.unsafeInteractions.length > 0) {
            const unsafeList = document.createElement('div');
            unsafeList.className = 'interactions-list';
            
            substance.unsafeInteractions.forEach(interaction => {
                const badge = document.createElement('div');
                badge.className = 'badge badge-info';
                badge.textContent = interaction.name;
                unsafeList.appendChild(badge);
            });
            
            unsafeColumn.appendChild(unsafeList);
        } else {
            unsafeColumn.innerHTML += '<p>No unsafe interactions listed.</p>';
        }
        
        // Dangerous interactions
        const dangerousColumn = document.createElement('div');
        dangerousColumn.className = 'interaction-column dangerous';
        dangerousColumn.innerHTML = '<h4>Dangerous Interactions</h4>';
        
        if (substance.dangerousInteractions && substance.dangerousInteractions.length > 0) {
            const dangerousList = document.createElement('div');
            dangerousList.className = 'interactions-list';
            
            substance.dangerousInteractions.forEach(interaction => {
                const badge = document.createElement('div');
                badge.className = 'badge badge-danger';
                badge.textContent = interaction.name;
                dangerousList.appendChild(badge);
            });
            
            dangerousColumn.appendChild(dangerousList);
        } else {
            dangerousColumn.innerHTML += '<p>No dangerous interactions listed.</p>';
        }
        
        interactionsDiv.appendChild(uncertainColumn);
        interactionsDiv.appendChild(unsafeColumn);
        interactionsDiv.appendChild(dangerousColumn);
        
        interactionsContent.appendChild(interactionsDiv);
        
        // Populate toxicity tab
        if (substance.toxicity && substance.toxicity.length > 0) {
            const toxicityList = document.createElement('ul');
            
            substance.toxicity.forEach(item => {
                const listItem = document.createElement('li');
                listItem.textContent = item;
                toxicityList.appendChild(listItem);
            });
            
            toxicityContent.appendChild(toxicityList);
        } else {
            toxicityContent.innerHTML = '<p>No toxicity information available.</p>';
        }
        
        // In your renderSubstanceData function, modify the images part
        if (substance.images && substance.images.length > 0) {
            const imagesGrid = document.createElement('div');
            imagesGrid.className = 'images-grid';
            
            substance.images.forEach(image => {
                const imageDiv = document.createElement('div');
                imageDiv.className = 'substance-image';
                
                if (image.image) {
                    const img = document.createElement('img');
                    img.src = image.image;
                    img.alt = substance.name; // Use substance name instead of caption
                    
                    const imgLink = document.createElement('a');
                    imgLink.href = image.image;
                    imgLink.target = '_blank';
                    imgLink.appendChild(img);
                    
                    imageDiv.appendChild(imgLink);
                    
                    // Remove the caption code since it doesn't exist in the API response
                }
                
                imagesGrid.appendChild(imageDiv);
            });
            
            imagesContent.appendChild(imagesGrid);
        } else {
            imagesContent.innerHTML = '<p>No images available.</p>';
        }
        
        // Add tabs and tab content to card
        cardBody.appendChild(tabs);
        cardBody.appendChild(dosageContent);
        cardBody.appendChild(durationContent);
        cardBody.appendChild(effectsContent);
        cardBody.appendChild(interactionsContent);
        cardBody.appendChild(toxicityContent);
        cardBody.appendChild(imagesContent);
        
        // Add header and body to card
        card.appendChild(cardHeader);
        card.appendChild(cardBody);
        
        // Add card to results container
        resultsContainer.appendChild(card);
    }
    
    // Event listeners
    searchButton.addEventListener('click', async function() {
        const substanceName = searchInput.value.trim();
        if (substanceName) {
            const substance = await fetchSubstanceData(substanceName);
            if (substance) {
                renderSubstanceData(substance);
            }
        }
    });
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchButton.click();
        }
    });
    
    // Search for default substance on page load
    setTimeout(async function() {
        const substance = await fetchSubstanceData(searchInput.value.trim());
        if (substance) {
            renderSubstanceData(substance);
        }
    }, 500);
});
