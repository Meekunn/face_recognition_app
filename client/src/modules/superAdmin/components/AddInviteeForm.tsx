import { useState, ChangeEvent } from 'react';
import {
	VStack,
	Icon,
	Box,
	Text,
	Image,
	Button,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
} from '@chakra-ui/react';
import { useFormik } from 'formik';
import { FiPlus } from 'react-icons/fi';
import CustomInputBox from '../../../reusables/Input/CustomInputBox';
import { NAME_REGEX, PHONE_REGEX } from '../../../utils/regex';
import * as Yup from 'yup';
import { IInvitee } from '../types';
import Api from '../../../api';
import { generateUID } from '../../../utils/helperFunctions';
import useCustomToast from '../../../hooks/useCustomToast';

type IAddInviteeForm = {
	isOpen: boolean;
	onClose: () => void;
	onAddInvitee: (invitee: IInvitee) => void;
};

const AddInviteeForm = ({ isOpen, onClose, onAddInvitee }: IAddInviteeForm) => {
	const showToast = useCustomToast();
	const [selectedImage, setSelectedImage] = useState<string>('');

	const formik = useFormik<IInvitee>({
		initialValues: {
			photo: '',
			name: '',
			invitee_id: '',
			phone_number: '',
			photoFile: null,
		},
		validationSchema: Yup.object({
			photo: Yup.string().required('This Field is Required'),
			name: Yup.string().required('This Field is Required').matches(NAME_REGEX, 'Not a valid name'),
			invitee_id: Yup.string(),
			phone_number: Yup.string().required('This Field is Required').matches(PHONE_REGEX, 'Not a valid phone number'),
		}),
		onSubmit: async (values) => {
			// console.log(values);
			const generatedUID = generateUID();

			if (!values.invitee_id) {
				values.invitee_id = generatedUID;
			}

			const formData = new FormData();
			formData.append('name', values.name);
			formData.append('phone_number', values.phone_number);

			if (values.photoFile) formData.append('photo', values.photoFile);
			// console.log(values.photoFile);
			values.invitee_id ? formData.append('invitee_id', values.invitee_id) : formData.append('invitee_id', generatedUID);

			try {
				// const response =
				await Api.post('add-invitee', formData, {
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				});
				showToast({
					title: 'Invitee Added',
					description: 'Invitee added successfully',
					position: 'top',
					status: 'success',
					duration: 3000,
				});
				// console.log(response.data);
				formik.resetForm();
				setSelectedImage('');
			} catch (error) {
				// console.error('There was an error adding the invitee!', error);
				showToast({
					title: 'Failed to add Invitee',
					description: 'There was an error adding the invitee.',
					status: 'error',
					duration: 3000,
					position: 'top',
				});
			}
			onAddInvitee(values);
		},
	});

	const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		console.log(file);
		if (file) {
			const imageUrl = URL.createObjectURL(file);
			setSelectedImage(imageUrl);
			formik.setFieldValue('photo', imageUrl);
			formik.setFieldValue('photoFile', file);
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>Invitee's Details</ModalHeader>
				<ModalCloseButton />
				<ModalBody>
					<form id="invitee_form" onSubmit={formik.handleSubmit}>
						<VStack mb={8}>
							{selectedImage ? (
								<>
									<input type="file" accept="image/*" onChange={handleImageUpload} hidden id="image-upload" />
									<label htmlFor="image-upload">
										<Box
											boxSize={'98px'}
											bgColor={'#F4F4F4'}
											display="flex"
											justifyContent={'center'}
											alignItems={'center'}
											position="relative"
											borderRadius={'50%'}
										>
											<Image src={selectedImage} alt="Selected" objectFit="cover" borderRadius="50%" width="100%" h="100%" />
										</Box>
									</label>
								</>
							) : (
								<>
									<input type="file" accept="image/*" onChange={handleImageUpload} hidden id="image-upload" />
									<label htmlFor="image-upload">
										<Box
											boxSize={'98px'}
											bgColor={'#F4F4F4'}
											display="flex"
											justifyContent={'center'}
											alignItems={'center'}
											position="relative"
											borderRadius={'50%'}
										>
											<Icon as={FiPlus} w="25px" h="25px" />
										</Box>
									</label>
								</>
							)}
							<Text fontWeight={'semibold'} fontSize={'15px'} letterSpacing={'-0.3px'}>
								Add picture
							</Text>
						</VStack>
						<CustomInputBox
							hasFieldset={true}
							isRequired={true}
							onFocusLabelColor="brand.primary"
							onFocusBorderColor="brand.primary"
							onBlur={formik.handleBlur}
							onChange={formik.handleChange}
							value={formik.values.name}
							name="name"
							label="Full Name"
							placeholder="James John"
							type="text"
							color={'brand.textGray'}
							fontSize="sm"
							width="100%"
							labelSize="sm"
							errMsg={formik.errors.name}
						/>
						<CustomInputBox
							hasFieldset={true}
							isRequired={false}
							onFocusLabelColor="brand.primary"
							onFocusBorderColor="brand.primary"
							onBlur={formik.handleBlur}
							onChange={formik.handleChange}
							value={formik.values.invitee_id}
							name="invitee_id"
							label="Unique Id"
							placeholder="0011"
							type="text"
							color={'brand.textGray'}
							fontSize="sm"
							width="100%"
							labelSize="sm"
							errMsg={formik.errors.invitee_id}
						/>
						<CustomInputBox
							hasFieldset={true}
							isRequired={true}
							onFocusLabelColor="brand.primary"
							onFocusBorderColor="brand.primary"
							onBlur={formik.handleBlur}
							onChange={formik.handleChange}
							value={formik.values.phone_number}
							name="phone_number"
							label="Phone Number"
							placeholder="+2340192093844"
							type="text"
							color={'brand.textGray'}
							fontSize="sm"
							width="100%"
							labelSize="sm"
							errMsg={formik.errors.phone_number}
						/>
					</form>
				</ModalBody>

				<ModalFooter w="100%" display="flex" justifyContent={'space-between'}>
					<Button variant="ghost" mr={3} onClick={onClose}>
						Cancel
					</Button>
					<Button type="submit" form="invitee_form">
						Add
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default AddInviteeForm;
