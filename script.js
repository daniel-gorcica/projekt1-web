// Přidá třídu "js" – bez JavaScriptu se obsah zobrazí normálně (bez animací).
document.documentElement.classList.add('js');

const menu = document.getElementById('menu');
const menuTlacitko = document.getElementById('menuTlacitko');
const lista = document.getElementById('lista');
const progress = document.getElementById('progress');

// === MOBILNÍ MENU ===
menuTlacitko.addEventListener('click', () => {
    const otevrene = menu.classList.toggle('otevrene');
    menuTlacitko.classList.toggle('otevrene', otevrene);
    menuTlacitko.setAttribute('aria-expanded', otevrene);
});

// Po kliknutí na odkaz se menu zavře.
menu.querySelectorAll('a').forEach(odkaz => odkaz.addEventListener('click', () => {
    menu.classList.remove('otevrene');
    menuTlacitko.classList.remove('otevrene');
    menuTlacitko.setAttribute('aria-expanded', false);
}));

// === PROGRESS BAR + LIŠTA PŘI SCROLLU ===
window.addEventListener('scroll', () => {
    const vyska = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (scrollY / vyska) * 100 + '%';
    lista.classList.toggle('scrolled', scrollY > 40);
}, { passive: true });

// === AKTIVNÍ POLOŽKA MENU (podle sekce na obrazovce) ===
const sekceObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        menu.querySelectorAll('a').forEach(a =>
            a.classList.toggle('aktivni', a.getAttribute('href') === '#' + entry.target.id));
    });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('main section').forEach(s => sekceObserver.observe(s));

// === POČÍTÁNÍ ČÍSEL (0 → hodnota) ===
function napocitej(prvek) {
    const text = prvek.textContent.trim();
    const cislo = parseFloat(text.replace(/,/g, ''));
    if (isNaN(cislo)) return;
    const desetinna = (text.split('.')[1] || '').replace(/\D/g, '').length;
    const pripona = text.replace(/[\d.,]/g, '');
    const doba = 1600;
    const start = performance.now();

    function krok(cas) {
        const t = Math.min((cas - start) / doba, 1);
        const easing = 1 - Math.pow(1 - t, 3);
        prvek.textContent = (cislo * easing).toLocaleString('en-US', {
            minimumFractionDigits: desetinna,
            maximumFractionDigits: desetinna
        }) + pripona;
        if (t < 1) requestAnimationFrame(krok);
        else prvek.textContent = text;
    }
    requestAnimationFrame(krok);
}

// === ZOBRAZENÍ SEKCÍ PŘI SCROLLU ===
const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        if (entry.target.id === 'statistiky') {
            entry.target.querySelectorAll('.statistika h3').forEach(napocitej);
        }
        revealObserver.unobserve(entry.target);
    });
}, { threshold: 0.15 });

// === NAČTENÍ STATISTIK ZE stats.json ===
// Když se soubor nenačte, zůstanou čísla přímo z HTML.
fetch('stats.json?t=' + Date.now())
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(data => {
        document.querySelectorAll('.statistika').forEach(karta => {
            const hodnota = data.statistiky?.[karta.querySelector('p').textContent.trim()];
            if (hodnota) karta.querySelector('h3').textContent = hodnota;
        });

        const bunka = r => `<img src="${r.ikona}" alt="${r.nazev}" class="ikona-ranku"> ${r.nazev} ${r.rating} <small>${r.poznamka}</small>`;

        document.querySelectorAll('#rank tbody tr').forEach(radek => {
            const bunky = radek.querySelectorAll('td');
            const rezim = data.ranky?.[bunky[0].textContent.trim()];
            if (!rezim) return;
            if (rezim.aktualni) bunky[1].innerHTML = bunka(rezim.aktualni);
            if (rezim.nejlepsi) bunky[2].innerHTML = bunka(rezim.nejlepsi);
        });

        if (data.peak) {
            document.getElementById('peak').innerHTML =
                `Peak rating: <img src="${data.peak.ikona}" alt="${data.peak.nazev}" class="ikona-ranku"> <strong>${data.peak.rating}</strong> · ${data.peak.popis}`;
        }

        if (data.aktualizovano) {
            document.getElementById('aktualizace').textContent = 'Aktualizováno: ' + data.aktualizovano;
        }
    })
    .catch(() => { })
    // Animace se spustí až po načtení dat, aby se počítalo se správnými čísly.
    .finally(() => document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el)));
