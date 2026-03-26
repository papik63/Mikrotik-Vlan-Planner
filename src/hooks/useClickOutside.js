import { useEffect } from "react";

/**
 * Calls `handler` when a mousedown event occurs outside of `ref`.
 * Use this to close dropdowns, modals, or menus.
 *
 * @param {React.RefObject} ref
 * @param {function}        handler
 */
export const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
};
