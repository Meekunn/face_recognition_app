import { useState, useMemo } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import {
	Button,
	HStack,
	Icon,
	Input,
	InputGroup,
	InputLeftElement,
	Table,
	TableContainer,
	Tbody,
	Td,
	Th,
	Thead,
	Tr,
	Text,
	VStack,
} from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';

interface CustomTableProps<T> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	columns: ColumnDef<T, any>[];
	data: T[];
	showSearchBox?: boolean;
	clickableRows?: boolean;
	onRowClick?: (row: T) => void;
	placeholderText?: string;
	width?: string;
}

const CustomTable = <T extends object>({
	columns,
	data,
	showSearchBox = true,
	clickableRows = false,
	onRowClick,
	placeholderText = 'Search ...',
	width,
}: CustomTableProps<T>) => {
	const [searchQuery, setSearchQuery] = useState('');
	const [pagination, setPagination] = useState({
		pageIndex: 0, //initial page index
		pageSize: 7, //default page size
	});

	const filteredData = useMemo(() => {
		if (!searchQuery) return data;
		return data.filter((row) =>
			Object.values(row).some((value) => String(value).toLowerCase().includes(searchQuery.toLowerCase()))
		);
	}, [searchQuery, data]);

	const table = useReactTable({
		data: filteredData,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onPaginationChange: setPagination, //update the pagination state when internal APIs mutate the pagination state
		state: {
			//...
			pagination,
		},
	});

	const handleRowClick = (row: T) => {
		if (clickableRows && onRowClick) {
			onRowClick(row);
		}
	};

	return (
		<VStack gap={6} w={width}>
			{showSearchBox && (
				<InputGroup borderRadius="10px">
					<InputLeftElement pointerEvents="none">
						<Icon as={FiSearch} color="gray.300" />
					</InputLeftElement>
					<Input type="text" placeholder={placeholderText} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
				</InputGroup>
			)}
			<TableContainer borderRadius={'10px'} w="full">
				<Table colorScheme="customBlue" variant="striped">
					<Thead>
						{table.getHeaderGroups().map((headerGroup) => (
							<Tr key={headerGroup.id} bgColor="customBlue.200">
								{headerGroup.headers.map((header) => (
									<Th
										key={header.id}
										px={6}
										py={4}
										fontSize="md"
										fontWeight="semibold"
										textTransform={'capitalize'}
										color="brand.textDark"
										textAlign={header.id === 'name' ? 'left' : 'center'}
									>
										{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
									</Th>
								))}
							</Tr>
						))}
					</Thead>
					<Tbody>
						{table.getRowModel().rows.map((row) => (
							<Tr
								key={row.id}
								className="border-b"
								onClick={() => handleRowClick(row.original)}
								cursor={clickableRows ? 'pointer' : 'default'}
							>
								{row.getVisibleCells().map((cell) => (
									<Td key={cell.id} textAlign={cell.column.id === 'name' ? 'left' : 'center'}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</Td>
								))}
							</Tr>
						))}
					</Tbody>
				</Table>
			</TableContainer>
			<HStack spacing={4} alignSelf="flex-end">
				<Button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
					Previous
				</Button>
				<Text>
					Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
				</Text>
				<Button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
					Next
				</Button>
			</HStack>
		</VStack>
	);
};

export default CustomTable;
