import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

import { VIRALAPP_BASE_URL_EXPRESSION } from '../nodes/ViralApp/baseUrl';

export class ViralAppApi implements ICredentialType {
	name = 'viralAppApi';
	displayName = 'ViralApp API';
	documentationUrl = 'https://viral.app/api/v1/docs';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Get your API key from viral.app Settings > API Keys',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'x-api-key': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: VIRALAPP_BASE_URL_EXPRESSION,
			url: '/accounts/tracked/count',
			method: 'GET',
		},
	};
}
