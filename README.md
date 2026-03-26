# VLAN Planner — MikroTik RouterOS v7

Интерактивный веб-инструмент для планирования VLAN-сетей на оборудовании MikroTik.  
Визуальное проектирование топологии с автоматической генерацией CLI-конфигурации RouterOS v7.

![RouterOS v7](https://img.shields.io/badge/RouterOS-v7-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![Vite](https://img.shields.io/badge/Vite-5-646cff)

---

## Возможности

- **Управление VLAN** — создание, редактирование, готовые шаблоны (управление, серверы, видеонаблюдение и др.)
- **Устройства и порты** — настройка любого количества роутеров, коммутаторов и других устройств с произвольным количеством портов
- **Настройка портов** — тип (tagged / untagged / hybrid), назначение VLAN, trunk-порты, участие bridge в VLAN
- **Генерация CLI** — готовые команды RouterOS v7 для роутеров (RoaS) и коммутаторов (Bridge VLAN Filtering)
- **Сохранение** — автоматически в `localStorage`; экспорт / импорт через JSON; экспорт в PDF
- **Сброс** — с диалогом подтверждения

---

## Быстрый старт

### Docker (рекомендуется)

```bash
git clone https://github.com/YOUR_USERNAME/vlan-planner.git
cd vlan-planner
docker compose up
```

Открыть в браузере: [http://localhost:5173](http://localhost:5173)

### Локально (Node.js 18+)

```bash
git clone https://github.com/YOUR_USERNAME/vlan-planner.git
cd vlan-planner
npm install
npm run dev
```

---

## Структура проекта

```
src/
├── constants/          # Константы: шрифты, данные по умолчанию, типы устройств
├── utils/
│   ├── cli.js          # Генераторы CLI-конфигурации (чистые функции)
│   ├── storage.js      # localStorage: load / save / validate
│   └── vlan.js         # Вспомогательные функции для работы с VLAN
├── hooks/
│   ├── useClickOutside.js  # Закрытие элементов по клику вне
│   └── usePlanStore.js     # Центральный стор: весь state и операции
└── components/
    ├── ui/             # Примитивы: Btn, Inp, Tag, Select, Section…
    ├── modals/         # ResetModal
    ├── header/         # Header, FileMenu
    ├── vlan/           # VlanRow, VlanForm
    ├── devices/        # DeviceCard, PortCard, DeviceForm
    ├── cli/            # CliBlock
    └── tabs/           # VlansTab, DevicesTab, SummaryTab
```

---

## Генерация CLI

Вкладка **«3. Итог и CLI»** генерирует конфигурацию RouterOS v7 для каждого устройства с типом **Роутер** или **Коммутатор**.

### Роутер (RoaS — Router on a Stick)

Генерируются секции:
1. `bridge-VLAN` с `frame-types=admit-only-vlan-tagged`
2. `/interface/bridge/port/` — порты с `frame-types` и `pvid`
3. `/interface/bridge/vlan/` — таблица VLAN с tagged/untagged портами и CPU-портом
4. `/interface/vlan/` — VLAN-субинтерфейсы
5. `/ip/address/` — IP-адреса на VLAN-интерфейсах
6. Включение `vlan-filtering=yes`

### Коммутатор (Bridge VLAN Filtering)

Генерируются секции:
1. `bridge1` с `frame-types=admit-only-vlan-tagged`
2. `/interface/bridge/port/` — порты с `frame-types` и `pvid`
3. `/interface/bridge/vlan/` — таблица VLAN
4. Управляющий VLAN-интерфейс (если включён флаг «Добавить bridge в VLAN»)
5. Включение `vlan-filtering=yes`

> **Важно:** включать `vlan-filtering=yes` нужно последним, после настройки всех устройств в сети.

---

## Формат файла экспорта (JSON)

```json
{
  "vlans": [
    { "id": 10, "name": "Управление", "subnet": "192.168.10.0/24", "gateway": "192.168.10.1", "color": "#3b82f6", "purpose": "..." }
  ],
  "devices": [
    { "id": "router", "name": "Роутер", "icon": "⬡", "type": "router", "ports": ["ether1-WAN", "sfp1"] }
  ],
  "portCfg": {
    "router": {
      "sfp1": { "vlan": "trunk", "trunkVlans": "10,20,30", "frameType": "tagged", "addBridge": false, "note": "" }
    }
  }
}
```

---

## Требования

- **Docker** — для запуска через `docker compose up`
- **Node.js 18+** — для локального запуска без Docker
- Современный браузер (Chrome, Firefox, Edge) — Safari поддерживается, но WebContainers могут работать нестабильно

---

## Лицензия

MIT
