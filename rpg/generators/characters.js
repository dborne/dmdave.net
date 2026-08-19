// State Management
const state = {
  currentCharacter: null,
  isLoading: false,
  availableRaces: [],
  availableClasses: [],
  selectedRaces: [],
  selectedClasses: [],
  quantity: 1
};

// Constants
const ABILITY_NAMES = {
  'str': 'strength',
  'dex': 'dexterity',
  'con': 'constitution',
  'int': 'intelligence',
  'wis': 'wisdom',
  'cha': 'charisma'
};

const ABILITY_ORDER = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

const COIN_ORDER = ['cp', 'sp', 'ep', 'gp', 'pp'];

// API Layer
async function fetchRaces() {
  const response = await fetch('https://api.dborne.com/rpg/generator/characters/races');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

async function fetchClasses() {
  const response = await fetch('https://api.dborne.com/rpg/generator/characters/classes');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

async function fetchCharacter() {
  // Build query parameters
  const params = new URLSearchParams();

  if (state.selectedRaces.length > 0) {
    params.append('races', state.selectedRaces.join(','));
  }

  if (state.selectedClasses.length > 0) {
    params.append('classes', state.selectedClasses.join(','));
  }

  const url = `https://api.dborne.com/rpg/generator/character${params.toString() ? '?' + params.toString() : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  // Ensure minimum 4 attacks
  while (data.attacks.length < 4) {
    data.attacks.push({ name: '', atk_bonus: '', damage: '', properties: '' });
  }

  // Ensure minimum 5 gear items
  while (data.gear.length < 5) {
    data.gear.push('');
  }

  // Prefix description with name
  data.description = data.name + ' is ' + data.description;

  return data;
}

// Render Functions
function renderAbilities(abilities) {
  return ABILITY_ORDER.map(attrib => `
    <div class="ability">
      <label for="${attrib}">${ABILITY_NAMES[attrib]}</label>
      <input type="text" id="${attrib}" class="inset" value="${abilities[attrib].modstr}">
      <input type="text" id="${attrib}-mod" value="${abilities[attrib].val}">
    </div>
  `).join('');
}

function renderSkills(skills) {
  const sortedSkills = Object.keys(skills).sort();

  return sortedSkills.map(skillName => {
    const skill = skills[skillName];
    const checked = skill.prof ? 'checked' : '';

    return `
      <div class="skill">
        <input type="checkbox" class="prof" ${checked}>
        <span class="proficiency-cover"></span>
        <input type="text" class="skillbox" id="${skillName}" value="${skill.valstr}">
        <label for="${skillName}">${skillName} <span class="grey">(${skill.ability})</span></label>
      </div>
    `;
  }).join('');
}

function renderAttacks(attacks) {
  return attacks.map((attack, index) => `
    <div class="attack">
      <div class="attack_flex">
        <input class="name" type="text" value="${attack.name}">
        <input type="text" value="${attack.atk_bonus}">
        <input type="text" value="${attack.damage}">
      </div>
      <input class="desc" type="text" value="${attack.properties || ''}">
    </div>
  `).join('');
}

function renderMoney(money) {
  return COIN_ORDER.map(coinType => `
    <div class="coin_box">
      <input type="text" id="${coinType}" value="${money[coinType]}">
      <label for="${coinType}">${coinType}</label>
    </div>
  `).join('');
}

function renderGear(gear) {
  return gear.map((item, index) => `
    <span class="gear_underline">
      <input type="text" value="${item}">
    </span>
  `).join('');
}

function createCharacterSheet() {
  return `
    <div class="charsheet">
        <div class="name_block">
            <span>
                <label for="name">name</label>
                <input type="text" class="char-name">
            </span>
            <span>
                <label for="race">race</label>
                <input type="text" class="char-race">
            </span>
            <span>
                <label for="class">class</label>
                <input type="text" class="char-class">
            </span>
        </div>
        <div class="stats_block">
            <span class="abilities">
                <!-- Abilities will be injected here by JS -->
            </span>
            <span class="skills">
                <div class="proficiency">
                    <input type="text" class="proficiency_bonus">
                    <label for="proficiency_bonus">proficiency bonus</label>
                </div>
                <div class="skill_list">
                    <!-- Skills will be injected here by JS -->
                </div>
            </span>
            <span class="combat">
                <div class="topstats">
                    <span class="acblock">
                        <span class="shield">
                          <svg width="68.09745" height="80.000008" viewBox="0 0 18.01745 21.166669" >
                            <path
                              style="color:#000000;fill:none;stroke:#000000;stroke-width:0.26458332;"
                              d="m 15.317336,2.1605376 c 0.373114,1.7473615 1.161091,3.1057885 2.541419,3.908887 V 10.736915 C 15.506331,17.702453 12.289212,19.53747 8.9945553,20.996499 5.6998989,19.53747 2.4827799,17.702453 0.13035566,10.736915 V 6.0694246 C 1.5106839,5.2663261 2.2986609,3.9078991 2.6717749,2.1605376 L 8.9945553,0.16643662 Z m -0.874559,0.9794061 c 0.387803,1.7657213 1.127621,3.0137012 2.328882,3.5829959 V 10.483601 C 15.429471,14.911714 12.870686,18.031985 8.9945553,19.751342 5.1184249,18.031985 2.5596399,14.911714 1.2174519,10.483601 V 6.7229396 C 2.4187129,6.1536449 3.1585309,4.905665 3.5463339,3.1399437 L 8.9945553,1.4133256 Z"
                              />
                          </svg>
                        </span>
                        <input type="text" class="char-ac">
                        <label for="ac">armor class</label>
                    </span>
                    <span class="initblock">
                        <input type="text" class="char-init">
                        <label for="init">initiative</label>
                    </span>
                    <span class="speedblock">
                        <input type="text" class="char-speed">
                        <label for="speed">speed</label>
                    </span>
                </div>
                <div class="hpblock">
                    <div class="hp">
                        <input class="char-hpmax" type="text">
                        <label for="hpmax">max hp</label>
                        <input class="char-hpcurr" type="text">
                        <label for="hpcurr">current hit points</label>
                    </div>
                    <div class="hp">
                        <input type="text" class="char-hptemp">
                        <label for="hptemp">temporary hit points</label>
                    </div>
                </div>
                <div class="hdblock">
                    <span class="hd">
                        <input class="char-hdtotal" type="text">
                        <label for="hdtotal">total</label>
                        <input class="char-hdcurr" type="text">
                        <label for="hdcurr">hit dice</label>
                    </span>
                    <span class="deathsave">
                        <span class="deathboxes">
                            <label>successes</label>
                            <span class="checkbox-holder">
                                <input type="checkbox" class="dsave">
                                <span class="dsave-cover"></span>
                            </span>
                            <span class="checkbox-holder">
                                <input type="checkbox" class="dsave">
                                <span class="dsave-cover"></span>
                            </span>
                            <span class="checkbox-holder">
                                <input type="checkbox" class="dsave">
                                <span class="dsave-cover"></span>
                            </span>
                        </span>
                        <span class="deathboxes">
                            <label>failures</label>
                            <span class="checkbox-holder">
                                <input type="checkbox" class="dsave">
                                <span class="dsave-cover"></span>
                            </span>
                            <span class="checkbox-holder">
                                <input type="checkbox" class="dsave">
                                <span class="dsave-cover"></span>
                            </span>
                            <span class="checkbox-holder">
                                <input type="checkbox" class="dsave">
                                <span class="dsave-cover"></span>
                            </span>
                        </span>
                        <label>death saves</label>
                    </span>
                </div>
            </span>
            <span class="gear">
                <div class="attackblock">
                    <div class="attack_labels">
                        <div class="attack_flex">
                            <span class="name">name</span>
                            <span>atk bonus</span>
                            <span>damage</span>
                        </div>
                    </div>
                    <div class="attacks-container">
                        <!-- Attacks will be injected here by JS -->
                    </div>
                    <label>attacks &amp; spellcasting</label>
                </div>
                <div class="gearblock">
                    <span class="money">
                        <!-- Money will be injected here by JS -->
                    </span>
                    <span class="gearlist gear-list">
                        <!-- Gear will be injected here by JS -->
                    </span>
                    <label>equipment</label>
                </div>
                <div class="description">
                    <textarea></textarea>
                    <label>description</label>
                </div>
            </span>
        </div>
    </div>
  `;
}

function renderCharacter(data, sheetElement) {
  // Simple fields
  sheetElement.querySelector('.char-name').value = data.name;
  sheetElement.querySelector('.char-race').value = data.race;
  sheetElement.querySelector('.char-class').value = data.job;
  sheetElement.querySelector('.char-ac').value = data.ac;
  sheetElement.querySelector('.char-init').value = data.initiative;
  sheetElement.querySelector('.char-speed').value = data.speed;
  sheetElement.querySelector('.char-hpmax').value = data.hit_points;
  sheetElement.querySelector('.char-hdtotal').value = data.hit_dice;
  sheetElement.querySelector('.proficiency_bonus').value = data.proficiency_bonus.valstr;
  sheetElement.querySelector('.description textarea').value = data.description;

  // Complex sections with rendering
  sheetElement.querySelector('.abilities').innerHTML = renderAbilities(data.abilities);
  sheetElement.querySelector('.skill_list').innerHTML = renderSkills(data.skills) + '<span class="skill_label">skills</span>';
  sheetElement.querySelector('.attacks-container').innerHTML = renderAttacks(data.attacks);
  sheetElement.querySelector('.money').innerHTML = renderMoney(data.money);
  sheetElement.querySelector('.gear-list').innerHTML = renderGear(data.gear);
}

// UI State Management
function showLoading() {
  state.isLoading = true;
  document.getElementById('loading-overlay').classList.remove('hidden');
  document.getElementById('generate-button').disabled = true;
}

function hideLoading() {
  state.isLoading = false;
  document.getElementById('loading-overlay').classList.add('hidden');
  document.getElementById('generate-button').disabled = false;
}

function showError(message) {
  const errorDiv = document.getElementById('error-message');
  errorDiv.querySelector('.error-text').textContent = message;
  errorDiv.classList.remove('hidden');
}

function hideError() {
  document.getElementById('error-message').classList.add('hidden');
}

// Config Modal Management
function showConfig() {
  document.getElementById('config-modal').classList.remove('hidden');
}

function hideConfig() {
  document.getElementById('config-modal').classList.add('hidden');
}

function renderRaceCheckboxes() {
  const container = document.getElementById('race-checkboxes');

  if (!container) {
    console.error('race-checkboxes container not found!');
    return;
  }

  container.innerHTML = state.availableRaces.map(race => {
    const checked = state.selectedRaces.includes(race) ? 'checked' : '';
    return `
      <label class="config-checkbox">
        <input type="checkbox" value="${race}" ${checked} data-type="race">
        <span>${race}</span>
      </label>
    `;
  }).join('');
}

function renderClassCheckboxes() {
  const container = document.getElementById('class-checkboxes');

  if (!container) {
    console.error('class-checkboxes container not found!');
    return;
  }

  container.innerHTML = state.availableClasses.map(className => {
    const checked = state.selectedClasses.includes(className) ? 'checked' : '';
    return `
      <label class="config-checkbox">
        <input type="checkbox" value="${className}" ${checked} data-type="class">
        <span>${className}</span>
      </label>
    `;
  }).join('');
}

function handleCheckboxChange(event) {
  const checkbox = event.target;
  const value = checkbox.value;
  const type = checkbox.dataset.type;

  if (type === 'race') {
    if (checkbox.checked) {
      if (!state.selectedRaces.includes(value)) {
        state.selectedRaces.push(value);
      }
    } else {
      state.selectedRaces = state.selectedRaces.filter(r => r !== value);
    }
  } else if (type === 'class') {
    if (checkbox.checked) {
      if (!state.selectedClasses.includes(value)) {
        state.selectedClasses.push(value);
      }
    } else {
      state.selectedClasses = state.selectedClasses.filter(c => c !== value);
    }
  }
}

function selectAllRaces() {
  state.selectedRaces = [...state.availableRaces];
  renderRaceCheckboxes();
}

function deselectAllRaces() {
  state.selectedRaces = [];
  renderRaceCheckboxes();
}

function selectAllClasses() {
  state.selectedClasses = [...state.availableClasses];
  renderClassCheckboxes();
}

function deselectAllClasses() {
  state.selectedClasses = [];
  renderClassCheckboxes();
}

// Event Handlers
async function handleGenerateClick() {
  if (state.isLoading) return;

  hideError();
  showLoading();

  try {
    const container = document.getElementById('charsheet-container');
    container.innerHTML = '';

    // Generate multiple characters
    const promises = [];
    for (let i = 0; i < state.quantity; i++) {
      promises.push(fetchCharacter());
    }

    const characters = await Promise.all(promises);

    // Create and render each character sheet
    characters.forEach(character => {
      const sheetHTML = createCharacterSheet();
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = sheetHTML;
      const sheetElement = tempDiv.firstElementChild;

      container.appendChild(sheetElement);
      renderCharacter(character, sheetElement);
    });

    hideLoading();
  } catch (error) {
    console.error('Failed to fetch character:', error);
    hideLoading();
    showError('Failed to generate characters. Please try again.');
  }
}

function handleQuantityChange(event) {
  const value = parseInt(event.target.value);
  if (value > 0 && value <= 100) {
    state.quantity = value;
  }
}

// Initialization
async function init() {
  // Bind event listeners
  document.getElementById('generate-button').addEventListener('click', handleGenerateClick);
  document.getElementById('retry-button').addEventListener('click', handleGenerateClick);
  document.getElementById('config-button').addEventListener('click', showConfig);
  document.getElementById('config-close').addEventListener('click', hideConfig);
  document.getElementById('quantity-input').addEventListener('change', handleQuantityChange);
  document.getElementById('config-save').addEventListener('click', () => {
    hideConfig();
    handleGenerateClick();
  });

  // Select all buttons
  document.getElementById('race-select-all').addEventListener('click', selectAllRaces);
  document.getElementById('race-deselect-all').addEventListener('click', deselectAllRaces);
  document.getElementById('class-select-all').addEventListener('click', selectAllClasses);
  document.getElementById('class-deselect-all').addEventListener('click', deselectAllClasses);

  // Checkbox delegation
  document.getElementById('race-checkboxes').addEventListener('change', handleCheckboxChange);
  document.getElementById('class-checkboxes').addEventListener('change', handleCheckboxChange);

  // Close modal on backdrop click
  document.getElementById('config-modal').addEventListener('click', (e) => {
    if (e.target.id === 'config-modal') {
      hideConfig();
    }
  });

  // Load configuration options
  try {
    const racesData = await fetchRaces();
    const classesData = await fetchClasses();

    // Handle different response formats
    state.availableRaces = Array.isArray(racesData) ? racesData : (racesData.races || []);
    state.availableClasses = Array.isArray(classesData) ? classesData : (classesData.classes || []);

    // Default: all selected
    state.selectedRaces = [...state.availableRaces];
    state.selectedClasses = [...state.availableClasses];

    renderRaceCheckboxes();
    renderClassCheckboxes();
  } catch (error) {
    console.error('Failed to load config options:', error);
  }

  // Load initial character
  await handleGenerateClick();
}

document.addEventListener('DOMContentLoaded', init);
