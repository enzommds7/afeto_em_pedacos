/**
 * AFETO EM PEDAÇOS · SCRIPTS FRONT-END OTIMIZADOS
 * Stepper de Quantidades, Pedido Dinâmico no WhatsApp, Acessibilidade & Mobile
 * Foco: 100% Vanilla JS, zero dependências, compatível com WebViews (Android/iOS)
 */

// ==========================================================================
// 1. CONFIGURAÇÃO CENTRALIZADA (FÁCIL EDIÇÃO)
// ==========================================================================
const CONFIG = {
  // Telefone oficial com DDI (55) e DDD (47)
  telefone: '5547996577492',

  // Endpoint oficial do WhatsApp
  baseUrl: 'https://wa.me/',

  // Mensagem padrão caso nenhum sabor específico seja selecionado
  mensagemPadrao: 'Olá! Vim pelo site da Afeto em Pedaços e gostaria de fazer um pedido de brownies. Poderiam me passar as opções disponíveis?',

  // Template do pedido estruturado quando houver itens selecionados no stepper
  gerarMensagemPedido: function(itens) {
    const listaFormatada = itens.map(i => `• ${i.qtd}x ${i.nome}`).join('\n');
    return `Olá! Vim pelo site da Afeto em Pedaços e gostaria de pedir:\n${listaFormatada}\n\nPoderiam confirmar a disponibilidade e a entrega?`;
  }
};

// ==========================================================================
// 2. ESTADO DO PEDIDO (QUANTIDADES POR SABOR)
// ==========================================================================
const estadoPedido = {};

/**
 * Retorna os itens selecionados (quantidade > 0)
 */
function obterItensSelecionados() {
  return Object.entries(estadoPedido)
    .filter(([_, qtd]) => qtd > 0)
    .map(([nome, qtd]) => ({ nome, qtd }));
}

/**
 * Atualiza os resumos de quantidade na interface (barra fixa e cardápio)
 */
function atualizarResumosUI() {
  const itens = obterItensSelecionados();
  const totalItens = itens.reduce((soma, i) => soma + i.qtd, 0);

  const textoResumo = totalItens === 0
    ? 'Nenhum item selecionado'
    : `${totalItens} ${totalItens === 1 ? 'brownie selecionado' : 'brownies selecionados'}`;

  // Atualiza nos elementos de resumo
  document.querySelectorAll('[data-summary-text]').forEach(el => {
    el.textContent = textoResumo;
  });

  // Atualiza texto dos botões de WhatsApp do cardápio e sticky bar
  const textoBotao = totalItens > 0 ? 'Enviar Pedido no WhatsApp' : 'Pedir no WhatsApp';
  document.querySelectorAll('[data-order-btn-text]').forEach(el => {
    el.textContent = textoBotao;
  });
}

/**
 * Abre o WhatsApp montando a mensagem com os itens selecionados ou a padrão
 */
function enviarPedidoWhatsApp() {
  const itens = obterItensSelecionados();
  const mensagem = itens.length > 0
    ? CONFIG.gerarMensagemPedido(itens)
    : CONFIG.mensagemPadrao;

  const url = `${CONFIG.baseUrl}${CONFIG.telefone}?text=${encodeURIComponent(mensagem)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

// Expõe globalmente caso necessário
window.enviarPedidoWhatsApp = enviarPedidoWhatsApp;

// ==========================================================================
// 3. INICIALIZAÇÃO DE EVENTOS DO DOM
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {

  // ------------------------------------------------------------------------
  // A. Inicialização e Controle dos Steppers (- / +)
  // ------------------------------------------------------------------------
  document.querySelectorAll('.flavor-row').forEach(row => {
    const saborNomeEl = row.querySelector('.flavor-row__name');
    if (!saborNomeEl) return;

    const saborNome = saborNomeEl.textContent.trim();
    estadoPedido[saborNome] = 0;

    const btnMinus = row.querySelector('.stepper__btn--minus');
    const btnPlus = row.querySelector('.stepper__btn--plus');
    const valDisplay = row.querySelector('.stepper__val');

    if (btnMinus && btnPlus && valDisplay) {
      btnMinus.addEventListener('click', () => {
        if (estadoPedido[saborNome] > 0) {
          estadoPedido[saborNome]--;
          valDisplay.textContent = estadoPedido[saborNome];
          atualizarResumosUI();
        }
      });

      btnPlus.addEventListener('click', () => {
        if (estadoPedido[saborNome] < 99) {
          estadoPedido[saborNome]++;
          valDisplay.textContent = estadoPedido[saborNome];
          atualizarResumosUI();
        }
      });
    }
  });

  // ------------------------------------------------------------------------
  // B. Botões de Envio de Pedido (Cardápio, Sticky Bar e Ações Gerais)
  // ------------------------------------------------------------------------
  document.querySelectorAll('[data-action-order]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      enviarPedidoWhatsApp();
    });
  });

  // ------------------------------------------------------------------------
  // C. Menu Hamburguer Mobile Acessível
  // ------------------------------------------------------------------------
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-menu__link');

  if (mobileToggle && mobileMenu) {
    const alternarMenu = (fechar = false) => {
      const estaAberto = mobileToggle.getAttribute('aria-expanded') === 'true';
      const novoEstado = fechar ? false : !estaAberto;

      mobileToggle.setAttribute('aria-expanded', String(novoEstado));
      mobileMenu.classList.toggle('is-active', novoEstado);

      if (novoEstado) {
        mobileMenu.removeAttribute('aria-hidden');
        document.body.style.overflow = 'hidden';
      } else {
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    };

    mobileToggle.addEventListener('click', () => alternarMenu());

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => alternarMenu(true));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileToggle.getAttribute('aria-expanded') === 'true') {
        alternarMenu(true);
        mobileToggle.focus();
      }
    });
  }

  // ------------------------------------------------------------------------
  // D. Ano Atual no Rodapé
  // ------------------------------------------------------------------------
  const elAno = document.getElementById('currentYear');
  if (elAno) {
    elAno.textContent = new Date().getFullYear();
  }

  // ------------------------------------------------------------------------
  // E. Snippet de Debug de Overflow Horizontal (Apenas para inspeção)
  // ------------------------------------------------------------------------
  // [...document.querySelectorAll('*')].filter(e => e.scrollWidth > innerWidth);
});
