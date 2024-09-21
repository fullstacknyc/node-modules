let todos = JSON.parse(localStorage.getItem('todos')) || [];
let journalEntries = JSON.parse(localStorage.getItem('journalEntries')) || [];
let events = JSON.parse(localStorage.getItem('events')) || {};

document.addEventListener('DOMContentLoaded', () => {
    fetchTodos();
    fetchJournalEntries();
    const lastTab = localStorage.getItem('activeTab') || 'todo-tab';
    switchTab(lastTab);
    setCurrentDateTime();
    displayEvents();
    
    const tabs = ['todo-tab', 'journal-tab', 'scheduler-tab', 'backup-tab'];
    tabs.forEach(tabId => {
        document.getElementById(tabId).addEventListener('click', () => {
            switchTab(tabId);
            localStorage.setItem('activeTab', tabId);
        });
    });
});

function fetchTodos() {
    displayTodos();
}

function fetchJournalEntries() {
    displayJournalEntries();
}

function switchTab(tabId) {
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    document.getElementById(tabId.replace('-tab', '-section')).classList.add('active');

    if (tabId === 'journal-tab') {
        setCurrentDateTime();
    }
}

function addTodo() {
    const input = document.getElementById('todo-input');
    const todoText = input.value.trim();

    if (todoText === '') return;

    todos.unshift({ text: todoText });
    input.value = '';
    saveTodos();
    displayTodos();
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function displayTodos() {
    const list = document.getElementById('todo-list');
    list.innerHTML = '';

    todos.forEach((todo, index) => {
        const li = document.createElement('li');
        li.textContent = todo.text;

        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'task-buttons';

        const editButton = createButton('EDIT', () => editTodoPrompt(index));
        const deleteButton = createButton('DELETE', () => deleteTodo(index));

        buttonsDiv.append(editButton, deleteButton);
        li.appendChild(buttonsDiv);
        
        list.appendChild(li);
    });
}

function deleteTodo(index) {
    todos.splice(index, 1);
    saveTodos();
    displayTodos();
}

function editTodoPrompt(index) {
    const newText = prompt("Edit your todo:", todos[index].text);
    if (newText !== null && newText.trim() !== '') {
        todos[index].text = newText;
        saveTodos();
        displayTodos();
    }
}

function createButton(text, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.onclick = onClick;
    return button;
}

function saveJournal() {
    const journalText = document.getElementById('journal').value.trim();
    const dateTime = document.getElementById('journal-datetime').value;

    if (!dateTime) return;

    const timestamp = new Date(dateTime).getTime();
    
    if (journalText === '') {
        journalEntries = journalEntries.filter(entry => entry.timestamp !== timestamp); // Delete if empty
    } else {
        const existingEntryIndex = journalEntries.findIndex(entry => entry.timestamp === timestamp);
        if (existingEntryIndex > -1) {
            journalEntries[existingEntryIndex].text = journalText; // Edit existing entry
        } else {
            journalEntries.unshift({ text: journalText, timestamp }); // Create new entry
        }
    }

    localStorage.setItem('journalEntries', JSON.stringify(journalEntries));
    document.getElementById('journal').value = '';
    document.getElementById('journal-datetime').value = '';
    displayJournalEntries();
}


function setCurrentDateTime() {
    const now = new Date();
    const nycTimeZone = 'America/New_York';

    const options = { timeZone: nycTimeZone };
    const nycDate = new Date(now.toLocaleString('en-US', options));

    const year = nycDate.getFullYear();
    const month = String(nycDate.getMonth() + 1).padStart(2, '0');
    const day = String(nycDate.getDate()).padStart(2, '0');
    const hours = String(nycDate.getHours()).padStart(2, '0');
    const minutes = String(nycDate.getMinutes()).padStart(2, '0');

    document.getElementById('event-datetime').value = `${year}-${month}-${day}T${hours}:${minutes}`;
    document.getElementById('journal-datetime').value = `${year}-${month}-${day}T${hours}:${minutes}`;
}

function addOrEditEvent() {
    const dateTime = document.getElementById('event-datetime').value;
    const description = document.getElementById('event-description').value;

    const eventKey = new Date(dateTime).getTime();
    
    if (description === '') {
        delete events[eventKey]; // Delete event if description is empty
    } else {
        events[eventKey] = { description: description }; // Add or edit event
    }

    localStorage.setItem('events', JSON.stringify(events));
    displayEvents();
    document.getElementById('event-description').value = '';
}


function displayEvents() {
    const eventListDiv = document.getElementById('event-list');
    eventListDiv.innerHTML = '';

    const sortedEvents = Object.keys(events).sort((a, b) => b - a);
    sortedEvents.forEach(timestamp => {
        const event = events[timestamp];
        const eventDiv = document.createElement('div');
        eventDiv.className = 'event';

        const nycTimeZone = 'America/New_York';
        const eventDateTime = new Date(parseInt(timestamp)).toLocaleString('en-US', {
            timeZone: nycTimeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        const eventText = document.createElement('span');
        eventText.textContent = `${eventDateTime}: ${event.description}`;
        
        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'event-buttons';

        const editButton = createButton('EDIT', () => editEventPrompt(timestamp));
        const deleteButton = createButton('DELETE', () => deleteEvent(timestamp));

        buttonsDiv.append(editButton, deleteButton);
        eventDiv.append(eventText, buttonsDiv);
        eventListDiv.appendChild(eventDiv);
    });
}

function deleteEvent(timestamp) {
    delete events[timestamp];
    localStorage.setItem('events', JSON.stringify(events));
    displayEvents();
}

function editEventPrompt(timestamp) {
    const newDescription = prompt("Edit your event:", events[timestamp].description);
    if (newDescription !== null && newDescription.trim() !== '') {
        events[timestamp].description = newDescription;
        localStorage.setItem('events', JSON.stringify(events));
        displayEvents();
    }
}

function downloadBackup() {
    const backupData = {
        todos,
        journalEntries,
        events
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "backup.json");
    downloadAnchor.click();
}

function processUploadedBackup() {
    const fileInput = document.getElementById('upload-backup');
    const file = fileInput.files[0];
    const feedback = document.getElementById('upload-feedback');

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const uploadedData = JSON.parse(e.target.result);

                // Update the app state with uploaded data
                todos = uploadedData.todos || [];
                journalEntries = uploadedData.journalEntries || [];
                events = uploadedData.events || {};

                localStorage.setItem('todos', JSON.stringify(todos));
                localStorage.setItem('journalEntries', JSON.stringify(journalEntries));
                localStorage.setItem('events', JSON.stringify(events));

                // Refresh the displayed data
                displayTodos();
                displayJournalEntries();
                displayEvents();
                feedback.textContent = 'Backup uploaded successfully!';
            } catch (err) {
                feedback.textContent = 'Error processing uploaded file: ' + err.message;
            }
        };
        reader.readAsText(file);
    } else {
        feedback.textContent = 'Please select a file to upload.';
    }
}

function displayJournalEntries() {
    const entriesDiv = document.getElementById('journal-entries');
    entriesDiv.innerHTML = '';

    // Sort entries by timestamp in descending order (newest first)
    journalEntries.sort((a, b) => b.timestamp - a.timestamp);

    journalEntries.forEach(entry => {
        const entryDiv = document.createElement('div');
        
        // Format date in military time
        const date = new Date(entry.timestamp).toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false, // 24-hour format
            timeZone: 'America/New_York' // adjust to desired time zone
        });

        entryDiv.textContent = `${date}: ${entry.text}`;
        entriesDiv.appendChild(entryDiv);
    });
}
