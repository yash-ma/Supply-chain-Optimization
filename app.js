// Supply Chain Route Optimization Dashboard JavaScript

// Algorithm data from provided JSON
const algorithms = {
    dijkstra: {
        name: "Dijkstra",
        description: "Classic shortest path algorithm, guaranteed optimal for single-source shortest paths",
        complexity: "O((V + E) log V)",
        avgRouteLength: 245,
        computationTime: 0.8,
        costSavings: 15,
        bestFor: "Simple point-to-point routing with fixed costs"
    },
    genetic: {
        name: "Genetic Algorithm",
        description: "Evolutionary algorithm that mimics natural selection for route optimization",
        complexity: "O(g × p × n²)",
        avgRouteLength: 198,
        computationTime: 45,
        costSavings: 22,
        bestFor: "Complex multi-objective optimization with many constraints"
    },
    "ant-colony": {
        name: "Ant Colony Optimization",
        description: "Bio-inspired algorithm that simulates ant foraging behavior",
        complexity: "O(n² × m × t)",
        avgRouteLength: 185,
        computationTime: 32,
        costSavings: 28,
        bestFor: "Dynamic routing with real-time traffic adaptation"
    },
    reinforcement: {
        name: "Reinforcement Learning",
        description: "AI agent learns optimal routes through trial and error",
        complexity: "O(episodes × actions)",
        avgRouteLength: 175,
        computationTime: 120,
        costSavings: 35,
        bestFor: "Adaptive routing in uncertain environments"
    },
    "ml-hybrid": {
        name: "Machine Learning Hybrid",
        description: "Combines multiple ML techniques for optimal performance",
        complexity: "Varies by model",
        avgRouteLength: 165,
        computationTime: 85,
        costSavings: 40,
        bestFor: "Enterprise-scale optimization with predictive capabilities"
    }
};

// Scenarios data
const scenarios = {
    urban: {
        name: "Urban Delivery",
        locations: [
            {id: 1, name: "Warehouse", x: 100, y: 100, type: "depot", demand: 0},
            {id: 2, name: "Store A", x: 250, y: 80, type: "delivery", demand: 15},
            {id: 3, name: "Store B", x: 180, y: 200, type: "delivery", demand: 22},
            {id: 4, name: "Store C", x: 320, y: 150, type: "delivery", demand: 18},
            {id: 5, name: "Store D", x: 150, y: 300, type: "delivery", demand: 12},
            {id: 6, name: "Store E", x: 400, y: 120, type: "delivery", demand: 25}
        ]
    },
    rural: {
        name: "Rural Routes",
        locations: [
            {id: 1, name: "Distribution Center", x: 150, y: 200, type: "depot", demand: 0},
            {id: 2, name: "Town A", x: 80, y: 60, type: "delivery", demand: 35},
            {id: 3, name: "Town B", x: 400, y: 80, type: "delivery", demand: 28},
            {id: 4, name: "Town C", x: 320, y: 300, type: "delivery", demand: 42},
            {id: 5, name: "Town D", x: 50, y: 350, type: "delivery", demand: 18}
        ]
    },
    "multi-depot": {
        name: "Multi-Depot System",
        locations: [
            {id: 1, name: "Depot North", x: 100, y: 80, type: "depot", demand: 0},
            {id: 2, name: "Depot South", x: 400, y: 320, type: "depot", demand: 0},
            {id: 3, name: "Store A", x: 150, y: 150, type: "delivery", demand: 20},
            {id: 4, name: "Store B", x: 250, y: 100, type: "delivery", demand: 15},
            {id: 5, name: "Store C", x: 350, y: 200, type: "delivery", demand: 30},
            {id: 6, name: "Store D", x: 300, y: 280, type: "delivery", demand: 25},
            {id: 7, name: "Store E", x: 200, y: 250, type: "delivery", demand: 18}
        ]
    }
};

// Global state
let currentAlgorithm = 'dijkstra';
let currentScenario = 'urban';
let locations = [...scenarios.urban.locations];
let optimizedRoutes = [];
let isAddingLocation = false;

// DOM Elements
const algorithmSelect = document.getElementById('algorithm-select');
const scenarioSelect = document.getElementById('scenario-select');
const optimizeBtn = document.getElementById('optimize-btn');
const routeMap = document.getElementById('route-map');
const ctx = routeMap.getContext('2d');
const capacitySlider = document.getElementById('capacity-slider');
const capacityValue = document.getElementById('capacity-value');
const fuelCostInput = document.getElementById('fuel-cost');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    populateDropdowns();
    initializeMap();
    updateAlgorithmDetails();
    setupEventListeners();
    drawDemandForecast();
    updateMetrics();
});

// Populate dropdown options
function populateDropdowns() {
    // Populate algorithm dropdown
    algorithmSelect.innerHTML = '';
    Object.keys(algorithms).forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = algorithms[key].name;
        algorithmSelect.appendChild(option);
    });

    // Populate scenario dropdown
    scenarioSelect.innerHTML = '';
    Object.keys(scenarios).forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = scenarios[key].name;
        scenarioSelect.appendChild(option);
    });
}

// Event Listeners
function setupEventListeners() {
    algorithmSelect.addEventListener('change', function() {
        currentAlgorithm = this.value;
        updateAlgorithmDetails();
        if (optimizedRoutes.length > 0) {
            optimizeRoutes();
        }
    });

    scenarioSelect.addEventListener('change', function() {
        currentScenario = this.value;
        loadScenarioData();
    });

    optimizeBtn.addEventListener('click', optimizeRoutes);

    routeMap.addEventListener('click', function(e) {
        if (isAddingLocation) {
            addLocationToMap(e);
        }
    });

    document.getElementById('add-location-btn').addEventListener('click', function() {
        isAddingLocation = !isAddingLocation;
        this.textContent = isAddingLocation ? 'Cancel Adding' : 'Add Location';
        if (isAddingLocation) {
            this.classList.remove('btn--secondary');
            this.classList.add('btn--primary');
        } else {
            this.classList.remove('btn--primary');
            this.classList.add('btn--secondary');
        }
        routeMap.style.cursor = isAddingLocation ? 'crosshair' : 'default';
    });

    document.getElementById('clear-routes-btn').addEventListener('click', function() {
        optimizedRoutes = [];
        drawMap();
        updateMetrics();
    });

    capacitySlider.addEventListener('input', function() {
        capacityValue.textContent = this.value;
        if (optimizedRoutes.length > 0) {
            updateMetrics();
        }
    });

    fuelCostInput.addEventListener('input', function() {
        if (optimizedRoutes.length > 0) {
            updateMetrics();
        }
    });

    // Case study interactions
    document.querySelectorAll('.case-study-card').forEach(card => {
        card.addEventListener('click', function() {
            document.querySelectorAll('.case-study-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
        });
    });

    // Export functionality
    document.getElementById('export-pdf-btn').addEventListener('click', exportToPDF);
    document.getElementById('export-csv-btn').addEventListener('click', exportToCSV);
    document.getElementById('save-scenario-btn').addEventListener('click', saveScenario);

    // ML feature buttons
    document.querySelectorAll('.ml-features-grid .btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.classList.add('loading');
            setTimeout(() => {
                this.classList.remove('loading');
                showNotification('Feature executed successfully!', 'success');
            }, 2000);
        });
    });
}

// Map Functions
function initializeMap() {
    routeMap.width = routeMap.offsetWidth;
    routeMap.height = 400;
    drawMap();
}

function drawMap() {
    ctx.clearRect(0, 0, routeMap.width, routeMap.height);
    
    // Draw grid background
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < routeMap.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, routeMap.height);
        ctx.stroke();
    }
    for (let y = 0; y < routeMap.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(routeMap.width, y);
        ctx.stroke();
    }

    // Draw routes first (so they appear behind locations)
    if (optimizedRoutes.length > 0) {
        drawRoutes();
    }

    // Draw locations
    locations.forEach(location => {
        drawLocation(location);
    });
}

function drawLocation(location) {
    const radius = location.type === 'depot' ? 12 : 8;
    const color = location.type === 'depot' ? '#1FB8CD' : '#FFC185';
    
    // Draw location circle
    ctx.beginPath();
    ctx.arc(location.x, location.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw label
    ctx.fillStyle = '#333';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(location.name, location.x, location.y - radius - 8);
    
    if (location.type === 'delivery') {
        ctx.font = '10px sans-serif';
        ctx.fillStyle = '#666';
        ctx.fillText(`(${location.demand})`, location.x, location.y + radius + 12);
    }
}

function drawRoutes() {
    if (optimizedRoutes.length < 2) return;

    ctx.strokeStyle = '#B4413C';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Draw route lines
    ctx.beginPath();
    for (let i = 0; i < optimizedRoutes.length - 1; i++) {
        const fromLocation = locations.find(l => l.id === optimizedRoutes[i]);
        const toLocation = locations.find(l => l.id === optimizedRoutes[i + 1]);
        
        if (fromLocation && toLocation) {
            if (i === 0) {
                ctx.moveTo(fromLocation.x, fromLocation.y);
            }
            ctx.lineTo(toLocation.x, toLocation.y);
        }
    }
    ctx.stroke();
    
    // Draw direction arrows
    ctx.fillStyle = '#B4413C';
    for (let i = 0; i < optimizedRoutes.length - 1; i++) {
        const fromLocation = locations.find(l => l.id === optimizedRoutes[i]);
        const toLocation = locations.find(l => l.id === optimizedRoutes[i + 1]);
        
        if (fromLocation && toLocation) {
            const angle = Math.atan2(toLocation.y - fromLocation.y, toLocation.x - fromLocation.x);
            const midX = (fromLocation.x + toLocation.x) / 2;
            const midY = (fromLocation.y + toLocation.y) / 2;
            
            // Draw arrow at midpoint
            const arrowSize = 8;
            ctx.save();
            ctx.translate(midX, midY);
            ctx.rotate(angle);
            
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-arrowSize, -arrowSize / 2);
            ctx.lineTo(-arrowSize, arrowSize / 2);
            ctx.closePath();
            ctx.fill();
            
            ctx.restore();
        }
    }
}

function addLocationToMap(e) {
    const rect = routeMap.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Ensure click is within canvas bounds
    if (x < 0 || x > routeMap.width || y < 0 || y > routeMap.height) {
        return;
    }
    
    const deliveryStores = locations.filter(l => l.type === 'delivery');
    const nextLetter = String.fromCharCode(65 + deliveryStores.length);
    
    const newLocation = {
        id: Math.max(...locations.map(l => l.id)) + 1,
        name: `Store ${nextLetter}`,
        x: x,
        y: y,
        type: 'delivery',
        demand: Math.floor(Math.random() * 30) + 10
    };
    
    locations.push(newLocation);
    drawMap();
    
    // Reset add location mode
    isAddingLocation = false;
    const addBtn = document.getElementById('add-location-btn');
    addBtn.textContent = 'Add Location';
    addBtn.classList.remove('btn--primary');
    addBtn.classList.add('btn--secondary');
    routeMap.style.cursor = 'default';
    
    showNotification(`Added ${newLocation.name} with demand ${newLocation.demand}`, 'success');
}

// Algorithm Functions
function updateAlgorithmDetails() {
    const algorithm = algorithms[currentAlgorithm];
    document.getElementById('selected-algorithm-name').textContent = algorithm.name;
    document.getElementById('algorithm-description').textContent = algorithm.description;
    document.getElementById('algorithm-complexity').textContent = algorithm.complexity;
    document.getElementById('algorithm-best-for').textContent = algorithm.bestFor;
    document.getElementById('algorithm-time').textContent = `${algorithm.computationTime}s`;
}

function optimizeRoutes() {
    optimizeBtn.classList.add('loading');
    optimizeBtn.textContent = 'Optimizing...';
    optimizeBtn.disabled = true;
    
    const algorithm = algorithms[currentAlgorithm];
    
    setTimeout(() => {
        // Get depot and delivery points
        const depots = locations.filter(l => l.type === 'depot');
        const deliveryPoints = locations.filter(l => l.type === 'delivery');
        
        if (depots.length === 0 || deliveryPoints.length === 0) {
            showNotification('Need at least one depot and one delivery point', 'error');
            optimizeBtn.classList.remove('loading');
            optimizeBtn.textContent = 'Optimize Routes';
            optimizeBtn.disabled = false;
            return;
        }
        
        // For multi-depot, use first depot; in real implementation would be more sophisticated
        const depot = depots[0];
        
        // Simple nearest neighbor algorithm for demonstration
        optimizedRoutes = [depot.id];
        let unvisited = [...deliveryPoints];
        let currentLocation = depot;
        
        while (unvisited.length > 0) {
            let nearestLocation = unvisited[0];
            let minDistance = calculateDistance(currentLocation, nearestLocation);
            
            for (let i = 1; i < unvisited.length; i++) {
                const distance = calculateDistance(currentLocation, unvisited[i]);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestLocation = unvisited[i];
                }
            }
            
            optimizedRoutes.push(nearestLocation.id);
            unvisited = unvisited.filter(l => l.id !== nearestLocation.id);
            currentLocation = nearestLocation;
        }
        
        // Return to depot
        optimizedRoutes.push(depot.id);
        
        drawMap();
        updateMetrics();
        
        optimizeBtn.classList.remove('loading');
        optimizeBtn.textContent = 'Optimize Routes';
        optimizeBtn.disabled = false;
        
        showNotification(`Routes optimized using ${algorithm.name}!`, 'success');
    }, Math.max(500, algorithm.computationTime * 20)); // Minimum 500ms for user feedback
}

function calculateDistance(loc1, loc2) {
    return Math.sqrt(Math.pow(loc2.x - loc1.x, 2) + Math.pow(loc2.y - loc1.y, 2));
}

function updateMetrics() {
    const algorithm = algorithms[currentAlgorithm];
    const routeLength = optimizedRoutes.length > 0 ? calculateTotalRouteLength() : 0;
    const fuelCostPerMile = parseFloat(fuelCostInput.value) || 0.15;
    const fuelCost = (algorithm.avgRouteLength * fuelCostPerMile);
    const deliveryTime = algorithm.avgRouteLength / 35; // Assuming 35 mph average speed
    
    document.getElementById('route-length').textContent = algorithm.avgRouteLength;
    document.getElementById('cost-savings').textContent = `${algorithm.costSavings}%`;
    document.getElementById('delivery-time').textContent = `${deliveryTime.toFixed(1)}h`;
    document.getElementById('fuel-cost').textContent = `$${fuelCost.toFixed(2)}`;
}

function calculateTotalRouteLength() {
    let totalLength = 0;
    for (let i = 0; i < optimizedRoutes.length - 1; i++) {
        const from = locations.find(l => l.id === optimizedRoutes[i]);
        const to = locations.find(l => l.id === optimizedRoutes[i + 1]);
        if (from && to) {
            totalLength += calculateDistance(from, to);
        }
    }
    return totalLength;
}

// Scenario Management
function loadScenarioData() {
    if (scenarios[currentScenario]) {
        locations = [...scenarios[currentScenario].locations];
        optimizedRoutes = [];
        drawMap();
        updateMetrics();
        showNotification(`Loaded ${scenarios[currentScenario].name} scenario`, 'info');
    }
}

// Machine Learning Features
function drawDemandForecast() {
    const canvas = document.getElementById('demand-forecast');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    // Generate sample forecast data
    const days = 30;
    const data = [];
    for (let i = 0; i < days; i++) {
        const baseValue = 100 + Math.sin(i * 0.2) * 20;
        const trend = i * 1.5;
        const noise = (Math.random() - 0.5) * 10;
        data.push(Math.max(0, baseValue + trend + noise));
    }
    
    // Draw forecast line
    ctx.strokeStyle = '#1FB8CD';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let i = 0; i < data.length; i++) {
        const x = (i / (data.length - 1)) * (width - 40) + 20;
        const y = height - 20 - (data[i] / 150) * (height - 40);
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    ctx.stroke();
    
    // Draw confidence interval
    ctx.fillStyle = 'rgba(31, 184, 205, 0.2)';
    ctx.beginPath();
    
    for (let i = 0; i < data.length; i++) {
        const x = (i / (data.length - 1)) * (width - 40) + 20;
        const y1 = height - 20 - ((data[i] - 10) / 150) * (height - 40);
        
        if (i === 0) {
            ctx.moveTo(x, y1);
        } else {
            ctx.lineTo(x, y1);
        }
    }
    
    for (let i = data.length - 1; i >= 0; i--) {
        const x = (i / (data.length - 1)) * (width - 40) + 20;
        const y = height - 20 - ((data[i] + 10) / 150) * (height - 40);
        ctx.lineTo(x, y);
    }
    
    ctx.closePath();
    ctx.fill();
    
    // Add axis labels
    ctx.fillStyle = '#666';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Day 1', 20, height - 5);
    ctx.textAlign = 'right';
    ctx.fillText('Day 30', width - 20, height - 5);
    ctx.textAlign = 'left';
    ctx.fillText('Demand', 5, 15);
}

// Export Functions
function exportToPDF() {
    showNotification('PDF export functionality would be implemented with a PDF library like jsPDF', 'info');
}

function exportToCSV() {
    let csvContent = "Location,Type,X,Y,Demand\n";
    locations.forEach(loc => {
        csvContent += `${loc.name},${loc.type},${loc.x},${loc.y},${loc.demand}\n`;
    });
    
    if (optimizedRoutes.length > 0) {
        csvContent += "\nOptimized Route:\n";
        csvContent += "Step,Location\n";
        optimizedRoutes.forEach((locationId, index) => {
            const loc = locations.find(l => l.id === locationId);
            csvContent += `${index + 1},${loc ? loc.name : 'Unknown'}\n`;
        });
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'route_optimization_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showNotification('CSV data exported successfully!', 'success');
}

function saveScenario() {
    const scenario = {
        name: `${scenarios[currentScenario].name} - Custom`,
        algorithm: currentAlgorithm,
        locations: locations,
        routes: optimizedRoutes,
        metrics: {
            routeLength: document.getElementById('route-length').textContent,
            costSavings: document.getElementById('cost-savings').textContent,
            deliveryTime: document.getElementById('delivery-time').textContent,
            fuelCost: document.getElementById('fuel-cost').textContent
        },
        timestamp: new Date().toISOString()
    };
    
    // In a real application, this would save to a backend
    console.log('Scenario saved:', scenario);
    showNotification('Scenario saved successfully!', 'success');
}

// Utility Functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-base);
        padding: var(--space-16);
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        max-width: 350px;
        animation: slideIn 0.3s ease-out;
    `;
    
    if (type === 'success') {
        notification.style.borderLeft = '4px solid var(--color-success)';
    } else if (type === 'error') {
        notification.style.borderLeft = '4px solid var(--color-error)';
    } else if (type === 'warning') {
        notification.style.borderLeft = '4px solid var(--color-warning)';
    } else {
        notification.style.borderLeft = '4px solid var(--color-info)';
    }
    
    document.body.appendChild(notification);
    
    // Close button functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Add CSS for notification animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .notification-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
    }
    
    .notification-close {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: var(--color-text-secondary);
        padding: 0;
        min-width: 20px;
        height: 20px;
    }
    
    .notification-close:hover {
        color: var(--color-text);
    }
    
    .notification-message {
        flex: 1;
        font-size: var(--font-size-sm);
        line-height: 1.4;
    }
`;
document.head.appendChild(style);

// Resize handler for responsive map
window.addEventListener('resize', function() {
    if (routeMap && routeMap.getContext) {
        setTimeout(() => {
            initializeMap();
        }, 100);
    }
});
