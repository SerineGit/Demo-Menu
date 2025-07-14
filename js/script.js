 // Дефолтные приложения
        const defaultApps = [
            { name: 'GitHub', url: 'https://github.com', icon: '🐱' },
            { name: 'Portfolio', url: 'https://yourportfolio.com', icon: '💼' },
            { name: 'LinkedIn', url: 'https://linkedin.com', icon: '💼' },
            { name: 'Twitter', url: 'https://twitter.com', icon: '🐦' },
            { name: 'YouTube', url: 'https://youtube.com', icon: '📺' },
            { name: 'Email', url: 'mailto:your@email.com', icon: '📧' },
            { name: 'Blog', url: 'https://yourblog.com', icon: '✍️' },
            { name: 'Resume', url: 'https://yourresume.com', icon: '📄' },
            { name: 'Projects', url: 'https://yourprojects.com', icon: '🚀' },
            { name: 'Telegram', url: 'https://t.me/username', icon: '💬' },
            { name: 'Discord', url: 'https://discord.com', icon: '🎮' },
            { name: 'Behance', url: 'https://behance.net', icon: '🎨' },
            { name: 'Dribbble', url: 'https://dribbble.com', icon: '🏀' },
            { name: 'Medium', url: 'https://medium.com', icon: '📝' },
            { name: 'Stack Overflow', url: 'https://stackoverflow.com', icon: '📚' },
            { name: 'CodePen', url: 'https://codepen.io', icon: '🖊️' },
            { name: 'Figma', url: 'https://figma.com', icon: '🔧' },
            { name: 'Spotify', url: 'https://spotify.com', icon: '🎵' },
            { name: 'Instagram', url: 'https://instagram.com', icon: '📷' }
        ];

        // Гексагональные позиции для иконок (компактнее, как на Apple Watch)
        const hexPositions = [
            { x: 0, y: 0, ring: 0 },           // Центр
            { x: 0, y: -80, ring: 1 },         // Кольцо 1 (ближе)
            { x: 70, y: -40, ring: 1 },
            { x: 70, y: 40, ring: 1 },
            { x: 0, y: 80, ring: 1 },
            { x: -70, y: 40, ring: 1 },
            { x: -70, y: -40, ring: 1 },
            { x: 0, y: -160, ring: 2 },        // Кольцо 2 (компактнее)
            { x: 70, y: -120, ring: 2 },
            { x: 140, y: -80, ring: 2 },
            { x: 140, y: 0, ring: 2 },
            { x: 140, y: 80, ring: 2 },
            { x: 70, y: 120, ring: 2 },
            { x: 0, y: 160, ring: 2 },
            { x: -70, y: 120, ring: 2 },
            { x: -140, y: 80, ring: 2 },
            { x: -140, y: 0, ring: 2 },
            { x: -140, y: -80, ring: 2 },
            { x: -70, y: -120, ring: 2 }
        ];

        let apps = JSON.parse(localStorage.getItem('watchApps')) || defaultApps;
        let isDragging = false;
        let dragStart = { x: 0, y: 0 };
        let containerOffset = { x: 0, y: 0 };
        let velocity = { x: 0, y: 0 };
        let lastMousePos = { x: 0, y: 0 };

        function getIconSize(ring) {
            switch(ring) {
                case 0: return 85;  // Центральная иконка (увеличил)
                case 1: return 65;  // Первое кольцо (увеличил)
                case 2: return 50;  // Второе кольцо (увеличил)
                default: return 45;
            }
        }

        function renderApps() {
            const container = document.getElementById('appsContainer');
            container.innerHTML = '';

            // Заполняем селект в модальном окне
            const select = document.getElementById('slotSelect');
            select.innerHTML = '';
            
            apps.forEach((app, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = `${app.name} (${index === 0 ? 'Центр' : `Кольцо ${hexPositions[index]?.ring || 2}`})`;
                select.appendChild(option);
            });

            apps.forEach((app, index) => {
                if (index >= hexPositions.length) return;
                
                const pos = hexPositions[index];
                const size = getIconSize(pos.ring);
                
                const appElement = document.createElement('div');
                appElement.className = `app-icon app-${index}`;
                appElement.style.cssText = `
                    left: ${500 + pos.x}px;
                    top: ${500 + pos.y}px;
                    width: ${size}px;
                    height: ${size}px;
                    transform: translate(-50%, -50%);
                `;
                
                appElement.innerHTML = `
                    <div class="icon" style="font-size: ${size * 0.4}px">${app.icon}</div>
                    <div class="label">${app.name}</div>
                `;
                
                appElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    appElement.classList.add('pulse');
                    setTimeout(() => {
                        appElement.classList.remove('pulse');
                        if (app.url) {
                            window.open(app.url, '_blank');
                        }
                    }, 300);
                });
                
                container.appendChild(appElement);
            });
        }

        function updateIconScales() {
            const container = document.getElementById('appsContainer');
            const watchRect = document.getElementById('watchContainer').getBoundingClientRect();
            const centerX = watchRect.left + watchRect.width / 2;
            const centerY = watchRect.top + watchRect.height / 2;
            
            Array.from(container.children).forEach((icon, index) => {
                const iconRect = icon.getBoundingClientRect();
                const iconCenterX = iconRect.left + iconRect.width / 2;
                const iconCenterY = iconRect.top + iconRect.height / 2;
                
                const distance = Math.sqrt(
                    Math.pow(iconCenterX - centerX, 2) + 
                    Math.pow(iconCenterY - centerY, 2)
                );
                
                const maxDistance = 120; // Уменьшил для более сильного эффекта
                const scale = Math.max(0.6, 1 - (distance / maxDistance) * 0.5); // Увеличил эффект
                
                icon.style.transform = `translate(-50%, -50%) scale(${scale})`;
            });
        }

        function setupDragAndDrop() {
            const watchContainer = document.getElementById('watchContainer');
            const appsContainer = document.getElementById('appsContainer');
            
            function startDrag(e) {
                isDragging = true;
                dragStart.x = e.clientX || e.touches[0].clientX;
                dragStart.y = e.clientY || e.touches[0].clientY;
                lastMousePos.x = dragStart.x;
                lastMousePos.y = dragStart.y;
                velocity.x = 0;
                velocity.y = 0;
                
                watchContainer.style.cursor = 'grabbing';
                appsContainer.style.transition = 'none';
            }
            
            function drag(e) {
                if (!isDragging) return;
                
                e.preventDefault();
                const currentX = e.clientX || e.touches[0].clientX;
                const currentY = e.clientY || e.touches[0].clientY;
                
                const deltaX = currentX - dragStart.x;
                const deltaY = currentY - dragStart.y;
                
                velocity.x = currentX - lastMousePos.x;
                velocity.y = currentY - lastMousePos.y;
                
                lastMousePos.x = currentX;
                lastMousePos.y = currentY;
                
                containerOffset.x += deltaX;
                containerOffset.y += deltaY;
                
                // Ограничиваем движение
                const maxOffset = 300;
                containerOffset.x = Math.max(-maxOffset, Math.min(maxOffset, containerOffset.x));
                containerOffset.y = Math.max(-maxOffset, Math.min(maxOffset, containerOffset.y));
                
                appsContainer.style.transform = `translate(calc(-50% + ${containerOffset.x}px), calc(-50% + ${containerOffset.y}px))`;
                
                dragStart.x = currentX;
                dragStart.y = currentY;
                
                updateIconScales();
            }
            
            function endDrag() {
                if (!isDragging) return;
                
                isDragging = false;
                watchContainer.style.cursor = 'grab';
                appsContainer.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                
                // Инерция
                const friction = 0.95;
                const animate = () => {
                    if (Math.abs(velocity.x) < 0.1 && Math.abs(velocity.y) < 0.1) return;
                    
                    velocity.x *= friction;
                    velocity.y *= friction;
                    
                    containerOffset.x += velocity.x;
                    containerOffset.y += velocity.y;
                    
                    const maxOffset = 300;
                    containerOffset.x = Math.max(-maxOffset, Math.min(maxOffset, containerOffset.x));
                    containerOffset.y = Math.max(-maxOffset, Math.min(maxOffset, containerOffset.y));
                    
                    appsContainer.style.transform = `translate(calc(-50% + ${containerOffset.x}px), calc(-50% + ${containerOffset.y}px))`;
                    
                    updateIconScales();
                    requestAnimationFrame(animate);
                };
                
                requestAnimationFrame(animate);
            }
            
            // Mouse events
            watchContainer.addEventListener('mousedown', startDrag);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', endDrag);
            
            // Touch events
            watchContainer.addEventListener('touchstart', startDrag);
            document.addEventListener('touchmove', drag);
            document.addEventListener('touchend', endDrag);
        }

        function editApp() {
            document.getElementById('editModal').style.display = 'flex';
        }

        function closeModal() {
            document.getElementById('editModal').style.display = 'none';
        }

        function saveApp() {
            const slot = parseInt(document.getElementById('slotSelect').value);
            const name = document.getElementById('appName').value;
            const url = document.getElementById('appUrl').value;
            const icon = document.getElementById('appIcon').value;
            
            if (name && url && icon) {
                apps[slot] = { name, url, icon };
                localStorage.setItem('watchApps', JSON.stringify(apps));
                renderApps();
                closeModal();
                
                // Очистка формы
                document.getElementById('appName').value = '';
                document.getElementById('appUrl').value = '';
                document.getElementById('appIcon').value = '';
            } else {
                alert('Заполните все поля!');
            }
        }

        function resetToDefaults() {
            if (confirm('Сбросить все настройки к дефолтным?')) {
                apps = [...defaultApps];
                localStorage.setItem('watchApps', JSON.stringify(apps));
                renderApps();
                
                // Сброс позиции
                containerOffset.x = 0;
                containerOffset.y = 0;
                document.getElementById('appsContainer').style.transform = 'translate(-50%, -50%)';
            }
        }

        function exportConfig() {
            const config = JSON.stringify(apps, null, 2);
            const blob = new Blob([config], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'watch-menu-config.json';
            a.click();
            URL.revokeObjectURL(url);
        }

        function importConfig() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try {
                            const config = JSON.parse(e.target.result);
                            apps = config;
                            localStorage.setItem('watchApps', JSON.stringify(apps));
                            renderApps();
                            alert('Конфигурация импортирована!');
                        } catch (error) {
                            alert('Ошибка при импорте файла!');
                        }
                    };
                    reader.readAsText(file);
                }
            };
            input.click();
        }

        // Загрузка формы при выборе слота
        document.getElementById('slotSelect').addEventListener('change', function() {
            const slot = parseInt(this.value);
            const app = apps[slot];
            
            if (app) {
                document.getElementById('appName').value = app.name;
                document.getElementById('appUrl').value = app.url;
                document.getElementById('appIcon').value = app.icon;
            }
        });

        // Инициализация при загрузке страницы
        document.addEventListener('DOMContentLoaded', function() {
            renderApps();
            setupDragAndDrop();
            updateIconScales();
        });

        // Закрытие модального окна при клике вне его
        document.getElementById('editModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });

        // Обновление масштаба при изменении размера окна
        window.addEventListener('resize', updateIconScales);
