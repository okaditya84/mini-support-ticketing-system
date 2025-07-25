// Mock authentication service
// In a real application, this would connect to your backend authentication system

const mockUsers = [
  { id: 1, email: 'reporter1@example.com', name: 'John Reporter', role: 'reporter' },
  { id: 2, email: 'reporter2@example.com', name: 'Jane User', role: 'reporter' },
  { id: 3, email: 'admin1@example.com', name: 'Admin Smith', role: 'admin' },
  { id: 4, email: 'admin2@example.com', name: 'Support Manager', role: 'admin' }
];

export const login = (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = mockUsers.find(u => u.email === email);
      if (user && password === 'password123') {
        const userData = { ...user };
        localStorage.setItem('currentUser', JSON.stringify(userData));
        localStorage.setItem('authToken', 'mock-token-' + user.id);
        resolve(userData);
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 1000);
  });
};

export const logout = () => {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('authToken');
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('currentUser');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      localStorage.removeItem('currentUser');
      return null;
    }
  }
  return null;
};

export const getAllUsers = () => {
  return mockUsers;
};
