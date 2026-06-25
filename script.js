(function () {
  const header = document.querySelector('.header');
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  const reveals = document.querySelectorAll('.reveal');

  const VISIBLE_COUNT = 4;

  window.addEventListener('scroll', () => {
    header.classList.toggle('header--scrolled', window.scrollY > 40);
  }, { passive: true });

  burger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  reveals.forEach((el) => observer.observe(el));

  initServices();
  initBookingModal();

  function initServices() {
    const filtersEl = document.getElementById('services-filters');
    const gridEl = document.getElementById('services-grid');
    const searchEl = document.getElementById('services-search');
    const emptyEl = document.getElementById('services-empty');
    const showAllBtn = document.getElementById('services-show-all');

    if (!filtersEl || typeof SERVICES === 'undefined') return;

    let activeCategory = 'all';
    let searchQuery = '';
    let showAll = false;

    SERVICE_CATEGORIES.forEach((cat, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'services-filter' + (index === 0 ? ' is-active' : '');
      btn.textContent = cat.label;
      btn.dataset.category = cat.id;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      btn.addEventListener('click', () => {
        activeCategory = cat.id;
        showAll = false;
        filtersEl.querySelectorAll('.services-filter').forEach((b) => {
          const isActive = b.dataset.category === cat.id;
          b.classList.toggle('is-active', isActive);
          b.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
        render();
      });
      filtersEl.appendChild(btn);
    });

    searchEl.addEventListener('input', () => {
      searchQuery = searchEl.value.trim().toLowerCase();
      showAll = false;
      render();
    });

    showAllBtn.addEventListener('click', () => {
      showAll = !showAll;
      showAllBtn.textContent = showAll ? 'Свернуть список' : 'Развернуть список';
      showAllBtn.classList.toggle('is-expanded', showAll);
      gridEl.classList.toggle('is-expanded', showAll);
      render();
      if (showAll) {
        showAllBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });

    function getFiltered() {
      return SERVICES.filter((service) => {
        const matchCategory = activeCategory === 'all' || service.category === activeCategory;
        const haystack = `${service.title} ${service.description} ${service.categoryLabel}`.toLowerCase();
        const matchSearch = !searchQuery || haystack.includes(searchQuery);
        return matchCategory && matchSearch;
      });
    }

    function renderCard(service, index) {
      const card = document.createElement('article');
      card.className = 'service-card';
      card.style.animationDelay = `${index * 0.07}s`;
      card.innerHTML = `
        <span class="service-card__tag">${service.categoryLabel}</span>
        <h3 class="service-card__title">${service.title}</h3>
        <p class="service-card__desc">${service.description}</p>
        <div class="service-card__meta">
          <div class="service-card__row">
            <span class="service-card__label">Длительность</span>
            <span class="service-card__value">${service.duration}</span>
          </div>
          <div class="service-card__row">
            <span class="service-card__label">Стоимость</span>
            <span class="service-card__value">${service.price}</span>
          </div>
        </div>
        <button type="button" class="service-card__book" data-service-id="${service.id}">Записаться</button>
      `;
      card.querySelector('.service-card__book').addEventListener('click', () => {
        openBookingModal(service);
      });
      return card;
    }

    function render() {
      const filtered = getFiltered();
      gridEl.innerHTML = '';

      if (filtered.length === 0) {
        emptyEl.hidden = false;
        showAllBtn.hidden = true;
        return;
      }

      emptyEl.hidden = true;
      const visible = showAll ? filtered : filtered.slice(0, VISIBLE_COUNT);
      showAllBtn.hidden = filtered.length <= VISIBLE_COUNT;

      visible.forEach((service, index) => {
        gridEl.appendChild(renderCard(service, index));
      });
    }

    render();
  }

  function initBookingModal() {
    const modal = document.getElementById('booking-modal');
    const backdrop = document.getElementById('booking-modal-backdrop');
    const closeBtn = document.getElementById('booking-modal-close');
    const scrollLink = document.getElementById('booking-modal-scroll');
    const serviceEl = document.getElementById('booking-modal-service');
    const bookingSelected = document.getElementById('booking-selected');
    const bookingSection = document.getElementById('booking');

    if (!modal) return;

    function closeModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    window.openBookingModal = function (service) {
      const text = `${service.title} · ${service.price}`;
      serviceEl.textContent = text;
      if (bookingSelected) {
        bookingSelected.textContent = `Вы выбрали: ${service.title}`;
        bookingSelected.hidden = false;
      }
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    };

    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);

    scrollLink.addEventListener('click', () => {
      closeModal();
      if (bookingSection) {
        bookingSection.classList.add('is-highlight');
        setTimeout(() => bookingSection.classList.remove('is-highlight'), 1200);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        closeModal();
      }
    });
  }
})();
