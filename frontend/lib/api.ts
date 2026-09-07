const BASE = "/api";

function authHeaders(token?: string): HeadersInit {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function req(path: string, options: RequestInit = {}, token?: string) {
  const res = await fetch(BASE + path, {
    ...options,
    headers: { ...(options.headers || {}), ...authHeaders(token) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}

function postJSON(path: string, body: any, token?: string) {
  return req(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }, token);
}

export const api = {
  registerStudent: (data: Record<string, any>) => postJSON("/auth/register/student", data),
  registerCompany: (data: Record<string, any>) => postJSON("/auth/register/company", data),
  login: (email: string, password: string) => postJSON("/auth/login", { email, password }),
  me: (token: string) => req("/auth/me", {}, token),

  studentDashboard: (token: string) => req("/student/dashboard", {}, token),
  uploadResume: async (file: File, token: string) => {
    const fd = new FormData();
    fd.append("resume", file);
    const res = await fetch(BASE + "/student/upload_resume", { method: "POST", headers: authHeaders(token), body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Upload failed.");
    return data;
  },
  applyJob: (jobId: number, token: string) => postJSON(`/student/apply/${jobId}`, {}, token),
  withdrawApplication: (appId: number, token: string) => postJSON(`/student/withdraw/${appId}`, {}, token),

  companyDashboard: (token: string) => req("/company/dashboard", {}, token),
  postJob: (data: Record<string, any>, token: string) => postJSON("/company/post_job", data, token),
  viewApplications: (jobId: number, token: string) => req(`/company/job/${jobId}/applications`, {}, token),
  updateApplicationStatus: (appId: number, status: string, remarks: string, token: string) =>
    postJSON(`/company/application/${appId}/update`, { status, remarks }, token),
  runScreening: (jobId: number, token: string) => postJSON(`/company/run_screening/${jobId}`, {}, token),

  notifications: (token: string) => req("/notifications", {}, token),
  openNotification: (id: number, token: string) => postJSON(`/notifications/${id}/open`, {}, token),
  markAllRead: (token: string) => postJSON("/notifications/mark_all_read", {}, token),

  adminDashboard: (token: string) => req("/admin/dashboard", {}, token),
  adminStudents: (token: string) => req("/admin/students", {}, token),
  adminCompanies: (token: string) => req("/admin/companies", {}, token),
  approveCompany: (id: number, token: string) => postJSON(`/admin/company/${id}/approve`, {}, token),
  rejectCompany: (id: number, token: string) => postJSON(`/admin/company/${id}/reject`, {}, token),
  adminJobs: (token: string) => req("/admin/jobs", {}, token),
  adminPlacements: (token: string) => req("/admin/placements", {}, token),
  deleteUser: (id: number, token: string) => postJSON(`/admin/delete_user/${id}`, {}, token),
};
