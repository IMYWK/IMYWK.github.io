# IMYWK.github.io

個人品牌／作品集網站的**首頁設計提案**：同一份內容與資訊架構，用四種視覺語言各做一次，並附一頁可即時比較的挑選頁。

打開 `index.html` 就能看到四版的即時預覽（不是截圖），點「開啟」進入完整頁面。

## 檔案結構

```
index.html            四版比較與挑選頁（含即時 iframe 預覽）
a.html  assets/css/a.css    A · 專業清新 SaaS 版
b.html  assets/css/b.css    B · 高端暗黑奢華版
c.html  assets/css/c.css    C · 科技未來衝擊版
d.html  assets/css/d.css    D · 復古文藝質感版
```

三個共用檔案：

| 檔案 | 負責 |
| --- | --- |
| `assets/css/base.css` | reset、流體字級、容器、按鈕骨架、無障礙、動效契約。不含任何顏色 |
| `assets/css/fonts.css` | 自架字型的 `@font-face`（latin 子集，共 216 KB，無外部請求） |
| `assets/js/site.js` | 五種效果，全部「有對應 data 屬性才啟動」，所以同一支檔案服務四版 |

四版都只依賴上面三個共用檔，加上自己那一支主題 CSS。沒有框架、沒有建置流程、沒有 npm 套件。

## 四版的設計定位

| 版本 | 視覺語彙 | 版面變異 / 動效強度 / 資訊密度 | 適合 |
| --- | --- | --- | --- |
| A | 明亮底、大留白、柔和陰影、SVG 漸層遮罩 + 浮動幾何 | 6 / 4 / 3 | 求職、接案，通用度最高 |
| B | 深色大理石、香檳金流光、襯線混搭、逐字浮現、差異混合游標 | 7 / 6 / 3 | 品牌合作、高單價接案 |
| C | Canvas 粒子場、霓虹單一 accent、磁吸按鈕、1px 邊框光束 | 9 / 8 / 4 | 技術團隊、產品端、新創 |
| D | 暖奶油紙張、膠卷顆粒、非對稱拼貼、濾鏡切換 | 9 / 5 / 3 | 內容、文化、設計導向客戶 |

## 切換成正式首頁

1. 把選定的那一版改名成 `index.html`，`index.html` 這頁可刪掉或改名為 `directions.html` 留著對照。
2. 替換所有示範文案：姓名、經歷、專案名稱、成果數據、Email 與 GitHub 連結。搜尋「示範」可快速定位需要改的位置。
3. 把每張 `.cover` 裡的抽象 `.cover-art` 換成真實專案截圖。保留這兩層結構，hover 放大與 D 版的濾鏡切換都會繼續運作。
4. 四版共用檔案請一起保留：`base.css`、`fonts.css`、`site.js`。

## 幾個刻意的技術決策

- **字型自架**：拉丁字母用 Geist / Geist Mono / Cormorant Garamond / EB Garamond（皆為 variable font 的 latin 子集），中文走系統字堆疊（PingFang TC、Songti TC、Noto Sans TC）。執行期零第三方請求。
- **進場動效有保險**：內容預設可見，只有在 JS 就緒時才隱藏等待進場；`site.js` 若沒在 1.5 秒內啟動，`<head>` 的計時器會直接關掉所有隱藏狀態，JS 失效時頁面依然完整可讀。
- **粒子用原生 Canvas 2D**，不是 Three.js：視覺足夠，且不必背 600 KB 的依賴。滑鼠離開畫面或頁面切到背景時會自動暫停。
- **`prefers-reduced-motion` 全面接管**：逐字浮現、粒子、磁吸、傾斜、自訂游標都會關閉，回到靜態且完整可見。
- **自訂游標保留原生游標**：只在 `(hover: hover) and (pointer: fine)` 且未開啟降低動效時啟用，避免可用性風險。
- **作品封面目前是抽象材質**，不是假截圖，等你的真實專案圖進來再替換。
