# Spec — Seção `Personagens`

> Source-of-truth: `desktop-print-personagens.png` + `DESIGN.md`.
> Este documento descreve **apenas** o que aparece no print. Nada além.

---

## 1) Objetivo

Apresentar o elenco de personagens de Super Mario Galaxy em uma composição **freeform** (espalhada, "flutuando no espaço"), sem grid e sem cards. A seção serve como bloco editorial pós-hero e é o **alvo de extensão do parallax** vindo da Hero (`extendedEndSelector`).

A intenção visual do print:

- Cabeçalho centralizado no topo (eyebrow + título + subtítulo).
- 6 personagens 3D distribuídos livremente no fundo escuro espacial.
- Cada personagem tem um rótulo simples com o nome logo abaixo.
- Forte variação de escala, altura e posicionamento — sensação de constelação, não de catálogo.

---

## 2) Inventário visual

> Regra: se um item **não está** nesta lista, não pode aparecer no HTML.

### 2.1. Cabeçalho da seção (centralizado, topo)

| # | Elemento | Conteúdo (literal do print) | Observações |
|---|---|---|---|
| H1 | Eyebrow / label superior | `CONHEÇA O ELENCO` | Caixa alta, fonte pequena, cor de destaque (token `--accent-star`). |
| H2 | Título principal | `Personagens` | Capitalização exata: "P" maiúsculo, restante minúsculo. Peso bold/black, escala grande, `--text-primary`. |
| H3 | Subtítulo / descrição | `OS HERÓIS E VILÕES DESTA AVENTURA GALÁCTICA` | Caixa alta, fonte pequena, leve letter-spacing, `--text-muted`. |

> **Não há** botões, CTAs, links, contadores, badges, ícones decorativos ou qualquer outra copy no cabeçalho.

### 2.2. Personagens (6 itens — composição freeform)

Cada personagem é uma composição `figura 3D + rótulo` simples.

| # | Personagem | Pose visual no print | Rótulo (literal) | Asset obrigatório | Quadrante aproximado | Escala relativa |
|---|---|---|---|---|---|---|
| P1 | Mario | Braços e pernas abertos, em pose de voo / queda livre | `Mario` | `assets/images/mario-original.webp` | Superior-esquerdo | Grande |
| P2 | Luigi | De ponta cabeça, braços abertos, caindo/flutuando | `Luigi` | `assets/images/luigi.webp` | Superior-direito | Média |
| P3 | Peach | Flutuando suavemente, segurando guarda-sol rosa aberto | `Peach` | `assets/images/peach.webp` | Centro (levemente acima da linha média, deslocada para a esquerda do centro) | Média-pequena |
| P4 | Rosalina | Vestido azul, varinha mágica, postura elegante e flutuante | `Rosalina` | `assets/images/rosalina.webp` | Meio-direito (abaixo de Luigi) | Média |
| P5 | Yoshi (com Bowser nas costas) | Yoshi correndo/avançando com Bowser montado nele | `Yoshi` | `assets/images/yoshi-perso.webp` | Inferior-esquerdo | Grande |
| P6 | Bowser Jr. | Voando dentro do Koopa Clown Car, segurando pincel mágico | `Bowser Jr.` | `assets/images/bowser-jr.webp` | Centro-inferior (entre Yoshi e Rosalina, levemente abaixo de Peach) | Média |

> **Total fixo: 6 personagens.** A contagem espelha o print.
>
> Cada `<img>` deve ter `alt` descritivo (nome do personagem) e `loading="lazy"`.
> Os arquivos `.webm` da Hero (`mario-clip-alpha.webm`, `yoshi-video-alpha.webm`) **não são reutilizados** aqui.

### 2.3. Fundo

| # | Elemento | Descrição |
|---|---|---|
| BG1 | Fundo da seção | Espacial escuro, plano (sem estrelas decorativas, sem nebulosas, sem partículas visíveis no print). Tom violeta-escuro aparente derivado dos tokens cósmicos. |

> **Não há** estrelas, partículas, ornamentos, glows extras, linhas, vinhetas decorativas, números, ícones ou divisores na seção. O que aparece no print é apenas: cabeçalho + 6 personagens + rótulos + fundo escuro.

---

## 3) Estrutura HTML (árvore + classes)

> Espelha 1:1 o inventário do item 2. Sem nós extras.

```
<section id="personagens" class="personagens">
  ├── <div class="personagens__header">
  │     ├── <p  class="personagens__eyebrow">CONHEÇA O ELENCO</p>
  │     ├── <h2 class="personagens__title">Personagens</h2>
  │     └── <p  class="personagens__subtitle">OS HERÓIS E VILÕES DESTA AVENTURA GALÁCTICA</p>
  │
  └── <div class="personagens__stage">
        ├── <figure class="personagem personagem--mario">
        │     ├── <img src="assets/images/mario-original.webp" alt="Mario" loading="lazy">
        │     └── <figcaption>Mario</figcaption>
        │
        ├── <figure class="personagem personagem--luigi">
        │     ├── <img src="assets/images/luigi.webp" alt="Luigi" loading="lazy">
        │     └── <figcaption>Luigi</figcaption>
        │
        ├── <figure class="personagem personagem--peach">
        │     ├── <img src="assets/images/peach.webp" alt="Peach" loading="lazy">
        │     └── <figcaption>Peach</figcaption>
        │
        ├── <figure class="personagem personagem--rosalina">
        │     ├── <img src="assets/images/rosalina.webp" alt="Rosalina" loading="lazy">
        │     └── <figcaption>Rosalina</figcaption>
        │
        ├── <figure class="personagem personagem--yoshi">
        │     ├── <img src="assets/images/yoshi-perso.webp" alt="Yoshi" loading="lazy">
        │     └── <figcaption>Yoshi</figcaption>
        │
        └── <figure class="personagem personagem--bowser-jr">
              ├── <img src="assets/images/bowser-jr.webp" alt="Bowser Jr." loading="lazy">
              └── <figcaption>Bowser Jr.</figcaption>
  </div>
</section>
```

**Notas estruturais:**

- `.personagens__stage` é um **container `position: relative`**, não um grid e não um flex de cards. Cada `.personagem` é posicionado de forma absoluta com coordenadas próprias (`top` / `left` ou `inset`).
- Cada `.personagem` é um `<figure>` para amarrar imagem ↔ rótulo semanticamente; o `<figcaption>` é o único texto permitido por personagem.
- Modificadores `--mario`, `--luigi`, etc. carregam **somente** posicionamento e escala individuais. Nenhum estilo de "card".

---

## 4) Camadas visuais (z-order)

De baixo (atrás) para cima (frente):

1. **Fundo da seção** — cor sólida ou gradiente derivado dos tokens cósmicos (`--bg-deep` / `--bg-mid` / `--bg-surface`). Sem texturas adicionais.
2. **Personagens (.personagem img)** — PNGs/WebPs com transparência sobre o fundo. Z-index pode variar levemente entre personagens caso haja sobreposição parcial visível no print.
3. **Rótulos (.personagem figcaption)** — sempre logo abaixo da imagem do respectivo personagem. Mesma camada conceitual da figura.
4. **Cabeçalho da seção** — bloco no topo, acima do "stage" no fluxo do documento; visualmente não compete com nenhum personagem (o print mostra o cabeçalho num espaço próprio antes da composição).

> Não há overlay, vinheta, blur de fundo, máscara, gradiente sobre os personagens, nem partículas/estrelas decorativas no print.

---

## 5) Tokens (referência ao `:root` do `DESIGN.md`)

### Cores

| Uso | Token |
|---|---|
| Fundo da seção | `--bg-deep` ou `--bg-mid` (ver Suposição S1) |
| Eyebrow `CONHEÇA O ELENCO` | `--accent-star` |
| Título `Personagens` | `--text-primary` |
| Subtítulo `OS HERÓIS E VILÕES…` | `--text-muted` |
| Rótulos dos personagens (`Mario`, `Luigi`, …) | `--text-primary` |

### Tipografia

| Uso | Família | Peso aproximado | Caso |
|---|---|---|---|
| Eyebrow | `--font-body` (Outfit) | 500–600 | UPPERCASE, letter-spacing leve, fonte pequena |
| Título | `--font-body` (Outfit) | 700–900 | Title case do print: "Personagens" |
| Subtítulo | `--font-body` (Outfit) | 500 | UPPERCASE, letter-spacing leve, fonte pequena |
| Rótulos | `--font-body` (Outfit) | 600–700 | Capitalização exata: "Mario", "Luigi", "Peach", "Yoshi", "Rosalina", "Bowser Jr." |

### Espaçamentos

- Espaçamento vertical da seção via `clamp(...)` para fluidez (alinhado à seção 5 do `DESIGN.md`).
- Padding lateral progressivo respeitando a largura máxima do projeto (1200–1400px).
- Distância entre imagem do personagem e seu `<figcaption>`: pequena, suficiente para amarrar visualmente (ver Suposição S2).

### Easing & Motion

- Reveal em cascata na entrada da seção: `--ease-out-expo` (alinhado à seção 6 do `DESIGN.md`).
- Microinteração opcional de "flutuação" em cada personagem (translate Y sutil) usando `--ease-spring` em loop (Suposição S3 — só se for confirmado).
- Animações exclusivamente em `transform` e `opacity`.

---

## 6) Suposições a confirmar

- **S1 — Cor exata do fundo da seção.** O print mostra um tom violeta-escuro plano. Não fica claro se é `--bg-deep` (`#000000`), `--bg-mid` (`#0a0a1a`) ou um gradiente derivado de `--bg-surface` (`#141340`). Recomendação: começar com `--bg-mid` e ajustar contra o print. *Confirmar.*
- **S2 — Distância exata entre figura e rótulo.** O print sugere um espaçamento curto e consistente, mas o valor numérico não é mensurável. *Confirmar com medida real do Figma.*
- **S3 — Animação de flutuação (idle).** O print é estático; não dá pra confirmar se há micro-animação contínua. Implementar apenas se confirmado pela referência em movimento.
- **S4 — Posições exatas (x/y) de cada personagem.** Os quadrantes do item 2.2 são leitura aproximada do print. As coordenadas finais devem ser ajustadas em pixel-pushing contra o print. A composição relativa entre eles, no entanto, **é fixa**: Mario topo-esquerda, Luigi topo-direita, Peach centro acima, Rosalina meio-direita abaixo de Luigi, Yoshi inferior-esquerda, Bowser Jr. centro-baixo.
- **S5 — Sobreposições.** No print não há sobreposição evidente entre personagens; cada um ocupa um espaço próprio. Confirmar antes de permitir overlap.
- **S6 — Cor exata dos rótulos.** Aparentam ser `--text-primary`; pode ser uma variação levemente atenuada. *Confirmar.*

---

## 7) Responsividade

- **Desktop (≥ 1024px):** composição freeform conforme inventário 2.2, com posicionamento absoluto dentro de `.personagens__stage`. Variação de escala e altura preservada.
- **Tablet (768–1023px):** manter freeform, reduzindo a escala global do stage proporcionalmente. Ajustar coordenadas para evitar que Yoshi (mais largo, com Bowser nas costas) toque as bordas.
- **Mobile (< 768px):** conforme `DESIGN.md` §5, colapso obrigatório para coluna única **sem overflow horizontal**. Nesse breakpoint a composição freeform pode ser reescrita como uma sequência vertical empilhada (ainda assim **sem cards** e **sem grid**), preservando:
  - mesma ordem de leitura: Mario → Luigi → Peach → Rosalina → Yoshi → Bowser Jr. (ou ordem visual top-to-bottom do print);
  - leve deslocamento horizontal alternado por item para manter a sensação de "espalhado" e quebrar o eixo central rígido;
  - escala diferenciada por item (não todos do mesmo tamanho).
- O cabeçalho permanece centralizado em todos os breakpoints, com tamanhos tipográficos via `clamp(...)`.

---

## 8) Trilho de scroll (interação com o parallax do hero)

- A `<section id="personagens">` é o alvo do `extendedEndSelector` do parallax do hero.
- Requisito: **`min-height: 100vh`** (no mínimo) para garantir trilho de scroll suficiente.
- Idealmente o conteúdo real (cabeçalho + stage com 6 personagens) já preenche essa altura no desktop; em telas muito altas, manter o `min-height: 100vh` como piso e centralizar o conteúdo verticalmente, ou deixar o stage respirar.
- O `id="personagens"` é **obrigatório** e não pode mudar — é referenciado pelo seletor do parallax.
- Não introduzir wrapper extra entre `<body>` e `<section id="personagens">` que possa quebrar a referência do seletor.

---

## 9) Checklist de implementação

- [ ] `<section id="personagens">` existe com `min-height: 100vh`.
- [ ] Cabeçalho com **exatamente 3 elementos textuais** (eyebrow, título, subtítulo) e nada além.
- [ ] Copy idêntica ao print (incluindo capitalização e acentuação): `CONHEÇA O ELENCO`, `Personagens`, `OS HERÓIS E VILÕES DESTA AVENTURA GALÁCTICA`.
- [ ] `.personagens__stage` com `position: relative` (sem `display: grid`, sem `flex` em modo "linha de cards").
- [ ] **Exatamente 6** elementos `.personagem`, na ordem do inventário.
- [ ] Cada `.personagem` tem **uma única `<img>`** apontando para o asset obrigatório listado em 2.2.
- [ ] Cada `<img>` tem `alt` com o nome do personagem e `loading="lazy"`.
- [ ] Cada `.personagem` tem **um único** `<figcaption>` com o rótulo literal do print.
- [ ] Posicionamento via `position: absolute` + coordenadas próprias por personagem (top/left ou inset).
- [ ] Variação visível de escala entre personagens (mínimo 3 tamanhos distintos).
- [ ] Variação visível de altura (topo / meio / base ocupados).
- [ ] Sem botões, sem CTAs, sem badges, sem ícones, sem números, sem decorações extras.
- [ ] Sem reuso dos vídeos do hero (`mario-clip-alpha.webm`, `yoshi-video-alpha.webm`).
- [ ] Tokens do `DESIGN.md` aplicados em cores e tipografia (nada de hex hardcoded fora dos tokens).
- [ ] Animações apenas em `transform` e `opacity`.
- [ ] Mobile colapsa para fluxo vertical sem overflow horizontal.

---

## 10) Critérios de aceitação visuais

### 10.1. Conteúdo

- [ ] Cabeçalho contém **apenas** os 3 textos especificados, na ordem: eyebrow → título → subtítulo.
- [ ] São renderizados **6 personagens**, na composição descrita.
- [ ] Cada personagem usa o asset `.webp` exato definido em 2.2.
- [ ] Os rótulos batem literalmente: `Mario`, `Luigi`, `Peach`, `Rosalina`, `Yoshi`, `Bowser Jr.`.

### 10.2. Estilo

- [ ] Eyebrow em `--accent-star`, caixa alta, fonte pequena.
- [ ] Título `Personagens` em `--text-primary`, peso bold/black, escala grande.
- [ ] Subtítulo em `--text-muted`, caixa alta, letter-spacing leve.
- [ ] Fundo escuro espacial sem texturas/partículas adicionais.

### 10.3. Anti-regressão de layout (checks binários)

- [ ] **não está em grid/cards** — nem `display: grid`, nem componentes tipo "card" com fundo/borda/sombra
- [ ] **personagens distribuídos em quadrantes diferentes da seção** — pelo menos 4 quadrantes da seção ocupados
- [ ] **há variação de escala** — pelo menos 3 tamanhos perceptivelmente distintos entre os 6 personagens
- [ ] **há variação vertical** — diferença clara de altura entre topo / meio / base do stage (nenhuma "linha" alinhada de personagens)
- [ ] **composição geral bate com o print** — mesma sensação de espalhamento (constelação), mesma localização relativa entre Mario, Luigi, Peach, Rosalina, Yoshi e Bowser Jr.
- [ ] **nenhum personagem tem o mesmo `top` ou o mesmo `left` de outro** — coordenadas independentes, sem alinhamentos repetidos acidentais
- [ ] **rótulo do personagem fica logo abaixo da respectiva figura** — nunca sobre, ao lado ou desconectado