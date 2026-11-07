# La Culla della Luna

Sito di Alessia Iraci, costruito sui dati del negozio https://laculladellaluna.myshopify.com/
(44 pezzi: prezzi, pietre, disponibilità e foto). "Acquista" porta alla pagina del prodotto su Shopify.

`index.html` (dati dei prodotti inclusi nello script, `const PRODUCTS`) + foto in `images/`. Nessuna build.

## Aggiornare i prodotti
I dati sono una copia del negozio del 7 novembre 2026: prezzi e disponibilità non si aggiornano da soli.
Per aggiornarli si rigenera `PRODUCTS` da `https://laculladellaluna.myshopify.com/products.json`.
