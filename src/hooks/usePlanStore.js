import { useState, useEffect, useCallback } from "react";
import { DEMO_STATE, EMPTY_STATE, DEVICE_TYPES, LIMITS, LS_KEY } from "../constants";
import { loadState, saveState, clearState, validateImport, MAX_IMPORT_SIZE } from "../utils/storage";
import { parseTrunkVlans } from "../utils/vlan";

/**
 * Central store for the VLAN planner.
 * Initial state on first visit = DEMO_STATE (full example from mikrotik.wiki).
 * Syncs across browser tabs via the storage event.
 */
export const usePlanStore = () => {
  // ── State ──────────────────────────────────────────────────────────────────
  // On first visit localStorage is empty, so we fall back to DEMO_STATE.
  const [vlans,   setVlans]   = useState(() => { const s = loadState(); return s.vlans   ?? DEMO_STATE.vlans;   });
  const [devices, setDevices] = useState(() => { const s = loadState(); return s.devices ?? DEMO_STATE.devices; });
  const [portCfg, setPortCfg] = useState(() => { const s = loadState(); return s.portCfg ?? DEMO_STATE.portCfg; });

  // ── Auto-save ──────────────────────────────────────────────────────────────
  useEffect(() => {
    saveState({ vlans, devices, portCfg });
  }, [vlans, devices, portCfg]);

  // ── Cross-tab sync ─────────────────────────────────────────────────────────
  useEffect(() => {
    const handleStorageEvent = (e) => {
      if (e.key !== LS_KEY || e.newValue === null) return;
      try {
        const next = JSON.parse(e.newValue);
        if (next.vlans)   setVlans(next.vlans);
        if (next.devices) setDevices(next.devices);
        if (next.portCfg) setPortCfg(next.portCfg);
      } catch {}
    };
    window.addEventListener("storage", handleStorageEvent);
    return () => window.removeEventListener("storage", handleStorageEvent);
  }, []);

  // ── VLAN operations ────────────────────────────────────────────────────────

  const addVlan = useCallback((newVlan) => {
    const id = parseInt(newVlan.id, 10);
    if (!id || !newVlan.name?.trim()) return "Укажи ID и название";
    if (id < LIMITS.vlanIdMin || id > LIMITS.vlanIdMax) {
      return `VLAN ID должен быть от ${LIMITS.vlanIdMin} до ${LIMITS.vlanIdMax}`;
    }
    if (vlans.find((v) => v.id === id)) return `VLAN ${id} уже существует`;
    if (vlans.length >= LIMITS.maxVlans) return `Максимум ${LIMITS.maxVlans} VLAN`;
    setVlans((prev) => [...prev, { ...newVlan, id }]);
    return null;
  }, [vlans]);

  const updateVlan = useCallback((oldId, field, val) => {
    if (field !== "id") {
      setVlans((prev) => prev.map((v) => v.id === oldId ? { ...v, [field]: val } : v));
      return null;
    }
    const newId = parseInt(val, 10);
    if (!newId) return null;
    if (newId < LIMITS.vlanIdMin || newId > LIMITS.vlanIdMax) {
      return `VLAN ID должен быть от ${LIMITS.vlanIdMin} до ${LIMITS.vlanIdMax}`;
    }
    if (newId !== oldId && vlans.find((v) => v.id === newId)) {
      return `VLAN ${newId} уже существует`;
    }
    const migratedCfg = {};
    Object.entries(portCfg).forEach(([devId, devPorts]) => {
      migratedCfg[devId] = {};
      Object.entries(devPorts).forEach(([port, cfg]) => {
        const updated = { ...cfg };
        if (parseInt(cfg.vlan, 10) === oldId) updated.vlan = String(newId);
        if (cfg.vlan === "trunk" && cfg.trunkVlans) {
          updated.trunkVlans = parseTrunkVlans(cfg.trunkVlans)
            .map((id) => (id === oldId ? newId : id))
            .join(",");
        }
        migratedCfg[devId][port] = updated;
      });
    });
    setPortCfg(migratedCfg);
    setVlans((prev) => prev.map((v) => v.id === oldId ? { ...v, id: newId } : v));
    return null;
  }, [vlans, portCfg]);

  const deleteVlan = useCallback((id) => {
    setVlans((prev) => prev.filter((v) => v.id !== id));
  }, []);

  const addVlanSuggestion = useCallback((suggestion) => {
    setVlans((prev) =>
      prev.find((v) => v.id === suggestion.id) ? prev : [...prev, suggestion]
    );
  }, []);

  // ── Device operations ──────────────────────────────────────────────────────

  const addDevice = useCallback((newDev) => {
    if (!newDev.name?.trim()) return;
    if (devices.length >= LIMITS.maxDevices) return;
    const typeInfo = DEVICE_TYPES.find((t) => t.value === newDev.type);
    setDevices((prev) => [
      ...prev,
      {
        id:    crypto.randomUUID(),
        name:  newDev.name.trim(),
        icon:  newDev.icon || typeInfo?.icon || "◆",
        type:  newDev.type,
        ports: [],
      },
    ]);
  }, [devices.length]);

  const updateDevice = useCallback((id, field, val) => {
    setDevices((prev) => prev.map((d) => d.id === id ? { ...d, [field]: val } : d));
  }, []);

  const deleteDevice = useCallback((id) => {
    setDevices((prev) => prev.filter((d) => d.id !== id));
    setPortCfg((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  // ── Port operations ────────────────────────────────────────────────────────

  const addPort = useCallback((devId, portName) => {
    const name = portName.trim();
    if (!name) return;
    setDevices((prev) => {
      const dev = prev.find((d) => d.id === devId);
      if (!dev || dev.ports.length >= LIMITS.maxPortsPerDev) return prev;
      if (dev.ports.includes(name)) return prev;
      return prev.map((d) => d.id === devId ? { ...d, ports: [...d.ports, name] } : d);
    });
  }, []);

  const deletePort = useCallback((devId, port) => {
    setDevices((prev) =>
      prev.map((d) => d.id === devId ? { ...d, ports: d.ports.filter((p) => p !== port) } : d)
    );
    setPortCfg((prev) => {
      const next = { ...prev, [devId]: { ...prev[devId] } };
      delete next[devId][port];
      return next;
    });
  }, []);

  const renamePort = useCallback((devId, oldName, newName) => {
    if (!newName || oldName === newName) return;
    setDevices((prev) => {
      const dev = prev.find((d) => d.id === devId);
      if (!dev || dev.ports.includes(newName)) return prev;
      return prev.map((d) =>
        d.id === devId
          ? { ...d, ports: d.ports.map((p) => (p === oldName ? newName : p)) }
          : d
      );
    });
    setPortCfg((prev) => {
      if (!prev[devId]?.[oldName]) return prev;
      const devPorts = { ...prev[devId], [newName]: prev[devId][oldName] };
      delete devPorts[oldName];
      return { ...prev, [devId]: devPorts };
    });
  }, []);

  const setPortConfig = useCallback((devId, port, field, val) => {
    setPortCfg((prev) => ({
      ...prev,
      [devId]: {
        ...prev[devId],
        [port]: { ...(prev[devId]?.[port] || {}), [field]: val },
      },
    }));
  }, []);

  const getPortConfig = useCallback(
    (devId, port) => portCfg[devId]?.[port] || {},
    [portCfg]
  );

  // ── File operations ────────────────────────────────────────────────────────

  const exportJSON = useCallback(() => {
    const data = JSON.stringify({ vlans, devices, portCfg }, null, 2);
    const blob  = new Blob([data], { type: "application/json" });
    const url   = URL.createObjectURL(blob);
    const a     = document.createElement("a");
    a.href      = url;
    a.download  = `vlan-plan-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [vlans, devices, portCfg]);

  const importJSON = useCallback((file) => {
    return new Promise((resolve, reject) => {
      if (file.size > MAX_IMPORT_SIZE) {
        reject(new Error(`Файл слишком большой. Максимум ${MAX_IMPORT_SIZE / 1024}KB`));
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          const { valid, error } = validateImport(data);
          if (!valid) { reject(new Error(error)); return; }
          setVlans(structuredClone(data.vlans));
          setDevices(structuredClone(data.devices));
          setPortCfg(structuredClone(data.portCfg));
          resolve();
        } catch {
          reject(new Error("Не удалось прочитать файл. Убедись, что это корректный JSON."));
        }
      };
      reader.onerror = () => reject(new Error("Ошибка чтения файла. Попробуй ещё раз."));
      reader.readAsText(file);
    });
  }, []);

  const exportPDF = useCallback(() => window.print(), []);

  /** Load demo topology from mikrotik.wiki article */
  const loadDemo = useCallback(() => {
    setVlans(structuredClone(DEMO_STATE.vlans));
    setDevices(structuredClone(DEMO_STATE.devices));
    setPortCfg(structuredClone(DEMO_STATE.portCfg));
  }, []);

  /** Clear everything — empty canvas */
  const clearAll = useCallback(() => {
    setVlans(structuredClone(EMPTY_STATE.vlans));
    setDevices(structuredClone(EMPTY_STATE.devices));
    setPortCfg(structuredClone(EMPTY_STATE.portCfg));
    clearState();
  }, []);

  return {
    vlans, devices, portCfg,
    addVlan, updateVlan, deleteVlan, addVlanSuggestion,
    addDevice, updateDevice, deleteDevice,
    addPort, deletePort, renamePort, setPortConfig, getPortConfig,
    exportJSON, importJSON, exportPDF,
    loadDemo, clearAll,
  };
};
