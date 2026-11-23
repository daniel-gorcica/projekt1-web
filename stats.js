// Načte stats.json a přepíše čísla na stránce.
// Když se soubor nenačte, zůstanou čísla, která jsou přímo v HTML.
fetch('stats.json?t=' + Date.now())
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(data => {
        // Statistiky – karta se najde podle popisku (Wins, Goals, ...)
        document.querySelectorAll('.statistika').forEach(karta => {
            const popisek = karta.querySelector('p').textContent.trim();
            const hodnota = data.statistiky && data.statistiky[popisek];
            if (hodnota) karta.querySelector('h3').textContent = hodnota;
        });

        // Pomocná funkce pro jednu buňku s rankem
        const bunka = r => r
            ? `<img src="${r.ikona}" alt="${r.nazev}" class="ikona-ranku"> ${r.nazev} ${r.rating} <small>${r.poznamka}</small>`
            : '';

        // Tabulka ranků
        document.querySelectorAll('#rank table tr').forEach(radek => {
            const bunky = radek.querySelectorAll('td');
            if (bunky.length < 3) return;
            const rezim = data.ranky && data.ranky[bunky[0].textContent.trim()];
            if (!rezim) return;
            if (rezim.aktualni) bunky[1].innerHTML = bunka(rezim.aktualni);
            if (rezim.nejlepsi) bunky[2].innerHTML = bunka(rezim.nejlepsi);
        });

        // Peak rating
        const peak = document.getElementById('peak');
        if (peak && data.peak) {
            peak.innerHTML = `Peak rating: <img src="${data.peak.ikona}" alt="${data.peak.nazev}" class="ikona-ranku">
        <strong>${data.peak.rating}</strong> · ${data.peak.popis}`;
        }

        // Datum aktualizace
        const info = document.getElementById('aktualizace');
        if (info && data.aktualizovano) info.textContent = 'Aktualizováno: ' + data.aktualizovano;
    })
    .catch(() => { });
