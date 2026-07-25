# Especificação: Contador Regressivo Animado

Documento de implementação para o contador de estreia (Super Mario Galaxy: O Filme).

---

## 1. Visão geral

Contador regressivo até **25 de Dezembro de 2026, 00:00 (horário local do usuário)**, exibindo dias, horas, minutos e segundos. Cada unidade tem seu próprio cartão escuro com tipografia branca grossa, separados por um divisor sutil (•).

A cada segundo, os números viram com **animação de flip estilo placar de aeroporto** (dobra no meio horizontal). A virada respeita uma **cascata real**: só anima a unidade que efetivamente mudou de valor.

---

## 2. Estrutura HTML

Cada unidade é um "cartão" composto por:

- Um container `.flip-unit` com `data-unit="seg|min|hor|dia"`.
- Uma "tela" `.flip-card` que comporta as duas metades empilhadas.
  - `.flip-card__top` — metade superior do dígito atual (estática até o flip começar).
  - `.flip-card__bottom` — metade inferior do dígito atual (estática).
  - `.flip-card__top-flap` — metade superior animada que **dobra para baixo** (mostra o número antigo enquanto cai).
  - `.flip-card__bottom-flap` — metade inferior animada que **sobe da base** revelando o número novo.
- Um label `.flip-unit__label` ("DIAS", "HORAS", "MIN", "SEG") em caps, tracking largo, abaixo do cartão.

Estrutura sugerida (exemplo para os segundos):

```html
<div class="flip-unit" data-unit="seg">
  <div class="flip-card">
    <div class="flip-card__top">09</div>
    <div class="flip-card__bottom">09</div>
    <div class="flip-card__top-flap">09</div>
    <div class="flip-card__bottom-flap">09</div>
  </div>
  <span class="flip-unit__label">SEG</span>
</div>
```

Os quatro `.flip-unit` ficam dentro de um wrapper `.countdown` em `display: flex`, com separadores `•` posicionados via pseudo-elemento (`::after` no `.flip-unit`, exceto no último).

Observação: os números devem sempre ser exibidos com **dois dígitos** (`09`, `00`), exceto **dias**, que pode ter três (`244`).

---

## 3. Estilo visual (CSS)

### Cartão

- Fundo do cartão: gradiente sutil de cima para baixo (ex: `#1a1a2e` → `#0f0f1f`), simulando o brilho do print.
- Borda arredondada: `~12px`.
- Sombra interna leve para dar profundidade: `inset 0 -2px 8px rgba(0,0,0,0.4)`.
- Linha horizontal divisória no centro do cartão (onde a dobra acontece): `1px solid rgba(255,255,255,0.06)` — pode ser feita com pseudo-elemento ou borda nas duas metades.
- Largura mínima: `~110px`. Altura: `~120px`. Ajustar para responsividade.

### Tipografia dos números

- Fonte: sans-serif geométrica/condensada e bold (sugestões: Inter, Manrope, ou similar com peso 700+).
- Tamanho: `~64px`.
- Cor: `#ffffff`.
- Alinhamento: centralizado horizontal e vertical em cada metade.

### Label

- Fonte: mesma família, peso normal, `~10px`, `letter-spacing: 0.2em`, `text-transform: uppercase`, cor `rgba(255,255,255,0.5)`.
- Margem superior em relação ao cartão: `~12px`.

### Separadores

- Caractere `•` (ou pseudo-elemento circular `4px x 4px`) entre unidades.
- Cor: `rgba(255,255,255,0.25)`.
- Espaçamento: `~24px` em cada lado.

---

## 4. Mecânica do flip

A ilusão depende de **quatro camadas empilhadas no mesmo cartão**, com `position: absolute` dentro de `.flip-card` (que é `position: relative` e tem `perspective: 400px` para dar a sensação 3D).

### Estado parado (sem animação)

- `.flip-card__top` visível: mostra o dígito atual, recortado na metade superior (`overflow: hidden`, altura = 50% do cartão, ancorado em `top: 0`).
- `.flip-card__bottom` visível: mostra o dígito atual, recortado na metade inferior (altura = 50%, ancorado em `bottom: 0`, e o conteúdo numérico precisa estar deslocado para cima para que o "08" inteiro caiba mas só a metade de baixo apareça — usar `line-height` igual à altura total do cartão e posicionar o texto adequadamente).
- `.flip-card__top-flap` e `.flip-card__bottom-flap`: `display: none` ou `opacity: 0`.

### Estado animando (durante 600ms)

Quando o valor muda, ex: `08 → 09`:

1. **Antes de iniciar**, o JS atualiza:
   - `.flip-card__top-flap` recebe o **valor antigo** (`08`) e fica visível na metade superior.
   - `.flip-card__bottom-flap` recebe o **valor novo** (`09`) e fica oculto (rotacionado em -90deg na base).
   - `.flip-card__top` já é atualizado para o **valor novo** (`09`) — mas como está atrás do `top-flap`, ainda não aparece.
   - `.flip-card__bottom` continua com o **valor antigo** (`08`) — aparecerá embaixo do `bottom-flap` que está descendo.

2. **Animação em duas fases (300ms cada)**:
   - **Fase 1 (0–300ms)**: `.flip-card__top-flap` rotaciona de `0deg` até `-90deg` em torno do eixo X, com `transform-origin: bottom`. Visualmente, a metade de cima do número antigo "tomba" para frente e some na linha do meio.
   - **Fase 2 (300–600ms)**: `.flip-card__bottom-flap` rotaciona de `90deg` até `0deg` em torno do eixo X, com `transform-origin: top`. Visualmente, a metade de baixo do número novo "sobe" da linha do meio até completar o cartão.

3. **Ao terminar** (600ms): o JS atualiza `.flip-card__bottom` para o valor novo (`09`), oculta as duas flaps, e o cartão volta ao estado parado, agora exibindo `09` inteiro.

### Easing e timing

- Fase 1 (queda da flap superior): `cubic-bezier(0.4, 0, 1, 1)` — ease-in, acelera ao cair.
- Fase 2 (subida da flap inferior): `cubic-bezier(0, 0, 0.2, 1)` — ease-out, desacelera ao chegar.
- Duração total da virada: **600ms**.
- Pequena sombra/escurecimento na flap em movimento ajuda a vender o 3D (opcional, via gradiente sutil ou `filter: brightness(0.85)` na flap durante a rotação).

### Backface

`.flip-card__top-flap` e `.flip-card__bottom-flap` precisam de `backface-visibility: hidden` para não mostrar o verso quando rotacionam além de 90deg.

---

## 5. Lógica JS (loop e cascata)

### Cálculo do tempo restante

```js
const ALVO = new Date('2026-12-25T00:00:00').getTime();

function calcularRestante() {
  const agora = Date.now();
  const diff = Math.max(0, ALVO - agora);
  return {
    dia: Math.floor(diff / 86400000),
    hor: Math.floor((diff % 86400000) / 3600000),
    min: Math.floor((diff % 3600000) / 60000),
    seg: Math.floor((diff % 60000) / 1000),
  };
}
```

### Loop principal

- Usar `setInterval(tick, 1000)` ou `requestAnimationFrame` com checagem de mudança de segundo.
- Manter um **estado anterior** `valorAtual = { dia, hor, min, seg }`.
- A cada tick:
  1. Calcular `novo = calcularRestante()`.
  2. Para cada unidade, comparar `novo[unidade]` com `valorAtual[unidade]`.
  3. **Se diferente**, disparar `flip(unidade, valorAtual[unidade], novo[unidade])`.
  4. Atualizar `valorAtual[unidade] = novo[unidade]`.

Como segundos mudam todo tick, eles flipam toda vez. Os minutos só flipam uma vez por minuto. Horas, uma vez por hora. Dias, uma vez por dia. **A "cascata" emerge naturalmente dessa comparação** — não precisa orquestrar manualmente.

### Função `flip(unidade, antigo, novo)`

Pseudocódigo:

```js
function flip(unidade, antigo, novo) {
  const card = document.querySelector(`[data-unit="${unidade}"] .flip-card`);
  const top = card.querySelector('.flip-card__top');
  const bottom = card.querySelector('.flip-card__bottom');
  const topFlap = card.querySelector('.flip-card__top-flap');
  const bottomFlap = card.querySelector('.flip-card__bottom-flap');

  const fmt = (n) => formatar(n, unidade); // padStart 2, ou 3 para dias

  // Preparar
  topFlap.textContent = fmt(antigo);
  bottomFlap.textContent = fmt(novo);
  top.textContent = fmt(novo);          // já fica o novo atrás
  bottom.textContent = fmt(antigo);     // ainda mostra o antigo

  // Disparar animação adicionando classe
  card.classList.add('is-flipping');

  // Ao terminar (600ms)
  card.addEventListener('animationend', function handler() {
    bottom.textContent = fmt(novo);
    card.classList.remove('is-flipping');
    card.removeEventListener('animationend', handler);
  }, { once: true });
}
```

A classe `.is-flipping` no `.flip-card` é o gatilho que ativa as `@keyframes` nas flaps.

### Formatação

- Segundos, minutos, horas: `String(n).padStart(2, '0')`.
- Dias: sem padding, ou `padStart(3, '0')` se preferir alinhar visualmente. **No print mostra `244` sem padding** — manter assim.

---

## 6. Estado inicial e edge cases

- **Primeira renderização**: pintar os valores corretos imediatamente nas quatro unidades, **sem flip** (não animar na carga).
- **Quando o contador zera** (data alvo atingida): travar em `000 : 00 : 00 : 00`, parar o `setInterval`. Opcional: emitir um evento custom para o app reagir (ex: trocar o texto "Estreia em..." por "Já estreou!").
- **Aba em background**: navegadores reduzem `setInterval` quando a aba não está ativa. Ao voltar ao foco, recalcular tudo do zero baseado no `Date.now()` — não confiar em contagem incremental. Se houver salto grande (ex: 30s passaram), atualizar **sem animação** os valores e retomar o flip normal a partir dali.
- **Mudança de unidade maior**: quando segundos vão de `00 → 59` (porque o minuto virou), o flip precisa funcionar normalmente nessa direção também. A função `flip` é agnóstica de direção — só recebe `antigo` e `novo`.

---

## 7. Acessibilidade

- Adicionar `aria-live="polite"` num elemento textual escondido visualmente (`.sr-only`) que descreve o tempo restante de forma legível: ex. "244 dias, 10 horas, 9 minutos e 9 segundos". Atualizar **a cada minuto** (não a cada segundo, para não saturar leitores de tela).
- O cartão visual em si pode ter `aria-hidden="true"` já que é decorativo do ponto de vista do leitor de tela.
- Respeitar `prefers-reduced-motion`: se ativo, **desligar a animação de flip** (atualização instantânea do `textContent`).

```css
@media (prefers-reduced-motion: reduce) {
  .flip-card__top-flap,
  .flip-card__bottom-flap {
    display: none !important;
  }
}
```

---

## 8. Responsividade

- Desktop (≥ 768px): tamanhos do print (cartão ~110×120px, número ~64px).
- Mobile (< 768px): reduzir cartão para ~70×80px, número ~40px, label ~9px, separadores com menos margem.
- Em telas muito estreitas, o conjunto pode quebrar em duas linhas (dia/hora numa linha, min/seg em outra) — opcional.

---

## 9. Estrutura de arquivos sugerida

```
contador/
├── index.html       — estrutura dos 4 cartões + label "ESTREIA NOS CINEMAS EM"
├── style.css        — variáveis de cor, tipografia, layout, keyframes do flip
└── countdown.js     — cálculo, loop e função flip()
```

Sem dependências externas. Vanilla JS puro.

---

## 10. Checklist de implementação

1. Marcar HTML dos 4 cartões com a estrutura de 4 camadas.
2. Estilizar estado parado (top + bottom recortados mostrando dígito completo).
3. Implementar `@keyframes` da queda da flap superior (300ms).
4. Implementar `@keyframes` da subida da flap inferior (300ms, atrasada em 300ms).
5. Função `flip()` que prepara os textos das 4 camadas e dispara a classe.
6. Loop principal com comparação contra estado anterior (cascata emerge daí).
7. Renderização inicial sem animação.
8. Tratamento de `prefers-reduced-motion` e aba em background.
9. Texto acessível em `aria-live`.
10. Travamento ao zerar.