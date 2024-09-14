import { Button, IconButton, IconProps } from "@chakra-ui/react";

interface ICrumbButton {
  title: string;
  ariaLabel: string;
  icon: React.ReactElement<IconProps>;
  handleClick: () => void;
}

const CrumbButton = ({ title, icon, ariaLabel, handleClick }: ICrumbButton) => {
  return (
    <>
      <Button
        leftIcon={icon}
        py="10px"
        px={4}
        display={{ base: "none", md: "inline-flex" }}
        onClick={handleClick}
      >
        {title}
      </Button>
      <IconButton
        aria-label={ariaLabel}
        p={3.5}
        display={{ base: "inline-flex", md: "none" }}
        onClick={handleClick}
      >
        {icon}
      </IconButton>
    </>
  );
};

export default CrumbButton;
