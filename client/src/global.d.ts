interface IBaseRoutes {
	path: string;
	exact?: boolean;
	component: React.LazyExoticComponent<() => JSX.Element>;
	isAuthenticated?: boolean;
	isProtected: boolean;
	layout?: ({ children }) => JSX.Element;
}

interface IContent {
	children: React.ReactNode;
	linkItems: LinkItemProps[];
}

interface ICrumbItems {
	name: string;
	path: string;
}

interface IOrganisation {
	id: string;
	name: string;
	email: string;
	isAuthenticated: string;
}

type OrganisationState = {
	organisation: IOrganisation;
};
