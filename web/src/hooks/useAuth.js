import { useAuthContext } from '../context/AuthProvider';

const useAuth = () => {
  return useAuthContext();
};

export default useAuth;