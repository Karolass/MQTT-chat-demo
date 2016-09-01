# MQTT chat demo

根據MQTT協定做的聊天demo

## Features

### avaliable
    1. 一對一聊天 (支援離線訊息)
    2. 用戶上下線顯示
    3. Server不儲存聊天訊息 實現用Client端瀏覽器儲存

### not yet
    1. filter by name
    2. 未讀訊息數 (badge)
    3. 用戶正在打字中

## How to use it on your own website

1. 隨便找一個MQTT broker來run 但要有支援websocket. 或用我project的server去run.
2. 把我的網頁copy去用 (PS: 記得改websocket url)

## How to build

```bash
# 安裝套件
cd client
# or
cd server

npm install
npm install -g gulp-cli

# 輸出檔案 to dist/
gulp

# 開發用
gulp watch

# server run
cd dist
node index.js
```

## Structure of Source Code

### client
```
client
├── dist - 專案輸出資料夾. 非輸出的檔案(EX: bootstrap...等等)請勿刪除.
├── src - 專案開發資料夾.
│   ├── ejs - HTML template.
│   │   ├── components - components of index.ejs
│   │   └── index.ejs
│   ├── js
│   │   └── index.js - 與MQTT server連線核心程式碼
│   └── scss - scss for HTML
├── .babelrc - babel設定檔.
├── .eslintrc - eslint設定檔.
└── gulpfile.babel.js - gulp設定檔.
```

### server
```
server
├── dist - 專案輸出資料夾.
├── src - 專案開發資料夾.
│   ├── config
│   │   └── broker.js - mosca broker config
│   └── index.js - server run & all of event examples
├── .babelrc - babel設定檔.
├── .eslintrc - eslint設定檔.
└── gulpfile.babel.js - gulp設定檔.
```

