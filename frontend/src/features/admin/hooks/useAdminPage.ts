export type UseAdminPage = Record<string, never>;

/**
 * Logic for the admin landing page. There is none yet — the page is a
 * `RequireRole`-gated placeholder until the admin management screens land in a
 * later epic — but the hook exists so the page follows the same logic-hook/UI
 * split as every other page and has a home for that logic when it arrives.
 */
const useAdminPage = (): UseAdminPage => {
  return {};
};

export default useAdminPage;
