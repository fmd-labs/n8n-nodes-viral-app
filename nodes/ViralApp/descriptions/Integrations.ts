import { INodeProperties } from 'n8n-workflow';

export const integrationsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['integrations'],
			},
		},
		options: [
			{
				name: 'Get Apps',
				value: 'getApps',
				description: 'Get list of connected apps and integrations',
				action: 'Get connected apps',
			},
		],
		default: 'getApps',
	},
];

export const integrationsFields: INodeProperties[] = [
	// ----------------------------------------
	//        integrations: getApps
	// ----------------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['integrations'],
				operation: ['getApps'],
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
				resource: ['integrations'],
				operation: ['getApps'],
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
				resource: ['integrations'],
				operation: ['getApps'],
			},
		},
		options: [
			{
				displayName: 'Provider',
				name: 'provider',
				type: 'string',
				default: '',
				description: 'Filter by integration provider',
				placeholder: 'e.g. zapier',
				routing: {
					send: {
						type: 'query',
						property: 'provider',
					},
				},
			},
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				description: 'Search apps by name or description',
				placeholder: 'e.g. analytics',
				routing: {
					send: {
						type: 'query',
						property: 'search',
					},
				},
			},
			{
				displayName: 'Sort Column',
				name: 'sortCol',
				type: 'options',
				options: [
					{
						name: 'Created At',
						value: 'createdAt',
					},
					{
						name: 'Name',
						value: 'name',
					},
					{
						name: 'Provider',
						value: 'provider',
					},
					{
						name: 'Updated At',
						value: 'updatedAt',
					},
				],
				default: 'createdAt',
				description: 'Column to sort by',
				routing: {
					send: {
						type: 'query',
						property: 'sortCol',
					},
				},
			},
			{
				displayName: 'Sort Direction',
				name: 'sortDir',
				type: 'options',
				options: [
					{
						name: 'Ascending',
						value: 'asc',
					},
					{
						name: 'Descending',
						value: 'desc',
					},
				],
				default: 'desc',
				routing: {
					send: {
						type: 'query',
						property: 'sortDir',
					},
				},
			},
		],
	},
];