/**
 * AFETO EM PEDAÇOS · SCRIPTS FRONT-END
 * Integração WhatsApp, Navegação Responsiva e Interações Editoriais
 */

// ==========================================================================
// 1. CONFIGURAÇÃO CENTRALIZADA (FÁCIL EDIÇÃO PELO CLIENTE)
// ==========================================================================
const CONFIG_WHATSAPP = {
  // Número oficial de atendimento com DDI (55) e DDD (47)
  numeroTelefone: '5547996577492',
  
  // Endpoint oficial da API do WhatsApp
  baseUrl: 'https://wa.me/',

  // Mensagem padrão enviada pelos botões gerais (Hero, Header, Contato)
  mensagemPadrao: 'Olá! Vim pelo site da Afeto em Pedaços e gostaria de fazer um pedido de brownies. Poderiam me passar as opções disponíveis?',

  // Template da mensagem ao clicar em "Pedir este sabor" no cardápio
  gerarMensagemSabor: function(sabor) {
    return `Olá! Gostaria de pedir o brownie sabor ${sabor}. Está disponível?`;
  }
};

// ==========================================================================
// 2. FUNÇÃO PRINCIPAL DE ABERTURA DO WHATSAPP
// ==========================================================================
/**
 * Abre o WhatsApp em nova aba com a mensagem devidamente codificada.
 * @param {string|null} sabor - Nome do sabor específico ou vazio/nulo para mensagem padrão.
 */
function abrirWhatsApp(sabor = null) {
  const mensagem = (sabor && typeof sabor === 'string' && sabor.trim() !== '')
    ? CONFIG_WHATSAPP.gerarMensagemSabor(sabor.trim())
    : CONFIG_WHATSAPP.mensagemPadrao;

  const urlCompleta = `${CONFIG_WHATSAPP.baseUrl}${CONFIG_WHATSAPP.numeroTelefone}?text=${encodeURIComponent(mensagem)}`;

  // Garante abertura em nova aba com segurança (noopener, noreferrer)
  window.open(urlCompleta, '_blank', 'noopener,noreferrer');
}

// Expõe a função no escopo global para chamadas diretas via inline onClick caso necessário
window.abrirWhatsApp = abrirWhatsApp;

// ==========================================================================
// 3. INICIALIZAÇÃO DE EVENTOS DO DOM
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  // ------------------------------------------------------------------------
  // A. Delegação de cliques para botões com atributo data-whatsapp
  // ------------------------------------------------------------------------
  document.querySelectorAll('[data-whatsapp]').forEach(botao => {
    botao.addEventListener('click', (evento) => {
      evento.preventDefault();
      const sabor = botao.getAttribute('data-whatsapp-sabor') || null;
      abrirWhatsApp(sabor);
    });
  });

  // ------------------------------------------------------------------------
  // B. Menu Hamburguer Mobile
  // ------------------------------------------------------------------------
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-menu__link');

  if (mobileToggle && mobileMenu) {
    const alternarMenu = (forcarFechamento = false) => {
      const estaAberto = mobileToggle.getAttribute('aria-expanded') === 'true';
      const novoEstado = forcarFechamento ? false : !estaAberto;

      mobileToggle.setAttribute('aria-expanded', String(novoEstado));
      if (novoEstado) {
        mobileMenu.classList.add('is-active');
        document.body.style.overflow = 'hidden';
      } else {
        mobileMenu.classList.remove('is-active');
        document.body.style.overflow = '';
      }
    };

    mobileToggle.addEventListener('click', () => alternarMenu());

    // Fechar ao clicar em qualquer link da gaveta mobile
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => alternarMenu(true));
    });

    // Fechar com tecla ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileToggle.getAttribute('aria-expanded') === 'true') {
        alternarMenu(true);
      }
    });
  }

  // ------------------------------------------------------------------------
  // C. Sombra sutil no Header ao rolar a página
  // ------------------------------------------------------------------------
  const siteHeader = document.querySelector('.site-header');
  const monitorarScroll = () => {
    if (!siteHeader) return;
    if (window.scrollY > 20) {
      siteHeader.style.boxShadow = '0 4px 20px rgba(59, 31, 23, 0.06)';
    } else {
      siteHeader.style.boxShadow = 'none';
    }
  };

  window.addEventListener('scroll', monitorarScroll, { passive: true });
  monitorarScroll();

  // ------------------------------------------------------------------------
  // D. Ano dinâmico no copyright do rodapé
  // ------------------------------------------------------------------------
  const elementoAno = document.getElementById('currentYear');
  if (elementoAno) {
    elementoAno.textContent = new Date().getFullYear();
  }
});
