const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = `${Math.min(i * 45, 220)}ms`;
  revealObserver.observe(el);
});

const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".tab-panel");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.tab;

    tabs.forEach((btn) => btn.classList.remove("is-active"));
    tab.classList.add("is-active");

    panels.forEach((panel) => {
      const isMatch = panel.id === target;
      panel.classList.toggle("is-active", isMatch);
      panel.hidden = !isMatch;
    });
  });
});
