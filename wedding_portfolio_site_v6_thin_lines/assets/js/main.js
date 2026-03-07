(function () {
  const content = window.siteContent || {};
  const items = window.galleryItems || [];

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el && value) el.textContent = value;
  };

  setText("site-title", content.siteTitle);
  setText("site-subtitle", content.siteSubtitle);
  setText("contact-note", content.contact?.note || "Instagramのリンク先は content/site-content.js で編集できます。");

  const heroLinks = document.getElementById("hero-links");
  (content.heroLinks || []).forEach(link => {
    const a = document.createElement("a");
    a.href = link.href;
    a.textContent = link.label;
    heroLinks.appendChild(a);
  });


  const iconMarkup = {
    web: `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="8.5"></circle>
        <path d="M3.5 12h17"></path>
        <path d="M12 3.5c2.2 2.35 3.4 5.35 3.4 8.5s-1.2 6.15-3.4 8.5"></path>
        <path d="M12 3.5c-2.2 2.35-3.4 5.35-3.4 8.5s1.2 6.15 3.4 8.5"></path>
      </svg>`,
    instagram: `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
        <rect x="4.25" y="4.25" width="15.5" height="15.5" rx="4.25"></rect>
        <circle cx="12" cy="12" r="3.5"></circle>
        <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none"></circle>
      </svg>`
  };

  const createIconLink = (link) => {
    const a = document.createElement("a");
    a.href = link.href || "#";
    a.className = `icon-link ${link.kind || "default"}`;
    if (link.href && !link.href.startsWith("#")) {
      a.target = "_blank";
      a.rel = "noreferrer noopener";
    }
    a.setAttribute("aria-label", link.label);
    a.innerHTML = `${iconMarkup[link.kind] || iconMarkup.web}<span class="sr-only">${link.label}</span>`;
    return a;
  };

  const renderIconLinks = (targetId, links) => {
    const target = document.getElementById(targetId);
    if (!target) return;
    (links || []).forEach(link => target.appendChild(createIconLink(link)));
  };

  renderIconLinks("smallsnow-links", content.profileLinks?.smallsnow);
  renderIconLinks("takayanagi-links", content.profileLinks?.takayanagi);
  renderIconLinks("contact-yu-links", content.contactLinks?.yu);
  renderIconLinks("contact-yudai-links", content.contactLinks?.yudai);

  const acknowledgement = document.getElementById("acknowledgement-text");
  (content.acknowledgement || []).forEach(paragraph => {
    const p = document.createElement("p");
    p.textContent = paragraph;
    acknowledgement.appendChild(p);
  });

  const scheduleList = document.getElementById("schedule-list");
  (content.schedule || []).forEach(entry => {
    const item = document.createElement("li");

    if (entry.divider) {
      item.className = "timeline-divider";
      item.innerHTML = `<span></span><span>～～${entry.divider}～～</span>`;
      scheduleList.appendChild(item);
      return;
    }

    item.className = "timeline-item";
    const time = document.createElement("div");
    time.className = "timeline-time";
    time.textContent = entry.time || "";

    const body = document.createElement("div");
    body.className = "timeline-content";

    const title = document.createElement("div");
    title.className = "timeline-title";
    title.textContent = entry.title || "";
    body.appendChild(title);

    if (entry.noteLabel) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "schedule-trigger";
      button.textContent = entry.noteLabel;
      button.addEventListener("click", () => openInfoModal(entry));
      body.appendChild(button);
    }

    item.appendChild(time);
    item.appendChild(body);
    scheduleList.appendChild(item);
  });

  const createCard = (item) => {
    const article = document.createElement("article");
    article.className = "gallery-item";

    const button = document.createElement("button");
    button.className = "gallery-button";
    button.type = "button";
    button.setAttribute("aria-label", item.title);

    const frame = document.createElement("div");
    frame.className = "gallery-frame";

    const img = document.createElement("img");
    img.src = item.file;
    img.alt = item.alt || item.title;
    img.loading = "lazy";
    img.onerror = () => {
      img.src = "assets/images/placeholder.svg";
      img.alt = `${item.title} placeholder`;
    };

    const meta = document.createElement("div");
    meta.className = "gallery-meta";
    meta.innerHTML = `<span>${item.title}</span><span>${item.year || ""}</span>`;

    frame.appendChild(img);
    button.appendChild(frame);
    button.appendChild(meta);
    button.addEventListener("click", () => openLightbox(item));

    article.appendChild(button);
    return article;
  };

  const renderGallery = (targetId, filteredItems) => {
    const target = document.getElementById(targetId);
    if (!target) return;
    filteredItems.forEach(item => target.appendChild(createCard(item)));
  };

  renderGallery("smallsnow-gallery", items.filter(item => item.category === "smallsnow"));
  renderGallery("takayanagi-gallery", items.filter(item => item.category === "takayanagi"));
  renderGallery("other-gallery", items.filter(item => item.category === "other"));

  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightbox-image");
  const lightboxClose = document.getElementById("lightbox-close");

  function openLightbox(item) {
    lightboxImage.src = item.file;
    lightboxImage.alt = item.alt || item.title;
    lightboxImage.onerror = () => {
      lightboxImage.src = "assets/images/placeholder.svg";
    };
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  const infoModal = document.getElementById("info-modal");
  const infoModalTitle = document.getElementById("info-modal-title");
  const infoModalBody = document.getElementById("info-modal-body");
  const modalClose = document.getElementById("modal-close");

  function openInfoModal(entry) {
    infoModalTitle.textContent = entry.modalTitle || entry.noteLabel || "詳細";
    infoModalBody.innerHTML = "";
    (entry.modalBody || []).forEach(paragraph => {
      const p = document.createElement("p");
      p.textContent = paragraph;
      infoModalBody.appendChild(p);
    });
    infoModal.classList.add("is-open");
    infoModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeInfoModal() {
    infoModal.classList.remove("is-open");
    infoModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  modalClose.addEventListener("click", closeInfoModal);
  infoModal.addEventListener("click", (event) => {
    if (event.target === infoModal) closeInfoModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (lightbox.classList.contains("is-open")) closeLightbox();
      if (infoModal.classList.contains("is-open")) closeInfoModal();
    }
  });
})();
