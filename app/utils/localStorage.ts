export function saveToLocalStorage<T>(key: string, data: T): void {
  try {
    const serializedData = JSON.stringify(data, (key, value) => {
      // Handle Date objects
      if (value instanceof Date) {
        return { __type: 'Date', value: value.toISOString() };
      }
      return value;
    });
    localStorage.setItem(key, serializedData);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

export function loadFromLocalStorage<T>(key: string): T | null {
  try {
    const serializedData = localStorage.getItem(key);
    if (serializedData === null) return null;
    
    return JSON.parse(serializedData, (key, value) => {
      // Handle Date objects
      if (value && typeof value === 'object' && value.__type === 'Date') {
        return new Date(value.value);
      }
      return value;
    });
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return null;
  }
}

export function removeFromLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
}

export function clearAllPresentations(): void {
  try {
    localStorage.removeItem('presentations');
    localStorage.removeItem('current-presentation');
  } catch (error) {
    console.error('Error clearing presentations:', error);
  }
}