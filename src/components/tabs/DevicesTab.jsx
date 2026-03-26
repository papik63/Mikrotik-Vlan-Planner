import { useState } from "react";
import { DeviceCard } from "../devices/DeviceCard";
import { DeviceForm } from "../devices/DeviceForm";
import { COLORS } from "../../constants";

export const DevicesTab = ({ devices, vlans, store }) => {
  const [showForm, setShowForm] = useState(false);

  const handleAdd = (form) => {
    store.addDevice(form);
    setShowForm(false);
  };

  return (
    <div>
      <p style={{ color: COLORS.textSecondary, fontSize: 12, marginTop: 0 }}>
        Настрой порты каждого устройства. Имя порта редактируется прямо в поле.
      </p>

      {vlans.length === 0 && (
        <div
          role="alert"
          style={{
            color:        COLORS.red,
            fontSize:     11,
            padding:      9,
            background:   COLORS.redBg,
            border:       `1px solid ${COLORS.red}30`,
            borderRadius: 7,
            marginBottom: 12,
          }}
        >
          ⚠ Сначала добавь VLAN-ы на первом шаге
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
        {devices.map((device) => (
          <DeviceCard
            key={device.id}
            device={device}
            vlans={vlans}
            getPortConfig={store.getPortConfig}
            store={store}
          />
        ))}
      </div>

      {showForm ? (
        <DeviceForm onAdd={handleAdd} onCancel={() => setShowForm(false)} />
      ) : (
        <button
          onClick={() => setShowForm(true)}
          style={{
            background:   "none",
            border:       `1px dashed ${COLORS.borderSubtle}`,
            borderRadius: 8,
            padding:      "8px 18px",
            color:        COLORS.blue,
            cursor:       "pointer",
            fontSize:     12,
            width:        "100%",
          }}
        >
          + Добавить устройство
        </button>
      )}
    </div>
  );
};
