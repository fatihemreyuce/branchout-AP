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
import LanguagesListPage from "./pages/languages/languages-list-page";
import LanguageCreatePage from "./pages/languages/language-create-page";
import LanguageEditPage from "./pages/languages/language-edit-page";
import LanguageDetailPage from "./pages/languages/language-detail-page";
import EcoPartnersListPage from "./pages/eco-partners/eco-partners-list-page";
import EcoPartnerCreatePage from "./pages/eco-partners/eco-partner-create-page";
import EcoPartnerDetailPage from "./pages/eco-partners/eco-partner-detail-page";
import EcoPartnerEditPage from "./pages/eco-partners/eco-partner-edit-page";
import PartnersListPage from "./pages/partners/partners-list-page";
import PartnerCreatePage from "./pages/partners/partner-create-page";
import PartnerDetailPage from "./pages/partners/partner-detail-page";
import PartnerEditPage from "./pages/partners/partner-edit-page";
import TeamMembersListPage from "./pages/team-members/team-members-list-page";
import TeamMemberCreatePage from "./pages/team-members/team-member-create-page";
import TeamMemberDetailPage from "./pages/team-members/team-member-detail-page";
import TeamMemberEditPage from "./pages/team-members/team-member-edit-page";
import AssetsListPage from "./pages/assets/assets-list-page";
import AssetCreatePage from "./pages/assets/asset-create-page";
import AssetDetailPage from "./pages/assets/asset-detail-page";
import AssetEditPage from "./pages/assets/asset-edit-page";
import ComponentsListPage from "./pages/components/components-list-page";
import ComponentCreatePage from "./pages/components/component-create-page";
import ComponentDetailPage from "./pages/components/component-detail-page";
import ComponentEditPage from "./pages/components/component-edit-page";
import ComponentTypesListPage from "./pages/component-types/component-types-list-page";
import ComponentTypeCreatePage from "./pages/component-types/component-type-create-page";
import ComponentTypeDetailPage from "./pages/component-types/component-type-detail-page";
import ComponentTypeEditPage from "./pages/component-types/component-type-edit-page";
import PageTypesListPage from "./pages/page-types/page-types-list-page";
import PageTypeCreatePage from "./pages/page-types/page-type-create-page";
import PageTypeDetailPage from "./pages/page-types/page-type-detail-page";
import PageTypeEditPage from "./pages/page-types/page-type-edit-page";
import PagesListPage from "./pages/pages/pages-list-page";
import PageCreatePage from "./pages/pages/page-create-page";
import PageDetailPage from "./pages/pages/page-detail-page";
import PageEditPage from "./pages/pages/page-edit-page";

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
								<Route path="/languages" element={<LanguagesListPage />} />
								<Route path="/languages/create" element={<LanguageCreatePage />} />
								<Route path="/languages/:id" element={<LanguageDetailPage />} />
								<Route path="/languages/:id/edit" element={<LanguageEditPage />} />
								<Route path="/eco-partners" element={<EcoPartnersListPage />} />
								<Route path="/eco-partners/create" element={<EcoPartnerCreatePage />} />
								<Route path="/eco-partners/:id" element={<EcoPartnerDetailPage />} />
								<Route path="/eco-partners/:id/edit" element={<EcoPartnerEditPage />} />
								<Route path="/partners" element={<PartnersListPage />} />
								<Route path="/partners/create" element={<PartnerCreatePage />} />
								<Route path="/partners/:id" element={<PartnerDetailPage />} />
								<Route path="/partners/:id/edit" element={<PartnerEditPage />} />
								<Route path="/team-members" element={<TeamMembersListPage />} />
								<Route path="/team-members/create" element={<TeamMemberCreatePage />} />
								<Route path="/team-members/:id" element={<TeamMemberDetailPage />} />
								<Route path="/team-members/:id/edit" element={<TeamMemberEditPage />} />
								<Route path="/assets" element={<AssetsListPage />} />
								<Route path="/assets/create" element={<AssetCreatePage />} />
								<Route path="/assets/:id" element={<AssetDetailPage />} />
								<Route path="/assets/:id/edit" element={<AssetEditPage />} />
								<Route path="/components" element={<ComponentsListPage />} />
								<Route path="/components/create" element={<ComponentCreatePage />} />
								<Route path="/components/:id" element={<ComponentDetailPage />} />
								<Route path="/components/:id/edit" element={<ComponentEditPage />} />
								<Route path="/component-types" element={<ComponentTypesListPage />} />
								<Route path="/component-types/create" element={<ComponentTypeCreatePage />} />
								<Route path="/component-types/:id" element={<ComponentTypeDetailPage />} />
								<Route path="/component-types/:id/edit" element={<ComponentTypeEditPage />} />
								<Route path="/page-types" element={<PageTypesListPage />} />
								<Route path="/page-types/create" element={<PageTypeCreatePage />} />
								<Route path="/page-types/:id" element={<PageTypeDetailPage />} />
								<Route path="/page-types/:id/edit" element={<PageTypeEditPage />} />
								<Route path="/pages" element={<PagesListPage />} />
								<Route path="/pages/create" element={<PageCreatePage />} />
								<Route path="/pages/:id" element={<PageDetailPage />} />
								<Route path="/pages/:id/edit" element={<PageEditPage />} />
							</Route>
						</Route>
					</Routes>
				</BrowserRouter>
			</LoginProvider>
		</QueryProvider>
	);
}

export default App;
