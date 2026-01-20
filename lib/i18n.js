/**
 * 国际化模块 - 动态语言切换
 */

class I18n {
    constructor() {
        this.lang = 'zh_CN';
        this.messages = {};
        this.loaded = false;
    }

    /**
     * 初始化 - 从storage读取语言设置并加载语言包
     */
    async init() {
        // 从storage获取语言设置
        const data = await chrome.storage.sync.get('settings');
        this.lang = data.settings?.language || 'zh_CN';
        await this.loadMessages();
    }

    /**
     * 加载语言包
     */
    async loadMessages() {
        try {
            const url = chrome.runtime.getURL(`_locales/${this.lang}/messages.json`);
            const response = await fetch(url);
            this.messages = await response.json();
            this.loaded = true;
        } catch (error) {
            console.error('Failed to load language pack:', error);
            // 回退到默认语言
            if (this.lang !== 'zh_CN') {
                this.lang = 'zh_CN';
                await this.loadMessages();
            }
        }
    }

    /**
     * 获取翻译文本
     */
    get(key, placeholders = {}) {
        const message = this.messages[key]?.message || key;

        // 替换占位符
        let result = message;
        for (const [placeholder, value] of Object.entries(placeholders)) {
            result = result.replace(`$${placeholder}$`, value);
        }

        return result;
    }

    /**
     * 切换语言
     */
    async setLanguage(lang) {
        this.lang = lang;
        await this.loadMessages();

        // 保存到storage
        const data = await chrome.storage.sync.get('settings');
        const settings = data.settings || {};
        settings.language = lang;
        await chrome.storage.sync.set({ settings });

        // 翻译页面
        this.translatePage();
    }

    /**
     * 获取当前语言
     */
    getLanguage() {
        return this.lang;
    }

    /**
     * 翻译页面所有带data-i18n属性的元素
     */
    translatePage() {
        // 翻译文本内容
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = this.get(key);
        });

        // 翻译placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = this.get(key);
        });

        // 翻译title
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            el.title = this.get(key);
        });

        // 更新页面标题
        const titleKey = document.querySelector('title')?.getAttribute('data-i18n');
        if (titleKey) {
            document.title = this.get(titleKey);
        }
    }

    /**
     * 切换语言（中英文互换）
     */
    async toggleLanguage() {
        const newLang = this.lang === 'zh_CN' ? 'en' : 'zh_CN';
        await this.setLanguage(newLang);
        return newLang;
    }
}

// 创建全局实例
const i18n = new I18n();

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { I18n, i18n };
}
