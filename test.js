const mockProfiles = [
  { id: 'usr_admin', name: 'Admin User', role: 'admin' },
  { id: 'usr_rk', name: 'Rahul K.', role: 'team_member', avatar: 'RK', color: '#ff6b6b', title: 'Creative Director' },
  { id: 'usr_ps', name: 'Priya S.', role: 'team_member', avatar: 'PS', color: '#f7b731', title: 'Senior Designer' },
  { id: 'usr_am', name: 'Arjun M.', role: 'team_member', avatar: 'AM', color: '#26de81', title: 'Video Editor' }
];

const today = new Date();
const addDays = (n) => new Date(today.getTime() + n * 24*60*60*1000).toISOString().split('T')[0];
const subDays = (n) => new Date(today.getTime() - n * 24*60*60*1000).toISOString().split('T')[0];

const mockClients = [
  { id: 'cli_zara', name: 'Zara India', cycle_start_day: 1, cycle_end_day: 30, avatar: 'Z' },
  { id: 'cli_nike', name: 'Nike Mumbai', cycle_start_day: 15, cycle_end_day: 14, avatar: 'N' },
  { id: 'cli_swiggy', name: 'Swiggy', cycle_start_day: 1, cycle_end_day: 30, avatar: 'S' }
];

const mockCycles = [
  { id: 'cyc_z_1', client_id: 'cli_zara', start_date: subDays(15), end_date: addDays(2), status: 'active' },
  { id: 'cyc_n_1', client_id: 'cli_nike', start_date: subDays(20), end_date: addDays(8), status: 'active' },
  { id: 'cyc_s_1', client_id: 'cli_swiggy', start_date: subDays(3), end_date: addDays(25), status: 'active' }
];

let mockTasks = [
  { id: 't1', client_id: 'cli_zara', cycle_id: 'cyc_z_1', type: 'Posters', status: 'completed', assigned_to: 'usr_rk', link: '' },
  { id: 't2', client_id: 'cli_zara', cycle_id: 'cyc_z_1', type: 'Posters', status: 'pending', assigned_to: 'usr_ps', link: '' },
  { id: 't3', client_id: 'cli_zara', cycle_id: 'cyc_z_1', type: 'Videos', status: 'in progress', assigned_to: 'usr_am', link: '' },
  { id: 't4', client_id: 'cli_zara', cycle_id: 'cyc_z_1', type: 'Videos', status: 'pending', assigned_to: 'usr_am', link: '' },
  
  { id: 't5', client_id: 'cli_nike', cycle_id: 'cyc_n_1', type: 'Posters', status: 'completed', assigned_to: 'usr_ps', link: 'http://figma.com/n1' },
  { id: 't6', client_id: 'cli_nike', cycle_id: 'cyc_n_1', type: 'Posters', status: 'in progress', assigned_to: 'usr_ps', link: '' },
  { id: 't7', client_id: 'cli_nike', cycle_id: 'cyc_n_1', type: 'Videos', status: 'pending', assigned_to: 'usr_am', link: '' },

  { id: 't8', client_id: 'cli_swiggy', cycle_id: 'cyc_s_1', type: 'Posters', status: 'pending', assigned_to: 'usr_rk', link: '' }
];

class AppState {
  constructor() {
    this.clients = mockClients;
    this.cycles = mockCycles;
    this.tasks = mockTasks;
    this.profiles = mockProfiles;
  }
  getActiveCycles() { return this.cycles.filter(c => c.status === 'active'); }
  getCycleMetrics(cycleId) {
    const tasks = this.tasks.filter(t => t.cycle_id === cycleId);
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

    const cycle = this.cycles.find(c => c.id === cycleId);
    const daysRem = Math.ceil((new Date(cycle.end_date) - new Date()) / (1000 * 60 * 60 * 24));
    
    let urgency = 'safe';
    if(daysRem <= 3) urgency = 'urgent';
    else if(daysRem <= 7) urgency = 'near';

    const isRisk = urgency === 'urgent' && progress < 30;

    return { total, completed, progress, daysRem, urgency, isRisk };
  }
}

const state = new AppState();
try {
  const activeCycles = state.getActiveCycles().sort((a,b) => new Date(a.end_date) - new Date(b.end_date));
  activeCycles.forEach((cycle, i) => {
    const client = state.clients.find(c => c.id === cycle.client_id);
    const metrics = state.getCycleMetrics(cycle.id);
    console.log(client.name, metrics);
  });
  console.log("No syntax or runtime errors in state metrics!");
} catch (e) {
  console.error("ERROR: ", e);
}
