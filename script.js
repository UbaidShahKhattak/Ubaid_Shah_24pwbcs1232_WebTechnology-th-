// =============================================
//   EVENT HORIZON – script.js
//      All DOM manipulation, validation, filtering
// =============================================

// ---- Set current year in footer ----
document.getElementById('year').textContent = new Date().getFullYear();

//    ---- Predefined initial events ----
let events = [
  {
    id: Date.now() + 1,
    name: "Tech Summit 2025",
    date: "2025-08-15",
    description: "Annual technology conference featuring top speakers from the industry covering AI, cloud computing, and cybersecurity."
  },
  {
    id: Date.now() + 2,
    name: "UET Peshawar Open Day",
    date: "2025-09-05",
    description: "University open day for prospective students. Campus tours, departmental exhibitions, and Q&A sessions with faculty."
  },
  {
    id: Date.now() + 3,
    name: "Web Dev Bootcamp",
    date: "2024-11-20",
    description: "Intensive 3-day bootcamp covering HTML, CSS, and JavaScript fundamentals for beginners."
  },
  {
    id: Date.now() + 4,
    name: "Startup Pitch Night",
    date: "2025-10-01",
    description: "Local entrepreneurs pitch their business ideas to a panel of investors. Networking dinner included."
  },
  {
    id: Date.now() + 5,
    name: "CS224 Project Showcase",
    date: "2024-12-10",
    description: "Students present their semester web technology projects. Prizes for top three projects."
  }
];

// ---- Utility: Check if a date is in the past ----
function isPast(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dateStr) < today;
}

// ---- Utility: Format date nicely ----
function formatDate(dateStr) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', options);
}

// ---- Sort events by date ascending ----
function sortEvents() {
  events.sort((a, b) => new Date(a.date) - new Date(b.date));
}

// ---- Render all (or filtered) events ----
function renderEvents(filter = '') {
  const list = document.getElementById('eventList');
  const noEvents = document.getElementById('noEvents');
  const countBadge = document.getElementById('eventCount');

  list.innerHTML = '';

  // Filter by name or date string
  const filterLower = filter.toLowerCase();
  const filtered = events.filter(ev =>
    ev.name.toLowerCase().includes(filterLower) ||
    ev.date.includes(filter) ||
    formatDate(ev.date).toLowerCase().includes(filterLower)
  );

  countBadge.textContent = filtered.length;

  if (filtered.length === 0) {
    noEvents.classList.remove('hidden');
    return;
  }

  noEvents.classList.add('hidden');

  filtered.forEach(ev => {
    const past = isPast(ev.date);
    const card = document.createElement('div');
    card.className = 'event-card' + (past ? ' past' : '');
    card.dataset.id = ev.id;

    card.innerHTML = `
      <span class="${past ? 'past-label' : 'upcoming-label'}">${past ? '⏮ Past' : '✦ Upcoming'}</span>
      <div class="event-name">${escapeHTML(ev.name)}</div>
      <div class="event-date">📅 ${formatDate(ev.date)}</div>
      <div class="event-desc">${escapeHTML(ev.description)}</div>
      <button class="btn-delete" data-id="${ev.id}">✕ Delete</button>
    `;

    list.appendChild(card);
  });

  // Attach delete listeners
  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => deleteEvent(Number(btn.dataset.id)));
  });
}

// ---- Escape HTML to prevent XSS ----
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---- Delete an event by id ----
function deleteEvent(id) {
  events = events.filter(ev => ev.id !== id);
  renderEvents(document.getElementById('searchInput').value);
}

// ---- Form submission – add new event ----
document.getElementById('eventForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('eventName').value.trim();
  const date = document.getElementById('eventDate').value;
  const desc = document.getElementById('eventDesc').value.trim();
  const warning = document.getElementById('formWarning');

  // Validation: all fields required
  if (!name || !date || !desc) {
    warning.classList.remove('hidden');
    return;
  }

  warning.classList.add('hidden');

  // Add new event object
  events.push({
    id: Date.now(),
    name,
    date,
    description: desc
  });

  // Sort after adding
  sortEvents();

  // Re-render
  renderEvents(document.getElementById('searchInput').value);

  // Reset form
  this.reset();
});

// ---- Hide warning when user starts typing ----
['eventName', 'eventDate', 'eventDesc'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => {
    document.getElementById('formWarning').classList.add('hidden');
  });
});

// ---- Search / filter ----
document.getElementById('searchInput').addEventListener('input', function () {
  renderEvents(this.value.trim());
});

// ---- Initial render ----
sortEvents();
renderEvents();
