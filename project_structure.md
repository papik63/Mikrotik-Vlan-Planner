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