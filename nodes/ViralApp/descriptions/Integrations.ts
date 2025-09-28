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
];