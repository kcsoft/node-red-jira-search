# Node-RED Jira Search

## Using the Search node

You can pass in `msg.jql` and optional `msg.fields` or specify a JQL/fields in the configuration of the node.

After execution, the msg.payload will contain the search results.

All the pages are fetched automatically and concatenated into one array.
