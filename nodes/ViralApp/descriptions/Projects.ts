import { INodeProperties } from 'n8n-workflow';

export const projectsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['projects'],
			},
		},
		options: [
			{
				name: 'Add Account',
				value: 'addAccount',
				description: 'Add an account to a project',
				action: 'Add account to project',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new project',
				action: 'Create a project',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a project',
				action: 'Delete a project',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'List many projects',
				action: 'List all projects',
			},
			{
				name: 'Remove Account',
				value: 'removeAccount',
				description: 'Remove an account from a project',
				action: 'Remove account from project',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an existing project',
				action: 'Update a project',
			},
		],
		default: 'getAll',
	},
];

export const projectsFields: INodeProperties[] = [
	// ----------------------------------------
	//        projects: getAll
	// ----------------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['projects'],
				operation: ['getAll'],
			},
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['projects'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
		},
		default: 50,
		description: 'Max number of results to return',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['projects'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Filter projects by name',
				placeholder: 'e.g. Marketing Campaign',
				routing: {
					send: {
						type: 'query',
						property: 'name',
					},
				},
			},
		],
	},

	// ----------------------------------------
	//        projects: create
	// ----------------------------------------
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['projects'],
				operation: ['create'],
			},
		},
		default: '',
		required: true,
		description: 'Project name',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['projects'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Project description',
			},
			{
				displayName: 'Logo URL',
				name: 'logo',
				type: 'string',
				default: '',
				description: 'URL to project logo',
			},
		],
	},

	// ----------------------------------------
	//        projects: update
	// ----------------------------------------
	{
		displayName: 'Project',
		name: 'projectId',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		displayOptions: {
			show: {
				resource: ['projects'],
				operation: ['update', 'delete', 'addAccount', 'removeAccount'],
			},
		},
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				placeholder: 'Select a project...',
				typeOptions: {
					searchListMethod: 'projectSearch',
					searchable: true,
				},
			},
			{
				displayName: 'By ID',
				name: 'id',
				type: 'string',
				placeholder: 'Enter project ID',
				validation: [
					{
						type: 'regex',
						properties: {
							regex: '^[a-zA-Z0-9-_]+$',
							errorMessage: 'Not a valid project ID',
						},
					},
				],
			},
		],
		description: 'The project to operate on',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['projects'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Project name',
				routing: {
					send: {
						type: 'body',
						property: 'name',
					},
				},
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Project description',
			},
			{
				displayName: 'Logo URL',
				name: 'logo',
				type: 'string',
				default: '',
				description: 'URL to project logo',
			},
		],
	},

	// ----------------------------------------
	//   projects: addAccount, removeAccount
	// ----------------------------------------
	{
		displayName: 'Account',
		name: 'accountId',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		displayOptions: {
			show: {
				resource: ['projects'],
				operation: ['addAccount', 'removeAccount'],
			},
		},
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				placeholder: 'Select an account...',
				typeOptions: {
					searchListMethod: 'trackedAccountSearch',
					searchable: true,
				},
			},
			{
				displayName: 'By ID',
				name: 'id',
				type: 'string',
				placeholder: 'Enter account ID',
				validation: [
					{
						type: 'regex',
						properties: {
							regex: '^[a-zA-Z0-9-_]+$',
							errorMessage: 'Not a valid account ID',
						},
					},
				],
			},
		],
		description: 'The tracked account to add/remove',
	},
];