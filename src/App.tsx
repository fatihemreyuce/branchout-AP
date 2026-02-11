import { LoginProvider } from "./providers/login-state-provider";
import QueryProvider from "./providers/query-client-provider";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import ProtectedRoute from "./providers/protected-route";
import AdminLayout from "./components/admin-layout";
import LoginPage from "./pages/login/login-page";
import DashboardPage from "./pages/dashboard/dashboard-page";
import UsersListPage from "./pages/users/users-list-page";
import UserCreatePage from "./pages/users/user-create-page";
import UserEditPage from "./pages/users/user-edit-page";
import UserDetailPage from "./pages/users/user-detail-page";
import OfficesListPage from "./pages/offices/offices-list-page";
import OfficeCreatePage from "./pages/offices/office-create-page";
import OfficeEditPage from "./pages/offices/office-edit-page";
import OfficeDetailPage from "./pages/offices/office-detail-page";

function App() {
	return (
		<QueryProvider>
			<LoginProvider>
				<BrowserRouter>
					<Toaster />
					<Routes>
						<Route path="/login" element={<LoginPage />} />
						<Route path="/" element={<ProtectedRoute />}>
							<Route path="/" element={<AdminLayout />}>
								<Route path="/" element={<DashboardPage />} />
								<Route path="/users" element={<UsersListPage />} />
								<Route path="/users/create" element={<UserCreatePage />} />
								<Route path="/users/:id" element={<UserDetailPage />} />
								<Route path="/users/:id/edit" element={<UserEditPage />} />
								<Route path="/offices" element={<OfficesListPage />} />
								<Route path="/offices/create" element={<OfficeCreatePage />} />
								<Route path="/offices/:id" element={<OfficeDetailPage />} />
								<Route path="/offices/:id/edit" element={<OfficeEditPage />} />
							</Route>
						</Route>
					</Routes>
				</BrowserRouter>
			</LoginProvider>
		</QueryProvider>
	);
}

export default App;
