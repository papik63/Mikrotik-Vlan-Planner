import { useState, useCallback } from "react";
import { usePlanStore } from "./hooks/usePlanStore";
import { Header } from "./components/header/Header";
import { ResetModal } from "./components/modals/ResetModal";
import { VlansTab } from "./components/tabs/VlansTab";
import { DevicesTab } from "./components/tabs/DevicesTab";
import { SummaryTab } from "./components/tabs/SummaryTab";
import { UI_FONT } from "./constants";

export default function App() {
  const [tab,          setTab]          = useState("vlans");
  // modal: null | "demo" | "clear"
  const [modal,        setModal]        = useState(null);
  const [importError,  setImportError]  = useState("");

  const store = usePlanStore();

  const handleImportJSON = useCallback(async (file) => {
    try {
      await store.importJSON(file);
      setImportError("");
    } catch (err) {
      setImportError(err.message);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleModalConfirm = useCallback(() => {
    if (modal === "demo")  store.loadDemo();
    if (modal === "clear") store.clearAll();
    setModal(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal]);

  return (
    <div style={{ minHeight: "100vh", background: "#0d1117", color: "#e6edf3", fontFamily: UI_FONT }}>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; color: #000 !important; }
          pre  { white-space: pre-wrap; }
        }
      `}</style>

      {modal && (
        <ResetModal
          mode={modal}
          onConfirm={handleModalConfirm}
          onCancel={() => setModal(null)}
        />
      )}

      <Header
        tab={tab}
        onTabChange={setTab}
        onExportJSON={store.exportJSON}
        onImportJSON={handleImportJSON}
        onExportPDF={store.exportPDF}
        onDemoRequest={() => setModal("demo")}
        onClearRequest={() => setModal("clear")}
        importError={importError}
        onClearImportError={() => setImportError("")}
      />

      <main style={{ padding: "20px 24px", maxWidth: 1020, margin: "0 auto" }}>
        {tab === "vlans" && (
          <VlansTab
            vlans={store.vlans}
            onAdd={store.addVlan}
            onUpdate={store.updateVlan}
            onDelete={store.deleteVlan}
            onAddSuggestion={store.addVlanSuggestion}
          />
        )}
        {tab === "ports" && (
          <DevicesTab
            devices={store.devices}
            vlans={store.vlans}
            store={store}
          />
        )}
        {tab === "summary" && (
          <SummaryTab
            vlans={store.vlans}
            devices={store.devices}
            portCfg={store.portCfg}
            getPortConfig={store.getPortConfig}
          />
        )}
      </main>
    </div>
  );
}
