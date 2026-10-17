/** Resolve admin handoffs before the regular account, with tab-scoped storage. */
export const VIEW_TOKEN_KEY = "cad_view_token";

type Store = Pick<Storage, "getItem" | "setItem">;

export function resolveAuthSession(
  location: Pick<Location, "pathname" | "hash">,
  tab: Store,
  persistent: Store,
): { token: string | null; view: boolean } {
  const landing = location.pathname === "/view-as";
  try {
    const incoming = landing ? new URLSearchParams(location.hash.slice(1)).get("t") : null;
    if (incoming) tab.setItem(VIEW_TOKEN_KEY, incoming);
    const viewToken = tab.getItem(VIEW_TOKEN_KEY);
    if (landing || viewToken) return { token: viewToken, view: true };
    return { token: persistent.getItem("cc_token"), view: false };
  } catch {
    return { token: null, view: true };
  }
}
