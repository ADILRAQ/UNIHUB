import apiClient from '../api/client';

export const downloadResource = async (resourceId: number, filename: string): Promise<void> => {
  const response = await apiClient.get(`/api/resources/${resourceId}/download`, {
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};
