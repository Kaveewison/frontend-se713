export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    CURRENT_USER: `/auth/me`,
    UPLOAD_PROFILE_IMAGE: '/auth/upload-profile-image',
    PROFILE: '/auth/profile',
  },

  // Users
  USERS: {
    BASE: '/admin/users',
    BY_ID: (id: number) => `/admin/user/${id}`,
    PROMOTE_EC: (id: number) => `/admin/promote-ec/${id}`,
    DEMOTE_VOTER: (id: number) => `/admin/demote-voter/${id}`,
  },

  ELECTION: {
    OVERVIEW: (params?: { id?: number; districtNumber?: number }) => {
      const qs = new URLSearchParams();
      if (params?.id != null) qs.set('id', String(params.id));
      if (params?.districtNumber != null)
        qs.set('districtNumber', String(params.districtNumber));
      const query = qs.toString();
      return query
        ? `/election/party-overview?${query}`
        : '/election/party-overview';
    },
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
  },

  // Votes
  VOTES: {
    SUBMIT: '/votes',
    MY_VOTE: '/votes/my-vote',
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
