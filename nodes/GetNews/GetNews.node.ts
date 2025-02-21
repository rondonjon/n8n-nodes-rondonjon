import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';
import {
	API_BASE_URL,
	DOCUMENTATION_URL,
	NAME,
	PROPERTY_API_KEY,
} from '../../credentials/NewsApi.credentials';

const PARAM_QUERY = 'query';
const PARAM_SEARCHINTITLE = 'searchInTitle';
const PARAM_SEARCHINDESCRIPTION = 'searchInDescription';
const PARAM_SEARCHINCONTENT = 'searchInContent';
const PARAM_SOURCES = 'sources';
const PARAM_DESTINATIONKEY = 'destinationKey';
const PARAM_DOMAINS = 'domains';
const PARAMS_EXCLUDEDDOMAINS = 'excludedDomains';
const PARAM_PAGESIZE = 'pageSize';
const PARAM_PAGENUMBER = 'pageNumber';

/**
 * Gets the latest news from newsapi.org using the credentials from `NewsApi`.
 */
export class GetNews implements INodeType {
	description: INodeTypeDescription = {
		credentials: [
			{
				name: NAME,
				required: true,
			},
		],
		defaults: {
			name: 'Get News',
		},
		displayName: 'Get News',
		description: 'Gets the latest news from newsapi.org',
		documentationUrl: DOCUMENTATION_URL,
		group: ['transform'],
		icon: 'file:GetNews.svg',
		// eslint-disable-next-line n8n-nodes-base/node-class-description-inputs-wrong-regular-node
		inputs: [NodeConnectionType.Main],
		name: 'rondonjonGetNews',
		// eslint-disable-next-line n8n-nodes-base/node-class-description-outputs-wrong
		outputs: [NodeConnectionType.Main],
		properties: [
			{
				displayName: 'Query',
				default: undefined,
				description: 'Free-text query to search for news',
				name: PARAM_QUERY,
				type: 'string',
			},
			{
				displayName: 'Search in Title',
				default: true,
				description: 'Whether to search in the title of the news (if query is provided)',
				name: PARAM_SEARCHINTITLE,
				type: 'boolean',
			},
			{
				displayName: 'Search in Description',
				default: true,
				description: 'Whether to search in the description of the news (if query is provided)',
				name: PARAM_SEARCHINDESCRIPTION,
				type: 'boolean',
			},
			{
				displayName: 'Search in Content',
				default: true,
				description: 'Whether to search in the content of the news (if query is provided)',
				name: PARAM_SEARCHINCONTENT,
				type: 'boolean',
			},
			{
				displayName: 'Sources',
				default: undefined,
				description:
					'Comma-separated list of sources to get news from (see newsapi.org for available sources)',
				name: PARAM_SOURCES,
				type: 'string',
			},
			{
				displayName: 'Domains',
				default: undefined,
				description:
					'Comma-separated list of domains to get news from (e.g. bbc.co.uk, techcrunch.com, engadget.com)',
				name: PARAM_DOMAINS,
				type: 'string',
			},
			{
				displayName: 'Excluded Domains',
				default: undefined,
				description:
					'Comma-separated list of domains to exclude news from (e.g. bbc.co.uk, techcrunch.com, engadget.com)',
				name: PARAMS_EXCLUDEDDOMAINS,
				type: 'string',
			},
			{
				displayName: 'Page Size',
				default: 100,
				description:
					'The number of results to return per page (default 100, minimum 1, maximum 100)',
				name: PARAM_PAGESIZE,
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 100,
					numberPrecision: 0,
				},
			},
			{
				displayName: 'Page Number',
				default: 1,
				description: 'The page number to get (default 1, minimum 1)',
				name: PARAM_PAGENUMBER,
				type: 'number',
				typeOptions: {
					minValue: 1,
					numberPrecision: 0,
				},
			},
			{
				displayName: 'Destination Key',
				name: PARAM_DESTINATIONKEY,
				type: 'string',
				default: undefined,
				description: 'The key to which the newsapi.org response will be written (default: "news")',
			},
		],
		version: 1,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const credentials = await this.getCredentials(NAME);
		const apiKey = credentials[PROPERTY_API_KEY] as string;
		const items = this.getInputData();

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const item = items[itemIndex];

				const query = (this.getNodeParameter(PARAM_QUERY, itemIndex, '') as string).trim();

				const searchInTitle = this.getNodeParameter(
					PARAM_SEARCHINTITLE,
					itemIndex,
					true,
				) as boolean;

				const searchInContent = this.getNodeParameter(
					PARAM_SEARCHINCONTENT,
					itemIndex,
					true,
				) as boolean;

				const searchInDescription = this.getNodeParameter(
					PARAM_SEARCHINDESCRIPTION,
					itemIndex,
					true,
				) as boolean;

				const sources = (this.getNodeParameter(PARAM_SOURCES, itemIndex, '') as string).trim();

				const domains = (this.getNodeParameter(PARAM_DOMAINS, itemIndex, '') as string).trim();

				const excludedDomains = (
					this.getNodeParameter(PARAMS_EXCLUDEDDOMAINS, itemIndex, '') as string
				).trim();

				const page = this.getNodeParameter(PARAM_PAGENUMBER, itemIndex, 1) as number;

				const pageSize = this.getNodeParameter(PARAM_PAGESIZE, itemIndex, 100) as number;

				const destinationKey = (
					this.getNodeParameter(PARAM_DESTINATIONKEY, itemIndex, 'news') as string
				).trim();

				const url = new URL('/v2/everything', API_BASE_URL);
				const { searchParams } = url;

				searchParams.set('apiKey', apiKey);
				searchParams.set('page', page.toString());
				searchParams.set('pageSize', pageSize.toString());
				searchParams.set('sortBy', 'publishedAt');

				if (sources) {
					searchParams.set('sources', sources);
				}

				if (domains) {
					searchParams.set('domains', domains);
				}

				if (excludedDomains) {
					searchParams.set('excludedDomains', excludedDomains);
				}

				if (query) {
					searchParams.set('q', query);

					const searchIn = [
						searchInTitle && 'title',
						searchInContent && 'content',
						searchInDescription && 'description',
					].filter(Boolean) as string[];

					if (searchIn.length) {
						searchParams.set('searchIn', searchIn.join(','));
					}
				}

				const timeBefore = Date.now();
				let status: number;
				let statusText: string;
				let data: unknown;

				try {
					const response = await fetch(url);
					data = await response.json();
					status = response.status;
					statusText = response.statusText;
				} catch (error) {
					throw new NodeOperationError(this.getNode(), `newsapi.org HTTP request failed: ${error}`);
				}

				if (status !== 200) {
					throw new NodeOperationError(
						this.getNode(),
						`newsapi.org HTTP request failed: ${statusText}`,
					);
				}

				item.json[destinationKey] = {
					data,
					durationMillis: Date.now() - timeBefore,
					page,
					pageSize,
					status,
					statusText,
				};
			} catch (error) {
				if (this.continueOnFail()) {
					items.push({
						json: this.getInputData(itemIndex)[0].json,
						error,
						pairedItem: itemIndex,
					});
				} else {
					if (error.context) {
						error.context.itemIndex = itemIndex;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex,
					});
				}
			}
		}

		return [items];
	}
}
