/**
 * Chrome Storage 封装模块
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
    // 硬编码的fallback
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
 * Storage类 - 封装Chrome Storage API
 */
class Storage {
  /**
   * 获取默认数据
   */
  static async getDefaults() {
    return await loadDefaultData();
  }

  /**
   * 获取所有数据
   */
  static async getAll() {
    const defaults = await loadDefaultData();
    const data = await chrome.storage.sync.get(['sites', 'groups', 'settings']);

    // 如果storage为空，使用默认数据
    return {
      sites: data.sites && data.sites.length > 0 ? data.sites : defaults.sites,
      groups: data.groups && data.groups.length > 0 ? data.groups : defaults.groups,
      settings: data.settings ? { ...defaults.settings, ...data.settings } : defaults.settings
    };
  }

  /**
   * 获取所有站点
   */
  static async getSites() {
    const defaults = await loadDefaultData();
    const data = await chrome.storage.sync.get('sites');
    return data.sites && data.sites.length > 0 ? data.sites : defaults.sites;
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
    const defaults = await loadDefaultData();
    const data = await chrome.storage.sync.get('groups');
    return data.groups && data.groups.length > 0 ? data.groups : defaults.groups;
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
    const defaults = await loadDefaultData();
    const data = await chrome.storage.sync.get('settings');
    return { ...defaults.settings, ...data.settings };
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
    const defaults = await loadDefaultData();
    await chrome.storage.sync.set({
      sites: defaults.sites,
      groups: defaults.groups,
      settings: defaults.settings
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
  module.exports = { Storage, loadDefaultData };
}
