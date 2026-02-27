/* ===================================
   RAIN Lab Main JavaScript
   =================================== */

// ============= Mobile Menu Toggle =============

const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

menuToggle.addEventListener('click', () => {
  menuToggle.classList.toggle('active');
  navMenu.classList.toggle('active');
});

// Close menu when clicking a nav link
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    menuToggle.classList.remove('active');
    navMenu.classList.remove('active');
  });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
    menuToggle.classList.remove('active');
    navMenu.classList.remove('active');
  }
});

// ============= Sticky Header on Scroll =============

const header = document.getElementById('header');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// ============= Smooth Scroll for Navigation Links =============

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');

    if (targetId === '#') return;

    const targetElement = document.querySelector(targetId);

    if (targetElement) {
      const headerHeight = header.offsetHeight;
      const targetPosition = targetElement.offsetTop - headerHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// ============= Active Section Highlighting =============

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function setActiveNavLink() {
  let currentSection = '';
  const scrollPosition = window.scrollY + 150; // Offset for header

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;

    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      currentSection = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${currentSection}`) {
      link.classList.add('active');
    }
  });
}

window.addEventListener('scroll', setActiveNavLink);
window.addEventListener('load', setActiveNavLink);

// ============= Load and Render Team Members =============

async function loadMembers() {
  try {
    const response = await fetch('data/members.json');
    const data = await response.json();
    renderMembers(data.members);
  } catch (error) {
    console.error('Error loading members:', error);
    document.getElementById('membersContainer').innerHTML = `
      <p style="text-align: center; color: var(--color-text-secondary);">
        No team members to display yet. Add member data to data/members.json.
      </p>
    `;
  }
}

function renderMembers(members) {
  const container = document.getElementById('membersContainer');

  if (!members || members.length === 0) {
    container.innerHTML = `
      <p style="text-align: center; color: var(--color-text-secondary);">
        No team members to display yet. Add member data to data/members.json.
      </p>
    `;
    return;
  }

  // Separate PI from other members
  const pi = members.filter(member => member.category === 'pi');
  const otherMembers = members.filter(member => member.category !== 'pi');

  let html = '';

  // Render PI centered at top
  if (pi.length > 0) {
    html += '<div class="pi-section">';
    pi.forEach(member => {
      html += renderMemberCard(member);
    });
    html += '</div>';
  }

  // Render all other members in one grid
  if (otherMembers.length > 0) {
    html += '<div class="members-grid">';
    otherMembers.forEach(member => {
      html += renderMemberCard(member);
    });
    html += '</div>';
  }

  container.innerHTML = html;
}

function renderMemberCard(member) {
  const links = member.links || {};
  const linksHtml = Object.entries(links)
    .filter(([key, url]) => url)
    .map(([key, url]) => {
      const label = key.charAt(0).toUpperCase() + key.slice(1);
      const icon = getLinkIcon(key);
      return `<a href="${url}" class="btn-link" title="${label}" target="_blank" rel="noopener">${icon}</a>`;
    })
    .join('');

  const photoSrc = member.photo || 'images/team/placeholder.jpg';
  const bioId = `bio-${member.name.replace(/\s+/g, '-').toLowerCase()}`;

  return `
    <div class="member-card fade-in">
      <img src="${photoSrc}" alt="${member.name}" class="member-image" onerror="this.src='images/team/placeholder.jpg'">
      <div class="member-info">
        <h4 class="member-name">${member.name}</h4>
        <p class="member-role">${member.role}</p>
        <p class="member-bio truncated" id="${bioId}">${member.bio}</p>
        <button class="bio-toggle" onclick="toggleBio('${bioId}', this)">Read more</button>
        ${linksHtml ? `<div class="member-links">${linksHtml}</div>` : ''}
      </div>
    </div>
  `;
}

function getLinkIcon(type) {
  const icons = {
    'website': '🌐',
    'scholar': '🎓',
    'github': '💻',
    'twitter': '🐦',
    'linkedin': '💼',
    'email': '📧'
  };
  return icons[type.toLowerCase()] || '🔗';
}

function toggleBio(id, btn) {
  const bio = document.getElementById(id);
  bio.classList.toggle('truncated');
  btn.textContent = bio.classList.contains('truncated') ? 'Read more' : 'Show less';
}

// ============= Load and Render Publications =============

let allPublications = [];

async function loadPublications() {
  try {
    const response = await fetch('data/publications.json');
    const data = await response.json();
    allPublications = data.publications || [];

    // Populate year filter
    populateYearFilter(allPublications);

    // Render all publications
    renderPublications(allPublications);
  } catch (error) {
    console.error('Error loading publications:', error);
    document.getElementById('publicationsContainer').innerHTML = `
      <p style="text-align: center; color: var(--color-text-secondary);">
        No publications to display yet. Add publication data to data/publications.json.
      </p>
    `;
  }
}

function populateYearFilter(publications) {
  const years = [...new Set(publications.map(pub => pub.year))].sort((a, b) => b - a);
  const filterSelect = document.getElementById('yearFilter');

  years.forEach(year => {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    filterSelect.appendChild(option);
  });

  // Add filter event listener
  filterSelect.addEventListener('change', (e) => {
    const selectedYear = e.target.value;
    if (selectedYear === 'all') {
      renderPublications(allPublications);
    } else {
      const filtered = allPublications.filter(pub => pub.year.toString() === selectedYear);
      renderPublications(filtered);
    }
  });
}

function renderPublications(publications) {
  const container = document.getElementById('publicationsContainer');

  if (!publications || publications.length === 0) {
    container.innerHTML = `
      <p style="text-align: center; color: var(--color-text-secondary); padding: var(--space-2xl);">
        No publications found for the selected year.
      </p>
    `;
    return;
  }

  // Sort by year (descending)
  publications.sort((a, b) => b.year - a.year);

  const html = '<div class="publications-list">' +
    publications.map(pub => renderPublicationItem(pub)).join('') +
    '</div>';

  container.innerHTML = html;
}

function renderPublicationItem(pub) {
  // Highlight lab members in author list
  const highlightAuthors = pub.highlightAuthors || [];
  const authorsHtml = pub.authors.map(author => {
    if (highlightAuthors.includes(author)) {
      return `<span class="author-highlight">${author}</span>`;
    }
    return author;
  }).join(', ');

  // Generate links
  const links = pub.links || {};
  const linksHtml = Object.entries(links)
    .filter(([key, url]) => url)
    .map(([key, url]) => {
      const label = key.toUpperCase();
      return `<a href="${url}" class="btn-link" target="_blank" rel="noopener">${label}</a>`;
    })
    .join('');

  // Venue icon based on type
  const venueIcon = getVenueIcon(pub.venueType || 'conference');

  return `
    <div class="publication-item fade-in">
      <div class="publication-header">
        <div class="year-badge">${pub.year}</div>
        <div class="publication-content">
          <h3 class="publication-title">${pub.title}</h3>
          <p class="publication-authors">${authorsHtml}</p>
          <p class="publication-venue">
            <span class="venue-icon">${venueIcon}</span>
            ${pub.venue}
          </p>
          ${linksHtml ? `<div class="publication-links">${linksHtml}</div>` : ''}
        </div>
      </div>
    </div>
  `;
}

function getVenueIcon(type) {
  const icons = {
    'conference': '📄',
    'journal': '📚',
    'preprint': '📝',
    'workshop': '🔬'
  };
  return icons[type] || '📄';
}

// ============= Load and Render News =============

async function loadNews() {
  try {
    const response = await fetch('data/news.json');
    const data = await response.json();
    renderNews(data.news);
  } catch (error) {
    console.error('Error loading news:', error);
    document.getElementById('newsContainer').innerHTML = `
      <p style="text-align: center; color: var(--color-text-secondary);">
        No news to display yet. Add news items to data/news.json.
      </p>
    `;
  }
}

function renderNews(newsItems) {
  const container = document.getElementById('newsContainer');

  if (!newsItems || newsItems.length === 0) {
    container.innerHTML = `
      <p style="text-align: center; color: var(--color-text-secondary);">
        No news to display yet. Add news items to data/news.json.
      </p>
    `;
    return;
  }

  // Sort by date (newest first)
  newsItems.sort((a, b) => new Date(b.date) - new Date(a.date));

  const html = newsItems.map(item => renderNewsItem(item)).join('');
  container.innerHTML = html;
}

function renderNewsItem(item) {
  const date = new Date(item.date);
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'short' });

  const linkHtml = item.link ?
    `<a href="${item.link}" class="news-link" target="_blank" rel="noopener">Read more →</a>` : '';

  return `
    <div class="news-item fade-in">
      <div class="news-date">
        <div class="news-day">${day}</div>
        <div class="news-month">${month.toUpperCase()}</div>
      </div>
      <div class="news-content">
        <h3>${item.headline}</h3>
        <p class="news-description">${item.description}</p>
        ${linkHtml}
      </div>
    </div>
  `;
}

// ============= Load and Render Alumni =============

function hideAlumniSection() {
  document.getElementById('alumni').style.display = 'none';
  document.querySelectorAll('a[href="#alumni"]').forEach(el => {
    el.closest('li').style.display = 'none';
  });
}

async function loadAlumni() {
  try {
    const response = await fetch('data/alumni.json');
    const data = await response.json();
    renderAlumni(data.alumni);
  } catch (error) {
    console.error('Error loading alumni:', error);
    hideAlumniSection();
  }
}

function renderAlumni(alumni) {
  const container = document.getElementById('alumniContainer');

  if (!alumni || alumni.length === 0) {
    hideAlumniSection();
    return;
  }

  // Sort by end year (descending)
  alumni.sort((a, b) => b.endYear - a.endYear);

  // Group by end year
  const groupedByYear = {};
  alumni.forEach(person => {
    const year = person.endYear;
    if (!groupedByYear[year]) {
      groupedByYear[year] = [];
    }
    groupedByYear[year].push(person);
  });

  // Render each year group
  let html = '';

  Object.keys(groupedByYear).sort((a, b) => b - a).forEach(year => {
    html += `
      <div class="alumni-year-group">
        <h3 class="alumni-year-heading">${year}</h3>
        <div class="alumni-list">
          ${groupedByYear[year].map(person => renderAlumniItem(person)).join('')}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function renderAlumniItem(person) {
  const nameHtml = person.link ?
    `<a href="${person.link}" target="_blank" rel="noopener">${person.name}</a>` :
    person.name;

  const years = person.startYear && person.endYear ?
    `${person.startYear}–${person.endYear}` :
    person.endYear;

  return `
    <div class="alumni-item fade-in">
      <div class="alumni-name">${nameHtml}</div>
      <div class="alumni-details">${years} • ${person.role}</div>
      ${person.currentPosition ? `<div class="alumni-current">Now: ${person.currentPosition}</div>` : ''}
    </div>
  `;
}

// ============= Intersection Observer for Fade-in Animations =============

const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe fade-in elements (will be applied after content loads)
function observeFadeInElements() {
  document.querySelectorAll('.fade-in').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
  });
}

// ============= Initialize on Page Load =============

document.addEventListener('DOMContentLoaded', async () => {
  // Load all data
  await Promise.all([
    loadMembers(),
    loadPublications(),
    loadNews(),
    loadAlumni()
  ]);

  // Apply fade-in animations after content is loaded
  setTimeout(() => {
    observeFadeInElements();
  }, 100);
});

// ============= Utility: Handle External Link Security =============

document.addEventListener('click', (e) => {
  const link = e.target.closest('a[target="_blank"]');
  if (link && !link.hasAttribute('rel')) {
    link.setAttribute('rel', 'noopener noreferrer');
  }
});
