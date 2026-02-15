
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const generateID = (prefix: string = ''): string => {
  // Usa API nativa de criptografia do navegador para IDs únicos seguros
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}${crypto.randomUUID()}`;
  }
  // Fallback seguro
  return `${prefix}${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
};
