# Spec — Seção "Trailers oficiais"

> Especificação da seção de trailers do site Super Mario Galaxy, derivada do print desktop anexado, do `DESIGN.md` (Super Mario Galaxy / Real Tokens) e dos tokens reais já implementados em `styles.css`.
> Esta spec descreve **o que** construir, não como codar. Nenhum elemento fora do mapeamento original foi adicionado.

---

## 1. Objetivo

Apresentar os trailers oficiais do filme em um **carrossel de embeds de vídeo**, posicionando o player como peça central da composição em uma atmosfera cósmica coerente com o resto do site.

A seção deve:
- Reforçar a hierarquia narrativa do site (eyebrow → título → subtítulo → mídia).
- Dar destaque cinematográfico ao player sem competir com o hero.
- Permitir navegação entre múltiplos trailers via paginação visual (dots) e setas laterais.
- Manter legibilidade, performance e acessibilidade sobre fundo profundo.

A seção **não** é responsável por reprodução autoplay, fullscreen custom, métricas de view ou qualquer integração além do embed padrão da plataforma de vídeo.

---

## 2. Inventário de elementos (mapeamento canônico)

Lista exaustiva extraída do print. Nada além disto deve aparecer.

### 2.1 Textos
| # | Papel | Conteúdo | Tratamento |
|---|---|---|---|
| T1 | Eyebrow superior | `Assista agora` | Caixa alta, letter-spacing largo, fonte pequena, cor secundária |
| T2 | Título principal | `Trailers oficiais` | Display centralizado, peso forte |
| T3 | Subtítulo | `Clipes da aventura no espaço` | Caixa alta, letter-spacing largo, cor secundária |
| T4 | Título do vídeo (header do embed) | `The Super Mario Bros. Movie \| Official Trailer` | Renderizado pelo provider (YouTube), não é texto da página |
| T5 | Tipografia decorativa de fundo | `TRAILERS` (parcialmente visível como `LERS` no recorte) | Display gigante, baixa opacidade, atrás do player |

> **Nota sobre T4 e elementos internos do embed** (logo "Super Mario Bros. Movie", botão de play vermelho central, marca "Assista no YouTube", avatar do canal, badge "OFFICIAL TRAILER"): pertencem ao **conteúdo do vídeo** servido pelo YouTube via `iframe`. **Não devem ser recriados** como elementos da página — aparecem naturalmente porque são parte do thumbnail/chrome do player.

### 2.2 Visuais e controles
| # | Papel | Descrição |
|---|---|---|
| V1 | Background | Gradiente cósmico azul/roxo profundo com leve halo radial |
| V2 | Watermark tipográfico | Palavra `TRAILERS` em escala enorme atrás do player, baixa opacidade, recortada pelas bordas |
| V3 | Card do player | Retângulo arredondado com sombra suave; contém o `<iframe>` do trailer |
| V4 | Carrossel — dots | 4 indicadores de página em formato pill/dot; o ativo é mais largo |
| V5 | Carrossel — seta esquerda | Botão circular contornado |
| V6 | Carrossel — seta direita | Botão circular contornado |

> Tudo que está **dentro** do retângulo do player (logo do filme, play button, header com avatar, "OFFICIAL TRAILER", "Assista no YouTube") é renderizado pelo embed. Não há sobreposições custom.

---

## 3. Estrutura HTML (semântica, sem código)

Hierarquia recomendada — descrita em prosa, com classes seguindo a convenção BEM já usada em `styles.css` (`.section`, `.section__title`, padrões `.personagens__eyebrow` etc.).

```
section.trailers (landmark, aria-labelledby="trailers-title")
├── div.trailers__bg-text          → V2 (watermark "TRAILERS", aria-hidden)
├── header.trailers__header
│   ├── p.trailers__eyebrow        → T1
│   ├── h2.trailers__title#trailers-title  → T2
│   └── p.trailers__subtitle       → T3
└── div.trailers__carousel (role="region", aria-roledescription="carousel", aria-label="Trailers oficiais")
    ├── div.trailers__viewport (overflow oculto)
    │   └── ul.trailers__track
    │       ├── li.trailers__slide (aria-roledescription="slide", aria-label="1 de N")
    │       │   └── div.trailers__player
    │       │       └── iframe[src=TRAILER_URL_1, title, loading="lazy", allowfullscreen]
    │       ├── li.trailers__slide … (TRAILER_URL_2)
    │       ├── li.trailers__slide … (TRAILER_URL_3)
    │       └── li.trailers__slide … (TRAILER_URL_4)
    └── div.trailers__controls
        ├── button.trailers__arrow.trailers__arrow--prev (aria-label="Trailer anterior")  → V5
        ├── div.trailers__dots (role="tablist")
        │   ├── button.trailers__dot.is-active (aria-label="Ir para trailer 1", aria-selected) → V4
        │   ├── button.trailers__dot
        │   ├── button.trailers__dot
        │   └── button.trailers__dot
        └── button.trailers__arrow.trailers__arrow--next (aria-label="Próximo trailer")  → V6
```

> A quantidade de slides/dots **deve refletir os embeds reais disponíveis**. O print mostra 4 dots; portanto, espera-se 4 trailers. Se a quantidade real divergir, a paginação deve acompanhar o número de URLs fornecidas.

---

## 4. Camadas (z-index e empilhamento)

Da camada mais ao fundo para a mais à frente, todas dentro do contexto da seção:

1. **Fundo da seção** — gradiente cósmico (camada 0).
2. **Watermark "TRAILERS"** (V2) — camada 1, baixa opacidade, `aria-hidden`, `pointer-events: none`.
3. **Header textual** (T1, T2, T3) — camada 2.
4. **Card do player + iframe** (V3) — camada 3, com sombra suave.
5. **Controles** (setas + dots, V4–V6) — camada 4, sempre acima do player.

A seção deve criar **isolamento de contexto** (`isolation: isolate`) para que o watermark e o player não vazem para o `#starfield` global.

---

## 5. Tokens aplicados

Todos vindos de `styles.css` / `DESIGN.md`. **Não criar novos tokens.**

### 5.1 Cores
- Fundo base da seção: `var(--bg-mid)` (segue o padrão `.section` ímpar). Como a seção alterna com `--bg-deep` no `:nth-child(even)`, a cor final depende da posição real no documento.
- Texto T2 (título): `var(--text-primary)`
- Texto T1 (eyebrow) e T3 (subtítulo): `var(--text-faint)` ou `var(--text-muted)` — preferir `--text-faint` para manter contraste sobre fundo escuro (visto que `--text-muted` em `styles.css` é marrom/dourado, não cinza).
- Watermark V2: `var(--text-primary)` com opacidade reduzida (≤ 0.06) — **sem introduzir cinza fora da paleta**.
- Card do player: borda `var(--border-subtle)`, sombra `var(--shadow-card)`.
- Dot ativo: `var(--accent-star)`.
- Dot inativo: `var(--border-strong)` (ou `--text-faint`).
- Setas: borda `var(--border-strong)`, ícone `var(--text-primary)`; hover → borda `var(--accent-star)`, ícone `var(--accent-star)`.
- Foco visível: `outline: 2px solid var(--ring-focus); outline-offset: 4px;` (mesmo padrão do `.floating-nav__link`).

### 5.2 Tipografia
- T1 (eyebrow): `font-size: var(--fs-xs)`; `font-weight: var(--fw-semibold)`; `text-transform: uppercase`; `letter-spacing: var(--ls-label)`.
- T2 (título): `font-family: var(--font-display)`; `font-size: var(--fs-3xl)` ou `--fs-display` se quiser mais peso visual; `font-weight: var(--fw-bold)`; `line-height: var(--lh-snug)`.
- T3 (subtítulo): `font-size: var(--fs-xs)` ou `--fs-sm`; `text-transform: uppercase`; `letter-spacing: var(--ls-label)`; `color: var(--text-faint)`.
- V2 (watermark): `font-family: var(--font-display)`; `font-weight: var(--fw-black)`; `font-size: clamp(...)` muito grande; `letter-spacing: var(--ls-tight)`.

### 5.3 Espaçamento e raio
- Padding vertical da seção: `var(--space-section-y)`.
- Padding horizontal: `var(--space-gutter-x)`.
- Gap entre header e carrossel: `var(--space-12)` a `var(--space-16)`.
- Gap entre player e controles: `var(--space-6)` a `var(--space-8)`.
- Raio do card do player: `var(--radius-2xl)`.
- Raio das setas: `var(--radius-full)`.
- Raio dos dots: `var(--radius-full)`.

### 5.4 Sombras
- Card do player: `var(--shadow-card)` (já combina `--shadow-surface` + `--shadow-inner-glow`).
- Setas e dots: **sem glow externo** (regra anti-pattern §7 do DESIGN.md). Apenas `--shadow-inner-glow` se desejado.

### 5.5 Motion
- Transição de slide: `transform var(--duration-slow) var(--ease-out-expo)`.
- Hover de seta/dot: `var(--transition-color)` + `var(--transition-transform)`.
- Active state das setas (clique): leve compressão vertical (`scale(0.97)`), conforme padrão de botões do DESIGN.md §4.
- Reveal de entrada (eyebrow → título → subtítulo → player): cascata com `--stagger-base`, easing `--ease-out-expo`, animando `opacity` e `transform: translateY(...)` apenas.
- Respeitar `@media (prefers-reduced-motion: reduce)`: desativar transições e revelar conteúdo estático (mesmo padrão usado em `.personagens` no `styles.css`).

---

## 6. Suposições

Itens **assumidos** porque não aparecem explícitos no print, mas são necessários para implementação. Devem ser confirmados antes do build.

1. **Provider de vídeo:** YouTube (deduzido pela marca "Assista no YouTube" e botão de play vermelho no thumbnail). URLs serão fornecidas como `[TRAILER_URL_1]`, `[TRAILER_URL_2]`, `[TRAILER_URL_3]`, `[TRAILER_URL_4]` no formato `https://www.youtube.com/embed/{ID}`.
2. **Quantidade:** 4 trailers (4 dots no print). Se mudar, paginação acompanha.
3. **Trailer inicial visível:** o segundo (dot 2 está ativo no print).
4. **Aspect ratio do player:** 16:9 (padrão YouTube). O card mantém esse ratio em todas as larguras.
5. **Comportamento das setas em borda de carrossel:** sem loop por padrão — desabilitadas no primeiro/último slide. Loop é decisão de produto e pode ser ativado se solicitado.
6. **Watermark "TRAILERS":** posicionado atrás do player, alinhado horizontalmente, podendo ser cortado pelas bordas da seção (efeito visto no print).
7. **Autoplay:** desligado. Som inicia mudo apenas se autoplay for habilitado (não é o caso aqui).
8. **Privacidade:** caso requerido, usar domínio `youtube-nocookie.com`. Decisão de produto.

---

## 7. Responsividade

Seguindo o sistema de `clamp(...)` e os breakpoints já presentes no projeto.

### Desktop (≥ 1024px)
- Layout idêntico ao print: header centralizado no topo, card do player centralizado abaixo, watermark atrás do player, controles (setas + dots) abaixo do card em linha.
- Largura máxima do card do player: ~960px (≤ container 1200–1400px do DESIGN.md §5).
- Setas posicionadas **fora** do card, alinhadas verticalmente com os dots ao centro.

### Tablet (768–1023px)
- Mesma composição, com escalas reduzidas via `clamp`.
- Watermark pode reduzir tamanho ou intensidade para não competir com o player.
- Setas continuam abaixo do card em linha com os dots.

### Mobile (< 768px)
- Coluna única (regra DESIGN.md §5).
- Watermark **opcional** ocultado em mobile (`display: none` em ≤ 767.98px) para evitar poluição visual em telas pequenas — mesma estratégia adotada no projeto para elementos decorativos de hero.
- Card do player ocupa 100% da largura disponível menos `--space-gutter-x`, mantendo aspect ratio 16:9.
- Setas: podem reduzir tamanho ou recolher abaixo dos dots, mantendo área de toque ≥ 44×44 px.
- Sem overflow horizontal (regra DESIGN.md §5).

---

## 8. Estados

### 8.1 Player
- **Default:** thumbnail do trailer ativo carregado pelo provider.
- **Loading:** placeholder do `iframe` (cor `--bg-surface`); evitar layout shift via aspect-ratio reservado.
- **Erro / sem conexão:** se o `iframe` falhar, exibir mensagem de fallback dentro do card com `--text-muted` e link textual para abrir o vídeo no YouTube em nova aba.

### 8.2 Setas (`.trailers__arrow`)
- **Default:** borda `--border-strong`, ícone `--text-primary`.
- **Hover/focus-visible:** borda `--accent-star`, ícone `--accent-star`, transição via `--transition-color`.
- **Active:** `transform: scale(0.97)`.
- **Disabled** (primeiro/último slide, se sem loop): opacidade ~0.4, `cursor: not-allowed`, sem hover state.

### 8.3 Dots (`.trailers__dot`)
- **Default:** pill estreito, fundo `--border-strong`.
- **Active (`.is-active`):** mais largo, fundo `--accent-star`.
- **Hover (inativo):** fundo `--text-faint`.
- **Focus-visible:** anel `--ring-focus`.

### 8.4 Reduced motion
- Transições de slide instantâneas (`--motion-reduce`).
- Sem reveal em cascata.
- Watermark estático.

---

## 9. Acessibilidade — checklist

- [ ] `<section>` com `aria-labelledby` apontando para o `id` do título T2.
- [ ] Hierarquia de headings: T2 como `<h2>` (assumindo hero com `<h1>`).
- [ ] Watermark "TRAILERS" com `aria-hidden="true"` e `pointer-events: none` (decorativo).
- [ ] Carrossel com `role="region"` e `aria-roledescription="carousel"`.
- [ ] Cada slide com `aria-roledescription="slide"` e `aria-label="N de Total"`.
- [ ] Setas com `aria-label` descritivo em PT-BR; estado `disabled` quando aplicável.
- [ ] Dots como `<button>` com `aria-label="Ir para trailer N"` e `aria-current="true"` no ativo.
- [ ] `iframe` de cada trailer com `title` descritivo e único (ex.: "Trailer oficial 1 — The Super Mario Bros. Movie").
- [ ] `iframe` com `loading="lazy"` para não bloquear render inicial.
- [ ] `iframe` com `allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"` e `allowfullscreen` (padrão YouTube).
- [ ] Foco visível em todos os controles via `--ring-focus`.
- [ ] Navegação por teclado: setas ←/→ avançam slides quando o carrossel ou seus controles têm foco; `Tab` percorre setas e dots na ordem visual.
- [ ] Contraste de texto sobre fundo cósmico ≥ AA para T1, T2, T3.
- [ ] `prefers-reduced-motion: reduce` desativa transições de slide e revelação.
- [ ] Sem trap de foco dentro do `iframe` (comportamento padrão do navegador).

---

## 10. Critérios de aceitação

A implementação só é aceita quando **todos** os itens abaixo são verdadeiros:

1. Os textos T1, T2, T3 aparecem com o conteúdo exato do inventário (§2.1), nesta ordem e centralizados.
2. O watermark V2 ("TRAILERS") aparece atrás do player em desktop/tablet, com opacidade ≤ 0.06 e sem capturar eventos de mouse.
3. Existem **N** slides correspondendo a **N** URLs fornecidas (`[TRAILER_URL_1]`…`[TRAILER_URL_N]`); o número de dots é igual a N.
4. Cada `iframe` tem `loading="lazy"`, `title` único e descritivo, e `allowfullscreen`.
5. O slide inicial visível ao carregar a seção é o segundo (dot 2 ativo), conforme o print.
6. Setas e dots são `<button>` reais (não `<div>` com handler), com foco visível usando `--ring-focus`.
7. Todos os tokens usados existem em `styles.css`. Nenhum hex novo, nenhuma cor cinza extra, nenhuma fonte além de `Outfit`/fallback (regras §7 do DESIGN.md).
8. Sem `box-shadow` com glow externo agressivo em setas/dots/card (regra §7 do DESIGN.md).
9. Em mobile (<768px), a seção colapsa para coluna única sem overflow horizontal; o card mantém 16:9.
10. `prefers-reduced-motion: reduce` desativa transição de slide e revelação inicial.
11. Nenhum elemento fora do inventário §2 foi adicionado (sem CTA, sem descrição extra, sem badge custom, sem contador "x/N", sem thumbnails miniatura — nada disso aparece no print).
12. Lighthouse a11y ≥ 95 e nenhuma violação de axe-core na seção.