/**
 * Background Service Worker
 * 处理右键菜单和标签页创建
 */

// 默认数据缓存
let DEFAULT_DATA = null;

/**
 * 加载默认数据
 */
async function loadDefaultData() {
    if (DEFAULT_DATA) return DEFAULT_DATA;

    try {
        const response = await fetch(chrome.runtime.getURL('data/defaults.json'));
        DEFAULT_DATA = await response.json();
    } catch (error) {
        console.error('Failed to load defaults.json:', error);
        DEFAULT_DATA = {
            sites: [],
            groups: [],
            settings: {
                language: 'en',
                openInNewTab: true,
                focusNewTab: false,
                tabPosition: 'NEXT'
            }
        };
    }
    return DEFAULT_DATA;
}

/**
 * 获取存储数据
 */
async function getStorageData() {
    const defaults = await loadDefaultData();
    const data = await chrome.storage.sync.get(['sites', 'groups', 'settings']);
    return {
        sites: data.sites && data.sites.length > 0 ? data.sites : defaults.sites,
        groups: data.groups && data.groups.length > 0 ? data.groups : defaults.groups,
        settings: data.settings ? { ...defaults.settings, ...data.settings } : defaults.settings
    };
}

/**
 * 获取右键菜单标题（根据语言设置）
 */
async function getContextMenuTitle() {
    const { settings } = await getStorageData();
    return settings.language === 'zh_CN' ? '右键搜索' : 'Right Click Search';
}

/**
 * 创建右键菜单
 */
async function createContextMenus() {
    // 先移除所有菜单
    await chrome.contextMenus.removeAll();

    const { sites, groups, settings } = await getStorageData();
    const menuTitle = await getContextMenuTitle();

    // 创建父菜单
    chrome.contextMenus.create({
        id: 'right-click-search',
        title: menuTitle,
        contexts: ['selection']
    });

    // 按order排序
    const sortedGroups = groups.filter(g => g.show).sort((a, b) => a.order - b.order);
    const sortedSites = sites.filter(s => s.show).sort((a, b) => a.order - b.order);

    // 先创建Groups
    sortedGroups.forEach(group => {
        chrome.contextMenus.create({
            id: `group-${group.id}`,
            parentId: 'right-click-search',
            title: `📁 ${group.name}`,
            contexts: ['selection']
        });
    });

    // 如果有Groups和Sites，添加分隔符
    if (sortedGroups.length > 0 && sortedSites.length > 0) {
        chrome.contextMenus.create({
            id: 'separator',
            parentId: 'right-click-search',
            type: 'separator',
            contexts: ['selection']
        });
    }

    // 再创建Sites
    sortedSites.forEach(site => {
        chrome.contextMenus.create({
            id: `site-${site.id}`,
            parentId: 'right-click-search',
            title: `🔍 ${site.name}`,
            contexts: ['selection']
        });
    });
}

/**
 * 获取新标签页的位置索引
 */
async function getNewTabIndex(position, currentTab) {
    switch (position) {
        case 'LAST': {
            const tabs = await chrome.tabs.query({ currentWindow: true });
            return tabs.length;
        }
        case 'FIRST':
            return 0;
        case 'NEXT':
            return currentTab.index + 1;
        case 'PREVIOUS':
            return Math.max(0, currentTab.index);
        default:
            return currentTab.index + 1;
    }
}

/**
 * 打开搜索页面
 */
async function openSearchTab(url, searchText, settings, currentTab, indexOffset = 0) {
    const searchUrl = url.replace('%s', encodeURIComponent(searchText));
    const baseIndex = await getNewTabIndex(settings.tabPosition, currentTab);

    await chrome.tabs.create({
        url: searchUrl,
        active: settings.focusNewTab && indexOffset === 0, // 只有第一个标签页可能获得焦点
        index: baseIndex + indexOffset
    });
}

/**
 * 处理菜单点击事件
 */
async function handleMenuClick(info, tab) {
    const { menuItemId, selectionText } = info;

    if (!selectionText) return;

    const { sites, groups, settings } = await getStorageData();

    // 判断是Site还是Group
    if (menuItemId.startsWith('site-')) {
        const siteId = menuItemId.replace('site-', '');
        const site = sites.find(s => s.id === siteId);
        if (site) {
            await openSearchTab(site.url, selectionText, settings, tab);
        }
    } else if (menuItemId.startsWith('group-')) {
        const groupId = menuItemId.replace('group-', '');
        const group = groups.find(g => g.id === groupId);
        if (group) {
            // 按顺序打开Group中的所有Sites
            for (let i = 0; i < group.siteIds.length; i++) {
                const site = sites.find(s => s.id === group.siteIds[i]);
                if (site) {
                    await openSearchTab(site.url, selectionText, settings, tab, i);
                }
            }
        }
    }
}

// 监听安装和启动事件
chrome.runtime.onInstalled.addListener(async () => {
    console.log('Right Click Search installed');
    await createContextMenus();
});

chrome.runtime.onStartup.addListener(async () => {
    console.log('Right Click Search started');
    await createContextMenus();
});

// 监听菜单点击
chrome.contextMenus.onClicked.addListener(handleMenuClick);

// 监听storage变化，更新菜单
chrome.storage.onChanged.addListener(async (changes, areaName) => {
    if (areaName === 'sync') {
        if (changes.sites || changes.groups || changes.settings) {
            await createContextMenus();
        }
    }
});
