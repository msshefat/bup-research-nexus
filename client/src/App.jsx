import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth';
import { ThemeProvider } from './theme';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { Directory } from './pages/Directory';
import { Profile } from './pages/Profile';
import { Opportunities, OpportunityDetail } from './pages/Opportunities';
import { ProjectDetail, Projects } from './pages/Projects';
import { Publications } from './pages/Publications';
import { Search } from './pages/Search';
import { Account } from './pages/Account';
import { Requests } from './pages/Requests';
import { Running } from './pages/Running';
import { Notifications } from './pages/Notifications';
import { Admin } from './pages/Admin';

export default function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="people" element={<Directory />} />
            <Route path="people/:id" element={<Profile />} />
            <Route path="opportunities" element={<Opportunities />} />
            <Route path="opportunities/:id" element={<OpportunityDetail />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="publications" element={<Publications />} />
            <Route path="search" element={<Search />} />
            <Route path="account" element={<Account />} />
            <Route path="requests" element={<Requests />} />
            <Route path="running" element={<Running />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="admin" element={<Admin />} />
            <Route path="*" element={<Missing />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  );
}

function Missing() {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <p className="font-serif text-5xl text-gold">404</p>
      <h1 className="mt-3 font-serif text-4xl">That page is not in the directory.</h1>
      <a href="/" className="mt-4 inline-block text-sm font-semibold text-gold">
        Back to the start
      </a>
    </div>
  );
}
