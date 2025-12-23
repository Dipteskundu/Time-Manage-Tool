

    // --- 1. DATA & STATE ---

    let state = {
      tasks: [],
      intensity: 'normal',
      hoursAvailable: 8,
      scheduleWindow: 'morning',
      schedule: [],
      showCongratsModal: false,
    };

    const CONFIG = {
      startTimes: {
        morning: 7 * 60,    // 7:00 AM
        day: 9 * 60,        // 9:00 AM
        evening: 18 * 60,   // 6:00 PM
        night: 22 * 60      // 10:00 PM
      },
      intensity: {
        light: { work: 0.60, min: 25, max: 35, breakMin: 12, breakMax: 15, emoji: '🌤️', color: 'green', name: 'Light' },
        normal: { work: 0.75, min: 30, max: 45, breakMin: 8, breakMax: 12, emoji: '⚡', color: 'purple', name: 'Normal' },
        hustle: { work: 0.85, min: 40, max: 60, breakMin: 5, breakMax: 10, emoji: '🔥', color: 'orange', name: 'Hustle' }
      }
    };

    // --- LOCAL STORAGE FUNCTIONS ---

    function saveToLocalStorage() {
      try {
        localStorage.setItem('timeManagementPlan', JSON.stringify(state.schedule));
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
      }
    }

    function loadFromLocalStorage() {
      try {
        const saved = localStorage.getItem('timeManagementPlan');
        if (saved) {
          state.schedule = JSON.parse(saved);
        }
      } catch (error) {
        console.error('Failed to load from localStorage:', error);
      }
    }

    function clearLocalStorage() {
      if (confirm('Are you sure you want to clear your saved plan? This cannot be undone.')) {
        localStorage.removeItem('timeManagementPlan');
        state.schedule = [];
        render();
      }
    }

    // --- 2. ACTIONS (User Interactions) ---

    function addTask() {
      const input = document.getElementById('taskInput');
      const taskName = input.value.trim();

      if (taskName && !state.tasks.includes(taskName)) {
        state.tasks.push(taskName);
        input.value = ''; // Reset input
        render();
      } else if (state.tasks.includes(taskName)) {
        alert('Task already exists!');
      }
    }

    function removeTask(index) {
      state.tasks.splice(index, 1);
      state.schedule = []; // Reset schedule as data changed
      render();
    }

    function updateHours(value) {
      state.hoursAvailable = parseInt(value);
      render();
    }

    function updateWindow(value) {
      state.scheduleWindow = value;
      render();
    }

    function setIntensity(level) {
      state.intensity = level;
      render();
    }

    function toggleTaskComplete(index) {
      // Toggle status
      state.schedule[index].completed = !state.schedule[index].completed;

      // Save to localStorage
      saveToLocalStorage();

      // Check if all tasks are done
      const tasks = state.schedule.filter(item => item.type === 'task');
      const allComplete = tasks.every(t => t.completed);

      if (allComplete && tasks.length > 0) {
        state.showCongratsModal = true;
      }

      render(); // Default render (no animation) to prevent bouncing
    }

    function closeCongratsModal() {
      state.showCongratsModal = false;
      render();
    }

    // --- 3. LOGIC (The Brains) ---

    function generatePlan() {
      if (state.tasks.length === 0) {
        alert('Please add tasks first!');
        return;
      }

      const settings = CONFIG.intensity[state.intensity];
      const totalMinutes = state.hoursAvailable * 60;

      // Calculate reliable work time
      const maxWorkMinutes = Math.floor(totalMinutes * settings.work);

      let currentTime = CONFIG.startTimes[state.scheduleWindow];
      let timeLeft = maxWorkMinutes; // "Bucket" of time to fill

      // Randomize task order
      const randomTasks = [...state.tasks].sort(() => Math.random() - 0.5);

      let newSchedule = [];
      let taskIndex = 0;

      // Loop until we run out of time or reasonable cycles
      while (timeLeft > 15 && taskIndex < randomTasks.length * 4) {
        const taskName = randomTasks[taskIndex % randomTasks.length];

        // Determine random session length within limits
        const randomDuration = Math.floor(Math.random() * (settings.max - settings.min + 1)) + settings.min;
        const duration = Math.min(randomDuration, timeLeft);

        // Add Task Block
        newSchedule.push({
          type: 'task',
          name: taskName,
          duration: duration,
          startTime: currentTime,
          endTime: currentTime + duration,
          color: getTaskColor(taskIndex),
          completed: false
        });

        currentTime += duration;
        timeLeft -= duration;

        // Add Break Block (if not out of time)
        if (timeLeft > 15) {
          const breakDuration = Math.floor(Math.random() * (settings.breakMax - settings.breakMin + 1)) + settings.breakMin;

          newSchedule.push({
            type: 'break',
            duration: breakDuration,
            startTime: currentTime,
            endTime: currentTime + breakDuration,
            completed: false
          });

          currentTime += breakDuration;
        }

        taskIndex++;
      }

      state.schedule = newSchedule;
      saveToLocalStorage(); // Save plan to localStorage
      render(true); // Trigger animation on new plan
    }

    // Helpers
    function getTaskColor(index) {
      const colors = [
        'blue-500', 'green-500',
        'purple-500', 'pink-500',
        'yellow-500', 'indigo-500',
        'red-500', 'teal-500'
      ];
      return colors[index % colors.length];
    }

    function formatTime(minutes) {
      const h = Math.floor(minutes / 60) % 24;
      const m = minutes % 60;
      const ampm = h >= 12 ? 'PM' : 'AM';
      const displayH = h % 12 || 12;
      return `${displayH}:${m.toString().padStart(2, '0')} ${ampm}`;
    }

    // --- 4. UI Rendering (The Visuals) ---

    function render(shouldAnimate = false) {
      renderTaskList();
      renderControls();
      renderDashboard(shouldAnimate);
      renderModal();
    }

    function renderTaskList() {
      const container = document.getElementById('taskList');

      if (state.tasks.length === 0) {
        container.innerHTML = `<p class="text-gray-400 italic text-center">No tasks added yet.</p>`;
        return;
      }

      const html = state.tasks.map((task, i) => `
        <div class="bg-${getTaskColor(i)} text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-md hover:shadow-lg transition">
            <span class="font-medium">${task}</span>
            <button onclick="removeTask(${i})" class="text-white hover:text-red-200 font-bold ml-1">×</button>
        </div>
    `).join('');

      container.innerHTML = `<div class="flex flex-wrap gap-2">${html}</div>`;
    }

    function renderControls() {
      // Slider
      document.getElementById('hoursDisplay').textContent = state.hoursAvailable;
      document.getElementById('hoursSlider').value = state.hoursAvailable;

      // Intensity Buttons
      // Intensity Buttons
      ['light', 'normal', 'hustle'].forEach(level => {
        const btn = document.getElementById(`${level}Btn`);
        const isActive = state.intensity === level;
        const color = CONFIG.intensity[level].color;

        // Reset base classes
        btn.className = `intensity-btn relative group p-8 bg-white border-2 rounded-3xl transition-all duration-300 text-center`;

        if (isActive) {
          btn.classList.add(`border-purple-500`, `shadow-2xl`, `transform`, `scale-105`, `z-10`);
        } else {
          btn.classList.add('border-gray-100', 'hover:border-purple-200', 'hover:shadow-xl');
        }
      });
    }

    function renderDashboard(animate) {
      const container = document.getElementById('scheduleOutput');

      if (state.schedule.length === 0) {
        container.innerHTML = '';
        return;
      }

      const settings = CONFIG.intensity[state.intensity];
      const stats = calculateStats();

      // Animation class
      const animClass = animate ? 'animate-fade-in' : '';

      container.innerHTML = `
        <div class="bg-white rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-100 ${animClass}">
            ${getDashboardHeader(settings.emoji)}
            ${getKpCards(stats)}
            ${getTimeline(state.schedule)}
            ${getProTip(settings)}
        </div>
    `;
    }

    function calculateStats() {
      const tasks = state.schedule.filter(s => s.type === 'task');
      const totalWork = tasks.reduce((acc, curr) => acc + curr.duration, 0);
      const totalBreak = state.schedule.reduce((acc, curr) => acc + curr.duration, 0) - totalWork;
      const completed = tasks.filter(t => t.completed).length;
      const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

      return { work: totalWork, break: totalBreak, completed, total: tasks.length, progress };
    }

    function getDashboardHeader(emoji) {
      return `
        <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
                <span class="text-4xl">${emoji}</span>
                <h2 class="text-3xl font-bold text-gray-800">Your Plan</h2>
            </div>
            <button onclick="clearLocalStorage()" 
                class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-semibold transition shadow-lg hover:shadow-xl flex items-center gap-2">
                <span>🗑️</span> Clear Plan
            </button>
        </div>
    `;
    }

    function getKpCards(stats) {
      const format = m => `${Math.floor(m / 60)}h ${m % 60}m`;

      return `
        <!-- Progress Bar -->
        <div class="mb-6">
            <div class="flex justify-between mb-2 font-semibold">
                <span>Progress</span>
                <span class="text-purple-600">${stats.progress}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div class="bg-purple-500 h-4 transition-all duration-500" style="width: ${stats.progress}%"></div>
            </div>
        </div>

        <!-- Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            ${createCard('Productive', format(stats.work), 'text-purple-100', 'purple-600')}
            ${createCard('Breaks', format(stats.break), 'text-green-100', 'green-600')}
            ${createCard('Completed', `${stats.completed}/${stats.total}`, 'text-blue-100', 'blue-600')}
            ${createCard('Score', `${stats.progress}%`, 'text-orange-100', 'red-600')}
        </div>
    `;
    }

    function createCard(title, value, textColor, color) {
      return `
        <div class="bg-${color} rounded-xl p-5 text-white shadow-lg">
            <div class="text-2xl md:text-3xl font-bold mb-1">${value}</div>
            <div class="${textColor} text-sm font-medium">${title}</div>
        </div>
    `;
    }

    function getTimeline(schedule) {
      const html = schedule.map((block, index) => {
        if (block.type === 'task') return getTaskBlockHTML(block, index);
        return getBreakBlockHTML(block);
      }).join('');

      return `
        <div class="mb-6">
            <h3 class="text-xl font-bold text-gray-700 mb-4">📅 Timeline</h3>
            <div class="space-y-4">${html}</div>
        </div>
    `;
    }

    function getTaskBlockHTML(block, index) {
      const done = block.completed;
      // Conditionals for style
      const opacity = done ? 'opacity-60 bg-gray-50' : 'bg-white';
      const border = done ? 'border-green-500' : 'border-purple-500';
      const decoration = done ? 'line-through' : '';
      const btnColor = done ? 'bg-green-500' : 'bg-gray-200';
      const check = done ? '✓' : '';

      return `
        <div class="${opacity} rounded-xl shadow-md p-5 flex flex-col md:flex-row items-center gap-4 transition-all border-l-4 ${border}">
            
            <!-- Time Bubble -->
            <div class="bg-${block.color} w-16 h-16 rounded-xl flex flex-col items-center justify-center text-white shrink-0">
                <span class="font-bold text-xl">${block.duration}</span>
                <span class="text-xs">min</span>
            </div>

            <!-- Info -->
            <div class="flex-1 w-full text-center md:text-left">
                <h3 class="font-bold text-lg text-gray-800 ${decoration}">${block.name}</h3>
                <div class="text-purple-600 font-semibold text-sm">
                    ${formatTime(block.startTime)} - ${formatTime(block.endTime)}
                </div>
            </div>

            <!-- Checkbox -->
            <button onclick="toggleTaskComplete(${index})" 
                class="w-10 h-10 rounded-full ${btnColor} text-white flex items-center justify-center text-xl hover:scale-110 transition shadow-sm shrink-0">
                ${check}
            </button>
        </div>
    `;
    }

    function getBreakBlockHTML(block) {
      return `
        <div class="bg-green-50 rounded-xl p-4 flex items-center gap-4 border border-green-200 opacity-80">
            <div class="text-2xl">☕</div>
            <div class="flex-1">
                <div class="font-bold text-gray-700">Break</div>
                <div class="text-green-700 text-sm font-medium">
                    ${formatTime(block.startTime)} - ${formatTime(block.endTime)} (${block.duration}m)
                </div>
            </div>
        </div>
    `;
    }

    function getProTip(settings) {
      return `
        <div class="bg-${settings.color}-50 p-4 rounded-xl border-l-4 border-${settings.color}-500 text-sm text-gray-600">
            <strong>🚀 ${settings.name} Mode Strategy:</strong> 
            Work ${Math.round(settings.work * 100)}% of the time. Sessions are ${settings.min}-${settings.max} mins.
        </div>
    `;
    }

    function renderModal() {
      const modal = document.getElementById('congratsModal');
      if (state.showCongratsModal) {
        modal.classList.remove('hidden');
      } else {
        modal.classList.add('hidden');
      }
    }

    // Initial Load
    document.addEventListener('DOMContentLoaded', () => {
      loadFromLocalStorage(); // Load saved plan
      render();
    });
