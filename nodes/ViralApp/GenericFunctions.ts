import {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IDataObject,
	IHttpRequestOptions,
	IHttpRequestMethods,
	NodeApiError,
	JsonObject,
} from 'n8n-workflow';

/**
 * Make an authenticated API request to ViralApp
 */
export async function viralAppApiRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: any = {},
	query: IDataObject = {},
): Promise<any> {
	// Ensure body is always a valid object for POST requests, never undefined or null
	if (method === 'POST') {
		if (!body || (typeof body === 'object' && Object.keys(body).length === 0)) {
			// Explicitly set an empty object that won't be stripped
			body = {};
		}
	}
	
	const options: IHttpRequestOptions = {
		method,
		url: `https://viral.app/api/v1${endpoint}`,
		body,
		qs: query,
		json: true,
		headers: {},
	};

	// Remove body for GET requests only
	if (method === 'GET') {
		delete options.body;
	}
	
	// For POST requests with empty body, ensure Content-Type is set and body is properly formatted
	// This applies to all export endpoints that might receive empty filters
	if (method === 'POST' && (endpoint === '/videos/export' || endpoint === '/accounts/export' || endpoint === '/analytics/video-daily-gains/export')) {
		// Force set headers to ensure proper content type
		(options.headers as IDataObject)['Content-Type'] = 'application/json';
		// If body is empty, explicitly stringify it
		if (Object.keys(body).length === 0) {
			options.body = JSON.stringify({});
			options.json = false; // Since we're manually stringifying
		}
	}

	try {
		const response = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'viralAppApi',
			options,
		);
		
		return response;
	} catch (error) {
		if (error.httpCode === '404') {
			throw new NodeApiError(this.getNode(), error as JsonObject, {
				message: 'Resource not found',
				description: 'The requested resource could not be found. Please check the ID and try again.',
			});
		}
		
		if (error.httpCode === '401') {
			throw new NodeApiError(this.getNode(), error as JsonObject, {
				message: 'Authentication failed',
				description: 'Please check your API key in the credentials.',
			});
		}
		
		if (error.httpCode === '429') {
			throw new NodeApiError(this.getNode(), error as JsonObject, {
				message: 'Rate limit exceeded',
				description: 'Too many requests. Please wait a moment and try again.',
			});
		}
		
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

/**
 * Make an authenticated API request and return all items (handles pagination)
 */
export async function viralAppApiRequestAllItems(
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: any = {},
	query: IDataObject = {},
): Promise<IDataObject[]> {
	const returnData: IDataObject[] = [];
	let responseData;

	// Set pagination parameters
	query.page = 1;
	query.perPage = 100; // Max items per page

	do {
		responseData = await viralAppApiRequest.call(this, method, endpoint, body, query);

		// Extract data array from response
		if (responseData.data && Array.isArray(responseData.data)) {
			returnData.push(...responseData.data);
		}

		// Increment page for next request
		query.page = (query.page as number) + 1;

		// Continue if there are more pages
	} while (
		responseData.pageCount &&
		responseData.pageCount >= query.page
	);

	return returnData;
}