export const PROTECTED_ROUTES = [
  // Admin Routes
  {
    path: "/api/admins",
    method: "GET",
    roles: ["admin"],
  },
  {
    path: "/api/admins",
    method: "POST",
    roles: ["admin"],
  },
  {
    path: "/api/admins",
    method: "DELETE",
    roles: ["admin"],
  },
  {
    path: "/api/creators",
    method: "POST",
    roles: ["admin"],
  },
  {
    path: "/api/creators",
    method: "DELETE",
    roles: ["admin"],
  },
  {
    path: "/api/contracts",
    method: "POST",
    roles: ["admin"],
  },
  {
    path: "/api/contracts/:contractAddress",
    method: "DELETE",
    roles: ["admin"],
  },
  {
    path: "/api/settings",
    method: "PATCH",
    roles: ["admin"],
  },
  {
    path: "/api/settings",
    method: "PUT",
    roles: ["admin"],
  },
  {
    path: "/api/settings/stems-carousel",
    method: "POST",
    roles: ["admin"],
  },
  {
    path: "/api/settings/stems-carousel",
    method: "PUT",
    roles: ["admin"],
  },
  {
    path: "/api/settings/stems-carousel/:versionID",
    method: "DELETE",
    roles: ["admin"],
  },
  {
    path: "/api/tags",
    method: "POST",
    roles: ["admin"],
  },
  {
    path: "/api/tags",
    method: "PATCH",
    roles: ["admin"],
  },
  {
    path: "/api/tags",
    method: "DELETE",
    roles: ["admin"],
  },
  {
    path: "/api/tags/categories",
    method: "POST",
    roles: ["admin"],
  },
  {
    path: "/api/tags/categories",
    method: "DELETE",
    roles: ["admin"],
  },
  {
    path: "/api/address",
    method: "GET",
    roles: ["admin"],
  },
  {
    path: "/api/address",
    method: "PATCH",
    roles: ["admin"],
  },
  {
    path: "/api/address/:address",
    method: "PATCH",
    roles: ["admin"],
  },

  // Creator & Admin Routes
  {
    path: "/api/applications",
    method: "GET",
    roles: ["creator", "admin"],
  },
  {
    path: "/api/applications/:applicationId",
    method: "GET",
    roles: ["creator", "admin"],
  },
  {
    path: "/api/sessions",
    method: "POST",
    roles: ["creator", "admin"],
  },

  // Member, Creator & Admin Routes
  {
    path: "/api/sessions",
    method: "GET",
    roles: ["member", "creator", "admin"],
  },
  {
    path: "/api/sessions/:sessionId/versions",
    method: "GET",
    roles: ["member", "creator", "admin"],
  },
  {
    path: "/api/sessions/versions",
    method: "GET",
    roles: ["member", "creator", "admin"],
  },
  {
    path: "/api/sessions/versions",
    method: "POST",
    roles: ["member", "creator", "admin"],
  },
  {
    path: "/api/sessions/versions/:versionId/activity",
    method: "GET",
    roles: ["member", "creator", "admin"],
  },
  {
    path: "/api/sessions/versions/:versionId/activity",
    method: "POST",
    roles: ["member", "creator", "admin"],
  },
  {
    path: "/api/sessions/:sessionId/activity",
    method: "GET",
    roles: ["member", "creator", "admin"],
  },
  {
    path: "/api/audio",
    method: "POST",
    roles: ["member", "creator", "admin"],
  },
  {
    path: "/api/audio/status/:temporaryAudioFile",
    method: "GET",
    roles: ["member", "creator", "admin"],
  },
];
