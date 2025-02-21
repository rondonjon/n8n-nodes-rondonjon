import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';
import {
	DOCUMENTATION_URL,
	NAME,
	PROPERTY_AUTH,
	PROPERTY_CX,
} from '../../credentials/GoogleCustomSearchApi.credentials';
import { customsearch } from '@googleapis/customsearch';

const PARAM_QUERY = 'query';
const PARAM_DESTINATIONKEY = 'destinationKey';
const PARAM_CR = 'cr';
const PARAM_EXACTTERMS = 'exactTerms';
const PARAM_EXCLUDETERMS = 'excludeTerms';
const PARAM_FILETYPE = 'fileType';
const PARAM_PAGESIZE = 'pageSize';
const PARAM_PAGEINDEX = 'pageIndex';

type Result = {
	title: string;
	link: string;
	snippet: string;
};

/**
 * Searches and returns the results using the Google Custom Search API.
 */
export class GoogleCustomSearch implements INodeType {
	description: INodeTypeDescription = {
		credentials: [
			{
				name: NAME,
				required: true,
			},
		],
		defaults: {
			name: 'Google Custom Search',
		},
		displayName: 'Google Custom Search',
		description: 'Searches and returns the results using the Google Custom Search API',
		documentationUrl: DOCUMENTATION_URL,
		group: ['transform'],
		icon: 'file:GoogleCustomSearch.svg',
		// eslint-disable-next-line n8n-nodes-base/node-class-description-inputs-wrong-regular-node
		inputs: [NodeConnectionType.Main],
		name: 'rondonjonGoogleCustomSearch',
		// eslint-disable-next-line n8n-nodes-base/node-class-description-outputs-wrong
		outputs: [NodeConnectionType.Main],
		properties: [
			{
				displayName: 'Query',
				name: PARAM_QUERY,
				type: 'string',
				default: undefined,
				required: true,
				description: 'The search query',
			},
			{
				displayName: 'Page Size',
				name: PARAM_PAGESIZE,
				type: 'number',
				default: 10,
				required: true,
				description:
					'The number of search results per page (default 10, minimum 1, maximum 10). Note that the API provides a maximum of 100 results in total.',
				typeOptions: {
					maxValue: 10,
					minValue: 1,
					numberPrecision: 0,
				},
			},
			{
				displayName: 'Page Index',
				name: PARAM_PAGEINDEX,
				type: 'number',
				default: 1,
				required: true,
				description:
					'The index of the page to return (default 1, minimum 1). Note that the API provides a maximum of 100 results in total.',
				typeOptions: {
					minValue: 1,
					numberPrecision: 0,
				},
			},
			{
				displayName: 'Country Restriction',
				name: PARAM_CR,
				type: 'string',
				default: undefined,
				description:
					'Restricts the search to documents in the specified country. See https://developers.google.com/custom-search/docs/json_api_reference#countryCollections for more information.',
			},
			{
				displayName: 'Exact Terms',
				name: PARAM_EXACTTERMS,
				type: 'string',
				default: undefined,
				description: 'A phrase that all documents in the search results must contain',
			},
			{
				displayName: 'Exclude Terms',
				name: PARAM_EXCLUDETERMS,
				type: 'string',
				default: undefined,
				description:
					'A word or phrase that should not appear in any documents in the search results',
			},
			{
				displayName: 'File Type',
				name: PARAM_FILETYPE,
				type: 'string',
				default: undefined,
				description:
					'List of file types indexable by Google. See https://support.google.com/webmasters/answer/35287 for more information.',
			},
			{
				displayName: 'Destination Key',
				name: PARAM_DESTINATIONKEY,
				type: 'string',
				default: undefined,
				description: 'The key to which the search result will be written (default: "search")',
			},
		],
		version: 1,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const credentials = await this.getCredentials(NAME);
		const auth = credentials[PROPERTY_AUTH] as string;
		const cx = credentials[PROPERTY_CX] as string;
		const items = this.getInputData();

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const item = items[itemIndex];

				const q = (this.getNodeParameter(PARAM_QUERY, itemIndex, '') as string).trim();

				const pageSize = this.getNodeParameter(PARAM_PAGESIZE, itemIndex, 10) as number;

				const pageIndex = this.getNodeParameter(PARAM_PAGEINDEX, itemIndex, 1) as number;

				const cr = (this.getNodeParameter(PARAM_CR, itemIndex, '') as string).trim() || undefined;

				const exactTerms =
					(this.getNodeParameter(PARAM_EXACTTERMS, itemIndex, '') as string).trim() || undefined;

				const excludeTerms =
					(this.getNodeParameter(PARAM_EXCLUDETERMS, itemIndex, '') as string).trim() || undefined;

				const fileType =
					(this.getNodeParameter(PARAM_FILETYPE, itemIndex, '') as string).trim() || undefined;

				const destinationKey = this.getNodeParameter(
					PARAM_DESTINATIONKEY,
					itemIndex,
					'search',
				) as string;

				const results: Result[] = [];

				try {
					const search = customsearch('v1');

					const { data } = await search.cse.list({
						auth,
						cr,
						cx,
						exactTerms,
						excludeTerms,
						fileType,
						num: pageSize,
						q,
						start: (pageIndex - 1) * pageSize + 1,
					});

					if (data.items) {
						for (const { title, link, snippet } of data.items) {
							results.push({
								title: title || '',
								link: link || '',
								snippet: snippet || '',
							});
						}
					}
				} catch (error) {
					throw new NodeOperationError(this.getNode(), `Google Custom Search failed: ${error}`);
				}

				item.json[destinationKey] = {
					cr,
					exactTerms,
					excludeTerms,
					fileType,
					pageIndex,
					pageSize,
					q,
					results,
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
