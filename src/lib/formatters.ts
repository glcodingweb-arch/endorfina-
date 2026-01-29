
export const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
