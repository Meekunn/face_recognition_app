import { Flex } from "@chakra-ui/react";
import BreadCrumb from "./BreadCrumb";

interface INavCrumbBar {
  button?: React.ReactNode;
  crumbItems: ICrumbItems[];
}

const NavCrumbBar = ({ button, crumbItems }: INavCrumbBar) => {
  return (
    <Flex
      bgColor="#FAFAFA"
      boxShadow="0px 1px 3px 0px #0000001A"
      minH="80px"
      align="center"
      justify="space-between"
      py={4}
      px={{ base: 4, md: 6, xl: 8 }}
    >
      <BreadCrumb crumbItems={crumbItems} />
      {button}
    </Flex>
  );
};

export default NavCrumbBar;
