module.exports = function(RED) {
  function JiraConnection(n) {
    RED.nodes.createNode(this,n);
    this.username = n.username;
    this.password = n.password;
    this.baseUrl = n.baseUrl;
    this.timeout = n.timeout;
  }
  RED.nodes.registerType('jira-connection', JiraConnection);
}