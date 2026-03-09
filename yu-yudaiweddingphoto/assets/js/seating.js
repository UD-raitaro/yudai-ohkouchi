\
(function () {
  "use strict";

  var config = window.seatingConfig || {};
  var tables = Array.isArray(config.tables) ? config.tables : [];

  if (!tables.length) return;
  if (document.getElementById("seating")) return;

  function createEl(tag, className, text) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (typeof text === "string") el.textContent = text;
    return el;
  }

  function renderSection() {
    var section = createEl("section", "ws-seating section");
    section.id = "seating";

    var inner = createEl("div", "ws-seating__inner");
    var header = createEl("div", "ws-seating__header");
    var heading = createEl("h2", "ws-seating__title", config.heading || "席表");
    var intro = createEl("p", "ws-seating__intro", config.intro || "");

    header.appendChild(heading);
    if ((config.intro || "").trim()) header.appendChild(intro);

    var grid = createEl("div", "ws-seating__grid");
    tables.forEach(function (table) {
      var btn = createEl("button", "ws-seating__button", table.name || "卓");
      btn.type = "button";
      btn.setAttribute("data-image", table.image || "");
      btn.setAttribute("data-alt", table.alt || (table.name || "席表"));
      btn.setAttribute("aria-haspopup", "dialog");
      btn.addEventListener("click", function () {
        openModal(table);
      });
      grid.appendChild(btn);
    });

    inner.appendChild(header);
    inner.appendChild(grid);
    section.appendChild(inner);
    return section;
  }

  function createModal() {
    var overlay = createEl("div", "ws-modal");
    overlay.id = "ws-seating-modal";
    overlay.hidden = true;

    var dialog = createEl("div", "ws-modal__dialog");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "ws-modal-title");

    var top = createEl("div", "ws-modal__top");
    var title = createEl("h3", "ws-modal__title", "席表");
    title.id = "ws-modal-title";

    var close = createEl("button", "ws-modal__close");
    close.type = "button";
    close.setAttribute("aria-label", "閉じる");
    close.innerHTML = "&times;";

    top.appendChild(title);
    top.appendChild(close);

    var body = createEl("div", "ws-modal__body");
    var img = document.createElement("img");
    img.className = "ws-modal__image";
    img.alt = "";
    body.appendChild(img);

    dialog.appendChild(top);
    dialog.appendChild(body);
    overlay.appendChild(dialog);

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeModal();
    });
    close.addEventListener("click", closeModal);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !overlay.hidden) closeModal();
    });

    document.body.appendChild(overlay);

    return {
      overlay: overlay,
      title: title,
      image: img
    };
  }

  var modalRef = null;

  function openModal(table) {
    if (!modalRef) modalRef = createModal();
    modalRef.title.textContent = table.name || "席表";
    modalRef.image.src = table.image || "";
    modalRef.image.alt = table.alt || table.name || "席表";
    modalRef.overlay.hidden = false;
    document.body.classList.add("ws-modal-open");
  }

  function closeModal() {
    if (!modalRef) return;
    modalRef.overlay.hidden = true;
    document.body.classList.remove("ws-modal-open");
  }

  function mountSection() {
    var section = renderSection();
    var contact = document.getElementById("contact");
    if (contact && contact.parentNode) {
      contact.parentNode.insertBefore(section, contact);
      return;
    }

    var main = document.querySelector("main");
    if (main) {
      main.appendChild(section);
      return;
    }

    document.body.appendChild(section);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountSection);
  } else {
    mountSection();
  }
})();
