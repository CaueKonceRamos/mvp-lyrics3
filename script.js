// Estado da aplicação
let currentSection = 'home';
let isPlaying = false;
let currentSong = null;
let volume = 0.7;
let isMuted = false;
let currentTime = 0;
let totalTime = 0;
let isMobile = window.innerWidth <= 768;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    createSidebarOverlay();
});

function initializeApp() {
    // Configurar volume inicial
    updateVolumeDisplay();
    
    // Configurar navegação
    setupNavigation();
    
    // Configurar busca
    setupSearch();
    
    // Verificar se é mobile
    handleResize();
}

function createSidebarOverlay() {
    if (isMobile) {
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.id = 'sidebarOverlay';
        overlay.addEventListener('click', closeSidebar);
        document.body.appendChild(overlay);
    }
}

function setupEventListeners() {
    // Navegação da sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            showSection(section);
            if (isMobile) {
                closeSidebar();
            }
        });
    });
    
    // Busca
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            handleSearch(this.value);
        });
        
        searchInput.addEventListener('focus', function() {
            showSection('search');
        });
    }
    
    // Teclas de atalho
    document.addEventListener('keydown', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                togglePlay();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                previousTrack();
                break;
            case 'ArrowRight':
                e.preventDefault();
                nextTrack();
                break;
            case 'ArrowUp':
                e.preventDefault();
                adjustVolume(0.1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                adjustVolume(-0.1);
                break;
            case 'KeyM':
                e.preventDefault();
                toggleMute();
                break;
        }
    });
    
    // Redimensionamento
    window.addEventListener('resize', handleResize);
    
    // Prevenir zoom no iOS
    document.addEventListener('touchstart', function(e) {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    });
    
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(e) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
}

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remover classe active de todos os itens
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Adicionar classe active ao item clicado
            this.classList.add('active');
            
            // Mostrar seção correspondente
            const section = this.dataset.section;
            showSection(section);
        });
    });
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                handleSearch(this.value);
            }, 300);
        });
        
        searchInput.addEventListener('focus', function() {
            showSection('search');
        });
    }
}

// Navegação entre seções
function showSection(sectionName) {
    // Esconder todas as seções
    document.querySelectorAll('.content-view').forEach(view => {
        view.style.display = 'none';
    });
    
    // Mostrar seção selecionada
    const targetView = document.getElementById(sectionName + '-view');
    if (targetView) {
        targetView.style.display = 'block';
    }
    
    // Atualizar navegação ativa
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeNavItem = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }
    
    currentSection = sectionName;
}

// Sidebar mobile
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebar.classList.contains('open')) {
        closeSidebar();
    } else {
        openSidebar();
    }
}

function openSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    sidebar.classList.add('open');
    if (overlay) {
        overlay.classList.add('active');
    }
    
    // Prevenir scroll do body
    document.body.style.overflow = 'hidden';
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    sidebar.classList.remove('open');
    if (overlay) {
        overlay.classList.remove('active');
    }
    
    // Restaurar scroll do body
    document.body.style.overflow = '';
}

// Controles do player
function togglePlay() {
    const playBtn = document.getElementById('playBtn');
    const playIcon = playBtn.querySelector('i');
    
    isPlaying = !isPlaying;
    
    if (isPlaying) {
        playIcon.className = 'fas fa-pause';
        if (currentSong) {
            simulateProgress();
        }
    } else {
        playIcon.className = 'fas fa-play';
    }
}

function playMusic(songId) {
    const songs = {
        'song1': { title: 'Amor Eterno', artist: 'Música Personalizada' },
        'song2': { title: 'Nosso Momento', artist: 'Composição Especial' },
        'song3': { title: 'Serenata Acústica', artist: 'Violão e Voz' },
        'song4': { title: 'Pedido de Casamento', artist: 'Música Única' },
        'song5': { title: 'Parabéns Especial', artist: 'Versão Personalizada' },
        'playlist1': { title: 'Mix Romântico', artist: 'Playlist Personalizada' },
        'playlist2': { title: 'Sucessos Personalizados', artist: 'Suas Criações' },
        'playlist3': { title: 'Datas Especiais', artist: 'Momentos Únicos' },
        'search1': { title: 'Música Romântica', artist: 'Resultado da busca' },
        'search2': { title: 'Serenata Especial', artist: 'Composição personalizada' },
        'search3': { title: 'Pedido de Amor', artist: 'Música única' }
    };
    
    const song = songs[songId];
    if (song) {
        currentSong = songId;
        document.getElementById('currentSong').textContent = song.title;
        document.getElementById('currentArtist').textContent = song.artist;
        
        // Iniciar reprodução
        isPlaying = true;
        const playBtn = document.getElementById('playBtn');
        playBtn.querySelector('i').className = 'fas fa-pause';
        
        // Simular progresso da música
        simulateProgress();
        
        // Mostrar notificação
        showNotification(`Tocando: ${song.title}`);
    }
}

function simulateProgress() {
    if (!isPlaying) return;
    
    totalTime = 180; // 3 minutos simulados
    currentTime = 0;
    
    const interval = setInterval(() => {
        if (!isPlaying) {
            clearInterval(interval);
            return;
        }
        
        currentTime += 1;
        updateProgressBar();
        updateTimeDisplay();
        
        if (currentTime >= totalTime) {
            clearInterval(interval);
            nextTrack();
        }
    }, 1000);
}

function updateProgressBar() {
    const progressFill = document.getElementById('progressFill');
    const percentage = (currentTime / totalTime) * 100;
    progressFill.style.width = percentage + '%';
}

function updateTimeDisplay() {
    document.getElementById('currentTime').textContent = formatTime(currentTime);
    document.getElementById('totalTime').textContent = formatTime(totalTime);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function previousTrack() {
    console.log('Música anterior');
    // Implementar lógica para música anterior
}

function nextTrack() {
    console.log('Próxima música');
    
    // Reset do player
    isPlaying = false;
    currentTime = 0;
    const playBtn = document.getElementById('playBtn');
    playBtn.querySelector('i').className = 'fas fa-play';
    updateProgressBar();
    updateTimeDisplay();
}

function shuffleMusic() {
    console.log('Embaralhar ativado');
    showNotification('Modo aleatório ativado');
}

function repeatMusic() {
    console.log('Repetir ativado');
    showNotification('Modo repetir ativado');
}

function seekMusic(event) {
    if (!currentSong) return;
    
    const progressBar = event.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const percentage = (event.clientX - rect.left) / rect.width;
    
    currentTime = Math.floor(percentage * totalTime);
    updateProgressBar();
    updateTimeDisplay();
}

// Controles de volume
function toggleMute() {
    const volumeIcon = document.getElementById('volumeIcon');
    const volumeFill = document.getElementById('volumeFill');
    
    isMuted = !isMuted;
    
    if (isMuted) {
        volumeIcon.className = 'fas fa-volume-mute';
        volumeFill.style.width = '0%';
    } else {
        volumeIcon.className = 'fas fa-volume-up';
        volumeFill.style.width = (volume * 100) + '%';
    }
}

function setVolume(event) {
    const volumeBar = event.currentTarget;
    const rect = volumeBar.getBoundingClientRect();
    const percentage = (event.clientX - rect.left) / rect.width;
    
    volume = Math.max(0, Math.min(1, percentage));
    isMuted = false;
    
    updateVolumeDisplay();
}

function adjustVolume(delta) {
    volume = Math.max(0, Math.min(1, volume + delta));
    isMuted = false;
    updateVolumeDisplay();
}

function updateVolumeDisplay() {
    const volumeFill = document.getElementById('volumeFill');
    const volumeIcon = document.getElementById('volumeIcon');
    
    if (!volumeFill || !volumeIcon) return;
    
    volumeFill.style.width = (volume * 100) + '%';
    
    if (volume === 0 || isMuted) {
        volumeIcon.className = 'fas fa-volume-mute';
    } else if (volume < 0.5) {
        volumeIcon.className = 'fas fa-volume-down';
    } else {
        volumeIcon.className = 'fas fa-volume-up';
    }
}

// Funcionalidade de curtir
function toggleLike() {
    const likeBtn = document.querySelector('.like-btn');
    const likeIcon = likeBtn.querySelector('i');
    
    if (likeIcon.classList.contains('far')) {
        likeIcon.className = 'fas fa-heart';
        likeBtn.classList.add('liked');
        showNotification('Adicionado aos favoritos');
    } else {
        likeIcon.className = 'far fa-heart';
        likeBtn.classList.remove('liked');
        showNotification('Removido dos favoritos');
    }
}

// Busca
function handleSearch(query) {
    if (!query.trim()) {
        document.getElementById('searchResults').innerHTML = '';
        return;
    }
    
    // Simular resultados de busca
    const mockResults = [
        { id: 'search1', title: 'Música Romântica', artist: 'Resultado da busca', type: 'song' },
        { id: 'search2', title: 'Serenata Especial', artist: 'Composição personalizada', type: 'song' },
        { id: 'search3', title: 'Pedido de Amor', artist: 'Música única', type: 'song' },
        { id: 'search4', title: 'Aniversário Especial', artist: 'Celebração única', type: 'song' },
        { id: 'search5', title: 'Declaração de Amor', artist: 'Sentimentos verdadeiros', type: 'song' }
    ];
    
    const filteredResults = mockResults.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.artist.toLowerCase().includes(query.toLowerCase())
    );
    
    displaySearchResults(filteredResults);
}

function displaySearchResults(results) {
    const searchResults = document.getElementById('searchResults');
    
    if (results.length === 0) {
        searchResults.innerHTML = '<p style="color: rgba(255, 255, 255, 0.6); text-align: center; padding: 40px;">Nenhum resultado encontrado</p>';
        return;
    }
    
    const resultsHTML = results.map(result => `
        <div class="music-card" onclick="playMusic('${result.id}')">
            <div class="card-cover">
                <i class="fas fa-music"></i>
                <div class="play-overlay">
                    <i class="fas fa-play"></i>
                </div>
            </div>
            <div class="card-info">
                <h3>${result.title}</h3>
                <p>${result.artist}</p>
            </div>
        </div>
    `).join('');
    
    searchResults.innerHTML = resultsHTML;
}

// Navegação do histórico
function goBack() {
    console.log('Voltar');
}

function goForward() {
    console.log('Avançar');
}

// Menu do usuário
function toggleUserMenu() {
    console.log('Menu do usuário');
}

// Sistema de notificações
function showNotification(message, type = 'info') {
    // Remover notificação existente
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// Responsividade
function handleResize() {
    const wasMobile = isMobile;
    isMobile = window.innerWidth <= 768;
    
    // Se mudou de mobile para desktop ou vice-versa
    if (wasMobile !== isMobile) {
        if (!isMobile) {
            // Mudou para desktop
            closeSidebar();
            const overlay = document.getElementById('sidebarOverlay');
            if (overlay) {
                overlay.remove();
            }
        } else {
            // Mudou para mobile
            createSidebarOverlay();
        }
    }
    
    // Ajustar grid de cards
    const cardsGrid = document.querySelectorAll('.cards-grid');
    cardsGrid.forEach(grid => {
        if (isMobile) {
            if (window.innerWidth <= 480) {
                grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(140px, 1fr))';
            } else {
                grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 1fr))';
            }
        } else {
            grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
        }
    });
}

// Efeito ripple
function addRippleEffect(element) {
    element.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.remove();
            }
        }, 600);
    });
}

// Aplicar efeito ripple aos elementos interativos
document.addEventListener('DOMContentLoaded', function() {
    const interactiveElements = document.querySelectorAll(
        '.music-card, .nav-item, .control-btn, .hero-cta, .create-music-btn, .like-btn'
    );
    
    interactiveElements.forEach(element => {
        addRippleEffect(element);
    });
});

// Otimização de scroll
let ticking = false;
function optimizeScroll() {
    if (!ticking) {
        requestAnimationFrame(() => {
            // Implementar otimizações de scroll
            ticking = false;
        });
        ticking = true;
    }
}

// Adicionar listener de scroll otimizado
document.addEventListener('DOMContentLoaded', function() {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.addEventListener('scroll', optimizeScroll, { passive: true });
    }
});

// Prevenção de comportamentos indesejados no mobile
function preventMobileBehaviors() {
    // Prevenir zoom duplo toque
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // Prevenir zoom com gestos
    document.addEventListener('gesturestart', function(e) {
        e.preventDefault();
    });
    
    // Prevenir pull-to-refresh
    document.addEventListener('touchstart', function(e) {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });
    
    let startY;
    document.addEventListener('touchstart', function(e) {
        startY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchmove', function(e) {
        const y = e.touches[0].clientY;
        const scrollTop = document.querySelector('.main-content').scrollTop;
        
        // Prevenir pull-to-refresh quando no topo
        if (scrollTop === 0 && y > startY) {
            e.preventDefault();
        }
    }, { passive: false });
}

// Aplicar prevenções mobile
if (isMobile) {
    preventMobileBehaviors();
}

// Gerenciamento de estado local
const AppState = {
    favorites: JSON.parse(localStorage.getItem('lirycs_favorites') || '[]'),
    recentlyPlayed: JSON.parse(localStorage.getItem('lirycs_recent') || '[]'),
    volume: parseFloat(localStorage.getItem('lirycs_volume') || '0.7'),
    
    save() {
        localStorage.setItem('lirycs_favorites', JSON.stringify(this.favorites));
        localStorage.setItem('lirycs_recent', JSON.stringify(this.recentlyPlayed));
        localStorage.setItem('lirycs_volume', this.volume.toString());
    },
    
    addToFavorites(songId) {
        if (!this.favorites.includes(songId)) {
            this.favorites.push(songId);
            this.save();
            return true;
        }
        return false;
    },
    
    removeFromFavorites(songId) {
        const index = this.favorites.indexOf(songId);
        if (index > -1) {
            this.favorites.splice(index, 1);
            this.save();
            return true;
        }
        return false;
    },
    
    addToRecentlyPlayed(songId) {
        // Remove se já existe
        this.recentlyPlayed = this.recentlyPlayed.filter(id => id !== songId);
        // Adiciona no início
        this.recentlyPlayed.unshift(songId);
        // Mantém apenas os últimos 20
        this.recentlyPlayed = this.recentlyPlayed.slice(0, 20);
        this.save();
    },
    
    isFavorite(songId) {
        return this.favorites.includes(songId);
    }
};

// Carregar estado inicial
document.addEventListener('DOMContentLoaded', function() {
    volume = AppState.volume;
    updateVolumeDisplay();
});

// Atualizar função de curtir com estado persistente
function toggleLike() {
    if (!currentSong) return;
    
    const likeBtn = document.querySelector('.like-btn');
    const likeIcon = likeBtn.querySelector('i');
    
    if (AppState.isFavorite(currentSong)) {
        AppState.removeFromFavorites(currentSong);
        likeIcon.className = 'far fa-heart';
        likeBtn.classList.remove('liked');
        showNotification('Removido dos favoritos');
    } else {
        AppState.addToFavorites(currentSong);
        likeIcon.className = 'fas fa-heart';
        likeBtn.classList.add('liked');
        showNotification('Adicionado aos favoritos');
    }
}

// Atualizar função de tocar música com histórico
function playMusic(songId) {
    const songs = {
        'song1': { title: 'Amor Eterno', artist: 'Música Personalizada' },
        'song2': { title: 'Nosso Momento', artist: 'Composição Especial' },
        'song3': { title: 'Serenata Acústica', artist: 'Violão e Voz' },
        'song4': { title: 'Pedido de Casamento', artist: 'Música Única' },
        'song5': { title: 'Parabéns Especial', artist: 'Versão Personalizada' },
        'playlist1': { title: 'Mix Romântico', artist: 'Playlist Personalizada' },
        'playlist2': { title: 'Sucessos Personalizados', artist: 'Suas Criações' },
        'playlist3': { title: 'Datas Especiais', artist: 'Momentos Únicos' },
        'search1': { title: 'Música Romântica', artist: 'Resultado da busca' },
        'search2': { title: 'Serenata Especial', artist: 'Composição personalizada' },
        'search3': { title: 'Pedido de Amor', artist: 'Música única' },
        'search4': { title: 'Aniversário Especial', artist: 'Celebração única' },
        'search5': { title: 'Declaração de Amor', artist: 'Sentimentos verdadeiros' }
    };
    
    const song = songs[songId];
    if (song) {
        currentSong = songId;
        document.getElementById('currentSong').textContent = song.title;
        document.getElementById('currentArtist').textContent = song.artist;
        
        // Adicionar ao histórico
        AppState.addToRecentlyPlayed(songId);
        
        // Atualizar estado do botão de curtir
        const likeBtn = document.querySelector('.like-btn');
        const likeIcon = likeBtn.querySelector('i');
        
        if (AppState.isFavorite(songId)) {
            likeIcon.className = 'fas fa-heart';
            likeBtn.classList.add('liked');
        } else {
            likeIcon.className = 'far fa-heart';
            likeBtn.classList.remove('liked');
        }
        
        // Iniciar reprodução
        isPlaying = true;
        const playBtn = document.getElementById('playBtn');
        playBtn.querySelector('i').className = 'fas fa-pause';
        
        // Simular progresso da música
        simulateProgress();
        
        // Mostrar notificação
        showNotification(`Tocando: ${song.title}`);
    }
}

// Função para criar playlist
function createPlaylist() {
    const playlistName = prompt('Nome da nova playlist:');
    if (playlistName && playlistName.trim()) {
        showNotification(`Playlist "${playlistName}" criada!`);
        // Aqui você implementaria a lógica para salvar a playlist
    }
}

// Função para compartilhar música
function shareMusic(songId) {
    if (navigator.share) {
        navigator.share({
            title: 'Lirycs - Música Personalizada',
            text: 'Confira esta música personalizada incrível!',
            url: window.location.href
        }).catch(err => console.log('Erro ao compartilhar:', err));
    } else {
        // Fallback para navegadores que não suportam Web Share API
        const url = window.location.href;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(() => {
                showNotification('Link copiado para a área de transferência!');
            }).catch(() => {
                showNotification('Não foi possível copiar o link');
            });
        } else {
            showNotification('Compartilhamento não suportado neste navegador');
        }
    }
}

// Função para download simulado
function downloadMusic(songId) {
    showNotification('Preparando download...', 'info');
    
    setTimeout(() => {
        showNotification('Download iniciado!', 'success');
    }, 2000);
}

// Melhorar função de ajuste de volume
function setVolume(event) {
    const volumeBar = event.currentTarget;
    const rect = volumeBar.getBoundingClientRect();
    const percentage = (event.clientX - rect.left) / rect.width;
    
    volume = Math.max(0, Math.min(1, percentage));
    isMuted = false;
    
    // Salvar no estado
    AppState.volume = volume;
    AppState.save();
    
    updateVolumeDisplay();
}

// Função para detectar se está online
function checkOnlineStatus() {
    if (navigator.onLine) {
        showNotification('Conectado à internet', 'success');
    } else {
        showNotification('Sem conexão com a internet', 'error');
    }
}

// Listeners para status de conexão
window.addEventListener('online', () => {
    showNotification('Conexão restaurada', 'success');
});

window.addEventListener('offline', () => {
    showNotification('Sem conexão com a internet', 'error');
});

// Função para lazy loading de imagens (futuro)
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Função para analytics simulado
function trackEvent(eventName, eventData = {}) {
    console.log('Analytics:', eventName, eventData);
    // Aqui você implementaria o tracking real
}

// Rastrear eventos importantes
document.addEventListener('DOMContentLoaded', function() {
    trackEvent('app_loaded');
    
    // Rastrear cliques em músicas
    document.addEventListener('click', function(e) {
        if (e.target.closest('.music-card')) {
            trackEvent('music_clicked');
        }
        
        if (e.target.closest('.hero-cta, .create-music-btn')) {
            trackEvent('cta_clicked');
        }
        
        if (e.target.closest('.whatsapp-btn')) {
            trackEvent('whatsapp_clicked');
        }
    });
});

// Função para modo escuro/claro (preparação futura)
function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('lirycs_theme', isLight ? 'light' : 'dark');
    showNotification(`Tema ${isLight ? 'claro' : 'escuro'} ativado`);
}

// Carregar tema salvo
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('lirycs_theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }
});

// Função para feedback de erro
function handleError(error, context = '') {
    console.error('Erro:', error, context);
    showNotification('Ops! Algo deu errado. Tente novamente.', 'error');
}

// Wrapper para funções que podem dar erro
function safeExecute(fn, context = '') {
    try {
        return fn();
    } catch (error) {
        handleError(error, context);
    }
}

// Performance monitoring
function measurePerformance() {
    if ('performance' in window) {
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Performance:', {
                loadTime: perfData.loadEventEnd - perfData.loadEventStart,
                domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                totalTime: perfData.loadEventEnd - perfData.fetchStart
            });
        });
    }
}

// Inicializar monitoramento de performance
measurePerformance();

// Service Worker registration (futuro)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registrado:', registration);
            })
            .catch(error => {
                console.log('SW falhou:', error);
            });
    });
}

// Função de inicialização final
function finalizeInitialization() {
    // Aplicar efeitos ripple
    const interactiveElements = document.querySelectorAll(
        '.music-card, .nav-item, .control-btn, .hero-cta, .create-music-btn, .like-btn, .nav-btn'
    );
    
    interactiveElements.forEach(element => {
        addRippleEffect(element);
    });
    
    // Lazy load de imagens
    if ('IntersectionObserver' in window) {
        lazyLoadImages();
    }
    
    // Log de inicialização
    console.log('🎵 Lirycs App inicializado com sucesso!');
    console.log('📱 Mobile:', isMobile);
    console.log('🔊 Volume:', volume);
    console.log('❤️ Favoritos:', AppState.favorites.length);
}

// Executar inicialização final
document.addEventListener('DOMContentLoaded', finalizeInitialization);

// Exportar funções globais necessárias
window.toggleSidebar = toggleSidebar;
window.showSection = showSection;
window.playMusic = playMusic;
window.togglePlay = togglePlay;
window.previousTrack = previousTrack;
window.nextTrack = nextTrack;
window.shuffleMusic = shuffleMusic;
window.repeatMusic = repeatMusic;
window.toggleLike = toggleLike;
window.toggleMute = toggleMute;
window.setVolume = setVolume;
window.seekMusic = seekMusic;
window.goBack = goBack;
window.goForward = goForward;
window.toggleUserMenu = toggleUserMenu;
window.shareMusic = shareMusic;
window.downloadMusic = downloadMusic;
window.createPlaylist = createPlaylist;
window.toggleTheme = toggleTheme;
