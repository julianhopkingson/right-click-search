/**
 * Options Page JavaScript
 * 设置页面核心逻辑
 */

// 全局变量
let sites = [];
let groups = [];
let settings = {};
let editingSiteId = null;
let editingGroupId = null;

/**
 * 初始化
 */
async function init() {
    // 初始化i18n
    await i18n.init();
    i18n.translatePage();

    // 加载数据
    await loadData();

    // 绑定事件
    bindEvents();

    // 渲染列表
    renderSites();
    renderGroups();
    renderSettings();
}

/**
 * 加载数据
 */
async function loadData() {
    const data = await Storage.getAll();
    sites = data.sites;
    groups = data.groups;
    settings = data.settings;
}

/**
 * 绑定事件
 */
function bindEvents() {
    // Tab切换
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // 添加站点
    document.getElementById('add-site-btn').addEventListener('click', () => openSiteModal());

    // 添加分组
    document.getElementById('add-group-btn').addEventListener('click', () => openGroupModal());

    // 语言切换
    document.getElementById('language-toggle').addEventListener('click', toggleLanguage);

    // 设置项
    document.getElementById('open-new-tab').addEventListener('change', (e) => {
        updateSetting('openInNewTab', e.target.checked);
    });

    document.getElementById('focus-new-tab').addEventListener('change', (e) => {
        updateSetting('focusNewTab', e.target.checked);
    });

    // 标签页位置
    document.querySelectorAll('.position-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.position-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateSetting('tabPosition', btn.dataset.position);
        });
    });

    // 导入导出
    document.getElementById('export-btn').addEventListener('click', exportSettings);
    document.getElementById('import-btn').addEventListener('click', () => {
        document.getElementById('import-file').click();
    });
    document.getElementById('import-file').addEventListener('change', importSettings);

    // 站点模态框
    document.getElementById('site-modal-close').addEventListener('click', closeSiteModal);
    document.getElementById('site-modal-cancel').addEventListener('click', closeSiteModal);
    document.getElementById('site-modal-save').addEventListener('click', saveSite);

    // 分组模态框
    document.getElementById('group-modal-close').addEventListener('click', closeGroupModal);
    document.getElementById('group-modal-cancel').addEventListener('click', closeGroupModal);
    document.getElementById('group-modal-save').addEventListener('click', saveGroup);

    // 点击模态框外部关闭
    document.getElementById('site-modal').addEventListener('click', (e) => {
        if (e.target.id === 'site-modal') closeSiteModal();
    });
    document.getElementById('group-modal').addEventListener('click', (e) => {
        if (e.target.id === 'group-modal') closeGroupModal();
    });

    // 事件委托 - Sites列表
    document.getElementById('sites-list').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (btn) {
            const action = btn.dataset.action;
            const siteId = btn.dataset.siteId;
            if (action === 'edit') openSiteModal(siteId);
            if (action === 'delete') deleteSite(siteId);
        }
    });

    document.getElementById('sites-list').addEventListener('change', (e) => {
        if (e.target.matches('[data-site-show]')) {
            const siteId = e.target.dataset.siteShow;
            toggleSiteShow(siteId, e.target.checked);
        }
    });

    // 事件委托 - Groups列表
    document.getElementById('groups-list').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (btn) {
            const action = btn.dataset.action;
            const groupId = btn.dataset.groupId;
            if (action === 'edit') openGroupModal(groupId);
            if (action === 'delete') deleteGroup(groupId);
        }
    });

    document.getElementById('groups-list').addEventListener('change', (e) => {
        if (e.target.matches('[data-group-show]')) {
            const groupId = e.target.dataset.groupShow;
            toggleGroupShow(groupId, e.target.checked);
        }
    });
}

/**
 * 切换Tab
 */
function switchTab(tabId) {
    // 更新按钮状态
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    // 更新内容显示
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.toggle('active', pane.id === `tab-${tabId}`);
    });
}

/**
 * 渲染站点列表
 */
function renderSites() {
    const tbody = document.getElementById('sites-list');
    const sortedSites = [...sites].sort((a, b) => a.order - b.order);

    if (sortedSites.length === 0) {
        tbody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">
          <p>${i18n.get('sites')} - Empty</p>
        </td>
      </tr>
    `;
        return;
    }

    tbody.innerHTML = sortedSites.map(site => `
    <tr data-id="${site.id}" draggable="true">
      <td class="drag-handle-col">
        <span class="drag-handle">⋮⋮</span>
      </td>
      <td>${escapeHtml(site.name)}</td>
      <td class="url-cell" title="${escapeHtml(site.url)}">${escapeHtml(site.url)}</td>
      <td class="checkbox-cell">
        <input type="checkbox" ${site.show ? 'checked' : ''} data-site-show="${site.id}">
      </td>
      <td class="actions-col">
        <button class="btn-icon" data-action="edit" data-site-id="${site.id}" title="Edit">✏️</button>
        <button class="btn-icon" data-action="delete" data-site-id="${site.id}" title="Delete">🗑️</button>
      </td>
    </tr>
  `).join('');

    // 绑定拖拽事件
    bindSiteDragEvents();
}

/**
 * 绑定站点拖拽事件
 */
function bindSiteDragEvents() {
    const tbody = document.getElementById('sites-list');
    let draggedRow = null;

    tbody.querySelectorAll('tr[draggable]').forEach(row => {
        row.addEventListener('dragstart', (e) => {
            draggedRow = row;
            row.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        row.addEventListener('dragend', () => {
            row.classList.remove('dragging');
            draggedRow = null;
        });

        row.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (draggedRow && draggedRow !== row) {
                const rect = row.getBoundingClientRect();
                const midpoint = rect.top + rect.height / 2;
                if (e.clientY < midpoint) {
                    row.parentNode.insertBefore(draggedRow, row);
                } else {
                    row.parentNode.insertBefore(draggedRow, row.nextSibling);
                }
            }
        });

        row.addEventListener('drop', async (e) => {
            e.preventDefault();
            await saveSiteOrder();
        });
    });
}

/**
 * 保存站点顺序
 */
async function saveSiteOrder() {
    const rows = document.querySelectorAll('#sites-list tr[data-id]');
    const newOrder = Array.from(rows).map((row, index) => ({
        id: row.dataset.id,
        order: index
    }));

    // 更新本地数据
    newOrder.forEach(({ id, order }) => {
        const site = sites.find(s => s.id === id);
        if (site) site.order = order;
    });

    // 保存到storage
    await Storage.saveSites(sites);
    showToast('Order saved', 'success');
}

/**
 * 切换站点显示状态
 */
async function toggleSiteShow(siteId, show) {
    await Storage.updateSite(siteId, { show });
    const site = sites.find(s => s.id === siteId);
    if (site) site.show = show;
}

/**
 * 打开站点模态框
 */
function openSiteModal(siteId = null) {
    editingSiteId = siteId;
    const modal = document.getElementById('site-modal');
    const title = document.getElementById('site-modal-title');
    const nameInput = document.getElementById('site-name-input');
    const urlInput = document.getElementById('site-url-input');

    if (siteId) {
        const site = sites.find(s => s.id === siteId);
        title.textContent = i18n.get('editSite');
        nameInput.value = site.name;
        urlInput.value = site.url;
    } else {
        title.textContent = i18n.get('addSite');
        nameInput.value = '';
        urlInput.value = '';
    }

    modal.classList.add('show');
    nameInput.focus();
}

/**
 * 关闭站点模态框
 */
function closeSiteModal() {
    document.getElementById('site-modal').classList.remove('show');
    editingSiteId = null;
}

/**
 * 保存站点
 */
async function saveSite() {
    const nameInput = document.getElementById('site-name-input');
    const urlInput = document.getElementById('site-url-input');

    const name = nameInput.value.trim();
    const url = urlInput.value.trim();

    // 验证
    if (!name) {
        showToast('Please enter site name', 'error');
        nameInput.focus();
        return;
    }

    if (!url || !url.includes('%s')) {
        showToast(i18n.get('urlError'), 'error');
        urlInput.focus();
        urlInput.classList.add('error');
        return;
    }

    urlInput.classList.remove('error');

    if (editingSiteId) {
        // 更新
        await Storage.updateSite(editingSiteId, { name, url });
        const site = sites.find(s => s.id === editingSiteId);
        if (site) {
            site.name = name;
            site.url = url;
        }
    } else {
        // 添加
        const newSite = await Storage.addSite({ name, url, show: true });
        sites.push(newSite);
    }

    closeSiteModal();
    renderSites();
    showToast('Saved!', 'success');
}

/**
 * 删除站点
 */
async function deleteSite(siteId) {
    if (!confirm(i18n.get('confirmDelete'))) return;

    await Storage.deleteSite(siteId);
    sites = sites.filter(s => s.id !== siteId);

    // 更新groups
    groups.forEach(g => {
        g.siteIds = g.siteIds.filter(id => id !== siteId);
    });

    renderSites();
    renderGroups();
    showToast('Deleted!', 'success');
}

/**
 * 渲染分组列表
 */
function renderGroups() {
    const tbody = document.getElementById('groups-list');
    const sortedGroups = [...groups].sort((a, b) => a.order - b.order);

    if (sortedGroups.length === 0) {
        tbody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">
          <p>${i18n.get('groups')} - Empty</p>
        </td>
      </tr>
    `;
        return;
    }

    tbody.innerHTML = sortedGroups.map(group => {
        const groupSites = group.siteIds
            .map(id => sites.find(s => s.id === id))
            .filter(Boolean);

        const tagsHtml = groupSites.map(s =>
            `<span class="tag">${escapeHtml(s.name)}</span>`
        ).join('');

        return `
      <tr data-id="${group.id}" draggable="true">
        <td class="drag-handle-col">
          <span class="drag-handle">⋮⋮</span>
        </td>
        <td>${escapeHtml(group.name)}</td>
        <td><div class="tags">${tagsHtml || '-'}</div></td>
        <td class="checkbox-cell">
          <input type="checkbox" ${group.show ? 'checked' : ''} data-group-show="${group.id}">
        </td>
        <td class="actions-col">
          <button class="btn-icon" data-action="edit" data-group-id="${group.id}" title="Edit">✏️</button>
          <button class="btn-icon" data-action="delete" data-group-id="${group.id}" title="Delete">🗑️</button>
        </td>
      </tr>
    `;
    }).join('');

    // 绑定拖拽事件
    bindGroupDragEvents();
}

/**
 * 绑定分组拖拽事件
 */
function bindGroupDragEvents() {
    const tbody = document.getElementById('groups-list');
    let draggedRow = null;

    tbody.querySelectorAll('tr[draggable]').forEach(row => {
        row.addEventListener('dragstart', (e) => {
            draggedRow = row;
            row.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        row.addEventListener('dragend', () => {
            row.classList.remove('dragging');
            draggedRow = null;
        });

        row.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (draggedRow && draggedRow !== row) {
                const rect = row.getBoundingClientRect();
                const midpoint = rect.top + rect.height / 2;
                if (e.clientY < midpoint) {
                    row.parentNode.insertBefore(draggedRow, row);
                } else {
                    row.parentNode.insertBefore(draggedRow, row.nextSibling);
                }
            }
        });

        row.addEventListener('drop', async (e) => {
            e.preventDefault();
            await saveGroupOrder();
        });
    });
}

/**
 * 保存分组顺序
 */
async function saveGroupOrder() {
    const rows = document.querySelectorAll('#groups-list tr[data-id]');
    const newOrder = Array.from(rows).map((row, index) => ({
        id: row.dataset.id,
        order: index
    }));

    newOrder.forEach(({ id, order }) => {
        const group = groups.find(g => g.id === id);
        if (group) group.order = order;
    });

    await Storage.saveGroups(groups);
    showToast('Order saved', 'success');
}

/**
 * 切换分组显示状态
 */
async function toggleGroupShow(groupId, show) {
    await Storage.updateGroup(groupId, { show });
    const group = groups.find(g => g.id === groupId);
    if (group) group.show = show;
}

/**
 * 打开分组模态框
 */
function openGroupModal(groupId = null) {
    editingGroupId = groupId;
    const modal = document.getElementById('group-modal');
    const title = document.getElementById('group-modal-title');
    const nameInput = document.getElementById('group-name-input');
    const selector = document.getElementById('sites-selector');

    // 渲染站点选择器
    selector.innerHTML = sites.map(site => `
    <label class="site-checkbox">
      <input type="checkbox" value="${site.id}">
      <span>${escapeHtml(site.name)}</span>
    </label>
  `).join('');

    if (groupId) {
        const group = groups.find(g => g.id === groupId);
        title.textContent = i18n.get('editGroup');
        nameInput.value = group.name;

        // 选中已有的站点
        group.siteIds.forEach(id => {
            const checkbox = selector.querySelector(`input[value="${id}"]`);
            if (checkbox) checkbox.checked = true;
        });
    } else {
        title.textContent = i18n.get('addGroup');
        nameInput.value = '';
    }

    modal.classList.add('show');
    nameInput.focus();
}

/**
 * 关闭分组模态框
 */
function closeGroupModal() {
    document.getElementById('group-modal').classList.remove('show');
    editingGroupId = null;
}

/**
 * 保存分组
 */
async function saveGroup() {
    const nameInput = document.getElementById('group-name-input');
    const selector = document.getElementById('sites-selector');

    const name = nameInput.value.trim();
    const siteIds = Array.from(selector.querySelectorAll('input:checked'))
        .map(input => input.value);

    if (!name) {
        showToast('Please enter group name', 'error');
        nameInput.focus();
        return;
    }

    if (siteIds.length === 0) {
        showToast('Please select at least one site', 'error');
        return;
    }

    if (editingGroupId) {
        await Storage.updateGroup(editingGroupId, { name, siteIds });
        const group = groups.find(g => g.id === editingGroupId);
        if (group) {
            group.name = name;
            group.siteIds = siteIds;
        }
    } else {
        const newGroup = await Storage.addGroup({ name, siteIds, show: true });
        groups.push(newGroup);
    }

    closeGroupModal();
    renderGroups();
    showToast('Saved!', 'success');
}

/**
 * 删除分组
 */
async function deleteGroup(groupId) {
    if (!confirm(i18n.get('confirmDelete'))) return;

    await Storage.deleteGroup(groupId);
    groups = groups.filter(g => g.id !== groupId);

    renderGroups();
    showToast('Deleted!', 'success');
}

/**
 * 渲染设置
 */
function renderSettings() {
    // 语言按钮
    updateLanguageButton();

    // 开关
    document.getElementById('open-new-tab').checked = settings.openInNewTab;
    document.getElementById('focus-new-tab').checked = settings.focusNewTab;

    // 位置按钮
    document.querySelectorAll('.position-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.position === settings.tabPosition);
    });
}

/**
 * 更新语言按钮显示
 */
function updateLanguageButton() {
    const langText = document.getElementById('language-text');
    langText.textContent = settings.language === 'zh_CN' ? '中文 ↔ EN' : 'EN ↔ 中文';
}

/**
 * 切换语言
 */
async function toggleLanguage() {
    const newLang = await i18n.toggleLanguage();
    settings.language = newLang;
    updateLanguageButton();
    showToast(newLang === 'zh_CN' ? '已切换为中文' : 'Switched to English', 'success');
}

/**
 * 更新设置
 */
async function updateSetting(key, value) {
    settings[key] = value;
    await Storage.updateSettings({ [key]: value });
}

/**
 * 导出设置
 */
async function exportSettings() {
    const json = await Storage.exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `right-click-search-settings-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
    showToast(i18n.get('export') + ' ✓', 'success');
}

/**
 * 导入设置
 */
async function importSettings(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        const success = await Storage.importData(event.target.result);
        if (success) {
            await loadData();
            renderSites();
            renderGroups();
            renderSettings();
            i18n.translatePage();
            showToast(i18n.get('importSuccess'), 'success');
        } else {
            showToast(i18n.get('importError'), 'error');
        }
    };
    reader.readAsText(file);

    // 清空input以便再次选择同一文件
    e.target.value = '';
}

/**
 * 显示Toast消息
 */
function showToast(message, type = '') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast show' + (type ? ` ${type}` : '');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

/**
 * HTML转义
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', init);
