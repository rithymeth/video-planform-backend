const { Client } = require("@elastic/elasticsearch");

// Replace this with your Elasticsearch URL
const ES_NODE = process.env.ELASTICSEARCH_URL || "http://localhost:9200";

const esClient = new Client({
  node: ES_NODE, // The URL of your Elasticsearch instance
});

module.exports = esClient;
