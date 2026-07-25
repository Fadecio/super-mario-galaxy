
# Documento de Especificação: Starfield Section (Cosmic Background)

## 1. Objetivo

Implementar um plano de fundo dinâmico e imersivo que simule o espaço profundo (vácuo cósmico) utilizando a API Canvas 2D. O efeito deve ser **não interativo**, puramente estético, servindo como camada visual de suporte entre o fundo global e o conteúdo da interface.

* **Acessibilidade:** Deve ser invisível para tecnologias assistivas (`aria-hidden="true"`) e respeitar a preferência do sistema por movimento reduzido.
* **Performance:** Execução otimizada em `requestAnimationFrame`, com limpeza de memória e redimensionamento eficiente.

---

## 2. HTML: Estrutura e Posicionamento

O elemento `<canvas>` deve ser injetado diretamente como o primeiro filho do `<body>` (ou dentro do container principal de layout) para garantir que sirva de base para todas as outras seções.

```html
<canvas 
  id="starfield" 
  aria-hidden="true" 
  role="presentation">
</canvas>

```

---

## 3. CSS: Comportamento Espacial

O estilo deve garantir que o canvas ocupe todo o viewport sem interferir na rolagem ou em cliques nos elementos da UI.

* **Identificador:** `#starfield`
* **Posicionamento:** `fixed` com `inset: 0` (top, left, right, bottom: 0).
* **Camada (z-index):** Deve ser inferior a qualquer componente de interface (ex: `z-index: -1`), mas superior ao `background-color` básico do `body`.
* **Interação:** `pointer-events: none` (obrigatório para não bloquear interações do mouse).
* **Mix-blend-mode:** Opcional (usar `screen` ou `lighten` se for necessário sobrepor cores de seção específicas).

---

## 4. JS: Contrato de `initStarfield()`

A lógica deve ser encapsulada em um módulo para facilitar o ciclo de vida do componente.

### Requisitos do Script:

1. **DevicePixelRatio:** Deve detectar `window.devicePixelRatio` para evitar borrões em telas Retina/High-DPI.
2. **Resize Observer:** Escutar mudanças de tamanho do window para recalcular as dimensões do canvas (`width` e `height` internos) sem distorcer as estrelas.
3. **Animation Loop:** Utilizar `requestAnimationFrame`.
4. **Cleanup:** Prover uma função de destruição que cancele o frame de animação e remova os event listeners para evitar memory leaks.

---

## 5. Parâmetros Visuais (Alinhamento Design System)

Os elementos renderizados no canvas devem utilizar estritamente a paleta do `DESIGN.md`.

| Elemento | Token de Cor / Valor | Comportamento |
| --- | --- | --- |
| **Fundo Local** | `--bg-deep` (`#000000`) | O canvas pode ter um gradiente radial suave para `--bg-mid`. |
| **Estrelas Distantes** | `--text-muted` (alpha 0.3) | Partículas pequenas (1px), estáticas ou com cintilação lenta. |
| **Estrelas Próximas** | `--text-primary` (`#f5f0e8`) | Partículas de 1.5px a 2px com parallax suave no scroll. |
| **Glow de Estrela** | `--cosmic-cyan` ou `--accent-star` | Micro-brilho (shadowBlur) em estrelas raras selecionadas. |
| **Nebulosas** | `--cosmic-purple` / `--cosmic-rose` | Manchas de baixa opacidade (2-5%) renderizadas via gradientes radiais. |

* **Densidade:** Conforme `DESIGN.md` (5/10). Evitar "ruído" visual; priorizar o vazio cósmico.
* **Motion:** Conforme `DESIGN.md` (6/10). Movimento contínuo deve ser quase imperceptível; o impacto principal vem do scroll do usuário (parallax).

---

## 6. Checklist e Critérios de Aceitação

* [ ] **Respeito a Movimento Reduzido:** Se `prefers-reduced-motion: reduce` for detectado, o loop de animação deve ser pausado e renderizar apenas um frame estático.
* [ ] **Integridade de Tokens:** Nenhuma cor hexadecimal "hardcoded" no JS; utilizar `getComputedStyle` para ler os valores de `:root`.
* [ ] **Performance:** O uso de CPU/GPU deve ser mínimo em repouso (monitorar via DevTools).
* [ ] **Responsividade:** As estrelas devem se redistribuir ou o canvas deve ser limpo/redesenhado instantaneamente no resize sem "esticar" a imagem.
* [ ] **Anti-Pattern Check:** Não deve haver glows externos agressivos que ultrapassem a estética cinematográfica controlada do sistema.

---

**Status da Spec:** Pronta para Implementação.