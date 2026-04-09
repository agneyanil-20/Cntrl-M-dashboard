// ══════════════════════════════════════════
// SUPABASE CONFIGURATION
// ══════════════════════════════════════════
const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';

let supabase = null;
if (SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE' && window.supabase) {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// ══════════════════════════════════════════
// MOCK STATE DATA TEMPLATES (Fallback)
// ══════════════════════════════════════════
const mockProfiles = [
  { id: 'usr_admin', name: 'Admin', role: 'admin', auth: 'avocado123', avatar: 'AD' },
  // Designers
  { id: 'usr_neha', name: 'Neha', role: 'designer', avatar: 'NH', auth: 'neha123' },
  { id: 'usr_agney', name: 'Agney', role: 'designer', avatar: 'AG', auth: 'agney123' },
  { id: 'usr_nived', name: 'Nived', role: 'designer', avatar: 'NV', auth: 'nived123' },
  // Video Editors
  { id: 'usr_sijin', name: 'Sijin', role: 'video', avatar: 'SJ', auth: 'sijin123' },
  { id: 'usr_shawn', name: 'Shawn', role: 'video', avatar: 'SH', auth: 'shawn123' },
  { id: 'usr_adil', name: 'Adil', role: 'video', avatar: 'AD', auth: 'adil123' },
  { id: 'usr_hari', name: 'Hari', role: 'video', avatar: 'HR', auth: 'hari123' },
  { id: 'usr_abhay', name: 'Abhay', role: 'video', avatar: 'AB', auth: 'abhay123' },
  // Social Media
  { id: 'usr_megha', name: 'Megha', role: 'social', avatar: 'MG', auth: 'megha123' },
  { id: 'usr_christi', name: 'Christi', role: 'social', avatar: 'CH', auth: 'christi123' },
  // Content Writer
  { id: 'usr_dilna', name: 'Dilna', role: 'content', avatar: 'DL', auth: 'mango123' }
];

const mockClients = [
  // Neha's Clients
  { id: 'cli_nails', name: 'Nails', cycle_start_day: 1, cycle_end_day: 30, owner: 'usr_neha' },
  { id: 'cli_pantry', name: 'Pantry', cycle_start_day: 5, cycle_end_day: 5, owner: 'usr_neha' },
  { id: 'cli_lakme', name: 'Lakmé', cycle_start_day: 10, cycle_end_day: 10, owner: 'usr_neha' },
  // Agney's Clients
  { id: 'cli_tredha', name: 'Tredha', cycle_start_day: 15, cycle_end_day: 15, owner: 'usr_agney' },
  { id: 'cli_flev', name: 'Flev', cycle_start_day: 1, cycle_end_day: 30, owner: 'usr_agney' },
  { id: 'cli_aura', name: 'Aura', cycle_start_day: 20, cycle_end_day: 20, owner: 'usr_agney' },
  // Nived's Clients
  { id: 'cli_copper', name: 'Copper', cycle_start_day: 2, cycle_end_day: 2, owner: 'usr_nived' },
  { id: 'cli_urban', name: 'Urban', cycle_start_day: 8, cycle_end_day: 8, owner: 'usr_nived' },
  { id: 'cli_zest', name: 'Zest', cycle_start_day: 12, cycle_end_day: 12, owner: 'usr_nived' }
];

// Today's date helper
const today = new Date();
const addDays = (n) => new Date(today.getTime() + n * 24*60*60*1000).toISOString().split('T')[0];
const subDays = (n) => new Date(today.getTime() - n * 24*60*60*1000).toISOString().split('T')[0];

const mockCycles = [
  // Generating a cycle per client for the demo.
  { id: 'cyc_1', client_id: 'cli_nails', start_date: subDays(10), end_date: addDays(4), status: 'active', posting_status: 'Not Started' },
  { id: 'cyc_2', client_id: 'cli_flev', start_date: subDays(5), end_date: addDays(15), status: 'active', posting_status: 'Scheduled' },
  { id: 'cyc_3', client_id: 'cli_urban', start_date: subDays(20), end_date: subDays(1), status: 'active', posting_status: 'Not Started' }
];

let mockTasks = [
  { id: 't1', client_id: 'cli_nails', cycle_id: 'cyc_1', type: 'Poster', status: 'completed', assigned_to: 'usr_neha', link: 'http://figma.com/1' },
  { id: 't2', client_id: 'cli_nails', cycle_id: 'cyc_1', type: 'Video', status: 'in progress', assigned_to: 'usr_sijin', link: '' },
  
  { id: 't3', client_id: 'cli_flev', cycle_id: 'cyc_2', type: 'Poster', status: 'pending', assigned_to: 'usr_agney', link: '' },
  
  { id: 't4', client_id: 'cli_urban', cycle_id: 'cyc_3', type: 'Poster', status: 'completed', assigned_to: 'usr_nived', link: '' },
  { id: 't5', client_id: 'cli_urban', cycle_id: 'cyc_3', type: 'Video', status: 'completed', assigned_to: 'usr_adil', link: '' }
];

let currentUserId = null;
let currentUserRole = 'admin'; 

// ── Session variables (from localStorage/sessionStorage) ──
let sessionUserId = sessionStorage.getItem('cm_user_id');
let sessionUserRole = sessionStorage.getItem('cm_user_role');

// ── Screen States ──
const APP_STATES = {
  ROLE_SELECTION: 'roleSelection',
  NAME_SELECTION: 'nameSelection',
  PASSWORD_SCREEN: 'passwordScreen',
  DASHBOARD: 'dashboard'
};
let currentAppState = APP_STATES.ROLE_SELECTION;

// ══════════════════════════════════════════
// STATE MANAGEMENT & INTELLIGENCE
// ══════════════════════════════════════════

class AppState {
  constructor() {
    this.clients = mockClients;
    this.cycles = mockCycles;
    this.tasks = mockTasks;
    this.profiles = mockProfiles;
    this.listeners = [];
  }

  subscribe(fn) {
    this.listeners.push(fn);
  }

  notify() {
    this.listeners.forEach(fn => fn());
  }

  // --- Real-time actions ---
  updateTask(taskId, updates) {
    const idx = this.tasks.findIndex(t => t.id === taskId);
    if(idx > -1) {
      this.tasks[idx] = { ...this.tasks[idx], ...updates };
      this.notify();
    }
  }

  // --- Intelligence Getters ---
  getActiveCycles() {
    return this.cycles.filter(c => c.status === 'active');
  }

  getCycleMetrics(cycleId) {
    const tasks = this.tasks.filter(t => t.cycle_id === cycleId);
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

    const cycle = this.cycles.find(c => c.id === cycleId);
    const daysRem = Math.ceil((new Date(cycle.end_date) - new Date()) / (1000 * 60 * 60 * 24));
    
    // Logic: Urgent if <= 3 days. Near if <= 7 days. Risk if progress < 30% and Urgent.
    let urgency = 'safe';
    if(daysRem <= 3) urgency = 'urgent';
    else if(daysRem <= 7) urgency = 'near';

    const isRisk = urgency === 'urgent' && progress < 30;

    return { total, completed, progress, daysRem, urgency, isRisk };
  }
}

function setupLiquidHover() {
  document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.role-card');
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--x', `${x}%`);
      card.style.setProperty('--y', `${y}%`);
    });
  });
}

const state = new AppState();


// ══════════════════════════════════════════
// INITIALIZATION
// ══════════════════════════════════════════
// ══════════════════════════════════════════
// INITIALIZATION & ENTRY EXPERIENCE
// ══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', async () => {
  console.log("Cntrl M: DOMContentLoaded firing...");
  const isLoginPage = window.location.pathname.includes('login.html');
  if (isLoginPage) return;

  setupBaseUI();
  setupModals();
  setupLiquidHover();
  state.subscribe(renderDashboard);

  // Theme Toggle Handler
  const themeToggle = document.getElementById('themeToggle');
  if(themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('light-mode');
    });
  }

  // ── Explicitly Bind Role Cards ──
  // This bypasses any issues with inline onclick handlers
  document.querySelectorAll('#roleScreen .role-card').forEach(card => {
    card.addEventListener('click', function(e) {
      const roleName = this.querySelector('.role-name')?.textContent;
      let roleKey = '';
      if (roleName === 'Designer') roleKey = 'designer';
      else if (roleName === 'Video Editor') roleKey = 'video';
      else if (roleName === 'Social Media') roleKey = 'social';
      else if (roleName === 'Content Writer') roleKey = 'content';
      
      console.log("Card clicked manually:", roleName, roleKey);
      if (roleKey) selectRoleGroup(roleKey);
    });
  });

  // ══════════════════════════════════════════
  // CHECK SESSION FROM login.html
  // ══════════════════════════════════════════
  // Always check fresh session state on load
  const activeUserId = sessionStorage.getItem('cm_user_id');
  const activeUserRole = sessionStorage.getItem('cm_user_role');

  if (activeUserId && activeUserRole) {
    console.log("Authenticating from session:", activeUserId, activeUserRole);
    // Directly go to dashboard, bypassing overlays
    navigateToState(APP_STATES.DASHBOARD, { userId: activeUserId, role: activeUserRole });
    _bindAdminAuthForm();
    return;
  }

  // No session found: start at role selection
  console.log("No active session. Starting at role selection.");
  navigateToState(APP_STATES.ROLE_SELECTION);
  _bindAdminAuthForm();

  if(supabase) {
    supabase.channel('public:*').on('postgres_changes', { event: '*', schema: 'public' }, () => {}).subscribe();
  }
});

/**
 * Global Navigation System
 * States: roleSelection, nameSelection, passwordScreen, dashboard
 */
window.navigateToState = function(state, data = {}) {
  console.log(`Transitioning to state: ${state}`, data);
  currentAppState = state;

  const roleScreen = document.getElementById('roleScreen');
  const nameScreen = document.getElementById('nameScreen');
  const passModal = document.getElementById('adminAuthModal');
  const dashboard = document.getElementById('mainAppLayout');

  // Helper to reset screens to baseline
  const resetScreens = () => {
    [roleScreen, nameScreen].forEach(s => {
      if (s) s.style.display = 'none';
      if (s) s.style.opacity = '0';
    });
    if (passModal) passModal.classList.remove('active');
  };

  switch(state) {
    case APP_STATES.ROLE_SELECTION:
      resetScreens();
      roleScreen.style.display = 'flex';
      setTimeout(() => roleScreen.style.opacity = '1', 10);
      break;

    case APP_STATES.NAME_SELECTION:
      // data.role expected
      console.log("Populating names for:", data.role);
      _populateNameGrid(data.role);
      roleScreen.style.opacity = '0';
      setTimeout(() => {
        roleScreen.style.display = 'none';
        nameScreen.style.display = 'flex';
        setTimeout(() => nameScreen.style.opacity = '1', 10);
      }, 300);
      break;

    case APP_STATES.PASSWORD_SCREEN:
      // data.userId expected
      const user = mockProfiles.find(p => p.id === data.userId);
      if (!user && data.userId !== 'admin') {
        console.error("User not found for ID:", data.userId);
        return;
      }
      
      const userName = data.userId === 'admin' ? 'Admin' : user.name;
      passModal.querySelector('h2').textContent = `Logging in as ${userName}`;
      document.getElementById('adminAuthForm').dataset.userid = data.userId;
      document.getElementById('adminPassword').value = '';
      document.getElementById('adminAuthError').style.display = 'none';
      passModal.classList.add('active');
      setTimeout(() => document.getElementById('adminPassword').focus(), 300);
      break;

    case APP_STATES.DASHBOARD:
      resetScreens();
      finalizeLogin(data.userId || sessionUserId, data.role || sessionUserRole);
      break;
  }
};

function _populateNameGrid(role) {
  const grid = document.getElementById('nameGrid');
  if (!grid) return;
  grid.innerHTML = '';
  const users = mockProfiles.filter(p => p.role === role);
  
  if (users.length === 0) {
    console.warn("No users found for role:", role);
    grid.innerHTML = '<p style="color:var(--text-muted); text-align:center; width:100%;">No profiles found for this role.</p>';
  }

  users.forEach(u => {
    const icon = u.avatar && u.avatar.includes('F') ? 'ph-user-female' : 'ph-user';
    const btn = document.createElement('button');
    btn.className = 'role-card anim-enter';
    btn.style.padding = '30px 20px';
    btn.innerHTML = `
        <i class="ph ${icon}" style="font-size:28px;"></i>
        <span class="role-name">${u.name}</span>
    `;
    btn.onclick = () => navigateToState(APP_STATES.PASSWORD_SCREEN, { userId: u.id });
    grid.appendChild(btn);
  });
}

function _bindAdminAuthForm() {
  const form = document.getElementById('adminAuthForm');
  if (!form || form._bound) return;
  form._bound = true;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const pw           = document.getElementById('adminPassword').value;
    const targetUserId = form.dataset.userid;

    let valid      = false;
    let targetRole = 'admin';

    if (targetUserId === 'admin') {
      if (pw === 'avocado123') valid = true;
    } else {
      const user = state.profiles.find(p => p.id === targetUserId);
      if (user && pw === user.auth) {
        valid      = true;
        targetRole = user.role;
      }
    }

    if (valid) {
      document.getElementById('adminAuthError').style.display = 'none';
      document.getElementById('adminAuthModal').classList.remove('active');
      navigateToState(APP_STATES.DASHBOARD, { userId: (targetUserId === 'admin' ? 'usr_admin' : targetUserId), role: targetRole });
    } else {
      const errorMsg = document.getElementById('adminAuthError');
      errorMsg.textContent = 'Incorrect password';
      errorMsg.style.display = 'block';
      const modalContent = document.querySelector('#adminAuthModal .modal-content');
      if (modalContent) {
        modalContent.style.transform = 'translateY(0) scale(1) translateX(10px)';
        setTimeout(() => modalContent.style.transform = 'translateY(0) scale(1)', 100);
      }
    }
  });
}

window.selectRoleGroup = function(role) {
  navigateToState(APP_STATES.NAME_SELECTION, { role });
};

window.backToRoles = function() {
  navigateToState(APP_STATES.ROLE_SELECTION);
};

window.selectUserForAuth = function(userId) {
  navigateToState(APP_STATES.PASSWORD_SCREEN, { userId });
};

window.openAdminAuth = function() {
  navigateToState(APP_STATES.PASSWORD_SCREEN, { userId: 'admin' });
};

function finalizeLogin(userId, role = 'admin') {
  console.log("Finalizing login for:", userId, role);
  currentUserId = userId;
  currentUserRole = role;
  
  // Persist session
  sessionStorage.setItem('cm_user_id', userId);
  sessionStorage.setItem('cm_user_role', role);
  
  // Fade out entry screens
  const roleScreen = document.getElementById('roleScreen');
  const nameScreen = document.getElementById('nameScreen');
  const adminAuthModal = document.getElementById('adminAuthModal');
  
  if(roleScreen) roleScreen.style.opacity = '0';
  if(nameScreen) nameScreen.style.opacity = '0';
  if(adminAuthModal) adminAuthModal.classList.remove('active');
  
  setTimeout(() => {
    if(roleScreen) roleScreen.style.display = 'none';
    if(nameScreen) nameScreen.style.display = 'none';
    
    const layout = document.getElementById('mainAppLayout');
    if(layout) {
      layout.style.display = 'flex';
      setTimeout(() => { layout.style.opacity = '1'; }, 50);
    }

    // All DOM updates that require mainAppLayout to be visible
    const greeting = document.getElementById('userGreeting');
    if (greeting) {
      if (role === 'admin') greeting.textContent = 'Admin Dashboard — Full Control.';
      else if (role === 'social') greeting.textContent = 'Social Media Pipeline ready.';
      else if (role === 'content') greeting.textContent = 'Content workspace loaded.';
      else greeting.textContent = 'Welcome back. Here are your assignments.';
    }

    // Avatar update
    const user = state.profiles.find(p => p.id === userId);
    const avatarText = user && user.avatar ? user.avatar : 'CM';
    const avatarHtml = document.getElementById('userAvatar');
    if(avatarHtml) avatarHtml.innerHTML = `<span>${avatarText}</span>`;

    const adminControls = document.getElementById('adminControls');
    if(adminControls) {
      adminControls.style.display = role === 'admin' ? 'flex' : 'none';
    }
    document.querySelectorAll('[data-role="admin-only"]').forEach(el => {
      el.style.display = role === 'admin' ? '' : 'none';
    });

    const viewTabs = document.getElementById('clientViewTabs');
    if(viewTabs) viewTabs.style.display = 'flex';
    
    window.currentViewMode = 'my_clients';
    renderDashboard();
    
    // Logout handler — clear session and go back to login page
    const logoutBtn = document.getElementById('logoutBtn');
    if(logoutBtn) {
      logoutBtn.onclick = () => {
        layout.style.opacity = '0';
        setTimeout(() => {
          sessionStorage.removeItem('cm_user_id');
          sessionStorage.removeItem('cm_user_name');
          sessionStorage.removeItem('cm_user_role');
          window.location.href = 'login.html';
        }, 400);
      };
    }
  }, 450);
}

window.currentViewMode = 'my_clients';
window.switchView = function(viewStr) {
  window.currentViewMode = viewStr;
  document.querySelectorAll('.view-tab').forEach(t => t.classList.remove('active'));
  event?.currentTarget?.classList.add('active');
  renderDashboard();
};

window.updatePostingStatus = function(cycleId, statusStr) {
  const cyc = state.cycles.find(c => c.id === cycleId);
  if(cyc) {
    cyc.posting_status = statusStr;
    state.notify();
  }
};



// ══════════════════════════════════════════
// RENDER CONTROLLER
// ══════════════════════════════════════════
function renderDashboard() {
  renderDeadlineStrip();
  renderOverviewCards();
  renderClientGrid();

  // Hide team list for non-admins
  const teamSec = document.querySelector('.team-section');
  if(teamSec) teamSec.style.display = currentUserRole === 'admin' ? 'block' : 'none';

  // Update Ready To Post badge
  const readyModeCount = state.getActiveCycles().filter(cyc => {
     const m = state.getCycleMetrics(cyc.id);
     return m.progress === 100 && cyc.posting_status !== 'Posted';
  }).length;
  const readyBadge = document.getElementById('readyCount');
  if(readyBadge) readyBadge.textContent = readyModeCount;
}


function renderDeadlineStrip() {
  const container = document.getElementById('deadlineStrip');
  if (!container) return;

  container.innerHTML = '';
  
  // Sort Active Cycles by End Date (nearest first)
  const activeCycles = state.getActiveCycles().sort((a,b) => new Date(a.end_date) - new Date(b.end_date));

  activeCycles.forEach((cycle, i) => {
    const client = state.clients.find(c => c.id === cycle.client_id);
    const metrics = state.getCycleMetrics(cycle.id);

    let badgeClass = metrics.urgency === 'urgent' ? 'urgent-badge' : (metrics.urgency === 'near' ? 'near-badge' : 'safe-badge');
    let badgeText = metrics.urgency === 'urgent' ? 'URGENT' : (metrics.urgency === 'near' ? 'DUE SOON' : 'ON TRACK');
    let iconClass = metrics.urgency === 'urgent' ? 'ph-fire' : (metrics.urgency === 'near' ? 'ph-clock' : 'ph-check-circle');

    const html = `
      <div class="deadline-card ${metrics.urgency} anim-enter" style="animation-delay: ${i*0.05}s">
        <div class="deadline-status-bar"></div>
        <div class="deadline-content">
          <span class="deadline-badge ${badgeClass}">${badgeText}</span>
          <h3 class="deadline-client">${client.name}</h3>
          <p class="deadline-days"><span class="days-num">${metrics.daysRem}</span> days left</p>
        </div>
        <i class="ph ${iconClass} deadline-icon"></i>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
  });
}

function renderOverviewCards() {
  const container = document.getElementById('overviewGrid');
  if (!container) return;

  const totalClients = state.clients.length;
  const pendingTasks = state.tasks.filter(t => t.status === 'pending').length;
  const completedTasks = state.tasks.filter(t => t.status === 'completed').length;
  
  // Risk Intelligence
  const riskCycles = state.getActiveCycles().filter(c => state.getCycleMetrics(c.id).isRisk).length;

  container.innerHTML = `
    <div class="overview-card anim-enter">
      <div class="overview-card-top">
        <div class="overview-icon-wrap"><i class="ph ph-briefcase"></i></div>
      </div>
      <div class="overview-num">${totalClients}</div>
      <div class="overview-label">Active Clients</div>
    </div>
    
    <div class="overview-card anim-enter" style="animation-delay: 0.1s">
      <div class="overview-card-top">
        <div class="overview-icon-wrap"><i class="ph ph-clipboard-text"></i></div>
      </div>
      <div class="overview-num">${pendingTasks}</div>
      <div class="overview-label">Pending Total</div>
    </div>
    
    <div class="overview-card highlight anim-enter" style="animation-delay: 0.2s">
      <div class="overview-card-top">
        <div class="overview-icon-wrap active"><i class="ph ph-check-circle"></i></div>
      </div>
      <div class="overview-num">${completedTasks}</div>
      <div class="overview-label">Completed Tasks</div>
    </div>
    
    <div class="overview-card danger anim-enter" style="animation-delay: 0.3s">
      <div class="overview-card-top">
        <div class="overview-icon-wrap danger-icon"><i class="ph ph-warning"></i></div>
      </div>
      <div class="overview-num">${riskCycles}</div>
      <div class="overview-label">High Risk Cycles</div>
    </div>
  `;
}

function renderClientGrid() {
  const container = document.getElementById('clientGrid');
  if (!container) return;
  container.innerHTML = '';

  let activeCycles = state.getActiveCycles();

  // Filter based on View Toggles
  if (window.currentViewMode === 'my_clients') {
    if (currentUserRole === 'designer') {
       activeCycles = activeCycles.filter(cyc => {
           const cli = state.clients.find(c => c.id === cyc.client_id);
           return cli && cli.owner === currentUserId;
       });
    } else if (currentUserRole === 'video') {
       activeCycles = activeCycles.filter(cyc => {
           const tasks = state.tasks.filter(t => t.cycle_id === cyc.id);
           return tasks.some(t => t.assigned_to === currentUserId);
       });
    }
  } else if (window.currentViewMode === 'ready_post') {
    activeCycles = activeCycles.filter(cyc => {
       const m = state.getCycleMetrics(cyc.id);
       return m.progress === 100 && cyc.posting_status !== 'Posted';
    });
  }

  activeCycles.forEach((cycle, i) => {
    const client = state.clients.find(c => c.id === cycle.client_id);
    const metrics = state.getCycleMetrics(cycle.id);
    const tasks = state.tasks.filter(t => t.cycle_id === cycle.id);

    const posterTotal = tasks.filter(t => t.type.includes('Poster')).length;
    const posterDone = tasks.filter(t => t.type.includes('Poster') && t.status === 'completed').length;
    
    const videoTotal = tasks.filter(t => t.type.includes('Video')).length;
    const videoDone = tasks.filter(t => t.type.includes('Video') && t.status === 'completed').length;

    let riskClass = metrics.isRisk ? 'risk-alert' : '';
    let riskTag = metrics.isRisk ? `<div class="risk-tag"><i class="ph ph-warning-circle"></i> HIGH RISK</div>` : '';
    
    // Dynamic Avatar since we removed it from mock object
    const avatar = client.name.charAt(0).toUpperCase();

    // Posting Status Logic
    const isSocialOrAdmin = currentUserRole === 'social' || currentUserRole === 'admin';
    const disabledStr = isSocialOrAdmin ? '' : 'disabled';
    const postingHtml = `
      <div class="posting-status">
        <span>Posting Status:</span>
        <select class="status-sel" onchange="updatePostingStatus('${cycle.id}', this.value)" ${disabledStr}>
          <option value="Not Started" ${cycle.posting_status === 'Not Started' ? 'selected' : ''}>Not Started</option>
          <option value="Scheduled" ${cycle.posting_status === 'Scheduled' ? 'selected' : ''}>Scheduled</option>
          <option value="Posted" ${cycle.posting_status === 'Posted' ? 'selected' : ''}>Posted</option>
        </select>
      </div>
    `;

    const html = `
      <div class="client-card ${riskClass} anim-enter" style="animation-delay: ${i*0.05}s">
        <div class="client-card-header">
          <div class="client-avatar">${avatar}</div>
          <div class="client-meta">
            <h3 class="client-name">${client.name}</h3>
            <span class="client-cycle">Cycle: ${cycle.start_date.slice(5)} to ${cycle.end_date.slice(5)}</span>
            ${riskTag}
          </div>
          <div style="display:flex; flex-direction:column; align-items:flex-end; gap:5px;">
            <span class="client-status-dot ${metrics.urgency}-dot"></span>
            <button class="cycle-action-btn" onclick="openTasksModal('${cycle.id}')" style="font-size:10px; background:var(--primary); color:var(--text-main); border:none; padding:4px 8px; border-radius:4px; font-weight:600; cursor:pointer;">Manage Tasks</button>
          </div>
        </div>
        <div class="progress-row">
          <span class="progress-label">Overall Completion</span>
          <span class="progress-pct">${metrics.progress}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width:${metrics.progress}%; transition: width 0.5s ease;"></div>
        </div>
        <div class="deliverables">
          <div class="deliverable-item">
            <i class="ph ph-image"></i><span>Posters</span>
            <span class="deliverable-count"><span class="done">${posterDone}</span>/${posterTotal}</span>
          </div>
          <div class="deliverable-item">
            <i class="ph ph-video"></i><span>Videos</span>
            <span class="deliverable-count"><span class="done">${videoDone}</span>/${videoTotal}</span>
          </div>
        </div>
        ${postingHtml}
      </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
  });
}

function renderMyTasks() {
  const container = document.getElementById('clientGrid'); // Reusing container for My Tasks
  if (!container) return;
  container.innerHTML = '';
  document.querySelector('.client-progress-section h2').innerHTML = `<i class="ph ph-list-checks"></i> My Assigned Tasks`;

  const myTasks = state.tasks.filter(t => t.assigned_to === currentUserId);

  myTasks.forEach((task, i) => {
    const client = state.clients.find(c => c.id === task.client_id);
    let stClass = task.status === 'completed' ? 'status-completed' : (task.status === 'in progress' ? 'status-inprogress' : 'status-pending');

    // Only show tasks that match the logged in user's role/assignment
    // If not assigned explicitly but fits their role type, we can optionally show it,
    // but assignment is Admin controlled per rules. We stick to assigned filter.
    const html = `
      <div class="task-item anim-enter" style="animation-delay: ${i*0.05}s" onclick="openTaskEditor('${task.id}')">
        <div>
          <div style="font-size:12px; color:var(--text-muted);">${client.name} | Cycle ${client.cycle_start_day}-${client.cycle_end_day}</div>
          <div style="font-weight:600; font-size:16px;">${task.type} Output</div>
        </div>
        <span class="task-status-badge ${stClass}">${task.status}</span>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
  });
}

function renderTeamWorkload() {
  const container = document.getElementById('teamList');
  if (!container) return;
  container.innerHTML = '';

  const team = state.profiles.filter(p => p.role === 'team_member');

  team.forEach((member, i) => {
    // Count active tasks
    const activeTasks = state.tasks.filter(t => t.assigned_to === member.id && t.status !== 'completed').length;
    const isOverloaded = activeTasks > 5; // Configurable threshold

    const html = `
      <div class="team-member ${isOverloaded ? 'overloaded' : ''} anim-enter" style="animation-delay: ${i*0.05}s">
        <div class="member-left">
          <div class="member-avatar" style="--av-color: ${member.color};">${member.avatar}</div>
          <div class="member-info">
            <span class="member-name">${member.name}</span>
            <span class="member-role">${member.title}</span>
          </div>
        </div>
        <div class="member-right">
          <div class="task-bar-wrap">
            <div class="task-bar ${isOverloaded ? 'overloaded-bar' : ''}" style="width:${Math.min(activeTasks * 10, 100)}%"></div>
          </div>
          <span class="task-count ${isOverloaded ? 'overloaded-count' : ''}">${activeTasks} active tasks</span>
          ${isOverloaded ? '<span class="overload-tag">Overloaded</span>' : ''}
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
  });
}

// ══════════════════════════════════════════
// MODALS & INPUT HANDLERS
// ══════════════════════════════════════════

let currentEditingTask = null;

window.openTaskEditor = function(taskId) {
  currentEditingTask = state.tasks.find(t => t.id === taskId);
  if(!currentEditingTask) return;

  document.getElementById('taskId').value = taskId;
  document.getElementById('taskStatus').value = currentEditingTask.status;
  document.getElementById('taskLink').value = currentEditingTask.link || '';

  const assigneeSelect = document.getElementById('taskAssignee');
  assigneeSelect.innerHTML = `<option value="">Unassigned</option>`;
  state.profiles.filter(p => p.role === 'team_member').forEach(p => {
    assigneeSelect.insertAdjacentHTML('beforeend', `<option value="${p.id}" ${p.id === currentEditingTask.assigned_to ? 'selected' : ''}>${p.name}</option>`);
  });

  const modal = document.getElementById('taskModal');
  modal.classList.add('active');
};

function setupModals() {
  const taskModal = document.getElementById('taskModal');
  const taskForm = document.getElementById('taskForm');
  
  document.getElementById('closeTaskModal').addEventListener('click', () => taskModal.classList.remove('active'));

  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('taskId').value;
    const status = document.getElementById('taskStatus').value;
    const link = document.getElementById('taskLink').value;
    
    const updates = { status, link };
    if(currentUserRole === 'admin') {
      updates.assigned_to = document.getElementById('taskAssignee').value;
    }

    // Dispatch real-time or local update
    state.updateTask(id, updates);
    taskModal.classList.remove('active');
  });

  // Client Modal Close
  document.getElementById('closeClientModal')?.addEventListener('click', () => document.getElementById('clientModal').classList.remove('active'));
  document.getElementById('openClientModalBtn')?.addEventListener('click', () => document.getElementById('clientModal').classList.add('active'));

  // Create Client + Generate Tasks Logic
  document.getElementById('createClientForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('clientName').value;
    const startDay = document.getElementById('cycleStart').value;
    const endDay = document.getElementById('cycleEnd').value;
    
    // Delivs
    const posters = parseInt(document.querySelectorAll('.deliv-qty')[0].value) || 0;
    const videos = parseInt(document.querySelectorAll('.deliv-qty')[1].value) || 0;
    const motion = parseInt(document.querySelectorAll('.deliv-qty')[2].value) || 0;

    const clientId = 'cli_' + Date.now();
    const cycleId = 'cyc_' + Date.now();

    // 1. Create client
    state.clients.push({ id: clientId, name, cycle_start_day: startDay, cycle_end_day: endDay, avatar: name[0].toUpperCase() });
    
    // 2. Create Active cycle
    state.cycles.push({ id: cycleId, client_id: clientId, start_date: new Date().toISOString(), end_date: new Date(new Date().getTime() + 14*24*60*60*1000).toISOString(), status: 'active' });

    // 3. Auto-generate Tasks explicitly
    const generateTasks = (count, type) => {
      for(let i=0; i<count; i++) {
        state.tasks.push({ id: 't_'+Date.now()+'_'+Math.random(), client_id: clientId, cycle_id: cycleId, type: type, status: 'pending', assigned_to: '', link: '' });
      }
    };
    
    generateTasks(posters, 'Poster');
    generateTasks(videos, 'Video');
    generateTasks(motion, 'Motion');

    state.notify();
    document.getElementById('clientModal').classList.remove('active');
  });
}

window.openTasksModal = function(cycleId) {
    const task = state.tasks.find(t => t.cycle_id === cycleId);
    if(task) openTaskEditor(task.id);
}

window.startNewCycle = function(clientId, completedCycleId) {
    // 1. Mark old cycle as completed
    const oldCycleIdx = state.cycles.findIndex(c => c.id === completedCycleId);
    if(oldCycleIdx > -1) {
      state.cycles[oldCycleIdx].status = 'completed';
    }

    // Determine counts from past cycle's generated tasks to preserve template rules identically
    const pastTasks = state.tasks.filter(t => t.cycle_id === completedCycleId);
    const posters = pastTasks.filter(t => t.type === 'Poster').length;
    const videos = pastTasks.filter(t => t.type === 'Video').length;
    const motion = pastTasks.filter(t => t.type === 'Motion').length;

    // 2. Spawn fresh cycle
    const cycleId = 'cyc_' + Date.now();
    state.cycles.push({ id: cycleId, client_id: clientId, start_date: new Date().toISOString(), end_date: new Date(new Date().getTime() + 14*24*60*60*1000).toISOString(), status: 'active' });

    // 3. Spawn unassigned pending tasks explicitly generated
    const generateTasks = (count, type) => {
      for(let i=0; i<count; i++) {
        state.tasks.push({ id: 't_'+Date.now()+'_'+Math.random(), client_id: clientId, cycle_id: cycleId, type: type, status: 'pending', assigned_to: '', link: '' });
      }
    };
    
    generateTasks(posters, 'Poster');
    generateTasks(videos, 'Video');
    generateTasks(motion, 'Motion');

    state.notify();
}

// ══════════════════════════════════════════
// BASE UI SHELL
// ══════════════════════════════════════════
function setupBaseUI() {
  const dateEl = document.getElementById('currentDate');
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  if (dateEl) dateEl.textContent = now.toLocaleDateString('en-US', options);

  document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
          document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
          item.classList.add('active');
      });
  });

  const hamburger = document.getElementById('hamburger');
  const sidebar = document.getElementById('sidebar');
  if (hamburger) hamburger.addEventListener('click', () => sidebar.classList.toggle('active'));
}
