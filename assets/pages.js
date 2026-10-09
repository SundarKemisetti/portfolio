(() => {
  const toggle = document.getElementById("theme-toggle");
  if (toggle) {
    const savedTheme = localStorage.getItem("bssk-theme");
    if (savedTheme === "light") document.documentElement.dataset.theme = "light";
    const updateButton = () => {
      const light = document.documentElement.dataset.theme === "light";
      toggle.textContent = light ? "☾" : "☼";
      toggle.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
    };
    updateButton();
    toggle.addEventListener("click", () => {
      const light = document.documentElement.dataset.theme === "light";
      if (light) delete document.documentElement.dataset.theme;
      else document.documentElement.dataset.theme = "light";
      localStorage.setItem("bssk-theme", light ? "dark" : "light");
      updateButton();
    });
  }
  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(contactForm);
      const subject = `Portfolio inquiry from ${data.get("name")}`;
      const body = `Name: ${data.get("name")}\nEmail: ${data.get("email")}\n\n${data.get("message")}`;
      window.location.href = `mailto:${window.PORTFOLIO_LINKS.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }
})();
