const isDev = process.env.NODE_ENV === 'development';

const getData = (key: string): unknown | undefined => {
  try {
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    if (isDev) console.error('Read from local storage', error);
  }
};

const setData = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    if (isDev) console.error('Save in local storage', error);
  }
};

export { getData, setData };
