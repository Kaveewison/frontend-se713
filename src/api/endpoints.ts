/**
 * API Endpoints Constants
 *
 * Centralized definition of all API endpoint paths.
 * Uses typed constants and function factories for parameterized endpoints.
 *
 * @module api/endpoints
 */

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    CURRENT_USER: '/auth/me',
    UPLOAD_PROFILE_IMAGE: '/auth/upload-profile-image',
  },

  // Users
  USERS: {
    BASE: '/admin/users',
    BY_ID: (id: number) => `/admin/user/${id}`,
    TOGGLE_ECT: (id: number) => `/users/${id}/ect-status`,
    PROMOTE_EC: (id: number) => `/admin/promote-ec/${id}`,
    DEMOTE_VOTER: (id: number) => `/admin/demote-voter/${id}`,
  },

  ELECTION: {
    BASE: '/election',
    OVERVIEW: '/election/party-overview',
    PUBLIC_PARTY_BY_ID: (id: number) => `/election/public/party/${id}`,
    CREATE_PARTY: '/election/party',
    UPDATE_PARTY: (id: number) => `/election/party/${id}`,
    UPLOAD_PARTY_LOGO: (id: number) => `/election/party/${id}/logo`,

    ELECTION_RESULTS: (id: number) => `/election/constituency/${id}`,
    ADD_CANDIDATE: '/election/candidate',
    UPDATE_CANDIDATE: (id: number) => `/election/candidate/${id}`,
    DELETE_CANDIDATE: (id: number) => `/election/candidate/${id}`,
  },

  // Parties
  PARTIES: {
    BASE: '/parties',
    BY_ID: (id: number) => `/parties/${id}`,
    MEMBERS: (id: number) => `/parties/${id}/members`,
    ADD_MEMBER: (partyId: number, userId: number) =>
      `/parties/${partyId}/members/${userId}`,
    REMOVE_MEMBER: (partyId: number, userId: number) =>
      `/parties/${partyId}/members/${userId}`,
  },

  // Candidates
  CANDIDATES: {
    BASE: '/candidates',
    BY_ID: (id: number) => `/candidates/${id}`,
    BY_CONSTITUENCY: (constituencyId: number) =>
      `/candidates/constituency/${constituencyId}`,
  },

  // Votes
  VOTES: {
    SUBMIT: '/votes',
    RESULTS: '/votes/results',
    MY_VOTE: '/votes/my-vote',
    BY_CONSTITUENCY: (constituencyId: number) =>
      `/votes/results/constituency/${constituencyId}`,
    HAS_VOTED: (userId: number) => `/votes/has-voted/${userId}`,
    HISTORY: (userId: number) => `/votes/history/${userId}`,
    BALLOT: '/votes/ballot',
  },

  // Constituencies
  CONSTITUENCIES: {
    BASE: '/election/constituencies',
    ADMIN_BASE: '/admin/constituencies',
    BY_PROVINCE: (province: string) =>
      `/election/constituencies?province=${encodeURIComponent(province)}`,
    BY_ID: (id: number) => `/constituencies/${id}`,
    CREATE: '/admin/constituency',
    UPDATE: (id: number) => `/admin/constituency/${id}`,
    DELETE: (id: number) => `/admin/constituency/${id}`,
    TOGGLE_STATUS: (id: number) => `/admin/constituency/${id}/toggle-status`,
  },
} as const;
