module.exports = function(RED) {

  const fetch = require('node-fetch');
  const AbortController = globalThis.AbortController || require('abort-controller');

  function Page(connection, jql, fields, startAt, maxResults) {
    const url = connection.baseUrl
      + (connection.baseUrl.substring(connection.baseUrl.length - 1) === '/' ? '' : '/')
      + 'search?jql=' + encodeURIComponent(jql)
      + (fields ? '&fields=' + encodeURIComponent(fields) : '')
      + (startAt ? '&startAt=' + encodeURIComponent(startAt) : '')
      + (maxResults ? '&maxResults=' + encodeURIComponent(maxResults) : '');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), connection.timeout || 36000);

    return fetch(url, {
      signal: controller.signal,
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(connection.username + ':' + connection.password).toString('base64'),
      },
      timeout: connection.timeout || 36000,
    }).then(response => {
      clearTimeout(timeout);
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(response.statusText);
      }
    });
  }


  function Search(config) {
    RED.nodes.createNode(this, config);
    this.connection = RED.nodes.getNode(config.connection);
    var node = this;

    this.on('input',  async function(msg) {
      node.status({fill:'green', shape:'ring', text:'initializing....'});

      if (msg.hasOwnProperty('jql')) {
        config.jql = msg.jql;
      }

      if (msg.hasOwnProperty('fields')) {
        config.fields = msg.fields;
      }

      const issues = [];
      let startAt = null;
      let maxResults = null;

      try {
        while (true) {
          node.status({fill:'green', shape:'ring', text:'fetching....'});
          const response = await Page(this.connection, config.jql, config.fields, startAt, maxResults);
          if (response.issues && response.issues.length > 0) {
            issues.push(...response.issues);
          }
          if (response.total <= issues.length) {
            break;
          }
          startAt = response.startAt + response.maxResults;
          maxResults = response.maxResults;
        }
        node.status({fill:'green', shape:'dot', text:'Done (' + issues.length + ' issues)'});
        msg.payload = issues;
        node.send(msg);
      } catch (error) {
        node.status({fill:'red', shape:'dot', text:'Error'});
        node.error(error);
      }
    });
  }
  RED.nodes.registerType('jira-search',  Search);
}
