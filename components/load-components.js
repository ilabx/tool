/**
 * 组件加载工具
 * 用于动态加载header和footer组件
 */

class ComponentLoader {
    /**
     * 加载组件
     * @param {string} componentName - 组件名称 ('header' 或 'footer')
     * @param {string} targetElementId - 目标元素ID
     * @param {Object} options - 配置选项
     * @returns {Promise} 加载完成的Promise
     */
    static async loadComponent(componentName, targetElementId, options = {}) {
        const {
            basePath = '../components/',
            activeNav = 'home',
            customLinks = null,
            toolName = null  // 工具名称，用于显示在header的工具详情位置
        } = options;
        
        try {
            // 构建组件文件路径
            const componentPath = `${basePath}${componentName}.html`;
            
            // 获取组件HTML
            const response = await fetch(componentPath);
            if (!response.ok) {
                throw new Error(`无法加载组件: ${componentName}`);
            }
            
            let html = await response.text();
            
            // 处理自定义链接（如果需要）
            if (customLinks && componentName === 'header') {
                html = this._processCustomLinks(html, customLinks);
            }

            // 设置活动导航项
            if (componentName === 'header') {
                html = this._setActiveNav(html, activeNav);
                // 设置工具名称
                if (toolName) {
                    html = html.replace(/>工具详情<\/a>/, `>${toolName}</a>`);
                }
            }
            
            // 插入到目标元素
            const targetElement = document.getElementById(targetElementId);
            if (targetElement) {
                targetElement.innerHTML = html;
                
                // 如果是header，重新绑定事件
                if (componentName === 'header') {
                    this._bindHeaderEvents();
                }
                
                // 如果是footer，更新工具数量
                if (componentName === 'footer') {
                    this._updateToolCount();
                }
                
                console.log(`组件 ${componentName} 加载成功`);
                return true;
            } else {
                throw new Error(`目标元素不存在: ${targetElementId}`);
            }
        } catch (error) {
            console.error(`加载组件 ${componentName} 失败:`, error);
            return false;
        }
    }
    
    /**
     * 处理自定义导航链接
     * @private
     */
    static _processCustomLinks(html, customLinks) {
        // 这里可以根据需要实现自定义链接替换逻辑
        // 例如，替换默认导航链接为自定义链接
        return html;
    }
    
    /**
     * 设置活动导航项
     * @private
     */
    static _setActiveNav(html, activeNav) {
        // 移除所有active类
        html = html.replace(/class="active"/g, '');
        
        // 根据activeNav设置对应的active类
        const navMap = {
            'home': '首页',
            'tools': '所有工具',
            'categories': '分类',
            'featured': '精选',
            'about': '关于'
        };
        
        if (navMap[activeNav]) {
            const navText = navMap[activeNav];
            const regex = new RegExp(`<a[^>]*>${navText}</a>`);
            html = html.replace(regex, (match) => {
                return match.replace('<a', '<a class="active"');
            });
        }
        
        return html;
    }
    
    /**
     * 绑定header事件
     * @private
     */
    static _bindHeaderEvents() {
        // 绑定登录按钮事件
        const loginBtn = document.querySelector('.btn-login');
        if (loginBtn) {
            loginBtn.addEventListener('click', function() {
                alert('登录功能即将推出！');
            });
        }
        
        // 绑定注册按钮事件
        const registerBtn = document.querySelector('.btn-register');
        if (registerBtn) {
            registerBtn.addEventListener('click', function() {
                alert('注册功能即将推出！');
            });
        }
        
        // 绑定平滑滚动
        document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    /**
     * 更新工具数量
     * @private
     */
    static _updateToolCount() {
        // 这里可以添加更新工具数量的逻辑
        // 例如，从全局变量或API获取工具数量
        const toolCountElement = document.getElementById('toolCount');
        if (toolCountElement) {
            // 默认显示0，实际项目中可以从数据源获取
            toolCountElement.textContent = '0';
        }
    }
    
    /**
     * 初始化页面组件
     * @param {Object} config - 页面配置
     */
    static async initPage(config = {}) {
        const {
            loadHeader = true,
            loadFooter = true,
            headerTarget = 'header-container',
            footerTarget = 'footer-container',
            activeNav = 'home',
            basePath = '../components/',
            loadSharedStyles = true,
            toolName = null  // 工具名称，用于显示在header的工具详情位置
        } = config;
        
        const promises = [];
        
        // 加载公共样式（如果需要）
        if (loadSharedStyles) {
            this._loadSharedStyles(basePath);
        }
        
        // 创建header容器（如果需要）
        if (loadHeader && !document.getElementById(headerTarget)) {
            const headerContainer = document.createElement('div');
            headerContainer.id = headerTarget;
            document.body.insertBefore(headerContainer, document.body.firstChild);
        }
        
        // 创建footer容器（如果需要）
        if (loadFooter && !document.getElementById(footerTarget)) {
            const footerContainer = document.createElement('div');
            footerContainer.id = footerTarget;
            document.body.appendChild(footerContainer);
        }
        
        // 加载header
        if (loadHeader) {
            promises.push(
                this.loadComponent('header', headerTarget, {
                    basePath,
                    activeNav,
                    toolName
                })
            );
        }
        
        // 加载footer
        if (loadFooter) {
            promises.push(
                this.loadComponent('footer', footerTarget, { basePath })
            );
        }
        
        // 等待所有组件加载完成
        return Promise.all(promises);
    }
    
    /**
     * 加载公共样式
     * @private
     */
    static _loadSharedStyles(basePath) {
        // 检查是否已经加载了公共样式
        const existingLink = document.querySelector('link[href*="shared-styles.css"]');
        if (existingLink) {
            return; // 已经加载过了
        }
        
        // 创建link元素
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `${basePath}shared-styles.css`;
        link.onload = () => console.log('公共样式加载完成');
        link.onerror = () => console.error('公共样式加载失败');
        
        // 添加到head
        document.head.appendChild(link);
    }
}

// 全局可用
window.ComponentLoader = ComponentLoader;
