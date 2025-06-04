// 📄 Modular Subdomain Layout Logic (Outline)
// Purpose: Encapsulate subdomain layout rendering into a self-contained, reusable function
// - Calculates column span dynamically
// - Determines if subdomain should be rendered (skip if no visible certs)
// - Returns DOM elements and layout metadata

/**
 * Create a subdomain container with filtered certs
 * @param {Object} subdomain - Subdomain object from subdomains.json
 * @param {string} domainId - Parent domainId
 * @param {Array} certs - All certs (filtered by current filters)
 * @param {Array} visibleSkillLevels - Array of skill levels to show (e.g., ["Beginner", "Intermediate"])
 * @returns {HTMLElement|null} - Returns subdomain DOM element or null if nothing to show
 */
function createSubdomainLayout(subdomain, domainId, certs, visibleSkillLevels) {
  const visibleRows = getVisibleRowNumbersForSkillLevels(visibleSkillLevels);

  // Filter certs for this subdomain
  const filteredCerts = certs.filter(cert => {
    const inThisSubdomain = cert.subdomainId === subdomain.subdomainId;
    const isVisibleStrata = visibleRows.includes(cert.certSkillStrata);
    return inThisSubdomain && isVisibleStrata;
  });

  if (filteredCerts.length === 0) return null; // Skip drawing empty subdomains

  // Determine max number of tiles in any one row
  const rowTileCount = {};
  filteredCerts.forEach(cert => {
    const row = cert.certSkillStrata;
    rowTileCount[row] = (rowTileCount[row] || 0) + 1;
  });

  const maxCols = Math.max(...Object.values(rowTileCount));

  // Create subdomain container
  const subDiv = document.createElement('div');
  subDiv.classList.add('subdomain-container', `subdomain-${subdomain.subdomainId}`);
  subDiv.style.gridTemplateColumns = `repeat(${maxCols}, 2.3vmax)`;
  subDiv.style.gridTemplateRows = `repeat(27, 1.5vmax)`;
  subDiv.style.gridColumnStart = subdomain.gridColumnStart;
  subDiv.style.gridColumnEnd = `span ${maxCols}`;
  subDiv.style.gridRowStart = subdomain.gridRowStart;
  subDiv.style.gridRowEnd = `span ${subdomain.gridRowSpan}`;

  // Optional canvas background
  const canvas = document.createElement('div');
  canvas.classList.add('subdomain-canvas');
  canvas.style.gridRowStart = subdomain.gridRowStart;
  canvas.style.gridRowEnd = `span ${subdomain.gridRowSpan}`;
  canvas.style.gridColumnStart = subdomain.gridColumnStart;
  canvas.style.gridColumnEnd = `span ${maxCols}`;

  // Append tiles to subdomain
  const tileRowMap = {};
  filteredCerts.forEach(cert => {
    const row = cert.certSkillStrata;
    tileRowMap[row] = (tileRowMap[row] || 0) + 1;
    const col = tileRowMap[row];

    const tile = makeCertTile(cert, window.loadedDomains, domainId, subdomain.subdomainId);
    tile.style.gridRowStart = row;
    tile.style.gridColumnStart = col;
    subDiv.appendChild(tile);
  });

  return { container: subDiv, canvas }; // Return both for insertion
}

/**
 * Translate visible skill level labels to row numbers
 */
function getVisibleRowNumbersForSkillLevels(levels) {
  const strataRowMap = {
    Beginner: [22, 23, 24, 25, 26, 27, 28],
    Intermediate: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
    Expert: [2, 3, 4, 5, 6, 7, 8, 9]
  };
  return levels.flatMap(level => strataRowMap[level] || []);
}
