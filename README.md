<img src="https://raw.githubusercontent.com/rondonjon/n8n-nodes-rondonjon/refs/heads/master/rondonjon-n8n.jpg" alt="RonDonJon ♥️ n8n" width="100%" />

# n8n-nodes-rondonjon

This is a collection of custom [n8n](https://n8n.io/) credentials and nodes.

# Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

# Credentials

<!-- begin-credentials -->
## PumbleApi

Authentication for the [Pumble](https://www.pumble.com) API

## NewsApi

Authentication for the [newsapi.org](https://newsapi.org/docs) API.

## GoogleCustomSearchApi

Authentication for the [Google Custom Search](https://developers.google.com/custom-search/docs/) API.
<!-- end-credentials -->

# Nodes

<!-- begin-nodes -->
## SendPumbleMessage

Sends a message to a Pumble channel.

## SanitizeHtml

Sanitizes a given HTML string

## ReadDir

Reads the contents of a local directory, but without importing the binary
data of files into the workflow, as the native
["Read/Write Files from Disk"](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.readwritefile)
node does, since this can be problematic for large files.

## GoogleCustomSearch

Searches and returns the results using the Google Custom Search API.

## GetNews

Gets the latest news from newsapi.org using the credentials from `NewsApi`.
<!-- end-nodes -->

# Compatibility

 * Tested with n8n 1.76.2

# Credits

 * `GoogleCustomSearch` is made with `@googleapis/customsearch`
 * `SanitizeHtml` is made with `dompurify` and `jsdom`
 * Icons from https://ionic.io/ionicons
 * Repository based on https://github.com/n8n-io/n8n-nodes-starter

# Acknowledgements

 * Google is a registered trademark of Google LLC
 * Pumble is a registered trademark of CAKE.com AG
