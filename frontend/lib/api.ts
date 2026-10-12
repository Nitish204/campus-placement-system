const BASE = "/api";

// Auth is an httpOnly session cookie set by the server on login/register.
// The browser attaches it automatically to these same-origin /api calls, so
// no token is ever read, stored or sent by JavaScript.
async function req(path: string, options: RequestInit = {}) {
  const res = await fetch(BASE + path, { ...options, credentials: "same-origin" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // A 401 anywhere except the login/register forms means the session is
    // missing or expired: send the user to sign in instead of showing a raw error.
    if (
      res.status === 401 &&
      typeof window !== "undefined" &&
      !path.startsWith("/auth/login") &&
      !path.startsWith("/auth/register") &&
      !/^\/(login|register)/.test(window.location.pathname)
    ) {
      window.location.assign("/login");
    }
    throw new Error(data.error || "Something went wrong.");
  }
  return data;
}

function postJSON(path: string, body: any) {
  return req(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export const api = {
  registerStudent: (data: Record<string, any>) => postJSON("/auth/register/student", data),
  registerCompany: (data: Record<string, any>) => postJSON("/auth/register/company", data),
  logout: () => postJSON("/auth/logout", {}),
  login: (email: string, password: string) => postJSON("/auth/login", { email, password }),
  me: () => req("/auth/me", {}),

  studentDashboard: () => req("/student/dashboard", {}),
  uploadResume: async (file: File) => {
    const fd = new FormData();
    fd.append("resume", file);
    const res = await fetch(BASE + "/student/upload_resume", { method: "POST", credentials: "same-origin", body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Upload failed.");
    return data;
  },
  applyJob: (jobId: number) => postJSON(`/student/apply/${jobId}`, {}),
  withdrawApplication: (appId: number) => postJSON(`/student/withdraw/${appId}`, {}),

  companyDashboard: () => req("/company/dashboard", {}),
  postJob: (data: Record<string, any>) => postJSON("/company/post_job", data),
  viewApplications: (jobId: number) => req(`/company/job/${jobId}/applications`, {}),
  updateApplicationStatus: (appId: number, status: string, remarks: string) =>
    postJSON(`/company/application/${appId}/update`, { status, remarks }),
  runScreening: (jobId: number) => postJSON(`/company/run_screening/${jobId}`, {}),

  notifications: () => req("/notifications", {}),
  openNotification: (id: number) => postJSON(`/notifications/${id}/open`, {}),
  markAllRead: () => postJSON("/notifications/mark_all_read", {}),

  adminDashboard: () => req("/admin/dashboard", {}),
  adminStudents: () => req("/admin/students", {}),
  adminCompanies: () => req("/admin/companies", {}),
  approveCompany: (id: number) => postJSON(`/admin/company/${id}/approve`, {}),
  rejectCompany: (id: number) => postJSON(`/admin/company/${id}/reject`, {}),
  adminJobs: () => req("/admin/jobs", {}),
  adminPlacements: () => req("/admin/placements", {}),
  deleteUser: (id: number) => postJSON(`/admin/delete_user/${id}`, {}),
};
