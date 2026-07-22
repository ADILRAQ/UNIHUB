/**
 * Admin-only placeholder. Its only job this story is to demonstrate the
 * `RequireRole` guard: a STUDENT or TEACHER who navigates to `/admin` is
 * redirected to their own home. Real admin management screens (user list, CSV
 * import, class groups) land in later epics on top of the Epic 2 backend.
 */
const AdminPage = () => {
  return (
    <section>
      <h1>Admin area</h1>
      <p>This section is restricted to administrators.</p>
    </section>
  );
};

export default AdminPage;
