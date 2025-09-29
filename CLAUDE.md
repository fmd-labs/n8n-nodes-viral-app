# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a custom n8n community node package for the ViralApp API, providing video analytics for TikTok, Instagram, and YouTube platforms. The package is built as a TypeScript n8n node following n8n's community node conventions.

## Development Commands

### Essential Commands
- `pnpm install` - Install dependencies
- `pnpm build` - Build the TypeScript project and copy icons (`tsc && gulp build:icons`)
- `pnpm dev` - Watch mode for development (`tsc --watch`)
- `pnpm dev:hot` - Hot reload development with n8n (`concurrently "tsc --watch" "N8N_DEV_RELOAD=true n8n start"`)
- `pnpm lint` - Run ESLint
- `pnpm lintfix` - Auto-fix ESLint issues
- `pnpm format` - Format code with Prettier

### Makefile Development Workflow
The project includes a comprehensive Makefile for n8n development:

- `make dev` - Full development setup with hot reload (recommended)
- `make build` - Build project with Node v22 via nvm
- `make link` - Link package to n8n custom directory for testing
- `make start` - Start n8n locally at http://localhost:5678
- `make clean` - Clean build artifacts and node_modules
- `make lint` / `make lintfix` - Linting commands

## Node.js Version

- **Required**: Node.js v22 (specified in `.nvmrc`)
- The Makefile automatically uses nvm to ensure Node v22 is used
- Package manager: pnpm (>=9.1)

## Architecture

### Core Structure
```
nodes/ViralApp/
├── ViralApp.node.ts          # Main node implementation
├── GenericFunctions.ts       # Shared API request functions
├── descriptions/             # Operation definitions for each resource
│   ├── AccountAnalytics.ts
│   ├── VideoAnalytics.ts
│   ├── TrackedAccounts.ts
│   ├── TrackedIndividualVideos.ts
│   ├── Projects.ts
│   ├── Integrations.ts
│   └── GeneralAnalytics.ts
└── viralapp.svg             # Node icon

credentials/
└── ViralAppApi.credentials.ts # API authentication
```

### n8n Node Resources
The ViralApp node supports these resources:
1. **Account Analytics** - Analytics for social media accounts
2. **Video Analytics** - Individual video performance metrics  
3. **Tracked Accounts** - Account management and tracking
4. **Tracked Individual Videos** - Video tracking operations
5. **Projects** - Project management functionality
6. **Integrations** - Third-party integrations
7. **General Analytics** - Aggregated analytics data

### API Integration
- Base URL: `https://viral.app/api/v1`
- Authentication via `viralAppApi` credentials
- Pagination handled automatically in `viralAppApiRequestAllItems()`
- Error handling through n8n's `NodeApiError`

## Development Notes

### TypeScript Configuration
- Target: ES2019
- Strict mode enabled
- Outputs to `dist/` directory
- Includes type declarations and source maps

### ESLint Rules
- Uses n8n-specific ESLint plugin (`eslint-plugin-n8n-nodes-base`)
- Separate configurations for credentials and nodes
- Pre-publish validation with stricter rules

### Build Process
1. TypeScript compilation (`tsc`)
2. Icon copying via Gulp (`gulp build:icons`)
3. ESLint validation before publishing

### Testing with n8n
Use `make dev` for the best development experience:
1. Builds and links the node to n8n's custom directory
2. Starts n8n with hot reload enabled
3. TypeScript watches for changes and recompiles automatically
4. n8n automatically reloads the node on changes

## n8n Programmatic Node Development

### Core Node Structure

Every n8n programmatic node must implement the `INodeType` interface:

```typescript
import {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
    NodeConnectionType,
    IDataObject,
    NodeApiError,
} from 'n8n-workflow';

export class ViralApp implements INodeType {
    description: INodeTypeDescription = {
        // Node metadata and properties
    };
    
    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        // Node execution logic
    }
}
```

### Required Node Properties

**Essential metadata fields:**
```typescript
displayName: 'ViralApp',           // UI display name
name: 'viralApp',                  // Internal name (must match filename)
icon: 'file:viralapp.svg',         // Node icon
group: ['transform'],              // Node category
version: 1,                        // Node version
description: 'Description text',    // Brief description
inputs: [NodeConnectionType.Main], // Input connections
outputs: [NodeConnectionType.Main], // Output connections
credentials: [{                     // Required credentials
    name: 'viralAppApi',
    required: true,
}],
```

### Node Properties Pattern

**Resource and Operation Structure:**
```typescript
properties: [
    {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        options: [{ name: 'Contact', value: 'contact' }],
        default: 'contact',
        noDataExpression: true,
    },
    {
        displayName: 'Operation', 
        name: 'operation',
        type: 'options',
        displayOptions: {           // Conditional display
            show: { resource: ['contact'] }
        },
        options: [{ name: 'Create', value: 'create' }],
        default: 'create',
    },
    {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',         // Groups optional fields
        placeholder: 'Add Field',
        default: {},
        options: [
            { displayName: 'Field Name', name: 'fieldName', type: 'string' }
        ],
    }
]
```

### Execute Method Pattern

**Standard data handling approach:**
```typescript
async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();      // Get input from previous nodes
    const returnData = [];
    
    // Get node parameters (same for all items)
    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;
    
    // Process each input item
    for (let i = 0; i < items.length; i++) {
        // Get item-specific parameters
        const email = this.getNodeParameter('email', i) as string;
        const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
        
        // Make API request with authentication
        try {
            const responseData = await this.helpers.requestWithAuthentication.call(
                this, 'viralAppApi', options
            );
            returnData.push(responseData);
        } catch (error) {
            throw new NodeApiError(this.getNode(), error);
        }
    }
    
    return [this.helpers.returnJsonArray(returnData)];
}
```

### Required Files Structure

**Node Base File** (`nodes/NodeName/NodeName.node.ts`):
- Main node implementation
- Must export class with same name as file
- Implements INodeType interface

**Node Codex File** (`nodes/NodeName/NodeName.node.json`):
```json
{
    "node": "n8n-nodes-base.NodeName",
    "nodeVersion": "1.0",
    "codexVersion": "1.0", 
    "categories": ["Miscellaneous"],
    "resources": {
        "credentialDocumentation": [{"url": ""}],
        "primaryDocumentation": [{"url": ""}]
    }
}
```

**Credentials File** (`credentials/NodeNameApi.credentials.ts`):
```typescript
import {
    IAuthenticateGeneric,
    ICredentialTestRequest, 
    ICredentialType,
    INodeProperties,
} from 'n8n-workflow';

export class NodeNameApi implements ICredentialType {
    name = 'nodeNameApi';
    displayName = 'NodeName API';
    properties: INodeProperties[] = [
        {
            displayName: 'API Key',
            name: 'apiKey',
            type: 'string',
            default: '',
        }
    ];
    
    authenticate: IAuthenticateGeneric = {
        type: 'generic',
        properties: {
            headers: {
                Authorization: '=Bearer {{$credentials.apiKey}}',
            },
        },
    };
    
    test: ICredentialTestRequest = {
        request: {
            baseURL: 'https://api.example.com',
            url: '/test-endpoint',
        },
    };
}
```

### Key Development Rules

1. **File Naming**: Class name must exactly match filename (e.g., `ViralApp` class → `ViralApp.node.ts`)
2. **Input Handling**: Always use `getInputData()` and loop through items to support multiple inputs
3. **Parameter Access**: Use `getNodeParameter(name, itemIndex)` to get user-defined values
4. **Authentication**: Use `this.helpers.requestWithAuthentication.call()` for authenticated requests
5. **Error Handling**: Wrap API calls in try/catch and throw `NodeApiError`
6. **Return Format**: Always return `[this.helpers.returnJsonArray(data)]`

### Package.json Configuration

**Required n8n object:**
```json
{
    "n8n": {
        "n8nNodesApiVersion": 1,
        "credentials": ["dist/credentials/NodeNameApi.credentials.js"],
        "nodes": ["dist/nodes/NodeName/NodeName.node.js"]
    },
    "keywords": ["n8n-community-node-package"]
}
```

## Node File Structure Best Practices

### Required Files and Directories

Every n8n node package must include:

1. **`package.json`** - At project root (required for all npm modules)
2. **`nodes/` directory** - Contains node implementation:
   - **Base file**: `<node-name>.node.ts` (e.g., `ViralApp.node.ts`)
   - **Codex file**: `<node-name>.node.json` (metadata, matches base filename)
   - Additional files and subdirectories as needed
3. **`credentials/` directory** - Contains authentication:
   - **Credentials file**: `<node-name>.credentials.ts` (e.g., `ViralAppApi.credentials.ts`)

### Modular Structure Patterns

**Simple nodes** can place all functionality in the base file, but **complex nodes** should use modular separation:

#### Basic Pattern - Separate Operations
```
nodes/NodeName/
├── NodeName.node.ts          # Base file with imports
├── NodeName.node.json        # Codex metadata
├── operations/               # Operations separated by file
│   ├── create.operation.ts
│   ├── update.operation.ts
│   └── delete.operation.ts
└── descriptions/             # UI descriptions
    ├── Resource1.ts
    └── Resource2.ts
```

#### Advanced Pattern - Resource-Based Structure
```
nodes/NodeName/
├── NodeName.node.ts          # Main node file
├── NodeName.node.json        # Codex file
├── actions/                  # Resource-based organization
│   ├── contacts/
│   │   ├── contacts.resource.ts    # Resource description
│   │   ├── create.operation.ts     # Operation implementation
│   │   ├── update.operation.ts
│   │   └── list.operation.ts
│   └── projects/
│       ├── projects.resource.ts
│       └── get.operation.ts
├── methods/                  # Dynamic parameters (optional)
│   └── loadOptions.ts
└── transport/                # Communication layer
    └── apiRequest.ts
```

#### Operation File Structure
Each operation file should export:
```typescript
export const description: INodeProperties[] = [
    // UI field definitions
];

export async function execute(
    this: IExecuteFunctions,
    index: number,
): Promise<IDataObject> {
    // Operation execution logic
}
```

### Current Project Structure (ViralApp)

This project follows the **descriptions pattern**:
```
nodes/ViralApp/
├── ViralApp.node.ts          # Main node implementation
├── GenericFunctions.ts       # Shared API request functions  
├── descriptions/             # Resource and operation definitions
│   ├── AccountAnalytics.ts   # Resource: Account Analytics
│   ├── VideoAnalytics.ts     # Resource: Video Analytics
│   ├── TrackedAccounts.ts    # Resource: Tracked Accounts
│   ├── TrackedIndividualVideos.ts
│   ├── Projects.ts
│   ├── Integrations.ts
│   └── GeneralAnalytics.ts
└── viralapp.svg             # Node icon

credentials/
└── ViralAppApi.credentials.ts # API authentication
```

### Versioning Structure

For nodes with multiple versions using full versioning:
```
nodes/NodeName/
├── NodeName.node.ts          # Base file (sets default version)
├── v1/
│   ├── NodeName.node.ts      # Version 1 implementation
│   └── actions/              # Version 1 specific code
└── v2/
    ├── NodeName.node.ts      # Version 2 implementation  
    └── actions/              # Version 2 specific code
```

### Multiple Nodes in One Package

You can include multiple nodes in a single npm package:
```
nodes/
├── FirstNode/
│   ├── FirstNode.node.ts
│   └── FirstNode.node.json
├── SecondNode/
│   ├── SecondNode.node.ts
│   └── SecondNode.node.json
└── SharedUtils/
    └── commonFunctions.ts

credentials/
├── FirstNodeApi.credentials.ts
└── SecondNodeApi.credentials.ts
```

### File Naming Conventions

1. **Node base file**: Must match class name exactly (`ViralApp` class → `ViralApp.node.ts`)
2. **Codex file**: Must match base file name (`ViralApp.node.ts` → `ViralApp.node.json`)
3. **Credentials**: Descriptive name ending in `.credentials.ts`
4. **Operations**: Descriptive names with `.operation.ts` suffix
5. **Resources**: Descriptive names with `.resource.ts` suffix

### Best Practice Examples

- **Simple structure**: [HttpBin starter node](https://github.com/n8n-io/n8n-nodes-starter/tree/master/nodes/HttpBin)
- **Complex structure**: [Airtable node](https://github.com/n8n-io/n8n/tree/master/packages/nodes-base/nodes/Airtable)
- **Resource-based**: [Microsoft Outlook node](https://github.com/n8n-io/n8n/tree/master/packages/nodes-base/nodes/Microsoft/Outlook)

## UX Guidelines for Community Nodes

### Credentials

**Security Requirements:**
- API keys and sensitive credentials must always be password fields
- Always include OAuth credentials when available from the service

### Node Structure

#### Required Operations (CRUD Pattern)
Include these **CRUD operations** for each resource type:

- **Create** - Create new resource/entity
- **Create or Update (Upsert)** - Create or update existing
- **Delete** - Remove resource/entity permanently
- **Get** - Retrieve single resource/entity  
- **Get Many** - Retrieve multiple resources with optional filtering/search
- **Update** - Modify existing resource/entity

#### UI Components
- **Use Resource Locator component** whenever possible for better UX
- **Default option** for Resource Locator should be `From list` (if available)
- **Maintain consistency** with existing n8n nodes and patterns
- **Add sorting options** for "Get Many" operations in dedicated collection below "Options"

### Node Functionality

#### Delete Operations
When deleting items, return standardized confirmation:
```json
{"deleted": true}
```

#### Output Field Management

**Normal Nodes** - Use "Simplify" parameter for endpoints with >10 fields:
```typescript
{
    displayName: 'Simplify',
    name: 'simplify',
    type: 'boolean',
    default: false,
    description: 'Whether to return a simplified version of the response instead of the raw data',
}
```

**AI Tool Nodes** - Use "Output" parameter with 3 modes:
- **Simplified** - Max 10 most useful fields
- **Raw** - All available fields  
- **Selected fields** - Multi-option parameter for field selection

### Copy and Text Guidelines

#### Text Case Rules
- **Title Case**: Node names, parameter display names, dropdown titles
- **Sentence case**: Node actions, descriptions, parameter descriptions, hints, dropdown descriptions

#### Terminology Guidelines
1. **Use service terminology** - Match the third-party service's language
2. **Use UI terminology** - Follow the service's UI, not API documentation  
3. **No tech jargon** - Use simple words ("field" not "key")
4. **Consistent naming** - Choose one term and stick to it

#### Placeholder Examples
Always start with "e.g." and use camelCase:
- Image: `e.g. https://example.com/image.png`
- Video: `e.g. https://example.com/video.mp4`
- Search: `e.g. automation`
- Email: `e.g. nathan@example.com`
- Username: `e.g. n8n`
- Full name: `e.g. Nathan Smith`
- First name: `e.g. Nathan`
- Last name: `e.g. Smith`

### Operations Naming Convention

#### Operation Name (Title Case)
Displayed in select when node is open on canvas:
- **Don't repeat resource** if resource selection is above
- **Specify resource** if no resource selection exists
- **Specify object** if operation acts on entity within resource

Examples:
- `Delete` (when Sheet resource is selected above)
- `Delete Records` (when no resource selection)
- `Get Columns` (when operating on columns within Table resource)

#### Operation Action (Sentence case)  
Displayed in node selection panel:
- **Omit articles** (a, an, the)
- **Repeat the resource** for clarity
- **Specify object** if not the resource

Examples:
- `Update row in sheet`
- `Append rows to sheet`
- `Get columns from table`

#### Operation Description (Sentence case)
Subtext below name in canvas selection:
- **Add more information** than operation name
- **Use alternative wording** to aid understanding

Examples:
- `Retrieve a list of users`
- `Delete a record permanently`
- `Insert rows into a sheet`

### CRUD Vocabulary Standards

- **Clear**: `Delete all the <CHILD_ELEMENT>s inside the <RESOURCE>`
- **Create**: `Create a new <RESOURCE>`
- **Create or Update**: `Create a new <RESOURCE> or update an existing one (upsert)`
- **Delete**: `Delete a <RESOURCE> permanently` / `Delete a <CHILD_ELEMENT> permanently`
- **Get**: `Retrieve a <RESOURCE>` / `Retrieve a <CHILD_ELEMENT> from the/a <RESOURCE>`
- **Get Many**: `Retrieve a list of <RESOURCE>s` / `List all <CHILD_ELEMENT>s in the/a <RESOURCE>`
- **Insert/Append**: `Insert <CHILD_ELEMENT>(s) in a <RESOURCE>` (use "insert" for databases)
- **Insert or Update**: `Insert <CHILD_ELEMENT>(s) or update an existing one(s) (upsert)`
- **Update**: `Update one or more <RESOURCE>s` / `Update <CHILD_ELEMENT>(s) inside a <RESOURCE>`

### Error Handling

#### Error Philosophy
Always tell users:
1. **What happened** - Clear description of the error
2. **How to solve** - Guide them to success, don't leave them blocked

#### Error Message Structure
**Error Message** (what happened):
- Include parameter `displayName` that triggered error
- Add item index: `[Item X]` if applicable
- Avoid words like "error", "problem", "failure", "mistake"

**Error Description** (how to solve):
- Explain how to solve the problem
- Guide users to next steps
- Provide specific configuration changes needed
- Avoid negative words

#### Boolean Descriptions
Start boolean parameter descriptions with "Whether...":
```typescript
description: 'Whether to return a simplified version of the response instead of the raw data'
```

#### Parameter References
Wrap parameter/field names in single quotes when referencing in copy:
```
"Please fill the 'name' parameter"
```

## Error Handling in n8n Nodes

Proper error handling is crucial for creating robust n8n nodes that provide clear feedback when things go wrong. n8n provides two specialized error classes for different types of failures:

### NodeApiError

Use `NodeApiError` for **external API calls and HTTP requests**:
- HTTP request failures
- External API errors  
- Authentication/authorization failures
- Rate limiting errors
- Service unavailable errors

**Basic pattern:**
```typescript
import { NodeApiError } from 'n8n-workflow';

try {
    const response = await this.helpers.requestWithAuthentication.call(
        this,
        credentialType,
        options
    );
    return response;
} catch (error) {
    throw new NodeApiError(this.getNode(), error as JsonObject);
}
```

**Handle specific HTTP status codes:**
```typescript
try {
    const response = await this.helpers.requestWithAuthentication.call(
        this,
        credentialType,
        options
    );
    return response;
} catch (error) {
    if (error.httpCode === "404") {
        const resource = this.getNodeParameter("resource", 0) as string;
        const errorOptions = {
            message: `${resource.charAt(0).toUpperCase() + resource.slice(1)} not found`,
            description: "The requested resource could not be found. Please check your input parameters.",
        };
        throw new NodeApiError(this.getNode(), error as JsonObject, errorOptions);
    }

    if (error.httpCode === "401") {
        throw new NodeApiError(this.getNode(), error as JsonObject, {
            message: "Authentication failed",
            description: "Please check your credentials and try again.",
        });
    }

    throw new NodeApiError(this.getNode(), error as JsonObject);
}
```

### NodeOperationError

Use `NodeOperationError` for **operational and validation errors**:
- Input validation failures
- Missing required parameters
- Data transformation errors
- Configuration issues
- Workflow logic errors

**Input validation pattern:**
```typescript
import { NodeOperationError } from 'n8n-workflow';

const email = this.getNodeParameter("email", itemIndex) as string;

if (email.indexOf("@") === -1) {
    const description = `The email address '${email}' in the 'email' field isn't valid`;
    throw new NodeOperationError(this.getNode(), "Invalid email address", {
        description,
        itemIndex, // Links error to specific item
    });
}
```

**Multiple items processing with error handling:**
```typescript
for (let i = 0; i < items.length; i++) {
    try {
        // Process item
        const result = await processItem(items[i]);
        returnData.push(result);
    } catch (error) {
        if (this.continueOnFail()) {
            returnData.push({
                json: { error: error.message },
                pairedItem: { item: i },
            });
            continue;
        }

        throw new NodeOperationError(this.getNode(), error as Error, {
            description: error.description,
            itemIndex: i,
        });
    }
}
```

### Error Message Best Practices

**Always provide:**
1. **What happened** - Clear description of the error
2. **How to solve** - Guide users to resolution

**Error message structure:**
```typescript
throw new NodeOperationError(this.getNode(), "Clear error title", {
    message: "What went wrong",
    description: "How to fix it - specific steps or configuration changes needed",
    itemIndex: i, // When processing multiple items
});
```

**Avoid these words in error messages:**
- "error", "problem", "failure", "mistake"

**Include context:**
- Parameter names that caused the error
- Item index for multiple item processing
- Specific values that were invalid

## HTTP Request Helpers

n8n provides flexible helpers for making HTTP requests that abstract away most of the complexity. These are essential for communicating with external APIs in your nodes.

### Basic Usage

**Without Authentication:**
```typescript
const response = await this.helpers.httpRequest(options);
```

**With Authentication:**
```typescript
const response = await this.helpers.httpRequestWithAuthentication.call(
    this, 
    'credentialTypeName', // e.g., 'viralAppApi'
    options,
);
```

### Request Options

The `options` object supports these properties:

```typescript
interface IHttpRequestOptions {
    url: string;                    // Required: API endpoint URL
    headers?: object;               // Custom headers
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD';
    body?: FormData | Array | string | number | object | Buffer | URLSearchParams;
    qs?: object;                    // Query string parameters
    arrayFormat?: 'indices' | 'brackets' | 'repeat' | 'comma';
    auth?: {                        // Basic auth (use credentials instead)
        username: string,
        password: string,
    };
    disableFollowRedirect?: boolean;
    encoding?: 'arraybuffer' | 'blob' | 'document' | 'json' | 'text' | 'stream';
    skipSslCertificateValidation?: boolean;
    returnFullResponse?: boolean;   // Return headers, status code, etc.
    proxy?: {
        host: string;
        port: string | number;
        auth?: { username: string; password: string; },
        protocol?: string;
    };
    timeout?: number;               // Request timeout in milliseconds
    json?: boolean;                 // Automatically parse JSON response
}
```

### Common Patterns

#### JSON API Requests
```typescript
const options: IHttpRequestOptions = {
    url: `${baseUrl}/api/v1/endpoint`,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    body: {
        name: 'example',
        value: 123,
    },
    json: true,
};

const response = await this.helpers.httpRequestWithAuthentication.call(
    this,
    'viralAppApi',
    options,
);
```

#### Query Parameters
```typescript
const options: IHttpRequestOptions = {
    url: `${baseUrl}/api/v1/search`,
    method: 'GET',
    qs: {
        query: 'search term',
        limit: 50,
        tags: ['tag1', 'tag2'], // Array handling
    },
    arrayFormat: 'repeat', // tags=tag1&tags=tag2
};
```

#### File Upload with FormData
```typescript
const formData = new FormData();
formData.append('file', buffer, 'filename.txt');
formData.append('description', 'File description');

const options: IHttpRequestOptions = {
    url: `${baseUrl}/api/v1/upload`,
    method: 'POST',
    body: formData,
    // Content-Type header automatically set to multipart/form-data
};
```

#### URL-Encoded Form Data
```typescript
const formData = new URLSearchParams();
formData.append('username', 'user');
formData.append('password', 'pass');

const options: IHttpRequestOptions = {
    url: `${baseUrl}/api/v1/login`,
    method: 'POST',
    body: formData,
    // Content-Type header automatically set to application/x-www-form-urlencoded
};
```

#### Full Response with Headers
```typescript
const options: IHttpRequestOptions = {
    url: `${baseUrl}/api/v1/data`,
    method: 'GET',
    returnFullResponse: true,
};

const response = await this.helpers.httpRequest(options);
// Returns: { body: data, headers: {}, statusCode: 200, statusMessage: 'OK' }
```

### Array Format Options

When query strings contain arrays, use `arrayFormat` to control formatting:

```typescript
const qs = { IDs: [15, 17] };

// 'indices' (default): IDs[0]=15&IDs[1]=17
// 'brackets': IDs[]=15&IDs[]=17  
// 'repeat': IDs=15&IDs=17
// 'comma': IDs=15,17
```

### Error Handling with HTTP Requests

Always wrap HTTP requests in try/catch blocks:

```typescript
try {
    const options: IHttpRequestOptions = {
        url: `${baseUrl}/api/v1/endpoint`,
        method: 'GET',
        json: true,
    };
    
    const response = await this.helpers.httpRequestWithAuthentication.call(
        this,
        'viralAppApi', 
        options,
    );
    
    return response;
} catch (error) {
    // Handle specific HTTP status codes
    if (error.httpCode === '404') {
        throw new NodeApiError(this.getNode(), error as JsonObject, {
            message: 'Resource not found',
            description: 'The requested resource could not be found. Please check the ID and try again.',
        });
    }
    
    if (error.httpCode === '401') {
        throw new NodeApiError(this.getNode(), error as JsonObject, {
            message: 'Authentication failed',
            description: 'Please check your API credentials in the node configuration.',
        });
    }
    
    // Generic API error
    throw new NodeApiError(this.getNode(), error as JsonObject);
}
```

### ViralApp Project Examples

Based on this project's GenericFunctions.ts:

```typescript
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
```

### Best Practices

1. **Always use authentication helper** when credentials are required
2. **Set appropriate Content-Type headers** for your request body type
3. **Handle errors gracefully** with specific messages for common HTTP status codes
4. **Use `json: true`** for JSON APIs to automatically parse responses
5. **Remove body for GET requests** to avoid issues with some APIs
6. **Use query parameters (`qs`)** instead of manually building URLs
7. **Set reasonable timeouts** for external API calls
8. **Validate response data** before processing in your node logic

### Migration from Legacy Helper

If migrating from older n8n versions:

- Use `url` instead of `uri`
- Use `encoding: 'arraybuffer'` instead of `encoding: null`
- Use `skipSslCertificateValidation: true` instead of `rejectUnauthorized: false`
- Use `returnFullResponse` instead of `resolveWithFullResponse`

## Node User Interface Elements

n8n provides a comprehensive set of predefined UI components for building user-friendly node interfaces. All UI elements share common properties and follow consistent patterns.

### Common Properties

All UI elements support these base properties:

```typescript
interface BaseNodeProperty {
    displayName: string;           // Label shown to users
    name: string;                  // Internal reference name
    type: string;                  // UI element type
    required?: boolean;            // Whether field is required
    default: any;                  // Default value
    description?: string;          // Help text for users
    displayOptions?: {             // Conditional display logic
        show?: {
            resource?: string[];
            operation?: string[];
            [key: string]: string[];
        };
        hide?: {
            resource?: string[];
            operation?: string[];
            [key: string]: string[];
        };
    };
    placeholder?: string;          // Placeholder text
    hint?: string;                 // Help text below field
    noDataExpression?: boolean;    // Disable expression support
}
```

### String

Basic text input field:

```typescript
{
    displayName: 'Name',
    name: 'name',
    type: 'string',
    required: true,
    default: 'n8n',
    description: 'The name of the user',
    placeholder: 'Enter a name',
    displayOptions: {
        show: {
            resource: ['contact'],
            operation: ['create']
        }
    },
}
```

**Password field variation:**
```typescript
{
    displayName: 'Password',
    name: 'password',
    type: 'string',
    required: true,
    typeOptions: {
        password: true,
    },
    default: '',
    description: "User's password",
}
```

**Multi-line text field:**
```typescript
{
    displayName: 'Description',
    name: 'description',
    type: 'string',
    typeOptions: {
        rows: 4,
    },
    default: '',
    description: 'Multi-line description text',
}
```

**Support for drag and drop data keys:**
```typescript
{
    displayName: 'Field Name',
    name: 'fieldName',
    type: 'string',
    requiresDataPath: 'single',    // For single string values
    default: '',
}

{
    displayName: 'Field Names',
    name: 'fieldNames',
    type: 'string',
    requiresDataPath: 'multiple',  // For comma-separated list
    default: '',
}
```

### Number

Numeric input with validation and formatting:

```typescript
{
    displayName: 'Amount',
    name: 'amount',
    type: 'number',
    required: true,
    typeOptions: {
        maxValue: 10,
        minValue: 0,
        numberPrecision: 2,
    },
    default: 10.00,
    description: 'Your current amount',
}
```

### Boolean

Toggle switch for true/false values:

```typescript
{
    displayName: 'Wait for Image',
    name: 'waitForImage',
    type: 'boolean',
    default: true,
    description: 'Whether to wait for the image or not',
}
```

### Options

Single-selection dropdown:

```typescript
{
    displayName: 'Resource',
    name: 'resource',
    type: 'options',
    options: [
        {
            name: 'Image',
            value: 'image',
        },
        {
            name: 'Template',
            value: 'template',
        },
    ],
    default: 'image',
    description: 'Resource to consume',
    noDataExpression: true,
}
```

### Multi-Options

Multi-selection dropdown:

```typescript
{
    displayName: 'Events',
    name: 'events',
    type: 'multiOptions',
    options: [
        {
            name: 'Plan Created',
            value: 'planCreated',
        },
        {
            name: 'Plan Deleted',
            value: 'planDeleted',
        },
    ],
    default: [],
    description: 'The events to be monitored',
}
```

### Collection

Groups optional fields under a collapsible section:

```typescript
{
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    options: [
        {
            displayName: 'Type',
            name: 'type',
            type: 'options',
            options: [
                { name: 'Automated', value: 'automated' },
                { name: 'Past', value: 'past' },
                { name: 'Upcoming', value: 'upcoming' },
            ],
            default: '',
        },
        {
            displayName: 'Priority',
            name: 'priority',
            type: 'number',
            default: 1,
        },
    ],
}
```

### Fixed Collection

Groups semantically related fields with multiple value support:

```typescript
{
    displayName: 'Metadata',
    name: 'metadataUi',
    placeholder: 'Add Metadata',
    type: 'fixedCollection',
    typeOptions: {
        multipleValues: true,
    },
    default: {},
    options: [
        {
            name: 'metadataValues',
            displayName: 'Metadata',
            values: [
                {
                    displayName: 'Name',
                    name: 'name',
                    type: 'string',
                    default: '',
                    description: 'Name of the metadata key to add',
                },
                {
                    displayName: 'Value',
                    name: 'value',
                    type: 'string',
                    default: '',
                    description: 'Value to set for the metadata key',
                },
            ],
        },
    ],
}
```

### DateTime

Date and time picker:

```typescript
{
    displayName: 'Modified Since',
    name: 'modified_since',
    type: 'dateTime',
    default: '',
    description: 'The date and time when the file was last modified',
}
```

### Color

Color selector with color picker:

```typescript
{
    displayName: 'Background Color',
    name: 'backgroundColor',
    type: 'color',
    default: '#ffffff',
    description: 'Background color for the element',
}
```

### JSON

JSON editor with syntax highlighting:

```typescript
{
    displayName: 'Content (JSON)',
    name: 'content',
    type: 'json',
    default: '{}',
    description: 'JSON content to process',
}
```

### HTML

HTML editor with syntax highlighting:

```typescript
{
    displayName: 'HTML Template',
    name: 'html',
    type: 'string',
    typeOptions: {
        editor: 'htmlEditor',
    },
    default: '<p>Hello World</p>',
    noDataExpression: true,
    description: 'HTML template to render',
}
```

### Resource Locator

Provides multiple ways to identify external resources:

```typescript
{
    displayName: 'Card',
    name: 'cardId',
    type: 'resourceLocator',
    default: { mode: 'list', value: '' },
    required: true,
    description: 'The card to operate on',
    modes: [
        {
            displayName: 'ID',
            name: 'id',
            type: 'string',
            hint: 'Enter card ID',
            validation: [
                {
                    type: 'regex',
                    properties: {
                        regex: '^[0-9a-f]{24}$',
                        errorMessage: 'Invalid card ID format',
                    },
                },
            ],
            placeholder: '507f1f77bcf86cd799439011',
            url: '=https://api.example.com/cards/{{$value}}',
        },
        {
            displayName: 'URL',
            name: 'url',
            type: 'string',
            hint: 'Enter card URL',
            validation: [
                {
                    type: 'regex',
                    properties: {
                        regex: '^https://example\\.com/card/',
                        errorMessage: 'Invalid card URL',
                    },
                },
            ],
            placeholder: 'https://example.com/card/12345',
            extractValue: {
                type: 'regex',
                regex: 'example\\.com/card/([^/]+)',
            },
        },
        {
            displayName: 'List',
            name: 'list',
            type: 'list',
            typeOptions: {
                searchListMethod: 'searchCards',
                searchable: true,
                searchFilterRequired: false,
            },
        },
    ],
}
```

### Resource Mapper

Advanced mapping component for data transformation:

```typescript
{
    displayName: 'Columns',
    name: 'columns',
    type: 'resourceMapper',
    required: true,
    default: {
        mappingMode: 'defineBelow',
        value: null,
    },
    typeOptions: {
        resourceMapper: {
            resourceMapperMethod: 'getMappingColumns',
            mode: 'update',
            fieldWords: {
                singular: 'column',
                plural: 'columns',
            },
            addAllFields: true,
            multiKeyMatch: true,
            supportAutoMap: true,
            matchingFieldsLabels: {
                title: 'Matching Columns',
                description: 'Select columns to match records for updating',
                hint: 'At least one matching column is required',
            },
        },
    },
}
```

### Assignment Collection

Drag-and-drop component for field assignments:

```typescript
{
    displayName: 'Fields to Set',
    name: 'assignments',
    type: 'assignmentCollection',
    default: {},
    description: 'Fields to set on the record',
}
```

### Filter

Advanced filtering component:

```typescript
{
    displayName: 'Conditions',
    name: 'conditions',
    placeholder: 'Add Condition',
    type: 'filter',
    default: {},
    typeOptions: {
        filter: {
            caseSensitive: '={{!$parameter.options.ignoreCase}}',
            typeValidation: '={{$parameter.options.looseTypeValidation ? "loose" : "strict"}}',
        },
    },
},
{
    displayName: 'Options',
    name: 'options',
    type: 'collection',
    placeholder: 'Add option',
    default: {},
    options: [
        {
            displayName: 'Ignore Case',
            name: 'ignoreCase',
            type: 'boolean',
            default: true,
            description: 'Whether to ignore letter case when evaluating conditions',
        },
        {
            displayName: 'Less Strict Type Validation',
            name: 'looseTypeValidation',
            type: 'boolean',
            default: true,
            description: 'Whether to try casting value types based on the selected operator',
        },
    ],
}
```

### Notice

Display informational messages:

```typescript
{
    displayName: 'This operation will modify existing data. Make sure you have proper backups.',
    name: 'notice',
    type: 'notice',
    default: '',
}
```

### Hints

**Parameter hints** (below field):
```typescript
{
    displayName: 'URL',
    name: 'url',
    type: 'string',
    hint: 'Enter a valid URL starting with http:// or https://',
    default: '',
}
```

**Node hints** (in node description):
```typescript
// In your node description
description: INodeTypeDescription = {
    // ... other properties
    hints: [
        {
            message: 'This node processes large amounts of data. Consider enabling <b>Execute Once</b> in the node settings.',
            type: 'info',                    // 'info' | 'warning' | 'danger'
            location: 'outputPane',          // 'inputPane' | 'outputPane' | 'ndv'
            whenToDisplay: 'beforeExecution', // 'always' | 'beforeExecution' | 'afterExecution'
            displayCondition: '={{ $parameter["operation"] === "select" && $input.all().length > 1 }}'
        }
    ]
};
```

**Dynamic hints** (programmatic nodes):
```typescript
// In execute method
if (operation === 'select' && items.length > 1 && !node.executeOnce) {
    return new NodeExecutionOutput(
        [returnData],
        [
            {
                message: `This node ran ${items.length} times. To run once, enable <b>Execute once</b> in settings.`,
                location: 'outputPane',
                type: 'info',
            },
        ],
    );
}
```

### UI Best Practices

1. **Use appropriate UI types** for data types (boolean for toggles, options for enums)
2. **Provide clear descriptions** and helpful placeholder text  
3. **Use collections** for optional/advanced fields
4. **Implement validation** for required formats (emails, URLs, IDs)
5. **Add hints** for complex operations or important warnings
6. **Use resource locators** when users need to select external resources
7. **Group related fields** with fixed collections
8. **Support expressions** unless `noDataExpression: true` is needed