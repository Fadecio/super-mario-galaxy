*Suposição:* O "SMG" funciona como um link "Voltar ao topo" ou para a seção Hero inicial. Os demais apontam para IDs correspondentes na página.

## 3. Estados Visuais

* **Inicial (Oculto):** O elemento possui `opacity: 0`, `visibility: hidden` e `transform: translateY(-100%)`. Pointer-events desativados para não interferir com elementos abaixo.
* **Visível (`.visible`):** Após o limiar de rolagem, o elemento ganha `opacity: 1`, `visibility: visible` e `transform: translateY(0)`. Transição usando `--transition-transform` e `--transition-opacity`.
* **Hover nos Links:** Texto transita para `--text-primary` com `--transition-color`.
* **Active / Current (ex: SMG no print):** Texto recebe cor `--accent-star` para indicar a seção em foco ou marca.

## 4. Estilos por Bloco (Mapeamento de Tokens)

### Container (`.floating-nav`)

* **Background:** `--bg-surface` ou `--bg-surface-raised` com leve `--bg-overlay` se necessário blur (backdrop-filter).
* **Border:** `1px solid var(--border-subtle)` ou `var(--border-strong)`.
* **Border-Radius:** `--radius-full` (para manter o formato arredondado de pílula dos cantos).
* **Shadow:** `--shadow-surface` e/ou `--shadow-inner-glow` para dar profundidade cósmica sutil sem "glow agressivo".
* **Padding:** Interno confortável, ex: `var(--space-2)` vertical e `var(--space-4)` horizontal.
* **Posicionamento:** `position: fixed`, `top: var(--space-6)`, `left: 50%`, `transform: translateX(-50%) translateY(...)`, `z-index: 100`.

### Tipografia (`.floating-nav__link`)

* **Font-Family:** `--font-body` (`Outfit`).
* **Font-Size:** `--fs-xs` ou `--fs-sm` para legibilidade sem pesar.
* **Font-Weight:** `--fw-medium` ou `--fw-semibold`.
* **Letter-Spacing:** `--ls-label` (12%), `text-transform: uppercase` (Utility label rule).
* **Cor Default:** `--text-muted`.
* **Cor Active (SMG):** `--accent-star`.

### Separador (`.floating-nav__separator`)

* **Largura/Altura:** `1px` de largura, altura preenchendo o bloco (ex: `16px` ou `1.2em`).
* **Cor:** Background ou border usando `--border-subtle` ou `--text-faint`.
* **Margem:** `var(--space-3)` horizontal.

## 5. Comportamento JS

* **Threshold de Aparição:** O elemento deve receber a classe `.visible` quando o usuário rolar além de 60% da altura da seção `#hero`.
* *Fórmula:* `const threshold = document.getElementById('hero')?.offsetHeight * 0.6;`
* *Fallback:* Caso não exista `#hero`, utilizar `window.innerHeight * 0.6` ou `300px`.


* **Scrollspy (Opcional, mas recomendado):** Conforme a página rola, a classe `.floating-nav__link--active` deve transitar entre os links (Personagens, Trailers, Estreia) utilizando `IntersectionObserver` nas seções.
* **Smooth Scroll:** Cliques nos links devem rolar suavemente até a âncora correspondente (`scroll-behavior: smooth` no CSS html ou JS `scrollIntoView`).

## 6. Responsividade e Foco

* **Foco de Teclado:** Utilizar `:focus-visible` com `outline: 2px solid var(--ring-focus)` e `outline-offset: 4px` para acessibilidade.
* **Mobile (< 768px):** A especificação é primariamente baseada no print *Desktop*. Em telas menores, a barra deve encolher (padding reduzido, fontes `clamp()`) ou colapsar para uma versão compacta (ex: menu de hambúrguer ou fixed bottom bar). A não ser que exigido pelo design, overflow horizontal (`overflow-x: auto`) pode ser aplicado removendo scrollbars para evitar quebra da "pílula".

## 7. Checklist de Implementação

* [ ] O componente obedece rigorosamente aos tokens (sem cores *hardcoded* ou fonts como *Inter*).
* [ ] Estrutura HTML acessível com tags `nav`, `ul`, `li`, `a` e `aria-label`.
* [ ] CSS encapsulado ou escopado, implementando `--radius-full` no container pai.
* [ ] Estados visuais (hover, focus-visible) funcionando com transições baseadas nos tokens (`--ease-out-expo`).
* [ ] JS controlando as classes baseado na rolagem (60% do Hero).
* [ ] Sem bugs no acionamento reverso (ocultar quando voltar pro topo).

## 8. Critérios de Aceitação Visuais

* A pílula de navegação deve ter exata aparência de flutuação cósmica sutil sobre fundo profundo, contida visualmente, sem ofuscar conteúdo sob ela.
* O link ativo "SMG" ou o link correspondente à seção da página devem apresentar clareza máxima na cor `--accent-star`.
* Tipografia uniformemente espaçada, com caixa alta e entrelinhamento sem desalinhamentos verticais (textos e separador vertical perfeitamente centralizados no eixo Y).
