/**
 * Chrome Storage 封装模块
 */

// 默认站点数据
const DEFAULT_SITES = [
  {
    id: 'default-google',
    name: 'Google',
    url: 'https://www.google.com/search?q=%s',
    show: true,
    order: 0,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'default-baidu',
    name: '百度',
    url: 'https://www.baidu.com/s?wd=%s',
    show: true,
    order: 1,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'default-youtube',
    name: 'Youtube',
    url: 'https://www.youtube.com/results?search_query=%s',
    show: true,
    order: 2,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'default-bilibili',
    name: 'B站',
    url: 'https://search.bilibili.com/all?keyword=%s',
    show: true,
    order: 3,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'default-wikipedia',
    name: 'Wikipedia',
    url: 'https://en.wikipedia.org/w/index.php?title=Special:Search&search=%s',
    show: true,
    order: 4,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'default-douban-book',
    name: '豆瓣读书',
    url: 'https://search.douban.com/book/subject_search?search_text=%s&cat=1001',
    show: false,
    order: 5,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'default-douban-movie',
    name: '豆瓣电影',
    url: 'https://movie.douban.com/subject_search?search_text=%s&cat=1002',
    show: false,
    order: 6,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'default-chatgpt',
    name: 'ChatGPT',
    url: 'https://chat.openai.com/?q=%s',
    show: true,
    order: 7,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'default-maosou',
    name: '猫搜',
    url: 'https://www.alipansou.com/search?k=%s',
    show: true,
    order: 8,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'default-yiso',
    name: '易搜',
    url: 'https://yiso.fun/info?searchKey=%s',
    show: true,
    order: 9,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'default-zlib',
    name: 'zlib',
    url: 'https://z-library.sk/s/%s?order=bestmatch',
    show: true,
    order: 10,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

// 默认分组数据
const DEFAULT_GROUPS = [
  {
    id: 'default-video',
    name: 'Video',
    siteIds: ['default-youtube', 'default-bilibili'],
    show: true,
    order: 0,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'default-search',
    name: '搜索引擎',
    siteIds: ['default-google', 'default-baidu'],
    show: true,
    order: 1,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

// 默认设置
const DEFAULT_SETTINGS = {
  language: 'zh_CN',
  openInNewTab: true,
  focusNewTab: false,
  tabPosition: 'NEXT'
};

/**
 * Storage类 - 封装Chrome Storage API
 */
class Storage {
  /**
   * 获取所有数据
   */
  static async getAll() {
    const data = await chrome.storage.sync.get(['sites', 'groups', 'settings']);
    return {
      sites: data.sites || DEFAULT_SITES,
      groups: data.groups || DEFAULT_GROUPS,
      settings: data.settings || DEFAULT_SETTINGS
    };
  }

  /**
   * 获取所有站点
   */
  static async getSites() {
    const data = await chrome.storage.sync.get('sites');
    return data.sites || DEFAULT_SITES;
  }

  /**
   * 保存所有站点
   */
  static async saveSites(sites) {
    await chrome.storage.sync.set({ sites });
  }

  /**
   * 添加站点
   */
  static async addSite(site) {
    const sites = await this.getSites();
    site.id = site.id || this.generateId();
    site.order = sites.length;
    site.createdAt = Date.now();
    site.updatedAt = Date.now();
    sites.push(site);
    await this.saveSites(sites);
    return site;
  }

  /**
   * 更新站点
   */
  static async updateSite(id, updates) {
    const sites = await this.getSites();
    const index = sites.findIndex(s => s.id === id);
    if (index !== -1) {
      sites[index] = { ...sites[index], ...updates, updatedAt: Date.now() };
      await this.saveSites(sites);
      return sites[index];
    }
    return null;
  }

  /**
   * 删除站点
   */
  static async deleteSite(id) {
    let sites = await this.getSites();
    sites = sites.filter(s => s.id !== id);
    // 重新排序
    sites.forEach((s, i) => s.order = i);
    await this.saveSites(sites);

    // 同时从所有分组中移除该站点
    let groups = await this.getGroups();
    groups = groups.map(g => ({
      ...g,
      siteIds: g.siteIds.filter(sid => sid !== id)
    }));
    await this.saveGroups(groups);
  }

  /**
   * 获取所有分组
   */
  static async getGroups() {
    const data = await chrome.storage.sync.get('groups');
    return data.groups || DEFAULT_GROUPS;
  }

  /**
   * 保存所有分组
   */
  static async saveGroups(groups) {
    await chrome.storage.sync.set({ groups });
  }

  /**
   * 添加分组
   */
  static async addGroup(group) {
    const groups = await this.getGroups();
    group.id = group.id || this.generateId();
    group.order = groups.length;
    group.createdAt = Date.now();
    group.updatedAt = Date.now();
    groups.push(group);
    await this.saveGroups(groups);
    return group;
  }

  /**
   * 更新分组
   */
  static async updateGroup(id, updates) {
    const groups = await this.getGroups();
    const index = groups.findIndex(g => g.id === id);
    if (index !== -1) {
      groups[index] = { ...groups[index], ...updates, updatedAt: Date.now() };
      await this.saveGroups(groups);
      return groups[index];
    }
    return null;
  }

  /**
   * 删除分组
   */
  static async deleteGroup(id) {
    let groups = await this.getGroups();
    groups = groups.filter(g => g.id !== id);
    // 重新排序
    groups.forEach((g, i) => g.order = i);
    await this.saveGroups(groups);
  }

  /**
   * 获取设置
   */
  static async getSettings() {
    const data = await chrome.storage.sync.get('settings');
    return { ...DEFAULT_SETTINGS, ...data.settings };
  }

  /**
   * 保存设置
   */
  static async saveSettings(settings) {
    await chrome.storage.sync.set({ settings });
  }

  /**
   * 更新设置
   */
  static async updateSettings(updates) {
    const settings = await this.getSettings();
    const newSettings = { ...settings, ...updates };
    await this.saveSettings(newSettings);
    return newSettings;
  }

  /**
   * 导出所有数据
   */
  static async exportData() {
    const data = await this.getAll();
    return JSON.stringify(data, null, 2);
  }

  /**
   * 导入数据
   */
  static async importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);

      // 验证数据结构
      if (!this.validateImportData(data)) {
        throw new Error('Invalid data structure');
      }

      await chrome.storage.sync.set({
        sites: data.sites,
        groups: data.groups,
        settings: data.settings
      });

      return true;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  }

  /**
   * 验证导入数据结构
   */
  static validateImportData(data) {
    if (!data || typeof data !== 'object') return false;

    // 验证sites
    if (data.sites && !Array.isArray(data.sites)) return false;
    if (data.sites) {
      for (const site of data.sites) {
        if (!site.id || !site.name || !site.url) return false;
        if (!site.url.includes('%s')) return false;
      }
    }

    // 验证groups
    if (data.groups && !Array.isArray(data.groups)) return false;
    if (data.groups) {
      for (const group of data.groups) {
        if (!group.id || !group.name || !Array.isArray(group.siteIds)) return false;
      }
    }

    // 验证settings
    if (data.settings && typeof data.settings !== 'object') return false;

    return true;
  }

  /**
   * 重置为默认数据
   */
  static async resetToDefault() {
    await chrome.storage.sync.set({
      sites: DEFAULT_SITES,
      groups: DEFAULT_GROUPS,
      settings: DEFAULT_SETTINGS
    });
  }

  /**
   * 生成唯一ID
   */
  static generateId() {
    return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Storage, DEFAULT_SITES, DEFAULT_GROUPS, DEFAULT_SETTINGS };
}
