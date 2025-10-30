// Calendar functionality
(function() {
    // DOM elements
    const monthDisplay = document.getElementById('monthDisplay');
    const daysGrid = document.getElementById('daysGrid');
    const dateInput = document.getElementById('dateInput');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');

    // State
    let currentDate = new Date();
    let selectedDate = new Date();
    let events = {};  // Store events by date string (YYYY-MM-DD)
    let editingEventIndex = null; // Track which event is being edited

    // DOM elements for events panel
    const selectedDateDisplay = document.getElementById('selectedDateDisplay');
    const eventsList = document.getElementById('eventsList');
    const addEventBtn = document.getElementById('addEventBtn');
    const addEventForm = document.getElementById('addEventForm');
    const eventTitle = document.getElementById('eventTitle');
    const eventStartTime = document.getElementById('eventStartTime');
    const eventEndTime = document.getElementById('eventEndTime');
    const eventDescription = document.getElementById('eventDescription');
    const saveEventBtn = document.getElementById('saveEventBtn');
    const cancelEventBtn = document.getElementById('cancelEventBtn');

    // Month names for display
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Initialize the calendar
    function initCalendar() {
        updateDateInput();
        renderCalendar();
        attachEventListeners();
    }

    // Update the date input field
    function updateDateInput() {
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        dateInput.value = `${year}-${month}-${day}`;
    }

    // Render the calendar grid
    function renderCalendar() {
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const startingDay = firstDay.getDay();
        const totalDays = lastDay.getDate();

        // Update month/year display
        monthDisplay.textContent = `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

        // Clear previous days
        daysGrid.innerHTML = '';

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'empty';
            daysGrid.appendChild(emptyDay);
        }

        // Add days of the month
        for (let day = 1; day <= totalDays; day++) {
            const dayElement = document.createElement('div');
            const daySpan = document.createElement('span');
            daySpan.textContent = day;
            dayElement.appendChild(daySpan);
            
            // Check if this day is today
            const isToday = isDateEqual(
                new Date(currentDate.getFullYear(), currentDate.getMonth(), day),
                new Date()
            );

            // Check if this day is selected
            const isSelected = isDateEqual(
                new Date(currentDate.getFullYear(), currentDate.getMonth(), day),
                selectedDate
            );

            // Add appropriate classes
            if (isToday) dayElement.classList.add('today');
            if (isSelected) dayElement.classList.add('selected');

            // Add event dots if there are events on this day
            const dateStr = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
            if (events[dateStr]) {
                const dotsContainer = document.createElement('div');
                dotsContainer.className = 'event-dots';
                
                // Get unique colors from events
                const colors = new Set(events[dateStr].map(event => event.color || '#4CAF50'));
                colors.forEach(color => {
                    const dot = document.createElement('div');
                    dot.className = 'event-dot';
                    dot.style.backgroundColor = color;
                    dotsContainer.appendChild(dot);
                });
                
                dayElement.appendChild(dotsContainer);
            }

            // Add click handler
            dayElement.addEventListener('click', () => selectDate(day));
            
            daysGrid.appendChild(dayElement);
        }
    }

    // Helper to compare dates (ignoring time)
    function isDateEqual(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    // Handle date selection
    function selectDate(day) {
        selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        updateDateInput();
        renderCalendar();
        updateEventsPanel();
    }

    // Format date as YYYY-MM-DD
    function formatDate(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    // Update events panel for selected date
    function updateEventsPanel() {
        const dateStr = formatDate(selectedDate);
        selectedDateDisplay.textContent = selectedDate.toLocaleDateString();
        eventsList.innerHTML = '';
        
        if (events[dateStr]) {
            events[dateStr].forEach((event, index) => {
                const eventEl = document.createElement('div');
                eventEl.className = 'event-item';
                eventEl.style.borderLeftColor = event.color || '#4CAF50';
                eventEl.innerHTML = `
                    <div class="event-content">
                        <h4>${event.title}</h4>
                        <div class="event-time">${event.startTime} - ${event.endTime}</div>
                        <div class="event-description">${event.description}</div>
                    </div>
                    <div class="event-actions">
                        <button type="button" class="edit-btn" aria-label="Edit event">
                            <svg viewBox="0 0 24 24" width="16" height="16">
                                <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM21.41 6.34l-3.75-3.75-2.53 2.54 3.75 3.75 2.53-2.54z"/>
                            </svg>
                        </button>
                        <button type="button" class="delete-btn" aria-label="Delete event">
                            <svg viewBox="0 0 24 24" width="16" height="16">
                                <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                            </svg>
                        </button>
                    </div>
                `;

                const editBtn = eventEl.querySelector('.edit-btn');
                const deleteBtn = eventEl.querySelector('.delete-btn');

                editBtn.addEventListener('click', () => editEvent(index));
                deleteBtn.addEventListener('click', () => deleteEvent(index));

                eventsList.appendChild(eventEl);
            });
        }
    }

    // Edit an existing event
    function editEvent(index) {
        const dateStr = formatDate(selectedDate);
        const event = events[dateStr][index];
        editingEventIndex = index;

        eventTitle.value = event.title;
        eventStartTime.value = event.startTime;
        eventEndTime.value = event.endTime;
        eventDescription.value = event.description;
        document.getElementById('eventColor').value = event.color;

        toggleEventForm(true);
        saveEventBtn.textContent = 'Update';
    }

    // Delete an event
    function deleteEvent(index) {
        if (confirm('Are you sure you want to delete this event?')) {
            const dateStr = formatDate(selectedDate);
            events[dateStr].splice(index, 1);
            if (events[dateStr].length === 0) {
                delete events[dateStr];
            }
            updateEventsPanel();
            renderCalendar();
        }
    }

    // Show/hide event form
    function toggleEventForm(show) {
        addEventForm.classList.toggle('hidden', !show);
        if (show && editingEventIndex === null) {
            // Clear form for new event
            eventTitle.value = '';
            eventStartTime.value = '';
            eventEndTime.value = '';
            eventDescription.value = '';
            saveEventBtn.textContent = 'Save';
            
            // Reset color selection
            document.getElementById('eventColor').value = '#4CAF50';
        }
        if (!show) {
            editingEventIndex = null;
        }
    }

    // Save or update event
    function saveEvent() {
        const dateStr = formatDate(selectedDate);
        const color = document.getElementById('eventColor').value;
        
        const eventData = {
            title: eventTitle.value,
            startTime: eventStartTime.value,
            endTime: eventEndTime.value,
            description: eventDescription.value,
            color: color
        };

        if (editingEventIndex !== null) {
            // Update existing event
            events[dateStr][editingEventIndex] = eventData;
        } else {
            // Add new event
            if (!events[dateStr]) {
                events[dateStr] = [];
            }
            events[dateStr].push(eventData);
        }
        
        toggleEventForm(false);
        updateEventsPanel();
        renderCalendar(); // Re-render to update event dots
    }

    // Attach event listeners
    function attachEventListeners() {
        // Previous month button
        prevMonthBtn.addEventListener('click', () => {
            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
            renderCalendar();
        });

        // Next month button
        nextMonthBtn.addEventListener('click', () => {
            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
            renderCalendar();
        });

        // Date input change
        dateInput.addEventListener('change', (e) => {
            const [year, month, day] = e.target.value.split('-').map(Number);
            currentDate = new Date(year, month - 1);
            selectedDate = new Date(year, month - 1, day);
            renderCalendar();
            updateEventsPanel();
        });

        // Events panel listeners
        addEventBtn.addEventListener('click', () => toggleEventForm(true));
        cancelEventBtn.addEventListener('click', () => toggleEventForm(false));
        saveEventBtn.addEventListener('click', saveEvent);

        // Color option listeners
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
            });
        });
    }

    // Start the calendar
    initCalendar();
})();