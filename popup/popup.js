/**
 * Popup Script
 */

async function init() {
    // 初始化i18n
    await i18n.init();
    i18n.translatePage();

    // 加载统计数据
    const data = await Storage.getAll();
    document.getElementById('sites-count').textContent = data.sites.filter(s => s.show).length;
    document.getElementById('groups-count').textContent = data.groups.filter(g => g.show).length;

    // 打开设置按钮
    document.getElementById('open-settings').addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
        window.close();
    });
}

document.addEventListener('DOMContentLoaded', init);
