export const isTokenExpired = (expiresAt:any) => {
    return new Date() > new Date(expiresAt);
  };