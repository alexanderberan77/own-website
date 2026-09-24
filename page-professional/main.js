document.addEventListener('DOMContentLoaded', () => {
  // Accordion Toggle Logik
  const accordionItems = document.querySelectorAll('.accordion-item');

  accordionItems.forEach(item => {
    const toggleBtn = item.querySelector('.accordion-toggle-btn');
    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // (Optional) Wenn du möchtest, dass immer nur EIN Item offen ist, entkommentiere folgende 3 Zeilen:
      // accordionItems.forEach(otherItem => {
      //   if (otherItem !== item) closeAccordion(otherItem);
      // });

      if (isActive) {
        closeAccordion(item);
      } else {
        openAccordion(item);
      }
    });
  });

  function openAccordion(item) {
    item.classList.add('active');
    const btnText = item.querySelector('.btn-text');
    const btnIcon = item.querySelector('.btn-icon');
    const toggleBtn = item.querySelector('.accordion-toggle-btn');

    if (btnText) btnText.textContent = 'Weniger anzeigen';
    if (btnIcon) btnIcon.textContent = '−';
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
  }

  function closeAccordion(item) {
    item.classList.remove('active');
    const btnText = item.querySelector('.btn-text');
    const btnIcon = item.querySelector('.btn-icon');
    const toggleBtn = item.querySelector('.accordion-toggle-btn');

    if (btnText) btnText.textContent = 'Mehr Erfahren';
    if (btnIcon) btnIcon.textContent = '+';
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
  }
});
