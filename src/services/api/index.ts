// src/services/api/index.ts
export { personsApi } from './persons';
export { usersApi } from './users';
export { companiesApi } from './companies';
export { rolesApi } from './roles';
export { permissionsApi } from './permissions';
export { rolePermissionsApi } from './rolePermissions';
export { userCompanyApi } from './userCompany';
export { campaignsApi } from './campaign'; // campaign.ts exports campaignsApi
export { channelsApi } from './channels';
export { trackingLinksApi } from './tracking';
export { clicksApi } from './clicks';
export { conversionApi } from './conversion';
export { authApi } from './auth';
export { statsApi, trackingStatsApi } from './stats';
export * from './client';
export * from './config';
export * from './types';

