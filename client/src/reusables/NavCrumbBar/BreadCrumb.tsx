import { Breadcrumb, BreadcrumbLink, BreadcrumbItem, useBreakpointValue } from "@chakra-ui/react";
import { PiCaretRightBold } from "react-icons/pi";
import { Link, useLocation } from "react-router-dom";

interface IBreadCrumb {
  crumbItems: ICrumbItems[];
}

const BreadCrumb = ({ crumbItems }: IBreadCrumb) => {
  const location = useLocation();
  const isMediumOrBigScreen = useBreakpointValue({ base: false, md: true });

  return (
    <Breadcrumb
      separator={<PiCaretRightBold />}
      color="brand.textDark"
      fontSize={{ base: "23px", md: "20px", xl: "23px" }}
      fontWeight={"medium"}
    >
      {crumbItems.map(({ path, name }) => {
        const isActive = path === location.pathname;
        if (!isMediumOrBigScreen && isActive) {
          return (
            <BreadcrumbItem key={path}>
              <BreadcrumbLink
                as={Link}
                to={path}
                color={"brand.textDark"}
                isCurrentPage={isActive}
                cursor={isActive ? "default !important" : "pointer"}
                textDecoration={"none"}
                _active={{ textDecoration: "none" }}
              >
                {name}
              </BreadcrumbLink>
            </BreadcrumbItem>
          );
        }
        if (isMediumOrBigScreen) {
          return (
            <BreadcrumbItem key={path}>
              <BreadcrumbLink
                as={Link}
                to={path}
                color={isActive ? "brand.textDark" : "brand.primary"}
                isCurrentPage={isActive}
                textDecoration={"none"}
                cursor={isActive ? "default !important" : "pointer"}
                _active={{ textDecoration: "none" }}
              >
                {name}
              </BreadcrumbLink>
            </BreadcrumbItem>
          );
        }
      })}
    </Breadcrumb>
  );
};

export default BreadCrumb;
