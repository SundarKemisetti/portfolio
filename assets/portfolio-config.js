window.PORTFOLIO_LINKS = Object.freeze({
  email: "sundarkemisetti@gmail.com",
  linkedin: "https://www.linkedin.com/in/sundarkemisetti/",
  github: "https://github.com/SundarKemisetti",
  tryhackme: "https://tryhackme.com/p/sundarkemisetti",
  instagram: "http://instagram.com/saisundarkemisetti/"
});

document.querySelectorAll("[data-profile-link]").forEach((link) => {
  const url = window.PORTFOLIO_LINKS[link.dataset.profileLink];
  if (!url || url === "#") {
    link.hidden = true;
    return;
  }
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
});

document.querySelectorAll("[data-contact-email-link]").forEach((link) => {
  link.href = `mailto:${window.PORTFOLIO_LINKS.email}`;
});
document.querySelectorAll("[data-contact-email]").forEach((email) => {
  email.textContent = window.PORTFOLIO_LINKS.email;
});
