async function main() {
	const key = '4df7342fb0ce4900b7f59aa727b566b7';
	const BASE_URL = 'https://newsapi.org';

	const url = new URL('/v2/everything', BASE_URL);
	url.searchParams.set('apiKey', key);

	url.searchParams.set('searchIn', 'title,description,content');
	url.searchParams.set('sources', 'wired');
	url.searchParams.set('domains', 'wired.com');

	// only for "everything"
	/* url.searchParams.set("from", "2021-08-01");
	url.searchParams.set("to", "2021-08-01");

	// only ONE of the following

	url.searchParams.set("domains", key);
	url.searchParams.set("category", "technology"); // only for "top-headlines"
	url.searchParams.set("country", "us"); // only for "top-headlines"

	url.searchParams.set("language", "en");
	url.searchParams.set("excludeDomains", key);

	url.searchParams.set("sortBy", "publishedAt"); */

	url.searchParams.set('pageSize', '3');
	url.searchParams.set('page', '1');

	const response = await fetch(url, {
		method: 'GET',
	});

	const json = await response.json();

	console.log(json);
}

main();
