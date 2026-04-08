document.addEventListener("DOMContentLoaded", () => {
    // ---- SCROLL SECTION HIGHLIGHTER ----
    const sectionMarkers = document.querySelectorAll('h2');
    const navLinks = document.querySelectorAll('nav ul li a');

    // ---- NAV CLICK ----
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').slice(1);
            const targetH2 = document.getElementById(targetId);
            if (!targetH2) return;

            const navItem = link.closest('li');
            const navItemRect = navItem.getBoundingClientRect();
            const navItemCenterY = navItemRect.top + navItemRect.height / 2;

            const h2Rect = targetH2.getBoundingClientRect();
            const h2CenterY = h2Rect.top + h2Rect.height / 2;

            const targetScrollY = window.scrollY + (h2CenterY - navItemCenterY);
            window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
        });
    });

    // ---- TITLE TYPOGRAPHY ----
    const titleEl = document.querySelector('h1.title');
    const letterSpans = [];

    const offcutsByChar = {
        'e': ['O-001-E.png', 'O-009-E.png', 'O-020-E.png'],
        't': ['O-003-T.png', 'O-029-T.png'],
        'm': ['O-004-M.png', 'O-028-M.png'],
        's': ['O-005-S.png', 'O-012-S.png', 'O-013-S.png', 'O-014-S.png', 'O-021-S.png'],
        'a': ['O-027-A.png', 'O-006-A.png', 'O-039-A.png'],
        'd': ['O-011-D.png', 'O-026-D.png'],
        'i': ['O-015-i.png', 'O-018-i.png'],
        'n': ['O-016-N.png', 'O-024-N.png'],
        'r': ['O-019-R.png'],
        'p': ['O-025-P.png'],
        'h': ['O-030-H.png'],
        'o': ['O-031-O.png'],
        'y': ['O-032-Y.png'],
        'l': ['O-034-L.png']
    };

    Object.keys(offcutsByChar).forEach(char => {
        offcutsByChar[char] = offcutsByChar[char].map(name => `assets/images/offcuts/${name}`);
    });

    const offcutUsageIndices = {};
    const allOffcuts = Object.values(offcutsByChar).flat();
    const offcutMetadata = {};

    allOffcuts.forEach(src => {
        const img = new Image();
        img.onload = () => {
            offcutMetadata[src] = img.width / img.height;
        };
        img.src = src;
    });

    if (titleEl) {
        const isMobile = window.innerWidth <= 768;
        if (!isMobile) {
            titleEl.style.whiteSpace = 'nowrap';
        }

        const textStr = titleEl.textContent;
        titleEl.innerHTML = '';

        textStr.split(' ').forEach((word, wordIndex, wordsArr) => {
            const wordWrap = document.createElement('span');
            if (!isMobile) {
                wordWrap.style.whiteSpace = 'nowrap';
            }

            word.split('').forEach(char => {
                const span = document.createElement('span');
                span.textContent = char;
                span.style.display = 'inline-block';
                span.style.transition = 'none';
                span.style.width = 'auto';
                span.style.textAlign = 'center';

                const lowerChar = char.toLowerCase();
                let assignedOffcut = '';

                if (offcutsByChar[lowerChar]) {
                    if (offcutUsageIndices[lowerChar] === undefined) {
                        offcutUsageIndices[lowerChar] = 0;
                    }
                    const charOffcuts = offcutsByChar[lowerChar];
                    assignedOffcut = charOffcuts[offcutUsageIndices[lowerChar] % charOffcuts.length];
                    offcutUsageIndices[lowerChar]++;
                } else if (allOffcuts.length > 0) {
                    assignedOffcut = allOffcuts[0];
                }

                span.dataset.offcut = assignedOffcut;
                span.dataset.char = lowerChar;
                span.dataset.wordIndex = wordIndex;

                span.style.backgroundImage = `url("${span.dataset.offcut}")`;
                span.style.backgroundRepeat = 'no-repeat';
                span.style.backgroundPosition = 'center';
                span.style.backgroundSize = '0';
                span.style.mixBlendMode = 'multiply';
                span.style.transform = 'translateZ(0)';

                letterSpans.push(span);
                wordWrap.appendChild(span);
            });

            titleEl.appendChild(wordWrap);

            if (isMobile && wordIndex === 2) {
                const lineBreak = document.createElement('br');
                lineBreak.className = 'mobile-break';
                titleEl.appendChild(lineBreak);
            } else if (wordIndex < wordsArr.length - 1) {
                const spaceSpan = document.createElement('span');
                spaceSpan.innerHTML = '&nbsp;';
                titleEl.appendChild(spaceSpan);
            }
        });

        // ---- NAV HIGHLIGHT ----
        function updateNavHighlight() {
            const footer = document.querySelector('footer');
            const mainEl = document.querySelector('main');

            const contentBottom = mainEl
                ? mainEl.getBoundingClientRect().bottom
                : (footer ? footer.getBoundingClientRect().top : window.innerHeight * 2);

            const triggerY = window.innerHeight * 0.65;
            let currentSectionId = '';

            if (contentBottom >= triggerY) {
                const markers = Array.from(sectionMarkers);
                for (let i = 0; i < markers.length; i++) {
                    const topRect = markers[i].getBoundingClientRect().top;
                    const bottomRect = i < markers.length - 1
                        ? markers[i + 1].getBoundingClientRect().top
                        : contentBottom;

                    if (topRect <= triggerY && triggerY < bottomRect) {
                        currentSectionId = markers[i].id;
                        break;
                    }
                }
            }

            navLinks.forEach(link => {
                const isActive = currentSectionId !== '' && link.getAttribute('href') === '#' + currentSectionId;
                link.classList.toggle('active', isActive);
            });
        }

        updateNavHighlight();

        window.addEventListener('scroll', () => {
            requestAnimationFrame(() => {
                updateNavHighlight();

                const scrollTop = window.scrollY;
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                let progress = 0;
                if (docHeight > 0) {
                    progress = Math.max(0, Math.min(1, scrollTop / docHeight));
                }

                const targetCount = Math.floor(progress * letterSpans.length);

                letterSpans.forEach((span, index) => {
                    if (index < targetCount) {
                        if (!span.classList.contains('is-offcut')) {
                            span.classList.add('is-offcut');
                            span.style.color = 'transparent';

                            const aspect = offcutMetadata[span.dataset.offcut] || 1.5;
                            const isMobile = window.innerWidth <= 768;
                            let spacingMultiplier = isMobile ? 2.2 : 2.6;
                            let marginOffset = isMobile ? '-2px' : '0.1ch';

                            if (isMobile) {
                                const wordIdx = parseInt(span.dataset.wordIndex);
                                const char = span.dataset.char;

                                if (wordIdx === 1) {
                                    if (char === 'i' || char === 's') {
                                        marginOffset = '-6px';
                                    }
                                } else if (wordIdx === 2) {
                                    if (char === 's' || char === 't' || char === 'e') {
                                        spacingMultiplier = 1.0;
                                    } else {
                                        spacingMultiplier = 1.4;
                                    }
                                }
                            }

                            span.style.width = (aspect * spacingMultiplier) + 'ch';
                            span.style.marginRight = isMobile ? marginOffset : '0.1ch';

                            span.style.backgroundSize = 'contain';
                            span.style.transform = `scale(1.8)`;
                        }
                    } else {
                        if (span.classList.contains('is-offcut')) {
                            span.classList.remove('is-offcut');
                            span.style.color = '';
                            span.style.width = 'auto';
                            span.style.margin = '0';
                            span.style.backgroundSize = '0';
                            span.style.transform = 'none';
                        }
                    }
                });
            });
        });
    }

    // ---- IDLE SCREEN ----
    let idleTimer;
    let spawnInterval;
    let isFxEnabled = true;

    const fxBtn = document.getElementById('fx-btn');
    if (fxBtn) {
        fxBtn.addEventListener('click', (e) => {
            e.preventDefault();
            isFxEnabled = !isFxEnabled;
            fxBtn.textContent = isFxEnabled ? 'fx: On' : 'fx: Off';
            fxBtn.style.opacity = isFxEnabled ? '1' : '0.5';

            if (!isFxEnabled) {
                clearTimeout(idleTimer);
                clearInterval(spawnInterval);
                if (idleScreen) {
                    const images = idleScreen.querySelectorAll('.idle-img-layer');
                    images.forEach(img => img.remove());
                }
            } else {
                resetIdleTimer();
            }
        });
    }

    const idleScreen = document.getElementById('idle-screen');
    const IDLE_TIMEOUT = 8000;
    const SPAWN_RATE = 12000;

    const availableIdleImages = [
        'frottage-bg-1.png',
        'frottage-bg-2.png',
        'frottage-bg-3.png',
        'frottage-bg-4.png'
    ];

    function spawnIdleImage() {
        if (!idleScreen || !isFxEnabled) return;

        if (idleScreen.querySelectorAll('.idle-img-layer').length >= 3) {
            return;
        }

        const imgName = availableIdleImages[Math.floor(Math.random() * availableIdleImages.length)];
        const imgParams = new Image();
        imgParams.src = `assets/images/bg/${imgName}`;
        imgParams.className = 'idle-img-layer';

        const randomTop = Math.floor(Math.random() * 80 + 10);
        const randomLeft = Math.floor(Math.random() * 80 + 10);

        let randomScale = Math.random() * 0.5 + 0.8;
        if (window.innerWidth <= 768) {
            randomScale *= 1.5;
        }

        const randomRotate = Math.floor(Math.random() * 360);

        imgParams.style.top = `${randomTop}%`;
        imgParams.style.left = `${randomLeft}%`;
        imgParams.style.transform = `translate(-50%, -50%) scale(${randomScale}) rotate(${randomRotate}deg)`;

        idleScreen.appendChild(imgParams);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                imgParams.classList.add('visible');
            });
        });
    }

    function startIdleScreen() {
        spawnIdleImage();
        spawnInterval = setInterval(spawnIdleImage, SPAWN_RATE);
    }

    function resetIdleTimer() {
        if (!isFxEnabled) return;
        clearInterval(spawnInterval);

        if (idleScreen) {
            const images = idleScreen.querySelectorAll('.idle-img-layer');
            images.forEach(img => {
                img.classList.remove('visible');
                img.classList.add('disappearing');
                img.addEventListener('animationend', () => img.remove(), { once: true });
            });
        }

        clearTimeout(idleTimer);
        idleTimer = setTimeout(startIdleScreen, IDLE_TIMEOUT);
    }

    ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'].forEach(event => {
        window.addEventListener(event, resetIdleTimer, { passive: true });
    });

    resetIdleTimer();

    // ---- IMAGE EXPANSION ----
    const overlay = document.getElementById('image-viewer-overlay');
    const fullImg = document.getElementById('full-image');

    if (overlay && fullImg) {
        document.querySelectorAll('figure img').forEach(img => {
            img.style.cursor = 'zoom-in';
            img.addEventListener('click', () => {
                fullImg.src = img.src;
                overlay.style.display = 'flex';
                document.body.classList.add('no-scroll');
            });
        });

        overlay.addEventListener('click', () => {
            overlay.style.display = 'none';
            fullImg.src = '';
            document.body.classList.remove('no-scroll');
        });
    }
});