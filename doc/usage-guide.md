# 右键搜索 Chrome 插件 - 使用与发布指南

---

## 1. 本地开发预览

### 1.1 加载未打包的扩展程序

1. 打开 Chrome 浏览器
2. 地址栏输入 `chrome://extensions/` 回车
3. 右上角开启 **开发者模式**
4. 点击 **加载已解压的扩展程序**
5. 选择项目根目录 `right-click-search`



### 1.2 预览 Settings 画面

加载后有两种方式打开设置页面：

**方式一：右键图标**
- 点击工具栏扩展图标 → 右键 → **选项**

**方式二：扩展管理页**
- `chrome://extensions/` → 找到"右键搜索" → 点击 **详情** → **扩展程序选项**

**方式三：直接访问**
```
chrome-extension://<extension-id>/options/options.html
```
> `<extension-id>` 在扩展管理页可以看到

### 1.3 预览右键菜单效果

1. 打开任意网页（如 https://www.google.com）
2. 选中页面上的任意文字
3. 右键点击
4. 菜单中出现 **右键搜索** 子菜单

### 1.4 实时调试

| 调试内容 | 方法 |
|----------|------|
| Settings页面 | 在页面上 F12 打开DevTools |
| Background | `chrome://extensions/` → 点击 **Service Worker** 链接 |
| 右键菜单逻辑 | 查看Background的Console输出 |

### 1.5 热更新

修改代码后：
- **HTML/CSS/JS修改**：刷新扩展即可（扩展页点击🔄按钮）
- **manifest.json修改**：必须重新加载扩展

---

## 2. 个人使用（不发布）

### 2.1 持久化使用

按照 1.1 加载后，扩展会一直存在，直到：
- 手动移除
- 删除源文件夹
- 禁用开发者模式

### 2.2 同步到其他设备

由于使用 `chrome.storage.sync`，配置会自动同步到登录同一Google账号的其他Chrome浏览器。

### 2.3 打包为 .crx 文件（可选）

1. `chrome://extensions/` → **打包扩展程序**
2. 选择扩展根目录
3. 生成 `.crx` 文件和 `.pem` 私钥文件

> ⚠️ 从Chrome 75开始，非Web Store的 .crx 文件无法直接安装，只能通过开发者模式加载

---

## 3. 发布到 Chrome Web Store

### 3.1 前置条件

| 条件 | 说明 |
|------|------|
| Google账号 | 需要一个Google账号 |
| 开发者账号 | 一次性支付 **$5 USD** 注册费 |
| 付款方式 | 信用卡/借记卡（支持Visa/MasterCard等） |

> [!NOTE]
> **Chrome Web Store 与 Google Play 开发者账号对比**
>
> 这是**两个完全独立的账号系统**，虽然都用Google账号登录：
>
> | 对比项 | Chrome Web Store | Google Play Store |
> |--------|------------------|-------------------|
> | **用途** | 发布Chrome扩展程序 | 发布Android应用 |
> | **注册费** | $5 USD（一次性） | $25 USD（一次性） |
> | **注册入口** | [chrome.google.com/webstore/devconsole](https://chrome.google.com/webstore/devconsole) | [play.google.com/console](https://play.google.com/console) |
> | **审核周期** | 1-3个工作日 | 几小时到数天不等 |
>
> 如果你已有Google Play开发者账号，仍需另外支付$5注册Chrome Web Store开发者账号。

### 3.2 注册开发者账号

1. 访问 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. 登录Google账号
3. 同意开发者协议
4. 支付 $5 注册费
5. 完成开发者资料（姓名、邮箱等）

### 3.3 准备发布资源

#### 必需文件

| 资源 | 规格 | 说明 |
|------|------|------|
| 扩展ZIP包 | - | 包含所有源文件，不含 `.git` 等 |
| 图标 | 128x128 PNG | manifest中的icon |
| 商店图标 | 128x128 PNG | 商店展示用 |
| 宣传图（小） | 440x280 PNG/JPG | 商店展示用（可选但推荐） |
| 宣传图（大） | 1400x560 PNG/JPG | 精选展示用（可选） |
| 截图 | 1280x800 或 640x400 | 至少1张，最多5张 |

#### 创建ZIP包

```powershell
# 在项目根目录执行
Compress-Archive -Path * -DestinationPath ../right-click-search.zip -Force
```

或手动选中所有文件压缩，**不要**包含：
- `.git/`
- `doc/`（可选移除）
- 任何测试文件

### 3.4 上传与配置

1. 进入 [Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. 点击 **新建项目** → **上传ZIP文件**
3. 填写商店列表信息：

| 字段 | 示例内容 |
|------|----------|
| 名称 | 右键搜索 / Right Click Search |
| 简短说明 | 选中文字快速搜索多个网站 |
| 详细说明 | 详细功能介绍... |
| 类别 | 生产力工具 / Productivity |
| 语言 | 中文(简体)、English |

4. 上传截图和宣传图
5. 设置隐私政策（如有）
6. 选择分发区域

### 3.5 提交审核

1. 检查所有必填项
2. 点击 **提交审核**
3. 等待Google审核（通常1-3个工作日）

### 3.6 审核常见问题

| 问题 | 解决方案 |
|------|----------|
| 权限过多 | 只申请必要权限，manifest中移除未使用的 |
| 缺少隐私政策 | 如果存储用户数据，需提供隐私政策页面 |
| 描述不清 | 详细说明扩展功能和使用场景 |
| 截图不合规 | 使用真实截图，不要有误导内容 |
| 品牌侵权 | 不要在名称/图标中使用受保护商标 |

### 3.7 发布后更新

1. Dashboard → 选择扩展 → **Package** → **Upload new package**
2. 上传新版ZIP（记得更新 `manifest.json` 中的 `version`）
3. 提交审核

---

## 4. 快速参考

### 常用链接

| 链接 | 用途 |
|------|------|
| `chrome://extensions/` | 本地扩展管理 |
| [Developer Dashboard](https://chrome.google.com/webstore/devconsole) | 发布管理 |
| [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/) | 官方文档 |
| [Manifest V3 参考](https://developer.chrome.com/docs/extensions/reference/manifest) | API参考 |

### 开发调试快捷键

| 快捷键 | 功能 |
|--------|------|
| F12 | 打开DevTools |
| Ctrl+Shift+I | 打开DevTools |
| Ctrl+R | 刷新页面 |

---

*指南结束*
