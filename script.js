/**
 * Time Management Plan Generator
 * Core Logic Script
 */

// Application State
const appState = {
    tasks: [],
    totalHours: 8,
    startTime: '07:00', // Default morning
    intensity: 'normal',
    generatedSchedule: [],
    completedTasks: new Set()
};

// DOM Elements
const elements = {
    taskInput: document.getElementById('taskInput'),
    addTaskBtn: document.getElementById('addTaskBtn'),
    taskList: document.getElementById('taskList'),
    emptyTasksMsg: document.getElementById('emptyTasksMsg'),
    hoursSlider: document.getElementById('hoursSlider'),
    hoursDisplay: document.getElementById('hoursDisplay'),
    generateBtn: document.getElementById('generateBtn'),
    dashboardSection: document.getElementById('dashboardSection'),
    timelineContainer: document.getElementById('timelineContainer'),
    progressBar: document.getElementById('progressBar'),
    progressText: document.getElementById('progressText'),
    statProductiveTime: document.getElementById('statProductiveTime'),
    statBreakTime: document.getElementById('statBreakTime'),
    statCompletion: document.getElementById('statCompletion'),
    celebrationModal: document.getElementById('celebrationModal'),
    strategyTip: document.getElementById('strategyTip')
};

// Event Listeners Initialization
function initListeners() {
    console.log("Initializing app...");

    // Add Task Events
    elements.addTaskBtn.addEventListener('click', handleAddTask);
    elements.taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAddTask();
    });

    // Slider Event
    elements.hoursSlider.addEventListener('input', (e) => {
        appState.totalHours = parseFloat(e.target.value);
        elements.hoursDisplay.innerText = `${appState.totalHours} hour${appState.totalHours !== 1 ? 's' : ''}`;
    });

    // Radio Button Events (Delegation)
    document.querySelectorAll('input[name="startTime"]').forEach(radio => {
        radio.addEventListener('change', (e) => appState.startTime = e.target.value);
    });

    document.querySelectorAll('input[name="intensity"]').forEach(radio => {
        radio.addEventListener('change', (e) => appState.intensity = e.target.value);
    });

    // Generate Button
    elements.generateBtn.addEventListener('click', generateSchedule);
}

// --- Core Logic Implementation ---

function handleAddTask() {
    const text = elements.taskInput.value.trim();
    if (!text) return;

    // Check for duplicates (case-insensitive)
    if (appState.tasks.some(t => t.toLowerCase() === text.toLowerCase())) {
        alert("Task already exists!");
        return;
    }

    appState.tasks.push(text);
    renderTaskList();
    elements.taskInput.value = '';
    elements.taskInput.focus();
}

function removeTask(index) {
    appState.tasks.splice(index, 1);
    renderTaskList();
}

function renderTaskList() {
    elements.taskList.innerHTML = '';

    if (appState.tasks.length === 0) {
        elements.taskList.appendChild(elements.emptyTasksMsg);
        return;
    }

    appState.tasks.forEach((task, index) => {
        // Assign a consistent gradient based on index
        const gradientClass = `bg-gradient-${(index % 6) + 1}`;

        const chip = document.createElement('div');
        chip.className = `${gradientClass} text-white px-4 py-2 rounded-full shadow-sm flex items-center gap-2 transform transition-all hover:scale-105 hover:shadow-md animate-slide-in-right`;
        chip.innerHTML = `
            <span class="font-medium">${task}</span>
            <button onclick="removeTask(${index})" class="bg-white/20 hover:bg-white/40 rounded-full w-5 h-5 flex items-center justify-center transition-colors text-xs" aria-label="Remove task">
                ✕
            </button>
        `;
        // Add animation class directly via style for uniqueness if needed, but CSS class handles it
        chip.style.animation = `slideInRight 0.3s ease-out forwards`;
        elements.taskList.appendChild(chip);
    });
}

// --- Scheduling Algorithm ---

function generateSchedule() {
    if (appState.tasks.length === 0) {
        alert("Please add at least one task!");
        return;
    }

    // SCROLL TO DASHBOARD
    elements.dashboardSection.classList.remove('hidden');
    elements.dashboardSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // 1. Configuration
    const MODE_CONFIG = {
        light: { workRatio: 0.60, minSession: 25, maxSession: 35 },
        normal: { workRatio: 0.75, minSession: 30, maxSession: 45 },
        hustle: { workRatio: 0.85, minSession: 40, maxSession: 60 }
    };

    const config = MODE_CONFIG[appState.intensity];
    const totalMinutes = appState.totalHours * 60;

    // 2. Initialize Variables
    let schedule = [];
    let currentTime = timeStringToDate(appState.startTime);
    let remainingWorkMinutes = Math.floor(totalMinutes * config.workRatio);
    let remainingBreakMinutes = totalMinutes - remainingWorkMinutes;

    // 3. Task Randomization (Fisher-Yates Shuffle)
    let shuffledTasks = [...appState.tasks];
    for (let i = shuffledTasks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledTasks[i], shuffledTasks[j]] = [shuffledTasks[j], shuffledTasks[i]];
    }

    // Determine number of rotations needed to cover all tasks or fit available time
    // We want to ensure every task gets at least one slot if possible

    let taskQueue = [...shuffledTasks];
    let slots = [];

    // Preliminary allocation
    // We need to loop until we run out of work minutes

    while (remainingWorkMinutes > 15) { // Stop if less than 15 mins left
        // Pick next task
        if (taskQueue.length === 0) {
            taskQueue = [...shuffledTasks]; // Refill if done with one round
        }
        const taskName = taskQueue.shift();

        // Calculate duration for this slot
        let duration = Math.floor(Math.random() * (config.maxSession - config.minSession + 1)) + config.minSession;

        // Cap duration if it exceeds remaining time
        if (duration > remainingWorkMinutes) {
            duration = remainingWorkMinutes;
        }

        slots.push({
            type: 'work',
            name: taskName,
            duration: duration,
            completed: false
        });

        remainingWorkMinutes -= duration;

        // Add a break if there is still work time left (don't end on a break usually, but good for pacing)
        if (remainingWorkMinutes > 0) {
            // Calculate break duration roughly proportional to the session, 
            // but constrained by the global break pool
            let breakDuration = Math.round(duration * (1 - config.workRatio) / config.workRatio);

            // Adjust break to fit 5-minute increments for cleaner times
            breakDuration = Math.max(5, Math.ceil(breakDuration / 5) * 5);

            // If we are running low on break pool, shrink it
            if (remainingBreakMinutes < breakDuration) {
                breakDuration = remainingBreakMinutes;
            }

            if (breakDuration > 0) {
                slots.push({
                    type: 'break',
                    name: 'Break / Coffee ☕',
                    duration: breakDuration,
                    completed: false
                });
                remainingBreakMinutes -= breakDuration;
            }
        }
    }

    // If we have excess break time left, distribute it into existing breaks
    if (remainingBreakMinutes > 0 && slots.length > 0) {
        const breakSlots = slots.filter(s => s.type === 'break');
        if (breakSlots.length > 0) {
            const extraPerBreak = Math.floor(remainingBreakMinutes / breakSlots.length);
            breakSlots.forEach(s => s.duration += extraPerBreak);
        }
    }

    // 4. Assign timestamps
    schedule = slots.map((slot, index) => {
        const start = new Date(currentTime);
        currentTime.setMinutes(currentTime.getMinutes() + slot.duration);
        const end = new Date(currentTime);

        // Assign color index to work tasks
        let colorIdx = 0;
        if (slot.type === 'work') {
            const originalIndex = appState.tasks.indexOf(slot.name);
            colorIdx = (originalIndex % 6) + 1;
        }

        return {
            ...slot,
            id: `slot-${index}`,
            startStr: formatTime(start),
            endStr: formatTime(end),
            colorClass: slot.type === 'work' ? `bg-gradient-${colorIdx}` : 'bg-slate-100 text-slate-500'
        };
    });

    appState.generatedSchedule = schedule;

    renderTimeline();
    updateStats(config);
    provideStrategyTip();
}

// --- Rendering & Helpers ---

function timeStringToDate(timeStr) {
    const d = new Date();
    const [hours, minutes] = timeStr.split(':').map(Number);
    d.setHours(hours, minutes, 0, 0);
    return d;
}

function formatTime(date) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function renderTimeline() {
    elements.timelineContainer.innerHTML = '';

    appState.generatedSchedule.forEach((block) => {
        const div = document.createElement('div');
        const isWork = block.type === 'work';
        const isCompleted = appState.completedTasks.has(block.id);

        div.className = `flex gap-4 items-center group ${isCompleted ? 'opacity-50' : ''}`;

        // Time Column
        const timeCol = `
            <div class="w-20 text-right text-xs md:text-sm text-slate-500 font-mono pt-2">
                <div>${block.startStr}</div>
                <div class="opacity-50">|</div>
                <div>${block.endStr}</div>
            </div>
        `;

        // Content Card
        let contentClass = isWork
            ? `${block.colorClass} text-white shadow-lg hover:shadow-xl hover:scale-[1.01]`
            : `bg-slate-50 border-2 border-slate-100 text-slate-500`;

        contentClass += ` flex-1 p-4 rounded-xl transition-all duration-300 relative overflow-hidden`;

        if (isCompleted) {
            contentClass += ' task-completed';
        }

        const checkbox = isWork ? `
            <button onclick="toggleBlockCompletion('${block.id}')" 
                class="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-white/50 flex items-center justify-center hover:bg-white/20 transition-all ${isCompleted ? 'bg-white text-indigo-600' : 'text-transparent'}">
                ✔
            </button>
        ` : '';

        const content = `
            <div class="${contentClass}">
                <div class="mr-10">
                    <div class="font-bold text-lg leading-tight mb-1">${block.name}</div>
                    <div class="text-xs opacity-90 font-medium flex items-center gap-1">
                        ⏱️ ${block.duration} mins
                    </div>
                </div>
                ${checkbox}
            </div>
        `;

        div.innerHTML = timeCol + content;
        elements.timelineContainer.appendChild(div);
    });
}

function toggleBlockCompletion(id) {
    if (appState.completedTasks.has(id)) {
        appState.completedTasks.delete(id);
    } else {
        appState.completedTasks.add(id);
        // Basic confetti or sound could go here
    }

    // Re-render to show state
    renderTimeline();
    updateStats();

    // Check for win condition
    const workBlocks = appState.generatedSchedule.filter(b => b.type === 'work');
    const completedWork = workBlocks.filter(b => appState.completedTasks.has(b.id));

    if (workBlocks.length > 0 && workBlocks.length === completedWork.length) {
        launchCelebration();
    }
}

function updateStats(currentConfig) {
    // Recalculate based on generated schedule
    const workBlocks = appState.generatedSchedule.filter(b => b.type === 'work');
    const breakBlocks = appState.generatedSchedule.filter(b => b.type === 'break');

    const totalWorkMins = workBlocks.reduce((acc, b) => acc + b.duration, 0);
    const totalBreakMins = breakBlocks.reduce((acc, b) => acc + b.duration, 0);

    // Convert to Hrs Mins
    const h = Math.floor(totalWorkMins / 60);
    const m = totalWorkMins % 60;

    elements.statProductiveTime.innerText = `${h}h ${m}m`;
    elements.statBreakTime.innerText = `${totalBreakMins}m`; // Just minutes is usually clearer for breaks

    // Completion %
    const completedCount = workBlocks.filter(b => appState.completedTasks.has(b.id)).length;
    const percent = workBlocks.length === 0 ? 0 : Math.round((completedCount / workBlocks.length) * 100);

    elements.statCompletion.innerText = `${percent}%`;
    elements.progressText.innerText = `${percent}%`;
    elements.progressBar.style.width = `${percent}%`;

    // Update color based on progress
    if (percent === 100) elements.progressBar.classList.add('bg-green-500');
    else elements.progressBar.classList.remove('bg-green-500');
}

function provideStrategyTip() {
    const tips = {
        light: "Remember: This is a recovery day. Don't skip those breaks!",
        normal: "Steady pace wins the race. Focus fully during the work blocks.",
        hustle: "You're in the zone! Keep distractions to zero during sprints."
    };
    elements.strategyTip.innerText = `💡 Strategy Tip: ${tips[appState.intensity]}`;
}

function launchCelebration() {
    elements.celebrationModal.classList.remove('hidden');
    // Could add JS canvas confetti here if requested, but sticking to CSS/HTML for now as planned
}

// Start App
initListeners();
