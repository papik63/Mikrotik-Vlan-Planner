# VLAN Planner — MikroTik RouterOS v7

Интерактивный веб-инструмент для планирования VLAN-сетей на оборудовании MikroTik.  
Визуальное проектирование топологии с автоматической генерацией CLI-конфигурации RouterOS v7.

![RouterOS v7](https://img.shields.io/badge/RouterOS-v7-blue)
![Mikrotik](https://img.shields.io/badge/Mikrotik-40a832)
![VLAN](https://img.shields.io/badge/VLAN-1ba2f5)

---

## Возможности

- **Управление VLAN** — создание, редактирование, готовые шаблоны (управление, серверы, видеонаблюдение и др.)
- **Устройства и порты** — настройка любого количества роутеров, коммутаторов и других устройств с произвольным количеством портов
- **Настройка портов** — тип (tagged / untagged / hybrid), назначение VLAN, trunk-порты, участие bridge в VLAN
- **Генерация CLI** — готовые команды RouterOS v7 для роутеров (RoaS) и коммутаторов (Bridge VLAN Filtering)
- **Сохранение** — автоматически в `localStorage`; экспорт / импорт через JSON; экспорт в PDF
- **Сброс** — с диалогом подтверждения

### 🚀 Demo

Смотри папку [preview](./preview)

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

## Требования

- **Docker** — для запуска через `docker compose up`
- **Node.js 18+** — для локального запуска без Docker

---

## Лицензия

MIT
