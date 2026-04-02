import { Navigate, Route, Routes } from 'react-router-dom';
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Settings from './pages/Settings'
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Verify from "./pages/Verify";
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from "./store/authStore";
import { useEffect } from "react";
import Chat from "./pages/Chat";
import Profile from './pages/Profile';
import { useThemeStore } from './store/themeStore';
import Search from './pages/Search';
import UserProfile from './pages/UserProfile';
import { useChatStore } from './store/useChatStore';
import NotificationToast from './components/NotificationToast.jsx';
// protect routes;

const ProtectedRoute = ({children}) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if(!isAuthenticated){
    return <Navigate to='/login' replace/>
  }

  if(!user.isVerified){
    return <Navigate to='/verify-email' replace/>
  }

  return children;
}

const RedirectAuthenticatedUser = ({children}) => {
  const {isAuthenticated, user} = useAuthStore();

  if(isAuthenticated && user.isVerified){
    return <Navigate to='/' replace />
  }

  return children;
}


function App() {
  const { checkAuth, isAuthenticated, user } = useAuthStore();
  const { subscribeToGlobalMessages, getFriendsForSidebar } = useChatStore();

  useEffect(() => {
      checkAuth();
  }, [checkAuth]);

  useEffect(() => {
      if (!isAuthenticated || !user) return;
      const timer = setTimeout(() => {
          subscribeToGlobalMessages();
          getFriendsForSidebar();
      }, 500);
      return () => clearTimeout(timer);
  }, [isAuthenticated, user]);


  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  console.log("isAuthenticated: ", isAuthenticated);
  console.log("user: ", user);
  const { theme } = useThemeStore();

  return (
    <div data-theme={theme}>
      <Toaster/>
      <NotificationToast />
      <Routes>
        <Route path='/' element={<ProtectedRoute>
          <Home/>
        </ProtectedRoute>}></Route>
        <Route path='/signup' element={<RedirectAuthenticatedUser>
          <Signup/>
          </RedirectAuthenticatedUser>}></Route>
        <Route path='/login' element={<RedirectAuthenticatedUser>
          <Login/>
          </RedirectAuthenticatedUser>}></Route>
        <Route path='/forgot-password' element={<RedirectAuthenticatedUser>
          <ForgotPassword/>
          </RedirectAuthenticatedUser>}></Route>
        <Route path='/reset-password/:resetToken' element={<ResetPassword/>}></Route>
        <Route path='/verify-email' element={<RedirectAuthenticatedUser>
          <Verify/>
          </RedirectAuthenticatedUser>}>
        </Route>

        <Route path='/chats' element={<ProtectedRoute>
          <Chat/>
        </ProtectedRoute>}>
        </Route>
        <Route path='/profile' element={<ProtectedRoute>
          <Profile/>
        </ProtectedRoute>}></Route>
        <Route path='/user/:userId' element={<ProtectedRoute>
          <UserProfile/>
        </ProtectedRoute>}></Route>
        <Route path='/search' element={<ProtectedRoute>
          <Search/>
        </ProtectedRoute>}></Route>
        <Route path='/settings' element={<Settings/>}/>
      </Routes>
      
    </div>
  )
}

export default App
