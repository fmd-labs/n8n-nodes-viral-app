import {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IDataObject,
	IHttpRequestOptions,
	IHttpRequestMethods,
	NodeApiError,
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
	const options: IHttpRequestOptions = {
		method,
		url: `https://viral.app/api/v1${endpoint}`,
		body,
		qs: query,
		json: true,
	};

	// Remove empty body for GET requests
	if (method === 'GET') {
		delete options.body;
	}

	try {
		return await this.helpers.httpRequestWithAuthentication.call(
			this,
			'viralAppApi',
			options,
		);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error);
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