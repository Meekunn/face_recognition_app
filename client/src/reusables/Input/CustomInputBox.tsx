import {
	Box,
	Button,
	FormControl,
	//   FormErrorMessage,
	FormLabel,
	Input,
	InputGroup,
	InputProps,
	InputRightElement,
	Text,
} from '@chakra-ui/react';
import { useState } from 'react';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';

interface inputProps extends InputProps {
	name: string;
	label: string;
	hasFieldset: boolean;
	isRequired?: boolean;
	requiredIndicator?: React.ReactNode;
	isInvalid?: boolean;
	autocomplete?: string;
	onFocusLabelColor?: string;
	onFocusBorderColor?: string;
	placeholder: string;
	type: string;
	formHelperText?: React.ReactNode;
	errMsg?: string;
	onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
	value?: string;
	onBlur?: (event: React.ChangeEvent<HTMLInputElement>) => void;
	handleValidation?: (value: string) => void;
	labelSize?: string;
	minDate?: string;
	// getFieldPropHook?:
}
function CustomInputBox(input: inputProps) {
	// Default values for onFocusBorderColor and onFocusTextColor
	const {
		onFocusBorderColor = 'initial',
		onFocusLabelColor = 'initial',
		isRequired = false,
		labelSize = 'xs',
		requiredIndicator = (
			<Text as="span" color="customRed.500">
				*
			</Text>
		),
		isInvalid = false,
		autocomplete = 'off',
	} = input;
	const [show, setShow] = useState(false);
	const handleClick = () => setShow(!show);
	return (
		<Box width={input.width}>
			<FormControl
				as={input.hasFieldset ? 'fieldset' : 'div'}
				isRequired={isRequired}
				isInvalid={isInvalid}
				border="1px"
				borderRadius="md"
				borderColor="brand.textGray"
				pl={2}
				_focus={{ borderColor: isInvalid ? 'brand.error' : onFocusBorderColor }}
			>
				<FormLabel
					as={input.hasFieldset ? 'legend' : 'label'}
					m={0}
					fontSize={labelSize}
					color={input.color}
					requiredIndicator={requiredIndicator}
					_groupFocus={{ color: isInvalid ? 'brand.error' : onFocusLabelColor }}
				>
					{input.label}
				</FormLabel>
				<InputGroup size="lg" h="100%" pl="6px" pr="14px">
					<Input
						pr="4.5rem"
						w="100%"
						h="2.5rem"
						pb={2}
						px={0}
						backgroundColor="transparent"
						_autofill={{ backgroundColor: 'transparent  !important' }}
						variant="ghost"
						name={input.name}
						type={input.type === 'password' ? (show ? 'text' : 'password') : input.type}
						autoComplete={autocomplete}
						placeholder={input.placeholder}
						onChange={(e) => {
							input?.onChange?.(e);
							input?.handleValidation?.(e.target.value);
						}}
						fontSize="sm"
						value={input.value || ''}
						onBlur={input.onBlur}
						_placeholder={{ fontSize: 'sm' }}
						_focus={{ bg: 'transparent' }}
						min={input.minDate}
					/>
					{input.type === 'password' && (
						<InputRightElement width="4.5rem" alignItems="flex-start">
							<Button
								display={'flex'}
								justifyContent={'center'}
								variant="unstyled"
								w="fit-content"
								h="1.75rem"
								size="sm"
								_focus={{
									outline: 'none',
									border: 0,
								}}
								onClick={handleClick}
								color="brand.textDark"
							>
								{show ? <MdVisibilityOff /> : <MdVisibility />}
							</Button>
						</InputRightElement>
					)}
				</InputGroup>
				{/* <FormErrorMessage>{input.errMsg}</FormErrorMessage> */}
				{/* <FormHelperText></FormHelperText> */}
			</FormControl>
			<Box h="10px">
				<Text color="red.500" fontSize="xs">
					{input.errMsg}
				</Text>
			</Box>
			{input.formHelperText}
		</Box>
	);
}
export default CustomInputBox;
