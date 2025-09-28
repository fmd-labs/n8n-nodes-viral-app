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
				name: 'Get Many',
				value: 'getAll',
				description: 'List many projects',
				action: 'List all projects',
				routing: {
					request: {
						method: 'GET',
						url: '/projects',
					},
				},
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new project',
				action: 'Create a project',
				routing: {
					request: {
						method: 'POST',
						url: '/projects',
					},
				},
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an existing project',
				action: 'Update a project',
				routing: {
					request: {
						method: 'PUT',
						url: '=/projects/{{$parameter.projectId}}',
					},
				},
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a project',
				action: 'Delete a project',
				routing: {
					request: {
						method: 'DELETE',
						url: '=/projects/{{$parameter.projectId}}',
					},
				},
			},
			{
				name: 'Add Account',
				value: 'addAccount',
				description: 'Add an account to a project',
				action: 'Add account to project',
				routing: {
					request: {
						method: 'POST',
						url: '=/projects/{{$parameter.projectId}}/accounts/{{$parameter.accountId}}',
					},
				},
			},
			{
				name: 'Remove Account',
				value: 'removeAccount',
				description: 'Remove an account from a project',
				action: 'Remove account from project',
				routing: {
					request: {
						method: 'DELETE',
						url: '=/projects/{{$parameter.projectId}}/accounts/{{$parameter.accountId}}',
					},
				},
			},
		],
		default: 'getAll',
	},
];

export const projectsFields: INodeProperties[] = [
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
		routing: {
			send: {
				type: 'body',
				property: 'name',
			},
		},
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
				routing: {
					send: {
						type: 'body',
						property: 'description',
					},
				},
			},
			{
				displayName: 'Logo URL',
				name: 'logo',
				type: 'string',
				default: '',
				description: 'URL to project logo',
				routing: {
					send: {
						type: 'body',
						property: 'logo',
					},
				},
			},
		],
	},

	// ----------------------------------------
	//        projects: update
	// ----------------------------------------
	{
		displayName: 'Project ID',
		name: 'projectId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['projects'],
				operation: ['update', 'delete', 'addAccount', 'removeAccount'],
			},
		},
		default: '',
		required: true,
		description: 'ID of the project',
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
				routing: {
					send: {
						type: 'body',
						property: 'description',
					},
				},
			},
			{
				displayName: 'Logo URL',
				name: 'logo',
				type: 'string',
				default: '',
				description: 'URL to project logo',
				routing: {
					send: {
						type: 'body',
						property: 'logo',
					},
				},
			},
		],
	},

	// ----------------------------------------
	//   projects: addAccount, removeAccount
	// ----------------------------------------
	{
		displayName: 'Account ID',
		name: 'accountId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['projects'],
				operation: ['addAccount', 'removeAccount'],
			},
		},
		default: '',
		required: true,
		description: 'ID of the account',
	},
];