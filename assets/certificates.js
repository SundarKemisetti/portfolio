const CERTIFICATES = {
  "cyber-crime-intern": { file: "assets/certificates/visakhapatnam-police.jpeg", title: "Cyber Crime & Digital Forensics Intern" },
  "vapt-trainee": { file: "assets/certificates/aicda-vapt.png", title: "VAPT Trainee" },
  "ethical-hacking-intern": { file: "assets/certificates/anonymous-india.png", title: "Cyber Security & Ethical Hacking Intern" },
  "jntu-intern": { file: "assets/certificates/jntu-kakinada.jpeg", title: "Digital Forensics & Cyber Security Training Intern" },
  "clue4evidence-intern": { file: "assets/certificates/clue4evidence.png", title: "Cybersecurity Intern" }
};

(() => {
  const entries = [...document.querySelectorAll(".timeline-item[data-cert]")];
  if (!entries.length) return;

  // Update CERTIFICATES above when adding or replacing local certificate files.
  entries.forEach((entry) => {
    const certificate = CERTIFICATES[entry.dataset.cert];
    if (!certificate) {
      entry.removeAttribute("data-cert");
      return;
    }
    const title = entry.querySelector("h3")?.textContent.trim() || certificate.title;
    const company = entry.querySelector(".timeline-org")?.textContent.trim() || "";
    entry.tabIndex = 0;
    entry.setAttribute("role", "button");
    entry.setAttribute("aria-haspopup", "dialog");
    entry.setAttribute("aria-label", `View certificate: ${title}${company ? ` at ${company}` : ""}`);
    const badge = document.createElement("span");
    badge.className = "certificate-badge";
    badge.textContent = "View certificate ↗";
    entry.querySelector(".timeline-head")?.append(badge);
  });

  const modal = document.createElement("div");
  modal.className = "certificate-modal";
  modal.hidden = true;
  modal.innerHTML = `
    <div class="certificate-backdrop" data-modal-close></div>
    <section class="certificate-dialog" role="dialog" aria-modal="true" aria-labelledby="certificate-title" tabindex="-1">
      <header class="certificate-dialog-header">
        <div><h2 id="certificate-title"></h2><p class="certificate-company"></p></div>
        <button class="certificate-close" type="button" aria-label="Close certificate">×</button>
      </header>
      <div class="certificate-content"></div>
      <footer class="certificate-actions"><a class="button certificate-download" download>Download certificate ↓</a></footer>
    </section>`;
  document.body.append(modal);

  const dialog = modal.querySelector(".certificate-dialog");
  const titleElement = modal.querySelector("#certificate-title");
  const companyElement = modal.querySelector(".certificate-company");
  const content = modal.querySelector(".certificate-content");
  const download = modal.querySelector(".certificate-download");
  const closeButton = modal.querySelector(".certificate-close");
  let activeEntry = null;
  let previousOverflow = "";

  const showUnavailable = () => {
    content.replaceChildren();
    const message = document.createElement("p");
    message.className = "certificate-unavailable";
    message.textContent = "Certificate coming soon";
    content.append(message);
    download.hidden = true;
  };

  const displayCertificate = (certificate) => {
    content.replaceChildren();
    download.href = certificate.file;
    download.hidden = false;
    const extension = certificate.file.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "webp"].includes(extension)) {
      const zoomControl = document.createElement("button");
      zoomControl.className = "certificate-image-toggle";
      zoomControl.type = "button";
      zoomControl.setAttribute("aria-label", "Zoom certificate image");
      const image = document.createElement("img");
      image.src = certificate.file;
      image.alt = `${certificate.title} certificate`;
      image.loading = "lazy";
      image.addEventListener("error", showUnavailable, { once: true });
      zoomControl.append(image);
      zoomControl.addEventListener("click", () => {
        const zoomed = zoomControl.classList.toggle("is-zoomed");
        zoomControl.setAttribute("aria-label", zoomed ? "Fit certificate to screen" : "Zoom certificate image");
      });
      content.append(zoomControl);
    } else if (extension === "pdf") {
      const frame = document.createElement("iframe");
      frame.className = "certificate-pdf";
      frame.src = certificate.file;
      frame.title = `${certificate.title} certificate`;
      frame.loading = "lazy";
      frame.addEventListener("error", showUnavailable, { once: true });
      content.append(frame);
      if (window.location.protocol !== "file:") {
        fetch(certificate.file, { method: "HEAD" })
          .then((response) => {
            if (!response.ok) showUnavailable();
          })
          .catch(showUnavailable);
      }
    } else {
      showUnavailable();
    }
  };

  const openModal = (entry) => {
    const certificate = CERTIFICATES[entry.dataset.cert];
    if (!certificate) return;
    activeEntry = entry;
    titleElement.textContent = certificate.title;
    companyElement.textContent = entry.querySelector(".timeline-org")?.textContent.trim() || "";
    displayCertificate(certificate);
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    modal.hidden = false;
    requestAnimationFrame(() => {
      modal.classList.add("is-open");
      closeButton.focus();
    });
  };

  const closeModal = () => {
    if (modal.hidden) return;
    modal.classList.remove("is-open");
    document.body.style.overflow = previousOverflow;
    const entryToRestore = activeEntry;
    activeEntry = null;
    window.setTimeout(() => {
      modal.hidden = true;
      entryToRestore?.focus();
    }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 220);
  };

  entries.forEach((entry) => {
    if (!entry.hasAttribute("data-cert")) return;
    entry.addEventListener("click", (event) => {
      if (!event.target.closest("a, button")) openModal(entry);
    });
    entry.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openModal(entry);
      }
    });
  });
  closeButton.addEventListener("click", closeModal);
  modal.querySelector("[data-modal-close]").addEventListener("click", closeModal);
  modal.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeModal();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = [...dialog.querySelectorAll('a[href]:not([hidden]), button:not([hidden]), iframe')];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
})();
