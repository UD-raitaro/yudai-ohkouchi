(function () {
  "use strict";

  var config = window.seatingConfig || {};
  var tables = Array.isArray(config.tables) ? config.tables : [];

  if (!tables.length) return;
  if (document.getElementById("seating")) return;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === "string") node.textContent = text;
    return node;
  }

  function ensureModal() {
    var existing = document.getElementById("ws-seating-modal");
    if (existing) {
      return {
        overlay: existing,
        title: existing.querySelector(".ws-modal__title"),
        image: existing.querySelector(".ws-modal__image"),
        close: existing.querySelector(".ws-modal__close")
      };
    }

    var overlay = el("div", "ws-modal");
    overlay.id = "ws-seating-modal";
    overlay.setAttribute("aria-hidden", "true");

    var dialog = el("div", "ws-modal__dialog");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");

    var top = el("div", "ws-modal__top");
    var title = el("h3", "ws-modal__title", "席表");
    var close = el("button", "ws-modal__close");
    close.type = "button";
    close.setAttribute("aria-label", "閉じる");
    close.innerHTML = "&times;";

    var body = el("div", "ws-modal__body");
    var img = document.createElement("img");
    img.className = "ws-modal__image";
    img.alt = "";
    body.appendChild(img);

    top.appendChild(title);
    top.appendChild(close);
    dialog.appendChild(top);
    dialog.appendChild(body);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    function closeModal() {
      overlay.classList.remove("is-open");
      overlay.setAttribute("aria-hidden", "true");
      document.body.classList.remove("ws-modal-open");
    }

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeModal();
    });

    close.addEventListener("click", closeModal);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("is-open")) {
        closeModal();
      }
    });

    return { overlay: overlay, title: title, image: img, close: close };
  }

  var modal = ensureModal();

  function openModal(table) {
    modal.title.textContent = table.name || "席表";
    modal.image.src = table.image || "";
    modal.image.alt = table.alt || table.name || "席表";
    modal.overlay.classList.add("is-open");
    modal.overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("ws-modal-open");
  }

  function renderSection() {
    var section = el("section", "ws-seating section");
    section.id = "seating";

    var inner = el("div", "ws-seating__inner");
    var header = el("div", "ws-seating__header");
    var heading = el("h2", "ws-seating__title", config.heading || "席表");
    var intro = el("p", "ws-seating__intro", config.intro || "");

    header.appendChild(heading);
    if ((config.intro || "").trim()) header.appendChild(intro);

    var grid = el("div", "ws-seating__grid");

    tables.forEach(function (table) {
      var button = el("button", "ws-seating__button", table.name || "卓");
      button.type = "button";
      button.addEventListener("click", function () {
        openModal(table);
      });
      grid.appendChild(button);
    });

    inner.appendChild(header);
    inner.appendChild(grid);
    section.appendChild(inner);

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
    document.addEventListener("DOMContentLoaded", renderSection);
  } else {
    renderSection();
  }
})();
